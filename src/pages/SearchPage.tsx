import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Image as ImageIcon, Sparkles, Loader2, Camera, X, Package } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';
import { searchProducts, visionSearch } from '../services/geminiService';
import { useAppContext } from '../context/AppContext';
import { ProductSkeleton } from '../components/Skeleton';
import { SmartImage } from '../components/SmartImage';

export default function SearchPage() {
  const { currency } = useAppContext();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query && !imageFile) return;

    setIsSearching(true);
    setResults([]);
    setError(null);

    try {
      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            const data = await visionSearch(base64Data, imageFile.type, currency);
            if (data.products) {
              setResults(data.products);
            }
          } catch (err: any) {
            if (err.message === 'RATE_LIMIT_EXCEEDED') {
              setError('Rate limit exceeded. Please wait a minute.');
            } else {
              setError('Search failed. Please try again.');
            }
          } finally {
            setIsSearching(false);
          }
        };
        reader.readAsDataURL(imageFile);
      } else {
        const products = await searchProducts(query, currency);
        setResults(products);
        setIsSearching(false);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'RATE_LIMIT_EXCEEDED') {
        setError('Rate limit exceeded. Please wait a minute.');
      } else {
        setError('Search failed. Please try again.');
      }
      setIsSearching(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setQuery(''); // Clear text query when image is uploaded
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 flex flex-col h-full min-h-screen pb-24"
    >
      <div className="sticky top-0 z-10 pt-4 pb-4 bg-zinc-950/80 backdrop-blur-xl">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-emerald-400" /> AI Search
        </h1>
        
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-xl">
            
            {imagePreview ? (
              <div className="relative w-12 h-12 rounded-xl overflow-hidden mr-3 border border-white/10 shrink-0">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={clearImage}
                  className="absolute top-0.5 right-0.5 bg-black/50 rounded-full p-0.5"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ) : (
              <Search className="text-zinc-400 ml-2 mr-3 shrink-0" size={20} />
            )}

            <input
              type="text"
              placeholder={imagePreview ? "Image attached. Add context..." : "Search products, paste link..."}
              className="bg-transparent border-none outline-none text-white flex-1 min-w-0 placeholder:text-zinc-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isSearching}
            />
            
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-zinc-400 hover:text-white transition-colors"
            >
              <Camera size={20} />
            </button>
            
            <button 
              type="submit"
              disabled={isSearching || (!query && !imageFile)}
              className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl ml-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            </button>
          </div>
        </form>
      </div>

      <div className="flex-1 mt-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-6"
          >
            <p className="text-sm text-red-400 text-center">{error}</p>
          </motion.div>
        )}

        {isSearching ? (
            <motion.div 
              key="searching"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto text-emerald-400 animate-pulse" size={24} />
                </div>
                <p className="text-sm text-zinc-400 animate-pulse">AI is scanning the web for best deals...</p>
              </div>
              {[1, 2, 3].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Top Results</h2>
                <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full text-zinc-300">{results.length} found</span>
              </div>
              
              {results.map((product, index) => (
                <motion.div 
                  key={product.id || index} 
                  layout
                  className={cn(
                    "relative p-4 rounded-3xl border transition-all",
                    product.isBestDeal || index === 0 
                      ? "bg-gradient-to-br from-zinc-900 to-zinc-950 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]" 
                      : "bg-zinc-900/50 border-white/5"
                  )}
                >
                  {(product.isBestDeal || index === 0) && (
                    <div className="absolute -top-3 left-4 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                      <Sparkles size={12} /> Best Deal
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-2">
                    <div className="w-24 h-24 rounded-2xl bg-zinc-800 overflow-hidden shrink-0 border border-white/5">
                      {product.imageUrl && product.imageUrl.startsWith('http') ? (
                        <SmartImage src={product.imageUrl} alt={product.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="text-zinc-500" size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-medium text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
                          {product.platform}
                        </span>
                        {product.matchType && (
                          <span className="text-[10px] font-medium text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-md">
                            {product.matchType}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-sm line-clamp-2 leading-snug mb-2 text-zinc-100">
                        {product.title}
                      </h3>
                      
                      {product.description && (
                        <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white">{formatPrice(product.price, currency)}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-xs text-zinc-500 line-through">{formatPrice(product.originalPrice, currency)}</span>
                            )}
                          </div>
                          {product.rating && (
                            <div className="text-[10px] text-zinc-400 mt-0.5">
                              ★ {product.rating} {product.reviewsCount ? `(${product.reviewsCount})` : ''}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 items-center">
                          {product.dealScore && (
                            <div className="flex flex-col items-center">
                              <div className="text-[10px] text-zinc-500 mb-0.5">Deal Score</div>
                              <div className={cn(
                                "text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center border-2",
                                product.dealScore > 80 ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10" :
                                product.dealScore > 60 ? "text-amber-400 border-amber-400/30 bg-amber-400/10" :
                                "text-zinc-400 border-zinc-400/30 bg-zinc-400/10"
                              )}>
                                {product.dealScore}
                              </div>
                            </div>
                          )}
                          {product.productUrl && (
                            <a 
                              href={product.productUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                            >
                              Buy
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {product.aiRecommendation && (
                    <div className="mt-4 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-xs text-emerald-200/80 flex items-start gap-2">
                      <Sparkles size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                      <p>{product.aiRecommendation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : !query && !imageFile ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-center px-8"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4 border border-white/5">
                <Camera className="text-zinc-500" size={24} />
              </div>
              <h3 className="text-lg font-medium text-zinc-300 mb-2">Circle to Search</h3>
              <p className="text-sm text-zinc-500">
                Upload an image of any product to instantly find it across all stores, compare prices, and discover cheaper alternatives.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
