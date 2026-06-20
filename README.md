<div align="center">
  <img src="public/favicon.svg" alt="Logo" width="72" height="72">
  <h1>Interview AI</h1>
  <p><strong>A stealthy, real-time AI interview copilot built with React, Electron, and Gemini 2.0 Flash.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Electron-Desktop-blue?style=flat-square&logo=electron" />
    <img src="https://img.shields.io/badge/Gemini%202.0-Flash-orange?style=flat-square&logo=google" />
    <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel" />
    <img src="https://img.shields.io/badge/Stealth-Screen%20Share%20Proof-green?style=flat-square" />
  </p>
</div>

---

Interview AI listens to your interviewer in real time, detects questions, and streams formatted answers to a floating transparent widget — completely invisible to screen-sharing software.

---

## ✨ Features

- 🎙️ **Real-time speech recognition** — detects questions automatically, no manual input needed
- ⚡ **Gemini 2.0 Flash** — blazing-fast streamed answers with bullet points and syntax-highlighted code
- 🥷 **Stealth desktop mode** — OS-level transparent window, physically impossible for Zoom or Meet to capture
- 🌐 **Web-ready** — deploy to Vercel in one click with Picture-in-Picture browser mode
- 🎨 **Glassmorphism UI** — sleek, minimal design that blends into your desktop

---

## 🚀 Two Ways to Run It

### 🖥️ Desktop App — Stealth Mode (Recommended)

A fully transparent floating window that hovers over your video call. Screen-sharing software **cannot capture it**, even if you share your entire screen.

> ⚠️ Due to Google's restrictions, the microphone feature is disabled in desktop mode. Use manual keyword input instead.

```bash
npm install
npm start
```

### 🌐 Web Mode — Auto Listen

Runs in Chrome and **automatically listens** to the interviewer via your microphone. Deploy to Vercel for a zero-install experience.

> ⚠️ Browser popups aren't truly transparent — only share the "Meet Tab" to keep the popup off your screen share.

```bash
npm install
npm run dev
```

---

## 🛠️ Setup

**1. Clone the repo**
```bash
git clone https://github.com/Himanshu0710-array/Interview_Assist.git
cd Interview_Assist
```

**2. Install dependencies**
```bash
npm install
```

**3. Add your Gemini API key**

Open the app → click the ⚙️ Settings icon → paste your free [Google Gemini API key](https://makersuite.google.com/app/apikey)

**4. Deploy to Vercel (optional)**

Import the GitHub repo in Vercel and click Deploy — it handles everything automatically.

---

<div align="center">
  <i>Built to make technical interviews stress-free.</i>
</div>
