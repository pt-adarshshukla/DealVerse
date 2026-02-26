import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, ShieldCheck, AlertTriangle, CheckCircle2, Loader2, Package, RefreshCw } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { getPreOwnedDeals } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { GridProductSkeleton } from '../components/Skeleton';
import { SmartImage } from '../components/SmartImage';

export default function PreOwnedPage() {
  const { currency, preOwnedDeals, setPreOwnedDeals } = useAppContext();
  const [isLoading, setIsLoading] = useState(preOwnedDeals.length === 0);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = async (bypassCache: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPreOwnedDeals(currency, bypassCache);
      if (data && data.length > 0) {
        setPreOwnedDeals(data);
      } else {
        setPreOwnedDeals([]);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'RATE_LIMIT_EXCEEDED') {
        setError('Rate limit exceeded. Please wait a minute before retrying.');
      } else {
        setError('Something went wrong. Please try again.');
      }
      setPreOwnedDeals([]);
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
      className="p-4 flex flex-col h-full min-h-screen pb-24"
    >
      <div className="sticky top-0 z-10 pt-4 pb-4 bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tag className="text-amber-400" /> Pre-Owned Smart Deals
          </h1>
          <p className="text-sm text-zinc-400 mt-1">AI-verified refurbished and used products.</p>
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

      <div className="grid grid-cols-2 gap-3 mt-2">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div 
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="contents"
            >
              {[1, 2, 3, 4].map((i) => (
                <GridProductSkeleton key={i} />
              ))}
            </motion.div>
          ) : preOwnedDeals.length > 0 ? (
            preOwnedDeals.map((deal, index) => (
              <motion.div 
                key={deal.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                layout
                className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col relative group"
              >
                {deal.worthBuying && (
                  <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <CheckCircle2 size={10} /> Worth Buying
                  </div>
                )}
                
                <div className="aspect-square bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                  {deal.imageUrl && deal.imageUrl.startsWith('http') ? (
                    <SmartImage src={deal.imageUrl} alt={deal.title} />
                  ) : (
                    <Package className="text-zinc-500" size={32} />
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-[9px] px-2 py-1 rounded-md text-white font-medium border border-white/10 flex items-center gap-1">
                    {deal.platform} {deal.platformRating ? <span className="text-amber-400 border-l border-white/20 pl-1 ml-0.5">{deal.platformRating}★</span> : ''}
                  </div>
                </div>
                
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-medium text-xs line-clamp-2 mb-2 text-zinc-100 h-8">
                    {deal.title}
                  </h3>
                  
                  <div className="mt-auto">
                    <div className="flex items-end gap-1.5 mb-2">
                      <span className="text-lg font-bold text-white">{formatPrice(deal.price, currency)}</span>
                      <span className="text-[10px] text-zinc-500 line-through mb-0.5">{formatPrice(deal.newPrice, currency)} new</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <span>Condition:</span>
                        <span className={cn(
                          "font-bold",
                          deal.conditionScore > 80 ? "text-emerald-400" :
                          deal.conditionScore > 60 ? "text-amber-400" :
                          "text-red-400"
                        )}>{deal.conditionScore}/100</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {deal.riskLevel === 'Low' ? (
                          <ShieldCheck size={12} className="text-emerald-400" />
                        ) : deal.riskLevel === 'Medium' ? (
                          <AlertTriangle size={12} className="text-amber-400" />
                        ) : (
                          <AlertTriangle size={12} className="text-red-400" />
                        )}
                        <span className={cn(
                          deal.riskLevel === 'Low' ? "text-emerald-400" :
                          deal.riskLevel === 'Medium' ? "text-amber-400" :
                          "text-red-400"
                        )}>{deal.riskLevel} Risk</span>
                      </div>
                    </div>
                    
                    {deal.productUrl && (
                      <a 
                        href={deal.productUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-3 block text-center w-full bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-white/5"
                      >
                        View Deal
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
              className="col-span-2 text-center py-20 space-y-4"
            >
              <p className="text-sm text-zinc-500">{error || "No pre-owned deals found right now."}</p>
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
