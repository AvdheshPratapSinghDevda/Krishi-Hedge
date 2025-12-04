# Profile Page - Visual Layout Guide

## 🎨 Desktop Layout (Large Screens)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🟢 My Profile                                          [Edit Profile] 💾   │
│     Manage your account information                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┬─────────────────────────────────────────────────────────────┐
│              │                                                               │
│  ┌────────┐  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   🧑   │  │  │ 👤 Personal  │  │ 📍 Location  │  │ 🌾 Farming   │      │
│  │  (A)   │  │  │ Information  │  │   Details    │  │   Details    │      │
│  │        │  │  │              │  │              │  │              │      │
│  │  📷   │  │  │ Name: [___]  │  │ Village: [__]│  │ Land: 5 acres│      │
│  └────────┘  │  │ Email: [___] │  │ District:[__]│  │ Crop: Soybean│      │
│              │  │ Phone: [___] │  │ State: [____]│  │ Exp: 10 years│      │
│ Farmer 🌾    │  │ Aadhaar: ✓   │  │ Pin: [_____] │  │ Reg: 2024    │      │
│              │  └──────────────┘  └──────────────┘  └──────────────┘      │
│ ✓ Email      │                                                               │
│ ✓ Phone      │  ┌─────────────────────────────────────────────────────┐    │
│ ✓ Aadhaar    │  │ 📄 Bank Details                                     │    │
│              │  │                                                       │    │
│ 📅 Dec 2024  │  │  💳 Account: 1234567890                             │    │
│ 📈 0 Trades  │  │     IFSC: SBIN0001234                               │    │
│              │  │     ✓ Verified                                       │    │
└──────────────┘  └─────────────────────────────────────────────────────┘    │
                  │                                                             │
                  │  ┌─────────────────────────────────────────────────────┐  │
                  │  │ 🔒 Security Settings                                │  │
                  │  │                                                      │  │
                  │  │  🔑 Change Password                             →   │  │
                  │  │  📱 Two-Factor Authentication              [ON/OFF] │  │
                  │  └─────────────────────────────────────────────────────┘  │
                  └─────────────────────────────────────────────────────────┘
```

## 📱 Mobile Layout (Small Screens)

```
┌───────────────────────────────┐
│  🟢 My Profile     [Edit] 💾 │
│     Manage your account       │
└───────────────────────────────┘

┌───────────────────────────────┐
│       ┌────────┐              │
│       │   🧑   │              │
│       │  (A)   │              │
│       │        │              │
│       │  📷   │              │
│       └────────┘              │
│                               │
│      Farmer Name              │
│      Farmer 🌾                │
│                               │
│  ✓ Email    ✓ Phone          │
│  ✓ Aadhaar                    │
│                               │
│  📅 Dec 2024  📈 0 Trades     │
└───────────────────────────────┘

┌───────────────────────────────┐
│  👤 Personal Information      │
│                               │
│  Name: [________________]     │
│  Email: [_______________]     │
│  Phone: [_______________]     │
│  Aadhaar: ✓ Verified          │
└───────────────────────────────┘

┌───────────────────────────────┐
│  📍 Location Details          │
│                               │
│  Village: [_____________]     │
│  District: [____________]     │
│  State: [_______________]     │
│  Pincode: [_____________]     │
└───────────────────────────────┘

┌───────────────────────────────┐
│  🌾 Farming Details           │
│                               │
│  Land Size: 5 acres           │
│  Primary Crop: Soybean        │
│  Experience: 10 years         │
│  Registered: 2024             │
└───────────────────────────────┘

┌───────────────────────────────┐
│  📄 Bank Details              │
│                               │
│  💳 1234567890                │
│     IFSC: SBIN0001234         │
│     ✓ Verified                │
└───────────────────────────────┘

┌───────────────────────────────┐
│  🔒 Security Settings         │
│                               │
│  🔑 Change Password      →    │
│  📱 2FA          [ON/OFF]     │
└───────────────────────────────┘

