import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, Flame, ArrowUpRight, BellRing, Loader2, Package, RefreshCw } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { formatPrice } from '../lib/utils';
import { getTrendingDeals } from '../services/geminiService';
import { SmartImage } from '../components/SmartImage';
import { TrendingSkeleton } from '../components/Skeleton';

const generateMockChartData = (currentPrice: number, originalPrice: number) => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  let price = originalPrice;
  const dropStep = (originalPrice - currentPrice) / 3;
  
  for (let i = 0; i < 7; i++) {
    if (i > 3) {
      price = Math.max(currentPrice, price - dropStep);
    }
    data.push({ name: months[i], price: Math.round(price) });
  }
  return data;
};

export default function TrendingPage() {
  const { currency, trendingDeals, setTrendingDeals } = useAppContext();
  const [isLoading, setIsLoading] = useState(trendingDeals.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async (bypassCache: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTrendingDeals(currency, bypassCache);
      if (data && data.length > 0) {
        setTrendingDeals(data);
      } else {
        setTrendingDeals([]);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'RATE_LIMIT_EXCEEDED') {
        setError('Rate limit exceeded. Please wait a minute before retrying.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setTrendingDeals([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Always bypass cache on initial load to get fresh deals
    fetchDeals(true);
  }, [currency]);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 flex flex-col h-full min-h-screen pb-24 space-y-6"
    >
      <div className="sticky top-0 z-10 pt-4 pb-4 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="text-cyan-400" /> Trending Drops
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Products with massive price drops today.</p>
        </div>
        <button 
          onClick={() => fetchDeals(true)}
          disabled={isLoading}
          className="p-2 hover:bg-white/5 rounded-xl transition-colors text-zinc-400 hover:text-emerald-400 disabled:opacity-50"
          title="Refresh deals"
        >
          <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div 
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {[1, 2, 3].map((i) => (
                <TrendingSkeleton key={i} />
              ))}
            </motion.div>
          ) : trendingDeals.length > 0 ? (
            trendingDeals.map((deal, index) => (
              <motion.div 
                key={deal.id || index} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className="bg-zinc-900 border border-white/5 rounded-3xl p-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/10 overflow-hidden shrink-0">
                      {deal.imageUrl && deal.imageUrl.startsWith('http') ? (
                        <SmartImage src={deal.imageUrl} alt={deal.title} />
                      ) : (
                        <Package className="text-zinc-500" size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{deal.title}</h3>
                      <p className="text-xs text-zinc-400">{deal.platform} • {deal.rating ? `${deal.rating}★` : 'Trending'}</p>
                    </div>
                  </div>
                  {deal.discount && (
                    <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-500/20 shrink-0 ml-2">
                      <ArrowUpRight size={14} className="rotate-180" /> {deal.discount}% Off
                    </div>
                  )}
                </div>
                
                <div className="h-32 w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateMockChartData(deal.price, deal.originalPrice || deal.price * 1.2)} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`colorPrice${index}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [formatPrice(value, currency), 'Price']}
                      />
                      <Area type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill={`url(#colorPrice${index})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-white/5 relative z-10">
                  <div>
                    <div className="text-2xl font-bold text-white">{formatPrice(deal.price, currency)}</div>
                    {deal.originalPrice && (
                      <div className="text-xs text-zinc-500 line-through">{formatPrice(deal.originalPrice, currency)}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors border border-white/5">
                      <BellRing size={18} />
                    </button>
                    {deal.productUrl && (
                      <a 
                        href={deal.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 h-10 rounded-xl bg-cyan-500 text-black font-bold text-sm hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center"
                      >
                        Buy Now
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 space-y-4"
            >
              <p className="text-sm text-zinc-500">{error || "No trending deals found right now."}</p>
              <button 
                onClick={() => fetchDeals(true)}
                className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-emerald-400 hover:bg-zinc-800 transition-colors"
              >
                {error ? 'Try Again' : 'Retry Search'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
