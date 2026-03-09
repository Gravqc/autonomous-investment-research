"use client";

import { useState, useEffect } from "react";

export default function HostingNote() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the note
    const dismissed = localStorage.getItem("hostingNoteDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    } else {
      // Show after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("hostingNoteDismissed", "true");
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-xs bg-white border border-stone-200 rounded-lg shadow-lg p-3 text-xs text-stone-600 z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-2">
        <span className="text-blue-500 text-base">ℹ️</span>
        <div className="flex-1">
          <p className="font-medium text-stone-700 mb-1">Note about loading times</p>
          <p>
            Data may take a moment to load due to our cost-effective hosting setup. 
            Thank you for your patience!
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-stone-400 hover:text-stone-600 transition-colors ml-1"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
