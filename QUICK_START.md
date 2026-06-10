# SafeHer India - Quick Start Guide

## ✅ System Status
- ✅ **Node.js & npm**: Installed and working
- ✅ **Frontend Dependencies**: Installed  
- ✅ **Backend Dependencies**: Installed
- ❌ **MongoDB**: Not installed (development mode enabled)

---

## 🚀 Quick Start Options

### **Option 1: Using Command Prompt (Recommended)**

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: **http://localhost:5000**

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: **http://localhost:5173** (or 5174/5175 if port is in use)

---

### **Option 2: Using Batch Files (Windows)**

Double-click one of these files in the project root:
- `start-backend.bat` - Starts only backend
- `start-frontend.bat` - Starts only frontend  
- `start-all.bat` - Starts both in separate windows

---

### **Option 3: Direct Node Commands**

**Backend:**
```bash
cd backend
node src/server.js
```

**Frontend:**
```bash
cd frontend
node node_modules/vite/bin/vite.js
```

---

## 📝 Login Information

**Use ANY email with valid format:**
- Email: `your@email.com` (any valid email)
- Password: `any6characters+` (minimum 6 characters for login)

Examples:
- admin@safeher.com + password123
- user@gmail.com + test1234
- priya@example.in + secure999

---

## 🔧 Important Notes

**If npm commands don't work in PowerShell:**
- Use Command Prompt (cmd.exe) instead
- Or use the batch files provided

**If ports are already in use:**
- Backend defaults to 5000
- Frontend defaults to 5173 (auto-increments to 5174, 5175, etc. if in use)
- Check running processes: `netstat -ano | findstr :PORT_NUMBER`

**To kill a process:**
```bash
taskkill /PID <PID> /F
```

---

## 📍 Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Main website |
| **Backend API** | http://localhost:5000 | API endpoint |
| **API Health** | http://localhost:5000/api/health | Server status check |

---

## ✨ Development Features

- ✅ Hot reload enabled (frontend changes auto-refresh)
- ✅ Mock authentication (no database needed)
- ✅ Works with any email/password combination
- ✅ Temporary user creation on first login
- ✅ Full feature testing without MongoDB

---

## 🐛 Troubleshooting

**Problem**: "npm is not recognized"
- **Solution**: Use Command Prompt instead of PowerShell

**Problem**: "Port already in use"
- **Solution**: Kill the process using that port or use batch file (auto-increments)

**Problem**: "Module not found"
- **Solution**: Run `npm install` in the respective folder (backend or frontend)

**Problem**: Cannot connect to backend
- **Solution**: Make sure backend is running first (starts on port 5000)

---

## 🎯 Ready to Go!

Everything is configured and ready. Just run:
```bash
cd backend && npm run dev
```
In one terminal, and:
```bash
cd frontend && npm run dev
```
In another terminal. That's it! 🎉
