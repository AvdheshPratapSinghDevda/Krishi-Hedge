import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Generate SHA-256 hash
function generateSHA256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function uploadContract(contractData) {
  try {
    console.log('\n🚀 Starting IPFS upload via Pinata (NO CREDIT CARD!)...\n');
    
    // Convert contract data to JSON
    const contractJSON = JSON.stringify(contractData, null, 2);
    
    // Compute SHA-256 hash
    const hash = generateSHA256(contractJSON);
    console.log('🔐 SHA-256 Hash:', hash);
    
    // Prepare form data for Pinata
    const formData = new FormData();
    formData.append('file', Buffer.from(contractJSON), {
      filename: 'contract.json',
      contentType: 'application/json',
    });
    
    // Add metadata
    const pinataMetadata = JSON.stringify({
      name: `Agricultural Contract - ${contractData.farmer.name}`,
      keyvalues: {
        farmer: contractData.farmer.name,
        commodity: contractData.commodity.name,
        date: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);
    
    // Upload to IPFS via Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${process.env.PINATA_JWT}`
        }
      }
    );
    
    const cid = response.data.IpfsHash;
    
    console.log('\n✅ Contract uploaded to IPFS!');
    console.log('📝 CID:', cid);
    console.log('🔗 View on IPFS:', `https://ipfs.io/ipfs/${cid}`);
    console.log('🔗 Pinata Gateway:', `https://gateway.pinata.cloud/ipfs/${cid}`);
    console.log('🔐 SHA-256:', hash);
    
    // Save metadata
    const metadata = {
      cid,
      hash,
      contractData,
      timestamp: new Date().toISOString(),
      ipfsUrls: [
        `https://ipfs.io/ipfs/${cid}`,
        `https://gateway.pinata.cloud/ipfs/${cid}`
      ],
      verificationInstructions: `
🔍 HOW TO VERIFY THIS CONTRACT:
1. Go to: https://ipfs.io/ipfs/${cid}
2. Download the JSON file
3. Compute SHA-256 hash of the downloaded file
4. Compare with stored hash: ${hash}
5. If hashes match = Contract is authentic ✅
6. If hashes differ = Contract was tampered ❌

Or use our UI: http://localhost:3000/contracts/verify
Enter CID: ${cid}
      `.trim()
    };
    
    fs.writeFileSync('last_contract_meta.json', JSON.stringify(metadata, null, 2));
    console.log('\n📄 Metadata saved to: last_contract_meta.json');
    
    // Append to history
    let history = [];
    if (fs.existsSync('contract_history.json')) {
      history = JSON.parse(fs.readFileSync('contract_history.json', 'utf-8'));
    }
    history.push(metadata);
    fs.writeFileSync('contract_history.json', JSON.stringify(history, null, 2));
    
    console.log('\n🎉 SUCCESS! Next steps:');
    console.log('1. Commit last_contract_meta.json to GitHub for public timestamp');
    console.log('2. Visit /contracts/verify and enter CID to test verification');
    console.log('3. Share the CID with FPO/buyer for transparency\n');
    
    return { cid, hash, metadata };
  } catch (error) {
    console.error('\n❌ Upload failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
}

// Sample contract data
const sampleContract = {
  farmer: {
    name: "Rajesh Kumar",
    location: "Indore, Madhya Pradesh",
    phone: "+91-98765-43210"
  },
  fpo: {
    name: "Indore Farmers Cooperative",
    registrationNo: "FPO-MP-2023-12345"
  },
  commodity: {
    name: "Soybean",
    variety: "JS-335",
    grade: "FAQ"
  },
  terms: {
    quantity: 50, // quintals
    strikePrice: 4800, // per quintal
    deliveryDate: "2025-01-15",
    totalValue: 50 * 4800 // ₹2,40,000
  },
  signatures: {
    farmer: "DIGITAL_SIGNATURE_PLACEHOLDER",
    fpo: "DIGITAL_SIGNATURE_PLACEHOLDER",
    witnessedBy: "Block Development Officer"
  }
};

// Run the upload
uploadContract(sampleContract)
  .then(result => {
    console.log('✅ Upload complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  });

export { uploadContract, generateSHA256 };
