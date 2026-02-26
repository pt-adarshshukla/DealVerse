import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';
export type User = { name: string; email: string; avatar: string } | null;

const DEFAULT_TRENDING = [
  { id: 't1', title: 'Samsung Galaxy S23 Ultra (256GB)', platform: 'Amazon', price: 74999, originalPrice: 149999, discount: 50, rating: 4.8, imageUrl: 'https://m.media-amazon.com/images/I/71lD7eGdW-L._SX679_.jpg', productUrl: 'https://www.amazon.in/Samsung-Galaxy-Ultra-Phantom-Storage/dp/B0BSRLKV47' },
  { id: 't2', title: 'Sony OLED 55 inch 4K Smart TV', platform: 'Amazon', price: 109990, originalPrice: 249900, discount: 56, rating: 4.7, imageUrl: 'https://m.media-amazon.com/images/I/81aZJ1yB0sL._SX679_.jpg', productUrl: 'https://www.amazon.in/Sony-Bravia-inches-XR-55A80K-OLED/dp/B0B18H62V6' },
  { id: 't3', title: 'MacBook Air M1 (8GB, 256GB)', platform: 'Amazon', price: 65990, originalPrice: 99900, discount: 34, rating: 4.9, imageUrl: 'https://m.media-amazon.com/images/I/71jG+e7roXL._SX679_.jpg', productUrl: 'https://www.amazon.in/Apple-MacBook-Chip-13-inch-256GB/dp/B08N5W4NNB' }
];

const DEFAULT_PREOWNED = [
  { id: 'p1', title: 'Refurbished iPad Pro 11" (M1)', platform: 'Amazon Renewed', platformRating: 4.4, price: 45999, newPrice: 81900, conditionScore: 92, riskLevel: 'Low', worthBuying: true, imageUrl: 'https://m.media-amazon.com/images/I/815knP2wjvL._SX679_.jpg', productUrl: 'https://www.amazon.in/Renewed-Apple-iPad-Pro-11-inch/dp/B09G96T85G' },
  { id: 'p2', title: 'Samsung Galaxy S22 Ultra (Used)', platform: 'Amazon Renewed', platformRating: 4.6, price: 42000, newPrice: 109999, conditionScore: 88, riskLevel: 'Low', worthBuying: true, imageUrl: 'https://m.media-amazon.com/images/I/71J8tz0UeJL._SX679_.jpg', productUrl: 'https://www.amazon.in/Renewed-Samsung-Galaxy-Ultra-Phantom/dp/B09V7N6S9R' },
  { id: 'p3', title: 'Sony PlayStation 5 Console', platform: 'Amazon', platformRating: 4.8, price: 34500, newPrice: 54990, conditionScore: 95, riskLevel: 'Low', worthBuying: true, imageUrl: 'https://m.media-amazon.com/images/I/51mWHXY8hyL._SX522_.jpg', productUrl: 'https://www.amazon.in/Sony-PlayStation-5-Console/dp/B0BRCP72X8' },
  { id: 'p4', title: 'Apple Watch Series 8 (45mm)', platform: 'Amazon Renewed', platformRating: 4.6, price: 19999, newPrice: 42900, conditionScore: 88, riskLevel: 'Low', worthBuying: true, imageUrl: 'https://m.media-amazon.com/images/I/71XMTLEZalL._SX679_.jpg', productUrl: 'https://www.amazon.in/Renewed-Apple-Watch-GPS-45mm-Aluminum/dp/B0BDJ6P6N4' },
  { id: 'p5', title: 'Dell XPS 13 (Core i7, 16GB)', platform: 'Amazon Renewed', platformRating: 4.4, price: 38000, newPrice: 95000, conditionScore: 78, riskLevel: 'Medium', worthBuying: true, imageUrl: 'https://m.media-amazon.com/images/I/71O1E1D9mOL._SX679_.jpg', productUrl: 'https://www.amazon.in/Renewed-Dell-XPS-9300-13-3-inch/dp/B08N5N6V9K' },
  { id: 'p6', title: 'AirPods Pro (2nd Gen)', platform: 'Amazon Renewed', platformRating: 3.8, price: 9500, newPrice: 24900, conditionScore: 90, riskLevel: 'Medium', worthBuying: true, imageUrl: 'https://m.media-amazon.com/images/I/61SUj2aKoEL._SX679_.jpg', productUrl: 'https://www.amazon.in/Renewed-Apple-AirPods-Pro-Generation/dp/B0BDHWDR12' }
];

interface AppContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  user: User;
  login: (email: string) => void;
  logout: () => void;
  hasSkippedLogin: boolean;
  skipLogin: () => void;
  trendingDeals: any[];
  setTrendingDeals: (deals: any[]) => void;
  preOwnedDeals: any[];
  setPreOwnedDeals: (deals: any[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('INR');
  const [user, setUser] = useState<User>(null);
  const [hasSkippedLogin, setHasSkippedLogin] = useState<boolean>(false);
  
  const [trendingDeals, setTrendingDealsState] = useState<any[]>(() => {
    const saved = localStorage.getItem('app_trending_deals_v2');
    return saved ? JSON.parse(saved) : DEFAULT_TRENDING;
  });
  
  const [preOwnedDeals, setPreOwnedDealsState] = useState<any[]>(() => {
    const saved = localStorage.getItem('app_preowned_deals_v2');
    return saved ? JSON.parse(saved) : DEFAULT_PREOWNED;
  });

  // Load from local storage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('app_currency') as Currency;
    if (savedCurrency) setCurrency(savedCurrency);
    
    const savedUser = localStorage.getItem('app_user');
    if (savedUser) setUser(JSON.parse(savedUser));

    const skipped = localStorage.getItem('app_skipped_login');
    if (skipped === 'true') setHasSkippedLogin(true);
  }, []);

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
    localStorage.setItem('app_currency', c);
    // Clear caches when currency changes to ensure fresh data
    setTrendingDealsState([]);
    setPreOwnedDealsState([]);
    localStorage.removeItem('app_trending_deals_v2');
    localStorage.removeItem('app_preowned_deals_v2');
  };

  const setTrendingDeals = (deals: any[]) => {
    setTrendingDealsState(deals);
    localStorage.setItem('app_trending_deals_v2', JSON.stringify(deals));
  };

  const setPreOwnedDeals = (deals: any[]) => {
    setPreOwnedDealsState(deals);
    localStorage.setItem('app_preowned_deals_v2', JSON.stringify(deals));
  };

  const login = (email: string) => {
    const newUser = { 
      name: email.split('@')[0], 
      email, 
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` 
    };
    setUser(newUser);
    setHasSkippedLogin(true);
    localStorage.setItem('app_user', JSON.stringify(newUser));
    localStorage.setItem('app_skipped_login', 'true');
  };

  const skipLogin = () => {
    setHasSkippedLogin(true);
    localStorage.setItem('app_skipped_login', 'true');
  };

  const logout = () => {
    setUser(null);
    setHasSkippedLogin(false);
    localStorage.removeItem('app_user');
    localStorage.removeItem('app_skipped_login');
  };

  return (
    <AppContext.Provider value={{ 
      currency, 
      setCurrency: handleSetCurrency, 
      user, 
      login, 
      logout,
      hasSkippedLogin,
      skipLogin,
      trendingDeals,
      setTrendingDeals,
      preOwnedDeals,
      setPreOwnedDeals
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
