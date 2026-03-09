"use client";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  message = "Loading portfolio data...", 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const containerClass = fullScreen 
    ? "fixed inset-0 flex flex-col items-center justify-center bg-stone-50 z-50"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClass}>
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-stone-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="text-stone-600 text-sm">{message}</p>
      <p className="text-stone-400 text-xs mt-2">
        This may take a moment due to our hosting setup
      </p>
    </div>
  );
}
