# 📱 Mobile Testing Setup Guide

## Problem
When testing on mobile, you get "DB Connection Error" because:
- Frontend uses `http://localhost:5000`
- Mobile's `localhost` ≠ Your computer's `localhost`

## ✅ Solution: Use Your Computer's IP Address

### Your Computer's IP Addresses:
- **Wi-Fi**: `192.168.11.203` (use this if on WiFi)
- **Ethernet**: `192.168.56.1` (use this if on cable)

---

## 🚀 Quick Setup (2 Steps)

### Step 1: Update API Config for Mobile Testing

Open: `frontend-vite/src/config/api.js`

**For Desktop Testing:**
```javascript
export const API_BASE_URL = 'http://localhost:5000';
```

**For Mobile Testing (Same WiFi):**
```javascript
export const API_BASE_URL = 'http://192.168.11.203:5000';
```

### Step 2: Access Frontend from Mobile

**On your mobile browser, visit:**
```
http://192.168.11.203:5173
```

---

## ⚠️ Important Notes

1. **Both devices must be on the SAME WiFi network**
2. **Backend is already configured** to accept connections from:
   - `http://localhost:5173`
   - `http://192.168.11.203:5173`
   - `http://192.168.137.1:5173`

3. **To find your IP anytime**, run in terminal:
   ```bash
   ipconfig
   ```
   Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi"

---

## 🔄 Switching Between Desktop and Mobile

### For Desktop:
```javascript
// frontend-vite/src/config/api.js
export const API_BASE_URL = 'http://localhost:5000';
```

### For Mobile:
```javascript
// frontend-vite/src/config/api.js
export const API_BASE_URL = 'http://192.168.11.203:5000';
```

---

## 🎯 Testing Checklist

- [ ] Computer and mobile on same WiFi
- [ ] Backend running: `cd backend && npm start`
- [ ] Frontend running: `cd frontend-vite && npm run dev`
- [ ] API_BASE_URL updated in `config/api.js`
- [ ] Mobile browser opens: `http://192.168.11.203:5173`

---

## 🐛 Troubleshooting

### Still getting connection error?

1. **Check Windows Firewall:**
   - Allow Node.js through firewall
   - Or temporarily disable firewall for testing

2. **Verify backend is accessible:**
   Open mobile browser and visit:
   ```
   http://192.168.11.203:5000
   ```
   You should see: `{"message":"LocalServe Backend (Sequelize) Chal Raha Hai!"}`

3. **Check if ports are blocked:**
   ```bash
   netstat -ano | findstr :5000
   netstat -ano | findstr :5173
   ```

4. **IP address changed?**
   Run `ipconfig` again and update the IP in `api.js`

---

## 💡 Pro Tip: Auto-Detect Environment

For automatic switching, you can use environment variables:

Create `.env` in `frontend-vite/`:
```env
VITE_API_URL=http://localhost:5000
```

For mobile testing, create `.env.mobile`:
```env
VITE_API_URL=http://192.168.11.203:5000
```

Then in `api.js`:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```
