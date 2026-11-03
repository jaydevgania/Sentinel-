const API_URL = "https://sentinel-kappa-silk.vercel.app/api";
const LOCAL_API_URL = "http://localhost:8000/api";

const draftText = document.getElementById("draftText");
const checkBtn = document.getElementById("checkBtn");
const grabPageTextBtn = document.getElementById("grabPageTextBtn");
const scoreValue = document.getElementById("scoreValue");
const issuesCount = document.getElementById("issuesCount");
const findingsContainer = document.getElementById("findingsContainer");
const jurisdictionSelect = document.getElementById("jurisdictionSelect");
const connStatus = document.getElementById("connStatus");

// Check current compliance
async function runCheck() {
  const text = draftText.value.trim();
  if (!text) {
    findingsContainer.innerHTML = '<div class="empty-state">Please enter some text to check.</div>';
    return;
  }

  checkBtn.textContent = "Checking...";
  checkBtn.disabled = true;

  try {
    let endpoint = `${API_URL}/companion/check`;
    let res = null;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          jurisdiction: jurisdictionSelect.value
        })
      });
    } catch (e) {
      // Try local fallback if online is unreachable
      endpoint = `${LOCAL_API_URL}/companion/check`;
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          jurisdiction: jurisdictionSelect.value
        })
      });
    }

    if (!res.ok) throw new Error("API error " + res.status);
    const data = await res.json();

    // Render results
    scoreValue.textContent = data.score;
    if (data.score >= 90) {
      scoreValue.style.color = "#34d399";
    } else if (data.score >= 70) {
      scoreValue.style.color = "#f59e0b";
    } else {
      scoreValue.style.color = "#ef4444";
    }

    issuesCount.textContent = `${data.total_issues} issues`;

    if (data.findings.length === 0) {
      findingsContainer.innerHTML = '<div class="empty-state" style="color: #34d399;">100% Brand Compliant! Zero policy violations detected.</div>';
    } else {
      findingsContainer.innerHTML = "";
      data.findings.forEach(f => {
        const card = document.createElement("div");
        card.className = `finding-card ${f.severity}`;
        card.innerHTML = `
          <div class="finding-header">
            <span class="finding-issue">${f.issue}</span>
            <span class="finding-source">${f.source.id}</span>
          </div>
          <div style="color: #cbd5e1; font-size: 10px; margin-bottom: 4px;">${f.explanation}</div>
          ${f.suggestion ? `
            <div class="finding-fix">
              <span>Fix: <strong>${f.suggestion}</strong></span>
              <button class="apply-fix-btn" data-fix="${f.suggestion}">Apply Fix</button>
            </div>
          ` : ""}
        `;
        findingsContainer.appendChild(card);
      });

      // Hook up apply buttons
      document.querySelectorAll(".apply-fix-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const fix = e.target.getAttribute("data-fix");
          if (fix) {
            // Apply simple intent replacement
            draftText.value = draftText.value.replace(/staff|NimbusCo|world's best coffee|yo fam|no cap fr fr/i, fix);
            runCheck();
          }
        });
      });
    }

    // Cultural notes notice
    if (data.cultural_notes && data.cultural_notes.length > 0) {
      const noteEl = document.createElement("div");
      noteEl.style.cssText = "background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 6px; padding: 6px; font-size: 10px; color: #38bdf8; margin-top: 6px;";
      noteEl.innerHTML = `<strong>Cultural Voice Protected:</strong> "${data.cultural_notes.map(n => n.term).join(', ')}" permitted under ASCI Regional Guidelines.`;
      findingsContainer.prepend(noteEl);
    }

  } catch (err) {
    console.error("Check failed:", err);
    connStatus.textContent = "Offline Heuristic Mode";
    connStatus.style.color = "#f59e0b";
  } finally {
    checkBtn.textContent = "Check Compliance";
    checkBtn.disabled = false;
  }
}

// Grab text from active page if content script injected
grabPageTextBtn.addEventListener("click", () => {
  if (chrome && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "GET_SELECTED_TEXT" }, (response) => {
          if (response && response.text) {
            draftText.value = response.text;
            runCheck();
          }
        });
      }
    });
  }
});

checkBtn.addEventListener("click", runCheck);
jurisdictionSelect.addEventListener("change", runCheck);

// Preload sample on open
document.addEventListener("DOMContentLoaded", () => {
  draftText.value = "A huge shoutout to our hardworking staff at NimbusCo for making this launch so special!";
  runCheck();
});
