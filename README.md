# 🦛 HippoSync

**AI-Powered Chat Application with Persistent Memory & Secure Email Verification**

HippoSync is a modern AI chat application featuring cross-session memory persistence through MemMachine V2, multi-provider AI support (OpenAI, Claude, Gemini), secure email verification, and team collaboration capabilities.

---

## ✨ Key Features

- 🧠 **Persistent Memory** - AI remembers you across all conversations
- 🔄 **Cross-Model Memory** - Switch between GPT-4, Claude, Gemini - memory stays intact
- 👥 **Team Projects** - Collaborate with shared AI context
- 🔐 **Secure Authentication** - Email verification with password strength validation
- 🤖 **Multi-Provider Support** - OpenAI, Anthropic, Google Gemini
- 🌐 **Web Search Integration** - Tavily-powered real-time information
- 🎨 **Beautiful UI** - Dark purple gradient theme with glass morphism

---

## 📋 Prerequisites

Before installing HippoSync, ensure you have:

- **Python 3.11 or higher**
- **Node.js 18 or higher** and npm
- **Git**
- **Gmail account** (for email verification during development)

---

## 🚀 Installation Guide

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/Viranshu-30/hipposync.git
cd hipposync
```

---

### **Step 2: Backend Setup**

#### 2.1 Create Virtual Environment

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
# Copy example env file
cp .env.example .env
```

**Edit `backend/.env` with your configuration:**

```env
# Database
DATABASE_URL=sqlite:///./app.db

# Security (REQUIRED - Generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-here-minimum-32-characters
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Provider API Keys (At least one required)
OPENAI_API_KEY=sk-your-openai-key
# ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
# GOOGLE_API_KEY=your-google-key

# Web Search (Optional)
TAVILY_API_KEY=tvly-your-tavily-key

# Email Configuration (REQUIRED for verification)
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
SMTP_USE_TLS=true
FROM_EMAIL=noreply@hipposync.com
FROM_NAME=HippoSync
APP_URL=http://localhost:5173
APP_NAME=HippoSync

# MemMachine Configuration
MEMMACHINE_BASE_URL=http://localhost:8001

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### 2.4 Setup Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to **App Passwords**
4. Generate password for "Mail"
5. Copy the 16-character password to `SMTP_PASSWORD` in `.env`

#### 2.5 Install and Start MemMachine

```bash
# Install MemMachine
pip install memmachine

# Start MemMachine server (in a separate terminal)
memmachine serve
```

**MemMachine will start on `http://localhost:8001`**

#### 2.6 Start Backend Server

```bash
# Make sure you're in backend folder with venv activated
python -m uvicorn app.main:app --reload --port 8000
```

**Backend will start on `http://localhost:8000`**

You should see:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

### **Step 3: Frontend Setup**

Open a **new terminal window**.

#### 3.1 Navigate to Frontend

```bash
cd frontend
```

#### 3.2 Install Node Dependencies

```bash
npm install
```

#### 3.3 Configure Frontend Environment

Create `.env` file in `frontend` folder:

```bash
# frontend/.env
VITE_API_URL=http://localhost:8000
```

#### 3.4 Start Frontend Server

```bash
npm run dev
```

**Frontend will start on `http://localhost:5173`**

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🎯 Using HippoSync

### **First Time Setup**

1. **Open Browser:** Navigate to `http://localhost:5173`

2. **Create Account:**
   - Click "Create Account"
   - Enter your email, password, and optional details
   - Click "Create Account"

3. **Verify Email:**
   - Check your email inbox (and spam folder)
   - Click the verification link
   - You'll be redirected to login after verification

4. **Login:**
   - Enter your verified email and password
   - Click "Sign In"

5. **Configure API Keys:**
   - Click the settings icon (⚙️)
   - Go to "API Keys" tab
   - Enter at least one AI provider API key
   - Click "Save"

6. **Start Chatting:**
   - Type your message in the input box
   - Press Enter or click Send
   - The AI will remember your conversation!


---

## 🔧 Troubleshooting

### **Backend Issues**

#### "Module not found" errors
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall requirements
pip install -r requirements.txt
```

#### "Port already in use"
```bash
# Kill process on port 8000
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -ti:8000 | xargs kill -9

# Or use different port
python -m uvicorn app.main:app --reload --port 8001
```

#### "MemMachine connection refused"
```bash
# Make sure MemMachine is running
memmachine serve

# Check if running on port 8001
# Update MEMMACHINE_BASE_URL in .env if using different port
```

### **Frontend Issues**

#### "Failed to fetch" / CORS errors
```bash
# Check backend is running on port 8000
# Verify VITE_API_URL in frontend/.env
# Check CORS_ORIGINS in backend/.env includes http://localhost:5173
```

#### Dependencies installation fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```


## 🛡️ Security Features

- ✅ **Bcrypt password hashing** - Passwords never stored in plain text
- ✅ **Email verification** - Blocks fake accounts
- ✅ **JWT tokens** - Secure session management
- ✅ **API key encryption** - Fernet encryption for stored keys
- ✅ **Password validation** - Enforces strong passwords
- ✅ **Disposable email blocking** - Prevents temporary emails
- ✅ **Token expiration** - Verification links expire in 24 hours



**Made with 💜 and 🧠**

*Remember everything. Forget nothing. Sync with your AI.*

⭐ Star us on GitHub if you find this useful!

</div>
