// Apply settings
document.getElementById("applyBtn").addEventListener("click", () => {
  const settings = {
    dyslexiaFont: document.getElementById("dyslexiaFont").checked,
    focusMode: document.getElementById("focusMode").checked,
    highContrast: document.getElementById("highContrast").checked
  };

  chrome.storage.sync.set({ settings }, () => {
    console.log("Settings saved:", settings);
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applySettings", settings });
  });
});

// Reset settings
document.getElementById("resetBtn").addEventListener("click", () => {
  chrome.storage.sync.clear(() => {
    console.log("Settings cleared.");
  });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "resetSettings" });
  });

  document.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = false);
});

// TTS controls
document.getElementById("playTTS").addEventListener("click", () => {
  sendAction("playTTS");
});
document.getElementById("pauseTTS").addEventListener("click", () => {
  sendAction("pauseTTS");
});
document.getElementById("resumeTTS").addEventListener("click", () => {
  sendAction("resumeTTS");
});
document.getElementById("stopTTS").addEventListener("click", () => {
  sendAction("stopTTS");
});

document.getElementById("summarizeBtn").addEventListener("click", () => {
  console.log("📖 Summarize button clicked!");
  sendAction("summarizePage");
});


function sendAction(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action });
  });
}
