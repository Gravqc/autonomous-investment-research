"use client";

import { useState } from "react";

interface TooltipProps {
  content: string;
}

export default function Tooltip({ content }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 text-xs text-stone-400 hover:text-stone-600 transition-colors cursor-pointer border border-stone-300 rounded-full select-none"
        aria-label="More information"
        type="button"
      >
        ?
      </button>
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-xs text-stone-700 bg-white border border-stone-200 rounded-lg shadow-lg whitespace-nowrap max-w-xs pointer-events-none select-none">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
        </div>
      )}
    </div>
  );
}
