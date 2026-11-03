// Sentinel Chrome Extension — Content Script
// Injects floating real-time compliance pill into web textareas, Notion, Google Docs & CMS inputs

let sentinelPill = null;
let activeElement = null;
let debounceTimer = null;

function createSentinelWidget() {
  if (document.getElementById("sentinel-inline-pill")) return;

  sentinelPill = document.createElement("div");
  sentinelPill.id = "sentinel-inline-pill";
  sentinelPill.className = "sentinel-floating-pill";
  sentinelPill.innerHTML = `
    <div class="sentinel-pill-content">
      <span class="sentinel-pill-icon">🛡️</span>
      <span id="sentinel-pill-score" class="sentinel-pill-score">100</span>
      <span id="sentinel-pill-label" class="sentinel-pill-label">Sentinel Active</span>
    </div>
  `;
  document.body.appendChild(sentinelPill);

  sentinelPill.addEventListener("click", () => {
    // Open companion or trigger inspection
    if (activeElement) {
      checkElementContent(activeElement);
    }
  });
}

async function checkElementContent(el) {
  const text = el.value || el.innerText || "";
  if (!text || text.length < 5) return;

  try {
    const res = await fetch("https://sentinel-kappa-silk.vercel.app/api/companion/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, jurisdiction: "global" })
    });
    if (!res.ok) return;
    const data = await res.json();

    const scoreEl = document.getElementById("sentinel-pill-score");
    const labelEl = document.getElementById("sentinel-pill-label");
    if (scoreEl && labelEl) {
      scoreEl.textContent = data.score;
      if (data.total_issues > 0) {
        scoreEl.style.color = "#f87171";
        labelEl.textContent = `${data.total_issues} violations`;
      } else {
        scoreEl.style.color = "#34d399";
        labelEl.textContent = "Compliant";
      }
    }
  } catch (e) {
    // Silent fail in background
  }
}

// Listen to focus and input on any textarea or contenteditable
document.addEventListener("focusin", (e) => {
  const target = e.target;
  if (target.tagName === "TEXTAREA" || target.isContentEditable || target.type === "text") {
    activeElement = target;
    createSentinelWidget();
    checkElementContent(target);
  }
});

document.addEventListener("input", (e) => {
  if (activeElement) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      checkElementContent(activeElement);
    }, 700);
  }
});

// Message listener for popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_SELECTED_TEXT") {
    const selection = window.getSelection().toString();
    const text = selection || (activeElement ? activeElement.value || activeElement.innerText : "");
    sendResponse({ text });
  }
});
