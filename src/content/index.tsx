import React from "react";
import { createRoot } from "react-dom/client";
import Sidebar from "../sidebar/Sidebar";

const SIDEBAR_ID = "persent-extension-sidebar";
const SIDEBAR_TOGGLE_ID = "persent-extension-toggle";
const SIDEBAR_WIDTH = "380px";

/**
 * Updated Theme: Midnight Stealth
 */
const THEME = {
  bg: "#0f172a", // Slate 900
  surface: "#1e293b", // Slate 800
  buttonBg: "#1a1a1a", // Deep charcoal
  accent: "#10b981", // Emerald 500 (used for icons/hover)
  text: "#f8fafc",
  border: "rgba(255, 255, 255, 0.08)",
  shadow: "rgba(0, 0, 0, 0.5)",
};

/**
 * Logo SVG Component
 */
const LOGO_SVG = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2L4.5 20.29C4.21 21 4.7 21.75 5.45 21.75H12V2Z" fill="${THEME.accent}"/>
  <path d="M12 2L19.5 20.29C19.79 21 19.3 21.75 18.55 21.75H12V2Z" fill="${THEME.accent}" fill-opacity="0.4"/>
</svg>
`;

function injectSidebar(): void {
  if (document.getElementById(SIDEBAR_ID)) return;

  // ─── Inject Global Styles ──────────────────────────────────────────
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700&display=swap');
    #${SIDEBAR_ID} * { box-sizing: border-box; }
  `;
  document.head.appendChild(styleSheet);

  // ─── Sidebar Container ─────────────────────────────────────────────
  const container = document.createElement("div");
  container.id = SIDEBAR_ID;
  container.style.cssText = `
    position: fixed;
    top: 0;
    right: -${SIDEBAR_WIDTH};
    width: ${SIDEBAR_WIDTH};
    height: 100vh;
    z-index: 2147483647;
    background: ${THEME.bg};
    box-shadow: -20px 0 60px ${THEME.shadow};
    display: flex;
    flex-direction: column;
    transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: 'Plus Jakarta Sans', sans-serif;
    border-left: 1px solid ${THEME.border};
  `;
  document.body.appendChild(container);

  // ─── Dark Minimalist Toggle ────────────────────────────────────────
  const toggle = document.createElement("button");
  toggle.id = SIDEBAR_TOGGLE_ID;
  toggle.innerHTML = LOGO_SVG;

  toggle.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    z-index: 2147483646;
    background: ${THEME.buttonBg};
    border: 1px solid ${THEME.border};
    width: 56px;
    height: 56px;
    border-radius: 16px; 
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 25px ${THEME.shadow};
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  `;

  // Interaction Logic
  toggle.onmouseenter = () => {
    toggle.style.transform = "translateY(-2px)";
    toggle.style.borderColor = THEME.accent;
    toggle.style.boxShadow = `0 10px 30px rgba(16, 185, 129, 0.2)`;
  };
  toggle.onmouseleave = () => {
    toggle.style.transform = "translateY(0)";
    toggle.style.borderColor = THEME.border;
    toggle.style.boxShadow = `0 10px 25px ${THEME.shadow}`;
  };

  document.body.appendChild(toggle);

  // ─── React Mount ───────────────────────────────────────────────────
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Sidebar onClose={() => hideSidebar(container, toggle)} />
    </React.StrictMode>,
  );

  toggle.addEventListener("click", () => {
    const isVisible = container.style.right === "0px";
    isVisible ? hideSidebar(container, toggle) : showSidebar(container, toggle);
  });
}

function showSidebar(container: HTMLElement, toggle: HTMLElement): void {
  container.style.right = "0px";
  toggle.style.right = "404px";
  toggle.style.opacity = "0.6";
}

function hideSidebar(container: HTMLElement, toggle: HTMLElement): void {
  container.style.right = `-${SIDEBAR_WIDTH}`;
  toggle.style.right = "30px";
  toggle.style.opacity = "1";
}

// ─── Gmail Observer ──────────────────────────────────────────────────
function waitForGmail(): void {
  const observer = new MutationObserver(() => {
    const gmailReady = document.querySelector('[role="main"]');
    if (gmailReady) {
      observer.disconnect();
      injectSidebar();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", waitForGmail);
} else {
  waitForGmail();
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TOGGLE_SIDEBAR") {
    const container = document.getElementById(SIDEBAR_ID);
    const toggle = document.getElementById(SIDEBAR_TOGGLE_ID);
    if (!container || !toggle) return;
    const isVisible = container.style.right === "0px";
    isVisible ? hideSidebar(container, toggle) : showSidebar(container, toggle);
  }
});

export {};
