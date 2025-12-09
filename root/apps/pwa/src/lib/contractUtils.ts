import crypto from 'crypto';

/**
 * Generate SHA-256 hash of contract data
 */
export function generateContractHash(contractData: any): string {
  const contractJSON = JSON.stringify(contractData, null, 2);
  return crypto.createHash('sha256').update(contractJSON).digest('hex');
}

/**
 * Upload contract to IPFS via Pinata and return CID
 */
export async function uploadContractToIPFS(contractData: any): Promise<{ cid: string; hash: string; ipfsUrl: string }> {
  try {
    const contractJSON = JSON.stringify(contractData, null, 2);
    const hash = generateContractHash(contractData);

    // Create FormData for Pinata upload
    const formData = new FormData();
    const blob = new Blob([contractJSON], { type: 'application/json' });
    formData.append('file', blob, 'contract.json');

    // Add Pinata metadata
    const metadata = JSON.stringify({
      name: `Contract-${contractData.id}`,
      keyvalues: {
        contractId: contractData.id,
        crop: contractData.crop,
        type: contractData.contractType || 'FARMER_OFFER',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    // Upload to IPFS via Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    const cid = result.IpfsHash;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;

    console.log('[IPFS] Contract uploaded:', { cid, hash, ipfsUrl });

    return { cid, hash, ipfsUrl };
  } catch (error) {
    console.error('[IPFS] Upload error:', error);
    throw error;
  }
}

/**
 * Generate contract PDF data (to be used with a PDF library like pdfkit or jsPDF)
 */
export function generateContractData(contract: any, farmerInfo: any, buyerInfo: any) {
  const contractType = contract.contractType || contract.contract_type;
  const isBuyerDemand = contractType === 'BUYER_DEMAND';

  return {
    id: contract.id,
    contractType,
    date: new Date().toLocaleDateString('en-IN'),
    
    // Parties
    seller: isBuyerDemand ? {
      name: farmerInfo?.full_name || farmerInfo?.name || 'Farmer',
      role: 'Seller (Farmer)',
      id: contract.farmerId || contract.farmer_id,
    } : {
      name: farmerInfo?.full_name || farmerInfo?.name || 'Farmer',
      role: 'Seller (Farmer)',
      id: contract.farmerId || contract.farmer_id,
    },
    
    buyer: {
      name: buyerInfo?.business_name || buyerInfo?.full_name || buyerInfo?.name || 'Buyer',
      role: 'Buyer',
      id: contract.buyerId || contract.buyer_id,
    },

    // Contract Details
    commodity: {
      name: contract.crop,
      quantity: contract.quantity,
      unit: contract.unit || 'Qtl',
      grade: 'FAQ (Fair Average Quality)',
    },

    // Pricing
    terms: {
      strikePrice: contract.strikePrice || contract.strike_price,
      totalValue: (contract.quantity * (contract.strikePrice || contract.strike_price)),
      deliveryWindow: contract.deliveryWindow || contract.deliverywindow,
      paymentTerms: 'Payment on delivery after quality inspection',
    },

    // Blockchain Verification
    blockchain: {
      documentHash: '', // Will be filled after hash generation
      ipfsCid: '', // Will be filled after IPFS upload
      timestamp: new Date().toISOString(),
      status: contract.status,
    },

    // Legal Terms
    legalTerms: [
      'This contract is legally binding between both parties.',
      'The seller agrees to deliver the specified quantity within the agreed timeline.',
      'The buyer agrees to pay the full amount upon successful quality inspection.',
      'Quality disputes will be resolved through third-party inspection.',
      'This contract is stored on IPFS for immutable record-keeping.',
      'Both parties have digitally accepted this contract through the platform.',
    ],

    // Signatures
    signatures: {
      seller: {
        signedAt: contract.createdAt || contract.created_at,
        method: 'Digital Acceptance via Platform',
      },
      buyer: {
        signedAt: contract.acceptedAt || contract.accepted_at || new Date().toISOString(),
        method: 'Digital Acceptance via Platform',
      },
    },
  };
}

/**
 * Process contract after acceptance (generate PDF, upload to IPFS, update database)
 */
export async function processAcceptedContract(
  contractId: string,
  supabase: any
): Promise<{ success: boolean; cid?: string; pdfUrl?: string; error?: string }> {
  try {
    // Fetch contract details
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      throw new Error('Contract not found');
    }

    // Fetch farmer and buyer info
    const { data: farmerInfo } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', contract.farmer_id)
      .single();

    const { data: buyerInfo } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', contract.buyer_id)
      .single();

    // Generate contract data
    const contractData = generateContractData(contract, farmerInfo, buyerInfo);

    // Upload to IPFS
    const { cid, hash, ipfsUrl } = await uploadContractToIPFS(contractData);

    // Update contract with IPFS details
    const { error: updateError } = await supabase
      .from('contracts')
      .update({
        ipfs_cid: cid,
        document_hash: hash,
        pdf_url: ipfsUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (updateError) {
      console.error('[CONTRACT] Failed to update with IPFS details:', updateError);
    }

    return {
      success: true,
      cid,
      pdfUrl: ipfsUrl,
    };
  } catch (error: any) {
    console.error('[CONTRACT] Processing error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
