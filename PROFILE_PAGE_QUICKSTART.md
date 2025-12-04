# 🚀 Quick Start - Enhanced Profile Page

## Start the Application

### Option 1: Using the Start Script (Recommended)
```powershell
# From project root
.\START.ps1
```

This will start both:
- PWA Application on http://localhost:3000
- ML Service on http://localhost:8000

### Option 2: Manual Start
```powershell
# Terminal 1 - Start PWA
cd root
pnpm dev

# Terminal 2 - Start ML Service
cd root/services/ml
python main.py
```

## Access the New Profile Page

### Direct URL
```
http://localhost:3000/profile
```

### From App Navigation
1. Open http://localhost:3000
2. Look for profile icon in bottom navigation
3. Click to access your enhanced profile

## 🎯 Testing the Features

### 1. View Profile
- See your profile information displayed in 3-column layout
- Check sidebar with profile picture and verification status
- View all sections: Personal, Location, Farming/Business

### 2. Edit Profile
1. Click **"Edit Profile"** button (top-right)
2. Modify any field (name, email, phone, location, etc.)
3. Click **"Save Changes"** to save
4. Click **"Cancel"** to discard changes

### 3. Upload Profile Picture
1. Click **"Edit Profile"**
2. Click camera icon on profile picture
3. Select an image from your device
4. Image will be displayed immediately and saved

### 4. Manage Bank Details
1. Scroll to "Bank Details" section
2. Click **"Add Bank Account"** if none exists
3. Enter Account Number and IFSC Code
4. Click **"Save Bank Details"**
5. See verified badge appear

### 5. Security Settings
1. Scroll to "Security Settings" section
2. Click **"Change Password"** (UI ready for integration)
3. Toggle **"Two-Factor Authentication"** on/off

### 6. Test User Type Switching

#### Farmer Mode (Default)
```javascript
// In browser console
localStorage.setItem('kh_profile', JSON.stringify({
  name: 'Ramesh Kumar',
  userType: 'farmer',
  landSize: '10',
  primaryCrop: 'Soybean',
  farmingExperience: '15'
}));
location.reload();
```

#### Business Mode
```javascript
// In browser console
localStorage.setItem('kh_profile', JSON.stringify({
  name: 'Agro Foods Pvt Ltd',
  userType: 'business',
  businessName: 'Agro Foods Pvt Ltd',
  gstNumber: '27AABCU9603R1ZX',
  businessType: 'Oil Mill',
  companySize: '50-200 employees'
}));
location.reload();
```

## 📱 Responsive Testing

### Desktop View (> 1024px)
- Open browser at full width
- See 4-column layout: 1 sidebar + 3 main cards
- Sidebar should stick while scrolling

### Tablet View (768px - 1024px)
1. Press F12 to open DevTools
2. Click device toolbar icon
3. Select iPad or similar
4. See 2-column layout

### Mobile View (< 768px)
1. Press F12 to open DevTools
2. Click device toolbar icon
3. Select iPhone or similar
4. See single-column stacked layout

## 🎨 Visual Checks

### Colors
- ✅ Green gradient header
- ✅ Emerald gradient background
- ✅ White cards with shadows
- ✅ Green checkmarks for verified items
- ✅ Amber warnings for unverified items

### Icons
All Lucide React icons should display:
- User, Mail, Phone icons
- MapPin, Home icons
- Sprout (farmer) or Building2 (business)
- Shield, CheckCircle2, AlertCircle
- Camera, Edit2, Save, X
- Lock, Key, Smartphone

### Verification Badges
- Email: Should show green ✓ if verified
- Phone: Should show green ✓ if verified
- Aadhaar: Should show green ✓ if verified
- Unverified items: Should show amber ⚠

## 🔄 Data Persistence

All changes are saved to `localStorage`:

### Check Saved Data
```javascript
// Open browser console (F12)
console.log('Profile:', JSON.parse(localStorage.getItem('kh_profile')));
console.log('Bank:', JSON.parse(localStorage.getItem('kh_bank')));
console.log('Image:', localStorage.getItem('kh_profile_image'));
```

### Reset Profile Data
```javascript
// Clear all profile data
localStorage.removeItem('kh_profile');
localStorage.removeItem('kh_bank');
localStorage.removeItem('kh_profile_image');
location.reload();
```

## 🐛 Troubleshooting

### Profile Not Loading?
```powershell
# Check if PWA is running
Get-Process -Name node

# Restart PWA
cd root
pnpm dev
```

### Images Not Showing?
- Check browser console for errors
- Ensure image file is < 5MB
- Try JPG or PNG format

### Edit Mode Not Working?
- Refresh page (Ctrl + R)
- Clear browser cache (Ctrl + Shift + Delete)
- Check browser console for errors

### Styles Look Wrong?
```powershell
# Rebuild Tailwind CSS
cd root/apps/pwa
pnpm dev
```

## 📚 Documentation Files

1. **PROFILE_PAGE_ENHANCEMENTS.md** - Complete feature documentation
2. **PROFILE_PAGE_LAYOUT_GUIDE.md** - Visual layout and design guide
3. **PROFILE_PAGE_QUICKSTART.md** - This file (quick start guide)

## 🎊 Success Checklist

- [ ] PWA running on http://localhost:3000
- [ ] Profile page loads at /profile
- [ ] Can see 3-column layout (desktop)
- [ ] Edit button works
- [ ] Can modify fields
- [ ] Save/Cancel buttons work
- [ ] Profile picture upload works
- [ ] Bank details can be added
- [ ] 2FA toggle works
- [ ] Logout works
- [ ] Responsive on mobile
- [ ] All icons display correctly
- [ ] Colors match design (green/emerald theme)

## 🚀 Next Steps

1. ✅ Test all features manually
2. ✅ Take screenshots for documentation
3. ✅ Prepare for backend integration
4. ✅ Add to your SIH presentation
5. ✅ Show to your team/judges

---

## 💡 Pro Tips

1. **Demo Mode**: Set up sample data for presentations
2. **Screenshot Ready**: Use Farmer mode with complete data
3. **Mobile First**: Always test on mobile view
4. **Verification Status**: Show mix of verified/unverified for demo
5. **Professional Data**: Use realistic names and values

Enjoy your enhanced profile page! 🎉