┌───────────────────────────────┐
│  ❌ Logout from Account       │
└───────────────────────────────┘
```

## 🎨 Color Scheme Reference

### Background Colors
- **Page Background**: Gradient from green-50 → emerald-50 → green-50
- **Header**: Gradient from green-600 → emerald-600
- **Cards**: White (#FFFFFF)
- **Sidebar**: Sticky white card with green border

### Status Colors
- **Verified (Green)**: #10b981
  - Email verified ✓
  - Phone verified ✓
  - Aadhaar verified ✓
  - Bank verified ✓

- **Pending (Amber)**: #f59e0b
  - Unverified items ⚠
  - "Verify" button

- **Error/Logout (Red)**: #ef4444
  - Cancel button
  - Logout button
  - Remove bank button

### Badge Colors
- **Farmer Badge**: Green background (bg-green-100), Green text (text-green-700)
- **Business Badge**: Blue background (bg-blue-100), Blue text (text-blue-700)

## 📐 Component Spacing

### Cards
- Padding: `p-6` (1.5rem / 24px)
- Rounded corners: `rounded-2xl` (1rem / 16px)
- Shadow: `shadow-lg`
- Border: `border border-green-100`

### Inputs (Edit Mode)
- Border: `border-slate-300`
- Focus ring: `ring-2 ring-green-500`
- Padding: `px-3 py-2` or `px-4 py-3`
- Rounded: `rounded-lg`

### Buttons
- Primary (Save): Green background, white text
- Secondary (Cancel): Red background, white text
- Edit: White background, green text
- Padding: `px-4 py-2` or `px-6 py-2`

## 🔄 State Changes

### View Mode → Edit Mode
1. Click "Edit Profile" button
2. All text fields become input boxes
3. Camera icon appears on profile picture
4. "Save Changes" and "Cancel" buttons appear
5. All fields become editable

### Save Changes
1. Click "Save Changes"
2. Data saved to localStorage
3. Returns to view mode
4. Changes reflected immediately

### Cancel
1. Click "Cancel"
2. Reverts to original data
3. Returns to view mode
4. No changes saved

## 📊 Data Flow

### Loading Profile Data
```
localStorage → useState (userData) → Display in cards
```

### Editing Profile
```
Click Edit → Copy to editForm → Modify in inputs → Click Save → Update userData → Save to localStorage
```

### Profile Picture
```
Select image → FileReader → Base64 → Display + Save to localStorage
```

### Bank Details
```
Click "Add Bank" → Enter details → Click Save → Verify → Display with checkmark
```

## 🎯 Interaction Points

### Clickable Elements
1. **Edit Profile** - Opens edit mode
2. **Save Changes** - Saves and closes edit mode
3. **Cancel** - Discards changes and closes edit mode
4. **Camera Icon** - Opens file picker for profile picture
5. **Verify Buttons** - Triggers verification flow (UI ready)
6. **Add Bank Account** - Opens bank form
7. **Remove Bank** - Deletes bank details
8. **Change Password** - Opens password change (UI ready)
9. **2FA Toggle** - Enables/disables two-factor auth
10. **Logout** - Clears data and redirects to splash

## 🔐 Security Features Display

### Two-Factor Authentication Toggle
```
[OFF State]               [ON State]
┌──────────────┐         ┌──────────────┐
│ ○          │         │          ● │
└──────────────┘         └──────────────┘
  Gray background          Green background
```

### Verification Indicators
```
Verified:                 Unverified:
✓ Green checkmark         ⚠ Amber warning
Green background          Amber background
```

## 📏 Responsive Breakpoints

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (1-2 columns)
- **Desktop**: > 1024px (4 columns: 1 sidebar + 3 main)

### Grid Configuration
```css
/* Mobile */
grid-cols-1

/* Desktop */
lg:grid-cols-4
  - Sidebar: lg:col-span-1
  - Main: lg:col-span-3
    - Cards: md:grid-cols-3
```

---

## 🎊 Ready to Use!

Navigate to **http://localhost:3000/profile** to see your new enhanced profile page!

All features are fully functional and stored in localStorage. Ready for backend API integration when needed.
