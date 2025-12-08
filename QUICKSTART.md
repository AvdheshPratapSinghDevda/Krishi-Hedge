# 🚀 QUICKSTART - Test Everything NOW

## 1. Install IPFS Dependencies (2 min)

```powershell
cd "d:\Folder A\SIH2025\TESTING-APP\root\scripts"
npm install
```

## 2. Get FREE Web3.Storage Token (3 min)

1. Go to https://web3.storage
2. Click "Sign Up" → Use GitHub
3. Click your profile → "Create API Token"
4. Copy the token (starts with `eyJhbGc...`)
5. Create `.env` file in scripts folder:

```powershell
# In scripts folder
Copy-Item .env.example .env
notepad .env
```

6. Paste your token:
```
WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_TOKEN_HERE
```

## 3. Test IPFS Upload (1 min)

```powershell
# In scripts folder
node upload_contract.js
```

**Expected output:**
```
✅ Contract uploaded to IPFS!
📝 CID: bafybeic...
🔗 View on IPFS: https://ipfs.io/ipfs/bafybeic...
🔐 SHA-256: a3f2b1c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7
📄 Metadata saved to: last_contract_meta.json
```

**Copy the CID** - you'll need it for verification!

## 4. Commit Metadata to GitHub (1 min)

```powershell
cd ..
git add scripts/last_contract_meta.json scripts/contract_history.json
git commit -m "Add IPFS contract metadata with SHA-256 hash"
git push origin himanshu_test
```

This creates a **permanent public timestamp** proving when the contract was created!

## 5. Start Dev Server (1 min)

```powershell
pnpm dev
```

Open browser: http://localhost:3000

## 6. Test Verification UI (1 min)

1. Navigate to http://localhost:3000/contracts/verify
2. Paste the CID from Step 3
3. Click "Verify Contract"
4. **Expected:** Green checkmark ✅ "Contract Verified!"

## 7. Test Futures Trading (2 min)

1. Go to http://localhost:3000
2. Click **"Practice Mode"** (purple card)
3. Click **"Futures Trading"** (orange card)
4. Select **Soybean** commodity
5. Enter quantity: **10**
6. Click **BUY**
7. Enter settlement price: **4900**
8. Click **Settle**
9. **Expected:** Shows P/L = +₹500 (green)

## 8. Test Price Alerts (2 min)

1. Go to http://localhost:3000/alerts
2. Click **"Enable Notifications"** (grant browser permission)
3. Select **Soybean**
4. Set direction: **ABOVE**
5. Set threshold: **5000**
6. Click **"Create Alert"**
7. Click **"Trigger Demo Alert"**
8. **Expected:** Browser notification pops up! 🔔

---

## ✅ VERIFICATION CHECKLIST

- [ ] IPFS upload returns CID
- [ ] SHA-256 hash generated
- [ ] Metadata files created (last_contract_meta.json)
- [ ] GitHub commit pushed
- [ ] Verification page shows green checkmark
- [ ] Futures P/L calculator works
- [ ] Browser alerts trigger successfully

---

## 🎬 NEXT: Record Demo

**Windows Game Bar (Win+G):**
1. Press **Win+G** to open
2. Click red **Record** button
3. Navigate through:
   - Home → AI Forecast (show graph)
   - Contracts → Create → Upload to IPFS
   - Verify → Paste CID → Green checkmark
   - Sandbox → Futures → BUY → Settle → Green P/L
   - Alerts → Create → Trigger demo
4. Press **Win+G** again → Stop recording
5. Save as `demo_video_sih25274.mp4`

**Target:** 60-90 seconds

---

## 📊 FEATURES TO SHOWCASE

| Feature | Location | Screenshot |
|---------|----------|------------|
| AI Forecasting | `/forecast` | 7-day prediction graph |
| IPFS Contracts | `scripts/upload_contract.js` | Terminal output with CID |
| Verification | `/contracts/verify` | Green checkmark ✅ |
| Futures Trading | `/sandbox/futures` | P/L +₹500 |
| Price Alerts | `/alerts` | Browser notification |

---

## 🏆 JUDGE PITCH (30 seconds)

**Problem:** Farmers lose money to price volatility. Need hedging + forecasting + secure contracts.

**Solution:** KrishiHedge provides:
- AI price prediction (Prophet ML)
- IPFS tamper-proof contracts (NO gas fees!)
- Futures simulator (margin + P/L)
- Real-time alerts (browser notifications)

**Impact:** ₹0 cost, 100% farmer accessibility, blockchain security WITHOUT crypto wallets!

---

## 🚨 TROUBLESHOOTING

**If IPFS upload fails:**
- Check `.env` has correct token
- Try `npm install` again
- Verify internet connection

**If verification fails:**
- Wait 30s for IPFS propagation
- Try alternate gateway: w3s.link instead of ipfs.io
- Check CID was copied correctly

**If alerts don't work:**
- Grant browser notification permission
- Test in Chrome/Edge (Safari has issues)
- Click "Trigger Demo Alert" button

---

**Total time: 10-15 minutes to test everything!**

Let me know when you're done and I'll help with the demo video script! 🎥
