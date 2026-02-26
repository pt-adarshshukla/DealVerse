import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, TrendingUp, Zap, Package, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { formatPrice } from '../lib/utils';
import { getTrendingDeals } from '../services/geminiService';
import { ProductSkeleton } from '../components/Skeleton';
import { SmartImage } from '../components/SmartImage';
import { cn } from '../lib/utils';

export default function HomePage() {
  const { currency, user, trendingDeals, setTrendingDeals } = useAppContext();
  const [isLoadingTrending, setIsLoadingTrending] = useState(trendingDeals.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = async (bypassCache: boolean = false) => {
    setIsLoadingTrending(true);
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
      setIsLoadingTrending(false);
    }
  };

  useEffect(() => {
    // Always bypass cache on initial load to get fresh deals
    fetchTrending(true);
  }, [currency]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            DealVerse <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-xs uppercase tracking-wider font-bold border border-emerald-500/30">AI</span>
          </h1>
          <p className="text-sm text-zinc-400">Smartest way to shop.</p>
        </div>
        <Link to="/profile">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center">
            {user ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
            ) : (
              <span className="text-xs text-zinc-500 font-medium">Login</span>
            )}
          </div>
        </Link>
      </div>

      {/* Search Bar */}
      <Link to="/search" className="block">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-xl">
            <Search className="text-zinc-400 mr-3" size={20} />
            <span className="text-zinc-400 flex-1">Search anything...</span>
            <div className="p-2 bg-zinc-800 rounded-xl">
              <Sparkles className="text-emerald-400" size={16} />
            </div>
          </div>
        </div>
      </Link>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/search" className="bg-zinc-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 hover:bg-zinc-800/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Sparkles className="text-emerald-400" size={16} />
          </div>
          <div>
            <div className="font-medium text-sm">AI Search</div>
            <div className="text-xs text-zinc-500">Find best deals</div>
          </div>
        </Link>
        <Link to="/pre-owned" className="bg-zinc-900 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 hover:bg-zinc-800/50 transition-colors">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Zap className="text-amber-400" size={16} />
          </div>
          <div>
            <div className="font-medium text-sm">Pre-Owned</div>
            <div className="text-xs text-zinc-500">Smart refurbished</div>
          </div>
        </Link>
      </div>

      {/* Trending Deals */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" /> Trending Drops
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => fetchTrending(true)}
              disabled={isLoadingTrending}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-zinc-500 hover:text-emerald-400 disabled:opacity-50"
              title="Refresh deals"
            >
              <RefreshCw size={14} className={isLoadingTrending ? 'animate-spin' : ''} />
            </button>
            <Link to="/trending" className="text-xs text-emerald-400 font-medium">View All</Link>
          </div>
        </div>
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {isLoadingTrending ? (
              <motion.div 
                key="skeletons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {[1, 2, 3].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </motion.div>
            ) : trendingDeals.length > 0 ? (
              trendingDeals.map((deal) => (
                <motion.div 
                  key={deal.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  layout
                  className="flex gap-4 p-3 rounded-2xl bg-zinc-900/50 border border-white/5 relative group"
                >
                  <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
                    {deal.imageUrl && deal.imageUrl.startsWith('http') ? (
                      <SmartImage src={deal.imageUrl} alt={deal.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-zinc-500" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-xs text-zinc-500 mb-1">{deal.platform} {deal.rating ? `• ${deal.rating}★` : ''}</div>
                    <div className="font-medium text-sm line-clamp-2 mb-2">{deal.title}</div>
                    <div className="flex items-end justify-between">
                      <div className="flex items-end gap-2">
                        <span className="text-lg font-bold text-white">{formatPrice(deal.price, currency)}</span>
                        {deal.originalPrice && (
                          <span className="text-xs text-zinc-500 line-through mb-1">{formatPrice(deal.originalPrice, currency)}</span>
                        )}
                        {deal.discount && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded mb-1">-{deal.discount}%</span>
                        )}
                      </div>
                      {deal.productUrl && (
                        <a 
                          href={deal.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500 hover:text-black px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                        >
                          Buy
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
                className="text-center py-8 space-y-4"
              >
                <p className="text-sm text-zinc-500">{error || "No trending deals found right now."}</p>
                <button 
                  onClick={() => fetchTrending(true)}
                  className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-xl text-xs font-bold text-emerald-400 hover:bg-zinc-800 transition-colors"
                >
                  {error ? 'Try Again' : 'Retry Search'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
