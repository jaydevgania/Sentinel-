// Sentinel Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log("Sentinel Brand Governance Companion installed.");
  
  // Create context menu item for checking selected text
  chrome.contextMenus.create({
    id: "sentinel-check-selection",
    title: "Check with Sentinel Brand Review",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sentinel-check-selection" && info.selectionText) {
    // Open popup or send message
    chrome.action.openPopup();
  }
});
