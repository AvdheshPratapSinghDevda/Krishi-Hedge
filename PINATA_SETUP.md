# 🚀 PINATA SETUP (NO CREDIT CARD!) - 5 Minutes

## Step 1: Install Dependencies (1 min)

```powershell
cd "d:\Folder A\SIH2025\TESTING-APP\root\scripts"
npm install
```

## Step 2: Get FREE Pinata API Key (2 min)

### Go to: https://app.pinata.cloud/developers/api-keys

1. **Sign up** with email (NO credit card!)
2. Click **"New Key"** button
3. Give it a name: `KrishiHedge`
4. Enable permission: **`pinFileToIPFS`** ✅
5. Click **"Generate Key"**
6. **COPY THE JWT** (starts with `eyJhbG...`)

## Step 3: Add Token to .env (30 sec)

```powershell
# Create .env file
Copy-Item .env.example .env

# Edit it
notepad .env
```

**Paste your JWT:**
```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb...
```

Save and close!

## Step 4: Upload First Contract (30 sec)

```powershell
node upload_contract_pinata.js
```

### Expected Output:
```
🚀 Starting IPFS upload via Pinata (NO CREDIT CARD!)...

🔐 SHA-256 Hash: a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7

✅ Contract uploaded to IPFS!
📝 CID: QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX
🔗 View on IPFS: https://ipfs.io/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX
🔗 Pinata Gateway: https://gateway.pinata.cloud/ipfs/QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX
🔐 SHA-256: a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7

📄 Metadata saved to: last_contract_meta.json

🎉 SUCCESS! Next steps:
1. Commit last_contract_meta.json to GitHub for public timestamp
2. Visit /contracts/verify and enter CID to test verification
3. Share the CID with FPO/buyer for transparency
```

## Step 5: Copy the CID!

**Copy this:** `QmT5NvUtoM5nWFfrQdVrFtvGfKFmG7AHE8P34isapyhCxX` (yours will be different)

You'll need it for verification!

## Step 6: Commit to GitHub (1 min)

```powershell
cd ..
git add scripts/last_contract_meta.json scripts/contract_history.json
git commit -m "Add IPFS contract with Pinata - NO CREDIT CARD NEEDED!"
git push origin himanshu_test
```

✅ **DONE!** Now you have a permanent public timestamp on GitHub!

---

## 🧪 Test Verification

```powershell
# Start dev server
cd "d:\Folder A\SIH2025\TESTING-APP\root"
pnpm dev
```

1. Open http://localhost:3000/contracts/verify
2. Paste your CID
3. Click "Verify Contract"
4. **Expected:** Green checkmark ✅

---

## 🎯 Why Pinata is Perfect

✅ **NO credit card** required
✅ **1GB free storage** (enough for 1000s of contracts)
✅ **Dedicated IPFS gateways** (fast access)
✅ **Simple API** (just JWT token)
✅ **Trusted by 250k+ developers**

---

## 🚨 Troubleshooting

**"Invalid JWT":**
- Make sure you copied the FULL token
- Check there are no extra spaces
- Token should start with `eyJhbG`

**"Network error":**
- Check internet connection
- Try again in 30 seconds

**"Module not found":**
- Run `npm install` again
- Make sure you're in `scripts` folder

---

**Total Time: 5 minutes from zero to verified contract! 🚀**

Next: Test futures trading at `/sandbox/futures` and alerts at `/alerts`!
