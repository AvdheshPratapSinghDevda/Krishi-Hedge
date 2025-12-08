/**
 * IPFS Contract Upload Script
 * 
 * FREE tamper-proof contract storage using:
 * - web3.storage (IPFS) - Free tier
 * - SHA-256 hash for verification
 * - GitHub commit for public timestamping
 * 
 * Usage: node upload_contract.js
 */

const { Web3Storage, File } = require('web3.storage');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get web3.storage token from env
const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN;

if (!WEB3_STORAGE_TOKEN) {
  console.error('❌ Missing WEB3_STORAGE_TOKEN in .env file');
  console.log('Get free token at: https://web3.storage');
  process.exit(1);
}

// Initialize web3.storage client
const client = new Web3Storage({ token: WEB3_STORAGE_TOKEN });

/**
 * Generate SHA-256 hash of content
 */
function generateSHA256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Upload contract to IPFS and generate verification metadata
 */
async function uploadContract(contractData) {
  console.log('📝 Creating contract document...');
  
  // Generate contract JSON
  const contractJSON = JSON.stringify(contractData, null, 2);
  
  // Compute SHA-256 hash
  const sha256Hash = generateSHA256(contractJSON);
  console.log(`🔐 SHA-256 Hash: ${sha256Hash}`);
  
  // Create file for IPFS upload
  const fileName = `contract_${contractData.id}.json`;
  const file = new File([contractJSON], fileName, { type: 'application/json' });
  
  console.log('📤 Uploading to IPFS via web3.storage...');
  
  // Upload to IPFS
  const cid = await client.put([file], {
    name: `KrishiHedge Contract ${contractData.id}`,
    wrapWithDirectory: false
  });
  
  console.log(`✅ Uploaded to IPFS!`);
  console.log(`📍 IPFS CID: ${cid}`);
  console.log(`🌐 Public URL: https://ipfs.io/ipfs/${cid}`);
  console.log(`🌐 w3s.link URL: https://${cid}.ipfs.w3s.link/`);
  
  // Generate metadata for verification
  const metadata = {
    contractId: contractData.id,
    ipfsCID: cid,
    sha256Hash: sha256Hash,
    timestamp: new Date().toISOString(),
    fileName: fileName,
    publicUrls: [
      `https://ipfs.io/ipfs/${cid}`,
      `https://${cid}.ipfs.w3s.link/`
    ],
    verification: {
      instructions: 'Download file from IPFS, compute SHA-256, compare with stored hash',
      expectedHash: sha256Hash
    },
    contract: contractData
  };
  
  // Save metadata to file
  const metadataPath = path.join(__dirname, '..', 'last_contract_meta.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`💾 Metadata saved to: last_contract_meta.json`);
  
  // Save to history
  const historyPath = path.join(__dirname, '..', 'contract_history.json');
  let history = [];
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  }
  history.unshift(metadata);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log(`📚 Added to contract history`);
  
  console.log('\n✨ NEXT STEPS:');
  console.log('1. Commit last_contract_meta.json to GitHub (public timestamp)');
  console.log('2. Use verification UI to verify contract');
  console.log('3. Share IPFS link with stakeholders');
  
  return metadata;
}

// Sample contract data
const sampleContract = {
  id: `KH-${Date.now()}`,
  type: 'FORWARD_CONTRACT',
  farmer: {
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    location: 'Indore, Madhya Pradesh'
  },
  fpo: {
    name: 'Indore Oilseed FPO',
    registrationNo: 'FPO-MP-2024-1234'
  },
  commodity: 'Soybean',
  quantity: 50,
  unit: 'Quintal',
  strikePrice: 4800,
  currency: 'INR',
  pricePerUnit: '₹4,800 per quintal',
  totalValue: 240000,
  startDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  deliveryWindow: '30 Days',
  terms: [
    'Farmer agrees to sell 50 quintals of Soybean at ₹4,800 per quintal',
    'Delivery within 30 days from contract date',
    'Quality: FAQ standard as per AGMARK specifications',
    'Payment within 7 days of delivery',
    'This contract is protected by IPFS immutable storage'
  ],
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  signatures: {
    farmer: 'Digital signature via phone OTP',
    fpo: 'Digital signature via admin portal',
    platform: 'KrishiHedge Platform'
  },
  verification: {
    method: 'IPFS + SHA-256',
    blockchainProof: false,
    ipfsStorage: true,
    publiclyVerifiable: true
  }
};

// Main execution
async function main() {
  console.log('🌾 KrishiHedge - IPFS Contract Upload\n');
  
  try {
    const metadata = await uploadContract(sampleContract);
    
    console.log('\n📊 SUMMARY:');
    console.log('─'.repeat(60));
    console.log(`Contract ID: ${metadata.contractId}`);
    console.log(`IPFS CID: ${metadata.ipfsCID}`);
    console.log(`SHA-256: ${metadata.sha256Hash}`);
    console.log(`Timestamp: ${metadata.timestamp}`);
    console.log(`Verify at: ${metadata.publicUrls[0]}`);
    console.log('─'.repeat(60));
    
    console.log('\n✅ SUCCESS! Contract uploaded to IPFS.');
    console.log('\n🔗 Copy this for verification:');
    console.log(JSON.stringify({
      cid: metadata.ipfsCID,
      sha256: metadata.sha256Hash,
      url: metadata.publicUrls[0]
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { uploadContract, generateSHA256 };
