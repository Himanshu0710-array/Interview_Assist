<div align="center">
  <img src="public/favicon.svg" alt="Logo" width="80" height="80">
  <h1 align="center">Interview AI</h1>
  <p align="center">
    <strong>A stealthy, real-time AI interview copilot built with React, Electron, and Gemini 2.0 Flash.</strong>
  </p>
</div>

<br />

Interview AI is a powerful assistant designed to help you ace technical interviews. It actively listens to your interviewer, detects questions, and streams highly accurate, formatting-rich answers directly to a floating transparent widget on your screen.

---

## ✨ Features

- **🎙️ Real-Time Speech Recognition**: Seamlessly captures interviewer audio and automatically detects incoming questions without manual input.
- **⚡ Gemini 2.0 Flash Integration**: Streams blazing-fast, intelligent answers using Google's latest multimodal AI. Answers are beautifully formatted with bullet points and syntax-highlighted code blocks.
- **🥷 Stealth Desktop Mode (Electron)**: Ships with a native Windows application wrapper that creates a **100% transparent, glass-like widget**. Using OS-level APIs, the widget is completely invisible to screen-sharing software like Google Meet and Zoom.
- **🌐 Web-Ready (Vercel)**: Fully configured to deploy as a standard web application with a Picture-in-Picture (PiP) mode for users who prefer a zero-install browser experience.
- **🎨 Glassmorphism UI**: Features a sleek, modern light-theme UI that blends right into your desktop environment.

---

## 🚀 Two Ways to Use

Depending on your needs, you can run Interview AI in two different modes:

### 1. The "Stealth" Desktop App (Recommended)
This mode provides a completely transparent window that hovers over your video call. **It is physically impossible for screen-sharing software to capture this window** (even if you share your entire screen).
*Note: Due to Google's restrictions on desktop apps, the automatic microphone feature is disabled in this mode. You will need to manually type keywords to get answers.*

**To run Desktop mode locally:**
```bash
npm install
npm start
```

### 2. The Web Browser Mode
If you prefer the AI to **automatically listen** to the interviewer via your microphone, you must run the app in your Chrome browser. 
*Note: Browser popups cannot be truly transparent. You must be careful to only share the "Meet Tab" so the popup isn't caught on the screen share.*

**To run Web mode locally:**
```bash
npm install
npm run dev
```
*(Or simply visit your deployed Vercel URL!)*

---

## 🛠️ Setup & Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Himanshu0710-array/Interview_Assist.git
cd Interview_Assist
```

2. **Install dependencies:**
```bash
npm install
```

3. **Add your Gemini API Key:**
Open the app (either desktop or web), click the **⚙️ Settings** icon, and paste your free Google Gemini API key.

4. **Deploy to Vercel (Optional):**
Click "Add New Project" in Vercel, import this GitHub repository, and click Deploy. Vercel will automatically handle the build process!

---

<div align="center">
  <i>Built to make technical interviews stress-free.</i>
</div>
