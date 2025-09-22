console.log("Cognitive Reader content script loaded.");

chrome.runtime.onMessage.addListener((request) => {
  console.log("📩 Message received in content.js:", request);

  if (request.action === "applySettings") applySettings(request.settings);
  if (request.action === "resetSettings") resetAll();
  if (request.action === "playTTS") enableTTS();
  if (request.action === "pauseTTS") pauseTTS();
  if (request.action === "resumeTTS") resumeTTS();
  if (request.action === "stopTTS") stopTTS();
  if (request.action === "summarizePage") {
    console.log("📝 Summarize request received, sending text to backend...");
    summarizePage();
  }
});


// ===== Settings Handlers =====
function applySettings(settings) {
  if (settings.dyslexiaFont) {
    document.body.style.fontFamily = "'OpenDyslexic', Arial, sans-serif";
    addDyslexiaFont();
  } else document.body.style.fontFamily = "";

  if (settings.focusMode) enableFocusMode(); else disableFocusMode();

  if (settings.highContrast) {
    document.body.style.filter = "contrast(150%) brightness(110%)";
  } else document.body.style.filter = "";
}

function resetAll() {
  document.body.style.fontFamily = "";
  const dyslexiaLink = document.getElementById("dyslexiaFontLink");
  if (dyslexiaLink) dyslexiaLink.remove();
  document.body.style.filter = "";
  disableFocusMode();
  stopTTS();
}

// Dyslexia font
function addDyslexiaFont() {
  if (!document.getElementById("dyslexiaFontLink")) {
    const link = document.createElement("link");
    link.id = "dyslexiaFontLink";
    link.rel = "stylesheet";
    link.href = "https://fonts.cdnfonts.com/css/open-dyslexic";
    document.head.appendChild(link);
  }
}

// ===== Focus Mode =====
let focusOverlay = null;
function enableFocusMode() {
  if (!focusOverlay) {
    focusOverlay = document.createElement("div");
    focusOverlay.style.position = "fixed";
    focusOverlay.style.top = "0";
    focusOverlay.style.left = "0";
    focusOverlay.style.width = "100%";
    focusOverlay.style.height = "100%";
    focusOverlay.style.pointerEvents = "none";
    focusOverlay.style.background = "rgba(0,0,0,0.6)";
    focusOverlay.style.zIndex = "999999";
    document.body.appendChild(focusOverlay);

    document.addEventListener("mousemove", highlightLine);
  }
}

function disableFocusMode() {
  if (focusOverlay) {
    focusOverlay.remove();
    focusOverlay = null;
    document.removeEventListener("mousemove", highlightLine);
  }
}

function highlightLine(e) {
  if (focusOverlay) {
    const lineHeight = 40;
    const top = e.clientY - lineHeight / 2;
    focusOverlay.style.background =
      `linear-gradient(to bottom,
        rgba(0,0,0,0.6) ${top}px,
        rgba(0,0,0,0) ${top + lineHeight}px,
        rgba(0,0,0,0.6) ${top + lineHeight + 1}px)`;
  }
}

// ===== TTS =====
let speechSynthesisUtterance = null;
let isSpeaking = false;

function enableTTS(text = null) {
  stopTTS();
  const content = text || document.body.innerText;
  speechSynthesisUtterance = new SpeechSynthesisUtterance(content);
  speechSynthesisUtterance.lang = "en-US";
  speechSynthesisUtterance.rate = 1.0;
  speechSynthesisUtterance.pitch = 1.0;
  window.speechSynthesis.speak(speechSynthesisUtterance);
  isSpeaking = true;
}

function pauseTTS() { if (isSpeaking) window.speechSynthesis.pause(); }
function resumeTTS() { if (speechSynthesis.paused) window.speechSynthesis.resume(); }
function stopTTS() {
  if (speechSynthesisUtterance) {
    window.speechSynthesis.cancel();
    speechSynthesisUtterance = null;
    isSpeaking = false;
  }
}

// ===== Summarization =====
async function summarizePage() {
  const text = document.body.innerText.slice(0, 2000);
  console.log("Sending text to backend for summarization...");

  try {
const response = await fetch("http://localhost:5000/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Backend response data:", data);

    if (data.summary) {
      console.log("✅ Summary received, showing popup...");
      showSummaryPopup(data.summary);
      enableTTS(data.summary); // Auto-read summary
    } else {
      console.warn("⚠️ No summary returned:", data);
      alert("Failed to summarize.");
    }
  } catch (err) {
    console.error("❌ Summarization error:", err);
  }
}

function showSummaryPopup(summary) {
  const summaryDiv = document.createElement("div");
  summaryDiv.style.position = "fixed";
  summaryDiv.style.bottom = "10px";
  summaryDiv.style.right = "10px";
  summaryDiv.style.width = "320px";
  summaryDiv.style.maxHeight = "250px";
  summaryDiv.style.overflowY = "auto";
  summaryDiv.style.background = "white";
  summaryDiv.style.border = "2px solid #3498db";
  summaryDiv.style.borderRadius = "8px";
  summaryDiv.style.padding = "10px";
  summaryDiv.style.zIndex = "999999";
  summaryDiv.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
  summaryDiv.innerText = summary;

  document.body.appendChild(summaryDiv);
}
