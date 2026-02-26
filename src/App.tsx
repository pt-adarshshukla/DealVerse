/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Search, Tag, TrendingUp, User } from 'lucide-react';
import { cn } from './lib/utils';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import PreOwnedPage from './pages/PreOwnedPage';
import TrendingPage from './pages/TrendingPage';
import ProfilePage from './pages/ProfilePage';
import OnboardingPage from './pages/OnboardingPage';
import { AppProvider, useAppContext } from './context/AppContext';

function BottomNav() {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'AI Search' },
    { path: '/pre-owned', icon: Tag, label: 'Pre-Owned' },
    { path: '/trending', icon: TrendingUp, label: 'Trending' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
                isActive ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon size={20} className={cn(isActive && "drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]")} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function AppContent() {
  const { user, hasSkippedLogin } = useAppContext();

  if (!user && !hasSkippedLogin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500/30">
        <div className="max-w-md mx-auto relative min-h-screen border-x border-white/5 shadow-2xl bg-zinc-950">
          <OnboardingPage />
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans pb-20 selection:bg-emerald-500/30">
        <div className="max-w-md mx-auto relative min-h-screen border-x border-white/5 shadow-2xl bg-zinc-950">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/pre-owned" element={<PreOwnedPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <BottomNav />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
