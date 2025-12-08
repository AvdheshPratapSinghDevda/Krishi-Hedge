# 🎯 QUICK START GUIDE - KrishiHedge Platform

## 🚀 Start Servers

### 1. Web App (Port 3001)
```powershell
cd "d:\Folder A\SIH2025\TESTING-APP\root"
pnpm dev:pwa
```
✅ Access: **http://localhost:3001**

### 2. ML API (Port 8000)
```powershell
cd "d:\Folder A\SIH2025\TESTING-APP\ml-model"
python api_server.py
```
✅ Access: **http://localhost:8000/docs**

---

## 🧪 Test Each Feature

### ✅ 1. IPFS Contract Upload
```powershell
cd "d:\Folder A\SIH2025\TESTING-APP\root\scripts"
node upload_contract_pinata.js
```
**Expected Output:**
```
✅ CID: QmUn98SErzXK2v3tGpNJNXZLN5ZcmdTGksAjzrtNEshy5c
✅ SHA-256: 54c015f0fa345244bb35d007df8db63ec5a597bc5758b531a5627d6b1daa88df
```

---

### ✅ 2. IPFS Verification
1. Open: http://localhost:3001/contracts/verify
2. Paste CID: `QmUn98SErzXK2v3tGpNJNXZLN5ZcmdTGksAjzrtNEshy5c`
3. Click **"Verify Contract"**
4. ✅ See green checkmark + matching hash

---

### ✅ 3. Futures Trading
1. Open: http://localhost:3001/sandbox/futures
2. Select: **Soybean**
3. Quantity: **10 quintals**
4. Strike Price: **₹4800**
5. Click **BUY**
6. Settlement Price: **₹4900**
7. Click **Settle**
8. ✅ See profit: **₹1,000** (₹100/quintal × 10)

---

### ✅ 4. Price Alerts
1. Open: http://localhost:3001/alerts
2. Click **"Enable Notifications"**
3. Create alert: **Soybean > ₹5000**
4. Click **"Trigger Demo Alert"**
5. ✅ See browser notification

---

### ✅ 5. ML Predictions
1. Open: http://localhost:8000/docs
2. Try `/predict` endpoint
3. Input:
```json
{
  "commodity": "soybean",
  "horizon": 7
}
```
4. ✅ Get 7-day price prediction

---

## 📋 All Pages

| Page | URL | Status |
|------|-----|--------|
| Home | http://localhost:3001/ | ✅ |
| Market | http://localhost:3001/market | ✅ |
| Forecast | http://localhost:3001/forecast | ✅ |
| Contracts | http://localhost:3001/contracts | ✅ |
| Verify | http://localhost:3001/contracts/verify | ✅ |
| Futures | http://localhost:3001/sandbox/futures | ✅ |
| Alerts | http://localhost:3001/alerts | ✅ |
| Profile | http://localhost:3001/profile | ✅ |
| Login | http://localhost:3001/auth/login | ✅ |
| Sandbox | http://localhost:3001/sandbox | ✅ |

---

## 🔧 If Something Breaks

### Web App Won't Start
```powershell
# Check if port 3000/3001 is in use
netstat -ano | findstr ":3001"

# Kill process if needed
taskkill /F /PID <PID>

# Restart
cd "d:\Folder A\SIH2025\TESTING-APP\root"
pnpm dev:pwa
```

### ML API Won't Start
```powershell
# Check port 8000
netstat -ano | findstr ":8000"

# Kill all Python processes
Get-Process python | Stop-Process -Force

# Restart
cd "d:\Folder A\SIH2025\TESTING-APP\ml-model"
python api_server.py
```

### IPFS Upload Fails
```powershell
# Check Pinata JWT token
cd "d:\Folder A\SIH2025\TESTING-APP\root\scripts"
cat .env

# Should show:
# PINATA_JWT=eyJhbGciOiJIUzI...

# If missing, add it to .env file
```

---

## 📊 Current Status

### ✅ Working (11/12)
- IPFS Upload
- IPFS Verification
- Futures Simulator
- Price Alerts
- ML Predictions
- Market Page
- Forecast Page
- Profile Page
- Login/Auth
- Sandbox
- Navigation

### ⚠️ Needs Data (1/12)
- Contracts List (API works, but empty - need Supabase data)

---

## 🎬 Demo Flow

**60-Second Walkthrough:**

1. **Problem** (5s): Farmer uncertain about prices
2. **Forecast** (10s): ML prediction shows trend
3. **Create Contract** (10s): Set strike price
4. **Upload IPFS** (10s): Generate CID + hash
5. **Verify** (10s): Green ✅ blockchain proof
6. **Futures** (10s): Calculate P&L
7. **Alert** (5s): Set notification

---

## 📦 Key Files

### IPFS
- Upload: `root/scripts/upload_contract_pinata.js`
- Verify: `root/apps/pwa/src/app/contracts/verify/page.tsx`
- Metadata: `root/apps/pwa/public/last_contract_meta.json`

### Features
- Futures: `root/apps/pwa/src/app/sandbox/futures/page.tsx`
- Alerts: `root/apps/pwa/src/app/alerts/page.tsx`
- ML API: `ml-model/api_server.py`

### Config
- Supabase: `root/apps/pwa/.env.local`
- Pinata: `root/scripts/.env`

---

## ✅ Pre-Demo Checklist

- [ ] Web app running on 3001
- [ ] ML API running on 8000
- [ ] IPFS upload tested (CID generated)
- [ ] Verification page shows green ✅
- [ ] Futures simulator tested (P&L correct)
- [ ] Price alerts tested (notification works)
- [ ] All pages load without errors
- [ ] Demo flow practiced (60 seconds)

---

**Ready to Demo!** 🎉

All systems operational. Test each feature above to verify everything works before your presentation.
