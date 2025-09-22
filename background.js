// Background service worker for Cognitive Adaptive Reader
chrome.runtime.onInstalled.addListener(() => {
  console.log("🧠 Cognitive Adaptive Reader installed and ready!");
});

// Optional: Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked on:", tab.url);
});
