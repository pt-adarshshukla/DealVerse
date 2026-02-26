import { useState, useEffect } from 'react';
import { Package } from 'lucide-react';
import { cn } from '../lib/utils';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function SmartImage({ src, alt, className }: SmartImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  // Reset state if src changes
  useEffect(() => {
    setImgSrc(src);
    setIsLoaded(false);
    setError(false);
  }, [src]);

  const handleError = () => {
    // If the original image fails, try routing it through multiple image proxies sequentially
    if (error) return;

    const proxies = [
      (u: string) => `https://wsrv.nl/?url=${encodeURIComponent(u)}&default=error`,
      (u: string) => `https://images.weserv.nl/?url=${encodeURIComponent(u)}`,
      (u: string) => `https://i0.wp.com/${u.replace(/^https?:\/\//, '')}`,
      (u: string) => `https://images.weserv.nl/?url=${encodeURIComponent(u)}&w=300&h=300&fit=cover`
    ];

    const currentProxyIndex = proxies.findIndex(p => imgSrc.includes(p('').split('?')[0].replace('https://', '')));
    const nextProxyIndex = currentProxyIndex + 1;

    if (nextProxyIndex < proxies.length) {
      setImgSrc(proxies[nextProxyIndex](src));
    } else {
      setError(true);
    }
  };

  if (!src) {
    return (
      <div className={cn("relative w-full h-full bg-zinc-800 flex items-center justify-center overflow-hidden", className)}>
        <Package className="text-zinc-600" size={24} />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full bg-zinc-800 flex items-center justify-center overflow-hidden", className)}>
      {!isLoaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-zinc-700" />
      )}
      {error ? (
        <Package className="text-zinc-600" size={24} />
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
