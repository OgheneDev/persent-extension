import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Persent",
  version: "1.0.0",
  description: "Send bulk personalized emails directly from Gmail",

  permissions: ["storage", "identity", "tabs"],
  host_permissions: ["https://mail.google.com/*"],

  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },

  content_scripts: [
    {
      matches: ["https://mail.google.com/*"],
      js: ["src/content/index.tsx"],
      run_at: "document_idle",
    },
  ],

  action: {
    default_popup: "src/popup/index.html",
    default_icon: {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png",
    },
  },

  icons: {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },

  web_accessible_resources: [
    {
      resources: ["src/sidebar/*", "assets/*"],
      matches: ["https://mail.google.com/*"],
    },
  ],
});
