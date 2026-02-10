"use client";

import { useEffect } from "react";

export function DebugDialogCheck() {
  useEffect(() => {
    // Log all portals and overlays
    const checkDialogs = () => {
      const portals = document.querySelectorAll('[data-radix-portal]');
      const overlays = document.querySelectorAll('[data-state]');
      const dialogs = document.querySelectorAll('[role="dialog"]');

      console.log("🔍 Dialog Debug Info:", {
        portals: portals.length,
        overlays: Array.from(overlays).slice(0, 3).map(o => ({
          tagName: o.tagName,
          dataState: o.getAttribute('data-state'),
          className: o.className,
          pointerEvents: window.getComputedStyle(o).pointerEvents,
          display: window.getComputedStyle(o).display,
          zIndex: window.getComputedStyle(o).zIndex,
        })),
        dialogs: Array.from(dialogs).map(d => ({
          dataState: d.getAttribute('data-state'),
          pointerEvents: window.getComputedStyle(d).pointerEvents,
          display: window.getComputedStyle(d).display,
          visibility: window.getComputedStyle(d).visibility,
        })),
      });
    };

    // Check every 2 seconds
    const interval = setInterval(checkDialogs, 2000);

    // Run on mount
    checkDialogs();

    return () => clearInterval(interval);
  }, []);

  return null;
}
