export default function Hero() {
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16 lg:px-24">
      <div className="max-w-2xl">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-stone-800 mb-6 animate-in fade-in duration-700">
          AI Investment Research
        </h1>
        
        <div className="w-16 h-1 bg-stone-300 mb-8"></div>
        
        <div className="space-y-6 text-lg text-stone-600 leading-relaxed animate-in fade-in duration-700 delay-150">
          <p>
            An autonomous paper trading experiment powered by artificial intelligence.
          </p>
          
          <p>
            This system analyzes market data and makes investment decisions automatically, 
            tracking performance in real-time.
          </p>
          
          <p className="text-base text-stone-500">
            Paper trading only - no real money involved.
          </p>
        </div>
      </div>
    </div>
  );
}
