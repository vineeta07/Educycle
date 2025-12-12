import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, useParams, Outlet, Navigate } from 'react-router-dom';
import { TRANSLATIONS, MOCK_PRODUCTS, MOCK_CAMPAIGNS, MOCK_NGOS, MOCK_TRANSACTIONS, MOCK_CHATS } from './constants';
import { Language, UserRole, Transaction, Message, Product, CartItem, Campaign, UserProfile, ChatContact, Notification } from './types';
import VoiceInput from './components/VoiceInput';
import { generateImageDescription } from './services/geminiService';
import { auth, googleProvider, githubProvider } from './services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, User, signInWithPopup } from 'firebase/auth';

// --- Global Styles ---
const inputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-black placeholder-slate-500 transition-all shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400";

// --- SVGs ---
const Icons = {
  Menu: () => <svg className="w-6 h-6 text-black dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
  Home: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  User: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Heart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Globe: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Logo: () => <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Cart: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Search: () => <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Check: () => <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Star: () => <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
  Campaign: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
  Flag: () => <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M3 21h18M5 21v-8a2 2 0 012-2h14a2 2 0 012 2v8M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Trash: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Refresh: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Sun: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Moon: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  PaperPlane: () => <svg className="w-5 h-5 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  X: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Bell: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Cog: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  MoreVertical: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Camera: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Google: () => <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
  Github: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
};

// --- Footer Component ---
const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    return (
        <footer className="bg-slate-900 text-white py-12 border-t border-slate-800 w-full mt-auto flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                            <Icons.Logo />
                        </div>
                        <span className="font-bold text-xl">{t.app_name}</span>
                    </div>
                    <p className="text-slate-400 max-w-xs">{t.landing_feature_market_desc}</p>
                </div>
                
                <div>
                    <h4 className="font-bold text-lg mb-4">{t.landing_footer_contact}</h4>
                    <ul className="space-y-2 text-slate-400">
                        <li>support@educycle.in</li>
                        <li>+91 98765 43210</li>
                        <li>Delhi University, North Campus</li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="font-bold text-lg mb-4">{t.landing_footer_about}</h4>
                    <ul className="space-y-2 text-slate-400">
                        <li><a href="#" className="hover:text-white">Our Story</a></li>
                        <li><a href="#" className="hover:text-white">NGO Partners</a></li>
                        <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
                {t.landing_footer_rights} © {new Date().getFullYear()} Educycle.
            </div>
        </footer>
    );
};

// --- Layout & Sidebar (Protected) ---

const Sidebar: React.FC<{
  lang: Language;
  role: UserRole;
  currentPath: string;
  onCloseMobile: () => void;
  onLogout: () => void;
  cartCount: number;
  currentUser: UserProfile;
  unreadNotifications: number;
}> = ({ lang, role, currentPath, onCloseMobile, onLogout, cartCount, currentUser, unreadNotifications }) => {
  const t = TRANSLATIONS[lang];

  const NavItem = ({ to, icon: Icon, label, active, badge }: any) => (
    <Link 
      to={to} 
      onClick={onCloseMobile}
      className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
        active 
        ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-900/30 dark:text-brand-400' 
        : 'text-black hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon />
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="bg-brand-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
    </Link>
  );

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 w-80 flex-shrink-0 dark:bg-slate-900 dark:border-slate-800">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800">
        <Link to="/dashboard" className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
           <Icons.Logo />
        </Link>
        <Link to="/dashboard" className="text-xl font-bold text-black tracking-tight dark:text-white">{t.app_name}</Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {role === 'seller' ? (
           <NavItem to="/dashboard" icon={Icons.Home} label={t.nav_dashboard} active={currentPath === '/dashboard'} />
        ) : (
           <NavItem to="/dashboard" icon={Icons.Home} label={t.nav_marketplace} active={currentPath === '/dashboard'} />
        )}
        
        {role === 'buyer' && (
          <NavItem to="/cart" icon={Icons.Cart} label={t.nav_cart} active={currentPath === '/cart'} badge={cartCount} />
        )}
        
        <NavItem to="/profile" icon={Icons.User} label={t.nav_profile} active={currentPath === '/profile'} />
        <NavItem to="/settings" icon={Icons.Cog} label={t.nav_settings} active={currentPath === '/settings'} />
        <NavItem to="/notifications" icon={Icons.Bell} label={t.nav_notifications} active={currentPath === '/notifications'} badge={unreadNotifications} />
        <NavItem to="/my-campaigns" icon={Icons.Campaign} label={t.nav_my_campaigns} active={currentPath === '/my-campaigns'} />
        <NavItem to="/campaigns" icon={Icons.Globe} label={t.nav_campaigns} active={currentPath === '/campaigns'} />
        <NavItem to="/donate" icon={Icons.Heart} label={t.nav_donate} active={currentPath.startsWith('/donate')} />
        <NavItem to="/chat" icon={Icons.Chat} label={t.nav_chat} active={currentPath.startsWith('/chat')} />
        
        {role === 'seller' && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
             <NavItem to="/sell" icon={Icons.Plus} label={t.nav_sell} active={currentPath === '/sell'} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-4 dark:hover:bg-red-900/20">
          <Icons.Logout />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const Layout: React.FC<{
  lang: Language;
  setLang: (l: Language) => void;
  role: UserRole;
  setRole: (r: UserRole) => void;
  unreadCount: number;
  unreadNotifications: number;
  onOpenChat: () => void;
  cartCount: number;
  onLogout: () => void;
  currentUser: UserProfile;
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}> = ({ lang, setLang, role, setRole, unreadCount, unreadNotifications, onOpenChat, onLogout, cartCount, currentUser, theme, setTheme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-black dark:bg-slate-950 dark:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shadow-lg z-20">
        <Sidebar lang={lang} role={role} currentPath={location.pathname} onCloseMobile={() => {}} onLogout={onLogout} cartCount={cartCount} currentUser={currentUser} unreadNotifications={unreadNotifications} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="absolute top-0 bottom-0 left-0 w-80 bg-white z-50 shadow-xl transition-transform duration-300 dark:bg-slate-900">
            <Sidebar lang={lang} role={role} currentPath={location.pathname} onCloseMobile={() => setMobileMenuOpen(false)} onLogout={onLogout} cartCount={cartCount} currentUser={currentUser} unreadNotifications={unreadNotifications} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden mr-4 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white">
              <Icons.Menu />
            </button>
            <h2 className="text-lg font-semibold text-black hidden sm:block dark:text-white">
              {role === 'seller' ? 'Seller Console' : 'Student Marketplace'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
             {/* Theme Toggle */}
             <button 
               onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
               className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition dark:text-slate-400 dark:hover:bg-slate-800"
             >
               {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
             </button>

             {/* Role Switcher */}
             <button 
              onClick={() => setRole(role === 'buyer' ? 'seller' : 'buyer')}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition ${
                role === 'seller' 
                  ? 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/20 dark:text-brand-400 dark:border-brand-800' 
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800'
              }`}
            >
              {role === 'seller' ? 'Seller Mode' : 'Buyer Mode'}
            </button>

            {/* Notification Icon */}
            <Link to="/notifications" className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition dark:text-slate-400 dark:hover:bg-slate-800">
                <Icons.Bell />
                {unreadNotifications > 0 && location.pathname !== '/notifications' && (
                    <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
            </Link>

            {/* Notifications / Messages */}
            <div className="relative group cursor-pointer" onClick={onOpenChat}>
              <Link to="/chat" className="text-black hover:text-brand-600 transition block dark:text-white dark:hover:text-brand-400">
                <div className="relative p-2">
                  <Icons.Chat />
                  {unreadCount > 0 && location.pathname !== '/chat' && (
                    <span className="absolute top-1 right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white pointer-events-none dark:border-slate-900"></span>
                  )}
                </div>
              </Link>
            </div>

            {/* Profile Avatar Link */}
            <Link to="/profile" className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden hover:ring-2 hover:ring-brand-500 transition">
               <img src={currentUser.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="Profile" className="w-full h-full object-cover" />
            </Link>

            {/* Lang Switcher */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Language)}
              className="bg-slate-100 border-none text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-brand-500 outline-none text-black dark:bg-slate-800 dark:text-white"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="ta">TA</option>
              <option value="gu">GU</option>
            </select>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-slate-50 dark:bg-slate-950 flex flex-col">
          <div className="flex-grow p-4 sm:p-6 lg:p-8 w-full">
            <div className="max-w-5xl mx-auto w-full">
                <Outlet />
            </div>
          </div>
          <Footer lang={lang} />
        </main>
      </div>
    </div>
  );
};

// ... (LandingPage component remains unchanged)
const LandingPage: React.FC<{ lang: Language, setLang: (l: Language) => void, theme: 'light' | 'dark', setTheme: (t: 'light' | 'dark') => void }> = ({ lang, setLang, theme, setTheme }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      title: t.landing_feature_market_title,
      desc: t.landing_feature_market_desc,
      icon: <Icons.Cart />,
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
      action: t.nav_marketplace,
      link: '/login'
    },
    {
      title: t.landing_feature_campaign_title,
      desc: t.landing_feature_campaign_desc,
      icon: <Icons.Globe />,
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=800",
      action: t.nav_campaigns,
      link: '/login'
    },
    {
      title: t.landing_feature_donate_title,
      desc: t.landing_feature_donate_desc,
      icon: <Icons.Heart />,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
      action: t.nav_donate,
      link: '/login'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-black dark:bg-slate-950 dark:text-white">
       <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 dark:bg-slate-900 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
               <Icons.Logo />
            </div>
            <span className="font-bold text-xl text-black dark:text-white">{t.app_name}</span>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex items-center space-x-4">
               <button 
                 onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                 className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition dark:text-slate-400 dark:hover:bg-slate-800"
               >
                 {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
               </button>

               <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-slate-100 border-none text-sm rounded-md px-2 py-1 focus:ring-2 focus:ring-brand-500 outline-none text-black cursor-pointer dark:bg-slate-800 dark:text-white"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="ta">TA</option>
                <option value="gu">GU</option>
              </select>
              
               <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium px-3 py-2 dark:text-slate-300 dark:hover:text-brand-400">{t.home_login}</Link>
               <Link to="/signup" className="bg-brand-600 text-white px-5 py-2 rounded-full font-medium hover:bg-brand-700 transition shadow-sm">{t.home_signup}</Link>
            </div>

            <button 
              className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md dark:text-slate-400 dark:hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 p-4 shadow-lg dark:bg-slate-900 dark:border-slate-800">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Theme</span>
                <button 
                   onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                   className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition dark:text-slate-400 dark:hover:bg-slate-800"
                 >
                   {theme === 'light' ? <div className="flex items-center gap-2"><Icons.Moon /> Dark</div> : <div className="flex items-center gap-2"><Icons.Sun /> Light</div>}
                 </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Language</span>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as Language)}
                  className="bg-slate-100 border border-slate-300 text-sm rounded-md px-2 py-1 outline-none text-black dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="ta">Tamil</option>
                  <option value="gu">Gujarati</option>
                </select>
              </div>

              <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2 dark:border-slate-800">
                 <Link to="/login" className="w-full text-center py-2 text-slate-600 hover:bg-slate-50 rounded-lg dark:text-slate-300 dark:hover:bg-slate-800">{t.home_login}</Link>
                 <Link to="/signup" className="w-full text-center py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700">{t.home_signup}</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      <div className="flex-grow">
        <div className="relative overflow-hidden py-32 px-4 flex flex-col items-center justify-center text-center">
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center"
                style={{ 
                    backgroundImage: 'url("https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2940&auto=format&fit=crop")',
                    filter: 'brightness(0.6)' 
                }}
            ></div>
            
            <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight drop-shadow-lg">
                {t.home_welcome}
            </h1>
            <p className="text-xl md:text-3xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md font-light">
                {t.home_sub}
            </p>
            <Link to="/signup" className="inline-block px-10 py-4 bg-brand-600 text-white text-lg font-bold rounded-full shadow-xl hover:bg-brand-500 hover:scale-105 transition transform">
                {t.home_btn_start}
            </Link>
            </div>
        </div>

        <div className="py-20 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">{t.landing_features_title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((feat, idx) => (
                    <div key={idx} onClick={() => navigate(feat.link)} className="bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-xl transition cursor-pointer group overflow-hidden dark:bg-slate-800 dark:border-slate-700">
                        <div className="h-48 overflow-hidden">
                        <img src={feat.image} alt={feat.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                        <div className="p-8">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-600 mb-4 border border-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-brand-400">
                                {feat.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-black dark:text-white">{feat.title}</h3>
                            <p className="text-slate-600 mb-6 dark:text-slate-300">{feat.desc}</p>
                            <span className="text-brand-600 font-bold flex items-center text-sm dark:text-brand-400">
                                {feat.action} <span className="ml-2">→</span>
                            </span>
                        </div>
                    </div>
                ))}
                </div>
            </div>
        </div>
      </div>

      <Footer lang={lang} />
    </div>
  );
};

const Login: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      try {
          await signInWithEmailAndPassword(auth, email, password);
          navigate('/dashboard'); 
      } catch (err: any) {
          setError(err.message.replace('Firebase:', '').trim());
      }
  };

  const handleProviderLogin = async (provider: any) => {
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message.replace('Firebase:', '').trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">{t.auth_login_title}</h2>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}
            
            <div className="flex gap-4 mb-6">
                <button onClick={() => handleProviderLogin(googleProvider)} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white">
                    <Icons.Google />
                    <span className="font-medium text-sm">Google</span>
                </button>
                <button onClick={() => handleProviderLogin(githubProvider)} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white">
                    <Icons.Github />
                    <span className="font-medium text-sm">GitHub</span>
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 dark:bg-slate-900">Or continue with</span>
                </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
                <input 
                    placeholder={t.auth_email} 
                    className={inputClasses} 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                />
                <input 
                    type="password" 
                    placeholder={t.auth_password} 
                    className={inputClasses}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/30">{t.auth_btn_login}</button>
            </form>
            <div className="mt-6 text-center">
                <Link to="/signup" className="text-brand-600 font-bold hover:underline">{t.auth_no_acc}</Link>
            </div>
        </div>
    </div>
  );
};

const Signup: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [bio, setBio] = useState('');
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name,
                photoURL: `https://ui-avatars.com/api/?name=${name}&background=random`
            });
            // Bio is not standard in Firebase Auth, would need Firestore to persist.
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message.replace('Firebase:', '').trim());
        }
    };

    const handleProviderLogin = async (provider: any) => {
        try {
          await signInWithPopup(auth, provider);
          navigate('/dashboard');
        } catch (err: any) {
          setError(err.message.replace('Firebase:', '').trim());
        }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 px-4">
          <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h2 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">{t.auth_signup_title}</h2>
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline">{error}</span></div>}
              
              <div className="flex gap-4 mb-6">
                <button onClick={() => handleProviderLogin(googleProvider)} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white">
                    <Icons.Google />
                    <span className="font-medium text-sm">Google</span>
                </button>
                <button onClick={() => handleProviderLogin(githubProvider)} className="flex-1 flex items-center justify-center gap-2 border border-slate-200 py-2.5 rounded-lg hover:bg-slate-50 transition dark:border-slate-700 dark:hover:bg-slate-800 dark:text-white">
                    <Icons.Github />
                    <span className="font-medium text-sm">GitHub</span>
                </button>
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500 dark:bg-slate-900">Or continue with</span>
                </div>
            </div>

              <form onSubmit={handleSignup} className="space-y-5">
                  <input 
                    placeholder={t.auth_name} 
                    className={inputClasses} 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input 
                    placeholder={t.auth_email} 
                    className={inputClasses} 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                  />
                  <input 
                    type="password" 
                    placeholder={t.auth_password} 
                    className={inputClasses} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <textarea
                    placeholder="Short Bio (Optional)"
                    className={inputClasses}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                  <button className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/30">{t.auth_btn_signup}</button>
              </form>
              <div className="mt-6 text-center">
                  <Link to="/login" className="text-brand-600 font-bold hover:underline">{t.auth_have_acc}</Link>
              </div>
          </div>
      </div>
    );
};

// ... (SellerDashboard, Notifications, Marketplace, Cart, ProductDetail, Checkout, OrderSuccessWrapper, SellItem, ItemListedSuccess, Profile components remain unchanged)
const SellerDashboard: React.FC<{ lang: Language, products: Product[], onRelist: (id: string) => void, onDelete: (id: string) => void }> = ({ lang, products }) => {
    const t = TRANSLATIONS[lang];
    const earnings = products.filter(p => p.status === 'sold').reduce((acc, p) => acc + p.price, 0);
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t.nav_dashboard}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-slate-800">
                    <p className="text-slate-500 mb-1">{t.dashboard_earnings}</p>
                    <p className="text-3xl font-bold text-green-600">₹{earnings}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-slate-800">
                    <p className="text-slate-500 mb-1">Active Listings</p>
                    <p className="text-3xl font-bold text-blue-600">{products.filter(p => p.status === 'available').length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm dark:bg-slate-800">
                    <p className="text-slate-500 mb-1">{t.dashboard_sold}</p>
                    <p className="text-3xl font-bold text-slate-600 dark:text-slate-300">{products.filter(p => p.status === 'sold').length}</p>
                </div>
            </div>
            <h3 className="text-xl font-bold mb-4 dark:text-white">Your Listings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                    <div key={p.id} className="bg-white rounded-lg shadow overflow-hidden dark:bg-slate-800">
                        <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
                        <div className="p-4">
                            <h4 className="font-bold dark:text-white">{p.title}</h4>
                            <p className="text-slate-500 text-sm mb-2">₹{p.price} • {p.status}</p>
                            <div className="text-xs text-slate-400">{p.date || 'Just now'}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Notifications: React.FC<{ notifications: Notification[], role: UserRole, markNotificationsRead: () => void }> = ({ notifications, role, markNotificationsRead }) => {
    
    useEffect(() => {
        markNotificationsRead();
    }, [markNotificationsRead]);

    // Filter notifications based on role
    const filteredNotifications = notifications.filter(n => {
        if (role === 'buyer') {
            // Buyer sees 'offer' (offer accepted) and 'system'. Should NOT see 'sale' (item sold).
            return n.type !== 'sale';
        } else {
            // Seller sees 'sale' (item sold) and 'system'.
            return n.type === 'sale' || n.type === 'system';
        }
    });

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">Notifications</h2>
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    No new notifications.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map(n => (
                        <div key={n.id} className={`bg-white p-4 rounded-xl shadow border-l-4 ${n.type === 'offer' ? 'border-blue-500' : n.type === 'sale' ? 'border-green-500' : 'border-slate-500'} dark:bg-slate-800 dark:border-opacity-50`}>
                            <h4 className="font-bold text-lg dark:text-white">{n.title}</h4>
                            <p className="text-slate-600 dark:text-slate-300">{n.message}</p>
                            <p className="text-xs text-slate-400 mt-2">{n.date}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ... (Marketplace, Cart, ProductDetail, Checkout, OrderSuccessWrapper, SellItem, ItemListedSuccess, Profile, Campaigns, MyCampaigns, Donate, DonationConfirmation components)
const Marketplace: React.FC<{ lang: Language, products: Product[], addToCart: (p: Product) => void, onMakeOffer: (p: Product, price: number) => void }> = ({ lang, products, addToCart, onMakeOffer }) => {
    const t = TRANSLATIONS[lang];
    const [search, setSearch] = useState("");
    const [offerProduct, setOfferProduct] = useState<Product | null>(null);
    const [offerPrice, setOfferPrice] = useState("");

    const filtered = products.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) && p.status === 'available');

    const handleOfferSubmit = () => {
        if (offerProduct && offerPrice) {
            onMakeOffer(offerProduct, parseInt(offerPrice));
            setOfferProduct(null);
            setOfferPrice("");
        }
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold dark:text-white">{t.nav_marketplace}</h2>
                <div className="relative w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full md:w-64 bg-white text-black focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                    />
                    <div className="absolute left-3 top-2.5 text-slate-400"><Icons.Search /></div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(p => (
                    <div key={p.id} className="bg-white rounded-lg shadow hover:shadow-lg transition dark:bg-slate-800 flex flex-col h-full">
                        <Link to={`/product/${p.id}`}>
                            <img src={p.image} alt={p.title} className="w-full h-48 object-cover rounded-t-lg" />
                        </Link>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <Link to={`/product/${p.id}`} className="font-bold text-lg hover:text-brand-600 truncate dark:text-white">{p.title}</Link>
                                <div>
                                    {p.originalPrice && p.originalPrice > p.price && (
                                        <span className="text-sm text-slate-400 line-through mr-2">₹{p.originalPrice}</span>
                                    )}
                                    <span className="font-bold text-green-600">₹{p.price}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2 dark:text-slate-400 flex-1">{p.description}</p>
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <button onClick={() => setOfferProduct(p)} className="w-full border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 text-sm font-bold dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                                    Make Offer
                                </button>
                                <button onClick={() => addToCart(p)} className="w-full bg-brand-600 text-white py-2 rounded-lg hover:bg-brand-700 flex items-center justify-center gap-2 text-sm font-bold">
                                    <Icons.Cart /> Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {offerProduct && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm dark:bg-slate-900 border dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-2 dark:text-white">Negotiate Price</h3>
                        <p className="text-sm text-slate-500 mb-4 dark:text-slate-400">Enter your offer for {offerProduct.title}</p>
                        <input 
                            type="number" 
                            className={inputClasses} 
                            placeholder={`Current Price: ₹${offerProduct.price}`}
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                        />
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setOfferProduct(null)} className="flex-1 py-2 border rounded-lg font-bold dark:border-slate-600 dark:text-white">Cancel</button>
                            <button onClick={handleOfferSubmit} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700">Send Offer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Cart: React.FC<{ lang: Language, cart: CartItem[], removeFromCart: (id: string) => void }> = ({ lang, cart, removeFromCart }) => {
    const t = TRANSLATIONS[lang];
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t.cart_title}</h2>
            {cart.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">{t.cart_empty}</p>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-slate-800">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center p-4 border-b last:border-0 border-slate-100 dark:border-slate-700">
                            <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded" />
                            <div className="ml-4 flex-1">
                                <h4 className="font-bold dark:text-white">{item.title}</h4>
                                <p className="text-slate-500">₹{item.price} x {item.quantity}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                                <Icons.Trash />
                            </button>
                        </div>
                    ))}
                    <div className="p-6 bg-slate-50 flex justify-between items-center dark:bg-slate-800/50">
                        <span className="font-bold text-xl dark:text-white">{t.cart_total}: ₹{total}</span>
                        <Link to="/checkout" className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700">
                            {t.cart_checkout}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProductDetail: React.FC<{ 
    lang: Language, 
    products: Product[], 
    addToCart: (p: Product) => void, 
    startNegotiation: (p: Product, amt: number) => void, 
    addReview: (id: string, rating: number, comment: string) => void 
}> = ({ lang, products, addToCart, startNegotiation, addReview }) => {
    const { id } = useParams();
    const product = products.find(p => p.id === id);
    const t = TRANSLATIONS[lang];
    const [offerPrice, setOfferPrice] = useState("");
    const [showModal, setShowModal] = useState(false);
    
    if (!product) return <div>Product not found</div>;

    const handleOffer = () => {
        if(offerPrice) {
            startNegotiation(product, parseInt(offerPrice));
            setShowModal(false);
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <img src={product.image} alt={product.title} className="w-full rounded-xl shadow-lg" />
            </div>
            <div>
                <h1 className="text-3xl font-bold mb-2 dark:text-white">{product.title}</h1>
                <div className="flex items-center gap-3 mb-4">
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xl text-slate-400 line-through">₹{product.originalPrice}</span>
                    )}
                    <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                </div>
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                        <Icons.User />
                    </div>
                    <span className="text-slate-700 dark:text-slate-300">Sold by {product.sellerName}</span>
                </div>
                <p className="text-slate-600 mb-8 dark:text-slate-400">{product.description}</p>
                <div className="flex gap-4">
                    <button onClick={() => addToCart(product)} className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700">
                        Add to Cart
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex-1 border border-slate-300 text-slate-700 py-3 rounded-lg font-bold text-center hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                        Make Offer
                    </button>
                </div>

                <div className="mt-12">
                    <h3 className="text-xl font-bold mb-4 dark:text-white">Reviews</h3>
                    {product.reviews.length > 0 ? (
                        <div className="space-y-4">
                            {product.reviews.map(r => (
                                <div key={r.id} className="border-b pb-4 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-bold dark:text-white">{r.user}</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(r.rating)].map((_, i) => <Icons.Star key={i} />)}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400">{r.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-slate-500 dark:text-slate-400">No reviews yet.</p>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-sm dark:bg-slate-900 border dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Negotiate Price</h3>
                        <input 
                            type="number" 
                            className={inputClasses} 
                            placeholder={`Current Price: ₹${product.price}`}
                            value={offerPrice}
                            onChange={(e) => setOfferPrice(e.target.value)}
                        />
                        <div className="flex gap-2 mt-4">
                            <button onClick={() => setShowModal(false)} className="flex-1 py-2 border rounded-lg font-bold dark:border-slate-600 dark:text-white">Cancel</button>
                            <button onClick={handleOffer} className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700">Send Offer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Checkout: React.FC<{ lang: Language, cart: CartItem[], onPlaceOrder: (method: string) => void }> = ({ lang, cart, onPlaceOrder }) => {
    const t = TRANSLATIONS[lang];
    const [method, setMethod] = useState('upi');
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    if (cart.length === 0) return <Navigate to="/cart" />;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t.checkout_title}</h2>
            <div className="bg-white p-6 rounded-lg shadow mb-6 dark:bg-slate-800">
                <h3 className="font-bold mb-4 dark:text-white">Order Summary</h3>
                <div className="space-y-2 mb-4">
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{item.title} x {item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4 flex justify-between font-bold text-lg dark:text-white dark:border-slate-700">
                    <span>Total</span>
                    <span>₹{total}</span>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow mb-6 dark:bg-slate-800">
                <h3 className="font-bold mb-4 dark:text-white">Payment Method</h3>
                <div className="space-y-3">
                    {['upi', 'card', 'cod'].map(m => (
                        <label key={m} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50">
                            <input type="radio" name="payment" checked={method === m} onChange={() => setMethod(m)} className="mr-3" />
                            <span className="dark:text-white">{m === 'upi' ? t.pay_upi : m === 'card' ? t.pay_card : t.pay_cod}</span>
                        </label>
                    ))}
                </div>
            </div>
            
            <button onClick={() => onPlaceOrder(method)} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
                {t.pay_btn}
            </button>
        </div>
    );
};

const OrderSuccessWrapper: React.FC<{ lang: Language }> = ({ lang }) => {
    const location = useLocation();
    const t = TRANSLATIONS[lang];
    const method = location.state?.method || 'cod';
    return (
        <div className="max-w-xl mx-auto py-16 px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden dark:bg-slate-800 text-center">
                <div className="bg-green-600 py-8 px-4">
                    <div className="w-20 h-20 bg-white text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icons.Check />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
                    <p className="text-green-100">We will process your order.</p>
                </div>
                <div className="p-8">
                    <div className="mb-8">
                        <p className="text-slate-600 dark:text-slate-300 text-lg mb-2">
                            {method === 'cod' ? "Please be ready with your cash." : t.order_online_msg}
                        </p>
                        <p className="text-sm text-slate-500">Order ID: #ORD-{Math.floor(Math.random() * 100000)}</p>
                    </div>
                    
                    <Link to="/dashboard" className="inline-block w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition dark:bg-white dark:text-black dark:hover:bg-slate-200">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ... (Rest of components: SellItem, ItemListedSuccess, Profile, Settings, Campaigns, MyCampaigns, Donate, DonationConfirmation, Chat, App)
const SellItem: React.FC<{ lang: Language, onAddItem: (item: any) => void }> = ({ lang, onAddItem }) => {
    const t = TRANSLATIONS[lang];
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Books');
    const [image, setImage] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setImage(base64);
                setLoading(true);
                const description = await generateImageDescription(base64);
                setDesc(description);
                setLoading(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddItem({ title, description: desc, price: Number(price), category, image: image || 'https://via.placeholder.com/400' });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow dark:bg-slate-800">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t.sell_page_title}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block font-medium mb-2 dark:text-white">{t.sell_upload_image}</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {image && <img src={image} alt="Preview" className="mt-4 h-48 rounded-lg object-cover" />}
                    {loading && <p className="text-blue-600 mt-2 animate-pulse">{t.sell_generating}</p>}
                </div>
                
                <VoiceInput label={t.form_title} value={title} onChange={(e) => setTitle(e.target.value)} onVoiceInput={setTitle} className={inputClasses} />
                <VoiceInput label={t.form_desc} isTextArea value={desc} onChange={(e) => setDesc(e.target.value)} onVoiceInput={setDesc} className={inputClasses} />
                <div className="grid grid-cols-2 gap-6">
                    <VoiceInput label={t.form_price} type="number" value={price} onChange={(e) => setPrice(e.target.value)} onVoiceInput={setPrice} className={inputClasses} />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t.form_category}</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClasses}>
                            <option>Books</option>
                            <option>Electronics</option>
                            <option>Stationary</option>
                            <option>Clothing</option>
                        </select>
                    </div>
                </div>
                
                <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30">
                    {t.form_submit}
                </button>
            </form>
        </div>
    );
};

const ItemListedSuccess: React.FC<{ lang: Language }> = ({ lang }) => {
    return (
        <div className="text-center py-16">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Check />
            </div>
            <h2 className="text-3xl font-bold mb-4 dark:text-white">Item Listed Successfully!</h2>
            <p className="text-slate-600 mb-8 dark:text-slate-400">Your item is now visible to thousands of students.</p>
            <Link to="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700">
                Go to Dashboard
            </Link>
        </div>
    );
};

const Profile: React.FC<{ lang: Language, currentUser: UserProfile, purchases: Product[], onUpdateUser: (u: UserProfile) => void, onAddReview: (id: string, rating: number, comment: string) => void }> = ({ lang, currentUser, purchases, onAddReview }) => {
    const t = TRANSLATIONS[lang];
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const location = useLocation();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (location.state?.profileUpdated) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const openReviewModal = (productId: string) => {
        setSelectedProduct(productId);
        setRating(5);
        setComment('');
        setReviewModalOpen(true);
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedProduct) {
            onAddReview(selectedProduct, rating, comment);
            setReviewModalOpen(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {showSuccess && (
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-6 flex items-center gap-2 animate-pulse dark:bg-green-900/30 dark:text-green-300">
                    <Icons.Check />
                    <span className="font-bold">{t.settings_saved}</span>
                </div>
            )}
            
            <div className="bg-white rounded-xl shadow p-8 mb-8 flex flex-col md:flex-row items-center gap-8 dark:bg-slate-800 relative">
                <div className="relative group">
                    <img src={currentUser.avatar || "https://i.pravatar.cc/150"} alt="Profile" className="w-32 h-32 rounded-full ring-4 ring-slate-100 object-cover dark:ring-slate-700" />
                    <Link to="/settings" className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-brand-700">
                         <Icons.Camera />
                    </Link>
                </div>
                <div className="text-center md:text-left flex-1">
                    <div className="flex justify-between items-start w-full">
                         <div>
                            <h2 className="text-2xl font-bold dark:text-white">{currentUser.name}</h2>
                            <p className="text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                            <p className="mt-4 text-slate-700 max-w-lg dark:text-slate-300">{currentUser.bio}</p>
                         </div>
                         <Link to="/settings" className="hidden md:block text-slate-400 hover:text-brand-600 dark:hover:text-white">
                             <Icons.Cog />
                         </Link>
                    </div>
                </div>
            </div>
            
            <h3 className="text-xl font-bold mb-4 dark:text-white">{t.profile_history}</h3>
            {purchases.length > 0 ? (
                 <div className="grid grid-cols-1 gap-4">
                     {purchases.map(p => (
                         <div key={p.id} className="bg-white p-4 rounded-lg shadow flex gap-4 dark:bg-slate-800 flex-col md:flex-row items-center">
                             <div className="flex gap-4 items-center flex-1 w-full">
                                 <img src={p.image} alt={p.title} className="w-16 h-16 rounded object-cover" />
                                 <div>
                                     <h4 className="font-bold dark:text-white">{p.title}</h4>
                                     <p className="text-sm text-slate-500 dark:text-slate-400">{p.date || 'Recent'}</p>
                                 </div>
                             </div>
                             <div className="mt-4 md:mt-0 w-full md:w-auto">
                                <button 
                                    onClick={() => openReviewModal(p.id)}
                                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 text-sm whitespace-nowrap w-full"
                                >
                                    Write Review
                                </button>
                             </div>
                         </div>
                     ))}
                 </div>
            ) : (
                <p className="text-slate-500 italic dark:text-slate-400">{t.profile_history_empty}</p>
            )}

            {/* Review Modal */}
            {reviewModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md dark:bg-slate-900 border dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Write a Review</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2 dark:text-white">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button 
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-slate-300'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2 dark:text-white">Comment</label>
                                <textarea 
                                    className={inputClasses}
                                    rows={4}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="How was your experience?"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setReviewModalOpen(false)}
                                    className="flex-1 py-2 border border-slate-300 rounded-lg font-bold dark:border-slate-600 dark:text-white"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Settings: React.FC<{ lang: Language, currentUser: UserProfile, onUpdateUser: (u: UserProfile) => void }> = ({ lang, currentUser, onUpdateUser }) => {
    const t = TRANSLATIONS[lang];
    const navigate = useNavigate();
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [bio, setBio] = useState(currentUser.bio);
    const [avatar, setAvatar] = useState(currentUser.avatar);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ ...currentUser, name, email, bio, avatar });
        // Redirect to profile with a state flag to show success message
        navigate('/profile', { state: { profileUpdated: true } });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t.settings_title}</h2>
            <div className="bg-white p-8 rounded-xl shadow dark:bg-slate-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center gap-6 mb-4">
                         <img src={avatar || "https://i.pravatar.cc/150"} alt="Preview" className="w-20 h-20 rounded-full object-cover ring-2 ring-slate-200" />
                         <div>
                             <label className="block text-sm font-bold mb-2 dark:text-white">Profile Photo</label>
                             <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAvatarUpload} 
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                             />
                         </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">{t.profile_name}</label>
                        <input value={name} onChange={e => setName(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">{t.profile_email}</label>
                        <input value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 dark:text-white">{t.profile_bio}</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} className={inputClasses} rows={3} />
                    </div>
                    
                    <button type="submit" className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-700">{t.settings_save}</button>
                </form>
            </div>
        </div>
    );
};

const SettingsSuccess: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Check />
            </div>
            <h2 className="text-3xl font-bold mb-4 dark:text-white">{t.settings_saved}</h2>
            <p className="text-slate-600 mb-8 dark:text-slate-400">Your profile information has been successfully updated.</p>
            <Link to="/dashboard" className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 dark:bg-white dark:text-black">
                Back to Dashboard
            </Link>
        </div>
    );
};

const Campaigns: React.FC<{ 
    lang: Language, 
    campaigns: Campaign[],
    onRegister: (id: string) => void, 
    onAddCampaign: (c: Campaign) => void,
    onReportCampaign: (id: string) => void,
    myCampaigns: string[], 
    userEmail: string 
}> = ({ lang, campaigns, onRegister, onAddCampaign, onReportCampaign, myCampaigns, userEmail }) => {
    const t = TRANSLATIONS[lang];
    const [filter, setFilter] = useState('');
    const [campaignSearch, setCampaignSearch] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [reportingId, setReportingId] = useState<string | null>(null);
    const [reportReason, setReportReason] = useState<string>('');
    const [reportSuccess, setReportSuccess] = useState<boolean>(false);
    
    // New Campaign Form State
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newType, setNewType] = useState<'cleaning' | 'recycling' | 'planting'>('cleaning');

    const allKeywords = Array.from(new Set(campaigns.flatMap(c => c.keywords)));

    const filtered = campaigns.filter(c => {
        const matchesKeyword = filter ? c.keywords.includes(filter) : true;
        const matchesSearch = c.title.toLowerCase().includes(campaignSearch.toLowerCase()) || 
                              c.keywords.some(k => k.toLowerCase().includes(campaignSearch.toLowerCase()));
        return matchesKeyword && matchesSearch;
    });

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCampaign) {
            onRegister(selectedCampaign);
            setRegisterSuccess(true);
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newCampaign: Campaign = {
            id: Date.now().toString(),
            title: newTitle,
            date: newDate,
            location: newLocation,
            description: newDesc,
            type: newType,
            participants: 1, // Creator is the first participant
            image: `https://picsum.photos/600/300?random=${Date.now()}`,
            keywords: [newType],
            reported: false
        };
        onAddCampaign(newCampaign);
        setShowCreateModal(false);
        // Reset form
        setNewTitle('');
        setNewDate('');
        setNewLocation('');
        setNewDesc('');
    };

    const handleReportClick = (id: string) => {
        setReportingId(id);
        setActiveMenu(null);
        setReportReason('');
        setReportSuccess(false);
    };

    const submitReport = () => {
        if (reportingId && reportReason) {
            onReportCampaign(reportingId);
            setReportSuccess(true);
        }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold dark:text-white">{t.nav_campaigns}</h2>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-brand-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-700 whitespace-nowrap"
                    >
                        {t.campaign_create}
                    </button>
                    <div className="relative w-full md:w-64">
                        <input 
                            type="text" 
                            placeholder={t.campaign_search}
                            value={campaignSearch} 
                            onChange={(e) => setCampaignSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg w-full bg-white text-black focus:ring-2 focus:ring-brand-500 outline-none shadow-sm"
                        />
                        <div className="absolute left-3 top-2.5 text-slate-400"><Icons.Search /></div>
                    </div>
                </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                <button onClick={() => setFilter('')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${!filter ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
                    All
                </button>
                {allKeywords.map(k => (
                    <button key={k} onClick={() => setFilter(k)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${filter === k ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {k}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(c => (
                    <div key={c.id} className={`bg-white rounded-xl shadow overflow-hidden dark:bg-slate-800 flex flex-col h-full relative ${c.reported ? 'opacity-50 grayscale' : ''}`}>
                        {c.reported && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 backdrop-blur-[1px] pointer-events-none">
                                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg transform -rotate-12 border-2 border-white">REPORTED</span>
                            </div>
                        )}
                        <img src={c.image} alt={c.title} className="w-full h-48 object-cover" />
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full uppercase font-bold dark:bg-green-900/30 dark:text-green-400 w-fit">{c.type}</span>
                                <div className="relative">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === c.id ? null : c.id); }}
                                        className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition ${c.reported ? 'pointer-events-none' : ''}`}
                                    >
                                        <Icons.MoreVertical />
                                    </button>
                                    {activeMenu === c.id && (
                                        <div className="absolute right-0 top-8 bg-white shadow-lg border border-slate-100 rounded-lg z-20 py-2 w-40 dark:bg-slate-800 dark:border-slate-700">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleReportClick(c.id); }}
                                                className="w-full text-left px-4 py-2 hover:bg-slate-50 text-red-600 font-medium text-sm dark:hover:bg-slate-700"
                                            >
                                                Report Campaign
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mt-2 mb-2 dark:text-white">{c.title}</h3>
                            <p className="text-slate-600 text-sm mb-4 dark:text-slate-300">{c.date} • {c.location}</p>
                            
                            <div className="flex items-center gap-2 mb-4 text-slate-500 dark:text-slate-400 text-sm">
                                <Icons.Users />
                                <span>{c.participants} Participants</span>
                            </div>

                            <p className="text-slate-500 mb-6 line-clamp-2 dark:text-slate-400 flex-1">{c.description}</p>
                            {myCampaigns.includes(c.id) ? (
                                <button disabled className="w-full bg-slate-100 text-slate-500 py-2 rounded-lg font-bold dark:bg-slate-700 dark:text-slate-400">Registered</button>
                            ) : (
                                <button 
                                    onClick={() => { setSelectedCampaign(c.id); setRegisterSuccess(false); }} 
                                    disabled={!!c.reported}
                                    className="w-full bg-brand-600 text-white py-2 rounded-lg font-bold hover:bg-brand-700 mt-auto disabled:bg-slate-400"
                                >
                                    {t.campaign_join}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Register Modal */}
            {selectedCampaign && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md dark:bg-slate-900 border dark:border-slate-700 shadow-2xl">
                        {registerSuccess ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icons.Check />
                                </div>
                                <h3 className="text-2xl font-bold mb-2 dark:text-white">Registration Successful</h3>
                                <p className="text-slate-600 mb-2 dark:text-slate-400">You have successfully registered. Thank you for registering.</p>
                                <p className="text-slate-500 text-sm mb-6 dark:text-slate-500">Details will be forwarded to your email <strong>{userEmail}</strong>.</p>
                                <button onClick={() => setSelectedCampaign(null)} className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold">Close</button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold mb-6 dark:text-white">Register for Event</h3>
                                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                    <input placeholder="Full Name" required className={inputClasses} />
                                    <input placeholder="Student ID" required className={inputClasses} />
                                    <input placeholder="Phone Number" required type="tel" className={inputClasses} />
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setSelectedCampaign(null)} className="flex-1 py-3 border border-slate-300 rounded-lg font-bold dark:border-slate-600 dark:text-white">Cancel</button>
                                        <button type="submit" className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700">Confirm</button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-md dark:bg-slate-900 border dark:border-slate-700 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-xl font-bold mb-6 dark:text-white">Create New Campaign</h3>
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-white">Campaign Title</label>
                                <VoiceInput label="" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onVoiceInput={setNewTitle} className={inputClasses} required />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-white">Date</label>
                                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputClasses} required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-white">Location</label>
                                <VoiceInput label="" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} onVoiceInput={setNewLocation} className={inputClasses} required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-white">Type</label>
                                <select 
                                    value={newType} 
                                    onChange={(e) => setNewType(e.target.value as any)} 
                                    className={inputClasses}
                                >
                                    <option value="cleaning">Cleaning Drive</option>
                                    <option value="recycling">Recycling Drive</option>
                                    <option value="planting">Planting Drive</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-white">Description</label>
                                <VoiceInput label="" isTextArea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} onVoiceInput={setNewDesc} className={inputClasses} required />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 border border-slate-300 rounded-lg font-bold dark:border-slate-600 dark:text-white">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Report Campaign Modal */}
            {reportingId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-8 w-full max-w-sm dark:bg-slate-900 border dark:border-slate-700 shadow-2xl">
                        {reportSuccess ? (
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Icons.Check />
                                </div>
                                <h3 className="text-xl font-bold mb-2 dark:text-white">Report Submitted</h3>
                                <p className="text-slate-600 mb-6 dark:text-slate-400">Thank you for keeping our community safe. We will review this campaign shortly.</p>
                                <button onClick={() => setReportingId(null)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 dark:bg-white dark:text-black">Close</button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-xl font-bold mb-4 dark:text-white">Report Campaign</h3>
                                <p className="text-sm text-slate-500 mb-4 dark:text-slate-400">Why are you reporting this campaign?</p>
                                <div className="space-y-3 mb-6">
                                    {['Inappropriate Content', 'Spam or Scam', 'Misleading Information', 'Harassment or Hate Speech', 'Other'].map(reason => (
                                        <label key={reason} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                                            <input 
                                                type="radio" 
                                                name="reportReason" 
                                                value={reason} 
                                                checked={reportReason === reason} 
                                                onChange={(e) => setReportReason(e.target.value)}
                                                className="w-4 h-4 text-brand-600"
                                            />
                                            <span className="dark:text-white text-sm">{reason}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setReportingId(null)} className="flex-1 py-2 border border-slate-300 rounded-lg font-bold dark:border-slate-600 dark:text-white">Cancel</button>
                                    <button 
                                        onClick={submitReport} 
                                        disabled={!reportReason}
                                        className="flex-1 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Report
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const MyCampaigns: React.FC<{ lang: Language, myCampaignIds: string[], campaigns: Campaign[] }> = ({ lang, myCampaignIds, campaigns }) => {
    const t = TRANSLATIONS[lang];
    const registered = campaigns.filter(c => myCampaignIds.includes(c.id));
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 dark:text-white">{t.nav_my_campaigns}</h2>
            {registered.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">You haven't joined any campaigns yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {registered.map(c => (
                        <div key={c.id} className="bg-white p-6 rounded-xl shadow flex gap-4 dark:bg-slate-800">
                             <img src={c.image} alt={c.title} className="w-24 h-24 rounded-lg object-cover" />
                             <div>
                                 <h3 className="font-bold text-lg dark:text-white">{c.title}</h3>
                                 <p className="text-slate-500 mb-2 dark:text-slate-400">{c.date}</p>
                                 <span className="text-green-600 text-sm font-bold">Confirmed</span>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const Donate: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    const [selectedNGO, setSelectedNGO] = useState<any>(null);
    const navigate = useNavigate();

    const handleDonateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/donation-success');
    };

    return (
        <div className="max-w-5xl mx-auto">
             <h2 className="text-2xl font-bold mb-6 dark:text-white">{t.donate_title}</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 {MOCK_NGOS.map(ngo => (
                     <div key={ngo.id} className="bg-white p-6 rounded-xl shadow border border-slate-100 dark:bg-slate-800 dark:border-slate-700 flex flex-col h-full">
                         <div className="flex items-center gap-4 mb-4">
                             <img src={ngo.image} alt={ngo.name} className="w-16 h-16 rounded-full" />
                             <div>
                                 <div className="flex items-center">
                                     <h3 className="font-bold dark:text-white">{ngo.name}</h3>
                                     {ngo.verified && (
                                         <svg className="w-5 h-5 text-blue-500 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                             <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                         </svg>
                                     )}
                                 </div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{ngo.focus}</p>
                             </div>
                         </div>
                         <p className="text-sm text-slate-600 mb-4 dark:text-slate-300 flex-1">{ngo.description}</p>
                         <div className="flex flex-wrap gap-2 mb-4">
                             {ngo.needs.map(n => <span key={n} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded dark:bg-green-900/30 dark:text-green-400">{n}</span>)}
                         </div>
                         <button 
                            onClick={() => setSelectedNGO(ngo)}
                            className="w-full py-2 border-2 border-green-500 text-green-600 font-bold rounded-lg hover:bg-green-50 transition dark:hover:bg-green-900/20 mt-auto"
                         >
                             Donate to {ngo.name}
                         </button>
                     </div>
                 ))}
             </div>
             
             {selectedNGO && (
                 <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                     <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md dark:bg-slate-900 dark:border dark:border-slate-700">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xl font-bold dark:text-white">Donate to {selectedNGO.name}</h3>
                             <button onClick={() => setSelectedNGO(null)}><Icons.X /></button>
                         </div>
                         <form onSubmit={handleDonateSubmit} className="space-y-4">
                             <VoiceInput label={t.donate_item_label} placeholder="e.g. 5 Winter Jackets" className={inputClasses} />
                             <VoiceInput label={t.donate_pickup_label} isTextArea placeholder="Room number, Hostel block..." className={inputClasses} />
                             <button className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg">
                                 {t.donate_confirm}
                             </button>
                         </form>
                     </div>
                 </div>
             )}
        </div>
    );
};

const DonationConfirmation: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = TRANSLATIONS[lang];
    return (
        <div className="text-center py-16">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Heart />
            </div>
            <h2 className="text-3xl font-bold mb-4 dark:text-white">{t.donate_thanks}</h2>
            <p className="text-slate-600 mb-8 max-w-lg mx-auto dark:text-slate-400">
                Your donation pledge has been recorded. An NGO representative will contact you shortly to coordinate the pickup. Thank you for your generosity!
            </p>
            <Link to="/dashboard" className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 dark:bg-white dark:text-black">
                Back to Dashboard
            </Link>
        </div>
    );
};

const Chat: React.FC<{ lang: Language, messages: Message[], onSendMessage: (text: string) => void, onAcceptOffer: (id: string) => void, onRejectOffer: (id: string) => void, markMessagesRead: () => void }> = ({ lang, messages, onSendMessage, onAcceptOffer, onRejectOffer, markMessagesRead }) => {
    const t = TRANSLATIONS[lang];
    const [activeChat, setActiveChat] = useState<string | null>('u1');
    const [text, setText] = useState('');

    useEffect(() => {
        markMessagesRead();
    }, [markMessagesRead]);

    const filteredMessages = messages.filter(m => m.sender === activeChat || m.sender === 'me'); 

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow overflow-hidden border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                <div className="p-4 border-b border-slate-200 font-bold text-lg dark:border-slate-800 dark:text-white">{t.chat_title}</div>
                <div className="overflow-y-auto h-full">
                    {MOCK_CHATS.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => setActiveChat(c.id)}
                            className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${activeChat === c.id ? 'bg-white dark:bg-slate-800 shadow-sm' : ''}`}
                        >
                            <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate dark:text-white">{c.name}</h4>
                                <p className="text-xs text-slate-500 truncate dark:text-slate-400">{c.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
                {activeChat ? (
                    <>
                        <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 dark:bg-slate-900 dark:border-slate-800">
                            <span className="font-bold dark:text-white">{MOCK_CHATS.find(c => c.id === activeChat)?.name}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {filteredMessages.map(m => (
                                <div key={m.id} className={`flex ${m.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs px-4 py-3 rounded-xl ${m.isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-bl-none shadow'}`}>
                                        {m.isOffer ? (
                                            <div>
                                                <p className="font-bold text-sm mb-1 uppercase tracking-wider opacity-80">Offer Received</p>
                                                <p className="text-lg font-bold mb-2">₹{m.offerAmount}</p>
                                                <p className="text-sm mb-3">for {m.relatedProductTitle}</p>
                                                {m.offerStatus === 'pending' ? (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => onRejectOffer(m.id)} className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-white py-1 rounded text-xs font-bold border border-red-500/50">Reject</button>
                                                        <button onClick={() => onAcceptOffer(m.id)} className="flex-1 bg-white/20 hover:bg-white/30 text-white py-1 rounded text-xs font-bold border border-white/50">Accept</button>
                                                    </div>
                                                ) : (
                                                    <div className={`text-xs font-bold uppercase py-1 px-2 rounded text-center ${m.offerStatus === 'accepted' ? 'bg-green-800/40 text-green-100' : 'bg-red-800/40 text-red-100'}`}>
                                                        {m.offerStatus}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p>{m.text}</p>
                                        )}
                                        <span className={`text-[10px] block text-right mt-1 opacity-70`}>{m.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-white border-t border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); onSendMessage(text); setText(''); }}>
                                <input 
                                    value={text} 
                                    onChange={(e) => setText(e.target.value)} 
                                    placeholder={t.chat_placeholder}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-black" 
                                />
                                <button type="submit" className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700">
                                    <Icons.Send />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">Select a conversation</div>
                )}
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [role, setRole] = useState<UserRole>('buyer');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [myCampaigns, setMyCampaigns] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  // Mock messages with a sample offer
  const [messages, setMessages] = useState<Message[]>([
      { id: '1', sender: 'u1', text: 'Hi, is the calculator still available?', isMe: false, timestamp: '10:00 AM', read: false },
      { id: '2', sender: 'me', text: 'Yes, it is!', isMe: true, timestamp: '10:05 AM', read: true },
      { id: '3', sender: 'u1', text: 'Would you take 500 for it?', isMe: false, timestamp: '10:10 AM', read: false, isOffer: true, offerAmount: 500, relatedProductId: '2', relatedProductTitle: 'Scientific Calculator fx-991ES', offerStatus: 'pending' }
  ]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Auth Listener
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
              setCurrentUser({
                  name: user.displayName || 'Student',
                  email: user.email || '',
                  bio: 'Student at University', // Default bio as it's not in standard auth profile
                  avatar: user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=random`
              });
          } else {
              setCurrentUser(null);
          }
      });
      return () => unsubscribe();
  }, []);

  // Helper to determine notification visibility based on role
  const isNotificationVisible = useCallback((n: Notification, r: UserRole) => {
      if (r === 'buyer') {
          // Buyer sees 'offer' (offer accepted) and 'system'. Should NOT see 'sale' (item sold).
          return n.type !== 'sale';
      } else {
          // Seller sees 'sale' (item sold) and 'system'.
          return n.type === 'sale' || n.type === 'system';
      }
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(p => p.id !== id));
  };
  
  const navigate = useNavigate();

  const onPlaceOrder = (method: string) => {
      // Mark items as sold and assign buyer name
      const soldItemIds = cart.map(c => c.id);
      
      setProducts(prev => prev.map(p => {
          if (soldItemIds.includes(p.id)) {
              return { ...p, status: 'sold', buyerName: currentUser?.name };
          }
          return p;
      }));

      // Generate notifications for sellers
      cart.forEach(item => {
          setNotifications(prev => [
              {
                  id: Date.now().toString() + Math.random(),
                  title: 'Item Sold',
                  message: `Congratulations, ${item.title} was sold out.`,
                  date: new Date().toLocaleDateString(),
                  read: false,
                  type: 'sale'
              },
              ...prev
          ]);
      });

      // Navigate first to avoid race condition with Checkout's empty cart redirect
      navigate('/order-success', { state: { method } });
      
      // Clear cart after navigation has likely started
      setTimeout(() => setCart([]), 50); 
  };

  const onAddItem = (item: any) => {
      const newProduct: Product = {
          id: Date.now().toString(),
          ...item,
          sellerName: currentUser?.name || 'You',
          status: 'available',
          reviews: [],
          date: new Date().toLocaleDateString()
      };
      setProducts([newProduct, ...products]);
      navigate('/sell-success');
  };
  
  const onRegisterCampaign = (id: string) => {
      if (!myCampaigns.includes(id)) {
          setMyCampaigns([...myCampaigns, id]);
          // Increment participant count
          setCampaigns(prev => prev.map(c => 
            c.id === id ? { ...c, participants: c.participants + 1 } : c
          ));
      }
  };

  const onAddCampaign = (newCampaign: Campaign) => {
      setCampaigns(prev => [newCampaign, ...prev]);
      // Also register the creator to their own campaign
      setMyCampaigns(prev => [...prev, newCampaign.id]);
  };

  const onReportCampaign = (id: string) => {
      setCampaigns(prev => prev.map(c => 
          c.id === id ? { ...c, reported: true } : c
      ));
      // Optionally notify user
      alert("Campaign reported. Thank you for keeping our community safe.");
  };

  const onAddReview = (id: string, rating: number, comment: string) => {
      setProducts(prev => prev.map(p => {
          if (p.id === id) {
              return {
                  ...p,
                  reviews: [
                      ...p.reviews,
                      {
                          id: Date.now().toString(),
                          user: currentUser?.name || 'Anonymous',
                          rating,
                          comment,
                          date: new Date().toLocaleDateString()
                      }
                  ]
              };
          }
          return p;
      }));
  };

  const handleMakeOffer = (product: Product, price: number) => {
      // Simulate sending an offer
      const newMsg: Message = {
          id: Date.now().toString(),
          sender: 'me',
          text: `Offer Sent: ₹${price} for ${product.title}`,
          isMe: true,
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          isOffer: true,
          offerAmount: price,
          relatedProductTitle: product.title,
          relatedProductId: product.id,
          offerStatus: 'pending' 
      };
      setMessages([...messages, newMsg]);
      navigate('/chat');
  };

  const handleAcceptOffer = (id: string) => {
      const msg = messages.find(m => m.id === id);
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, offerStatus: 'accepted' } : m));

      // Update product price if offer is accepted
      if (msg && msg.relatedProductId && msg.offerAmount) {
          setProducts(prev => prev.map(p => {
              if (p.id === msg.relatedProductId) {
                  return {
                      ...p,
                      originalPrice: p.price, // Store current price as original
                      price: msg.offerAmount! // Update to new negotiated price
                  };
              }
              return p;
          }));
          // Also update cart price if present
          setCart(prev => prev.map(c => {
              if (c.id === msg.relatedProductId) {
                  return {
                      ...c,
                      originalPrice: c.price,
                      price: msg.offerAmount!
                  };
              }
              return c;
          }));

          // Notify Buyer
          setNotifications(prev => [
              {
                  id: Date.now().toString(),
                  title: 'Offer Accepted',
                  message: `Congratulations, your offer for ${msg.relatedProductTitle} was accepted.`,
                  date: new Date().toLocaleDateString(),
                  read: false,
                  type: 'offer'
              },
              ...prev
          ]);
      }
  };

  const handleRejectOffer = (id: string) => {
      setMessages(msgs => msgs.map(m => m.id === id ? { ...m, offerStatus: 'rejected' } : m));
  };

  // Mark visible notifications as read for current role
  const markNotificationsRead = useCallback(() => {
      setNotifications(prev => prev.map(n => {
          if (!n.read && isNotificationVisible(n, role)) {
              return { ...n, read: true };
          }
          return n;
      }));
  }, [role, isNotificationVisible]);

  const markMessagesRead = useCallback(() => {
      setMessages(prev => prev.some(m => !m.read) ? prev.map(m => ({ ...m, read: true })) : prev);
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />} />
      <Route path="/login" element={<Login lang={lang} />} />
      <Route path="/signup" element={<Signup lang={lang} />} />
      
      {/* Protected Routes */}
      <Route element={
        currentUser ? (
          <Layout 
            lang={lang} 
            setLang={setLang} 
            role={role} 
            setRole={setRole} 
            unreadCount={messages.filter(m => !m.isMe && !m.read).length} 
            unreadNotifications={notifications.filter(n => !n.read && isNotificationVisible(n, role)).length}
            onOpenChat={() => navigate('/chat')}
            cartCount={cart.reduce((acc, i) => acc + i.quantity, 0)}
            onLogout={() => { signOut(auth).then(() => navigate('/')); }}
            currentUser={currentUser}
            theme={theme}
            setTheme={setTheme}
          />
        ) : (
          <Navigate to="/" replace /> 
        )
      }>
         <Route path="/dashboard" element={
            role === 'seller' 
              ? <SellerDashboard lang={lang} products={products.filter(p => p.sellerName === 'You' || p.sellerName === currentUser?.name)} onRelist={() => {}} onDelete={(id) => setProducts(products.filter(p => p.id !== id))} /> 
              : <Marketplace lang={lang} products={products} addToCart={addToCart} onMakeOffer={handleMakeOffer} />
         } />
         <Route path="/cart" element={<Cart lang={lang} cart={cart} removeFromCart={removeFromCart} />} />
         <Route path="/notifications" element={<Notifications notifications={notifications} role={role} markNotificationsRead={markNotificationsRead} />} />
         <Route path="/product/:id" element={
            <ProductDetail 
                lang={lang} 
                products={products} 
                addToCart={addToCart} 
                startNegotiation={handleMakeOffer}
                addReview={onAddReview}
            />
         } />
         <Route path="/checkout" element={<Checkout lang={lang} cart={cart} onPlaceOrder={onPlaceOrder} />} />
         <Route path="/order-success" element={<OrderSuccessWrapper lang={lang} />} />
         <Route path="/settings-success" element={<SettingsSuccess lang={lang} />} />
         <Route path="/donation-success" element={<DonationConfirmation lang={lang} />} />
         <Route path="/sell" element={<SellItem lang={lang} onAddItem={onAddItem} />} />
         <Route path="/sell-success" element={<ItemListedSuccess lang={lang} />} />
         <Route path="/profile" element={currentUser ? <Profile lang={lang} currentUser={currentUser} purchases={products.filter(p => p.buyerName === currentUser.name)} onUpdateUser={setCurrentUser} onAddReview={onAddReview} /> : null} />
         <Route path="/settings" element={currentUser ? <Settings lang={lang} currentUser={currentUser} onUpdateUser={setCurrentUser} /> : null} />
         <Route path="/campaigns" element={
            <Campaigns 
                lang={lang} 
                campaigns={campaigns}
                onRegister={onRegisterCampaign} 
                onAddCampaign={onAddCampaign}
                onReportCampaign={onReportCampaign}
                myCampaigns={myCampaigns} 
                userEmail={currentUser?.email || ''} 
            />
         } />
         <Route path="/my-campaigns" element={<MyCampaigns lang={lang} myCampaignIds={myCampaigns} campaigns={campaigns} />} />
         <Route path="/donate" element={<Donate lang={lang} />} />
         <Route path="/chat" element={
            <Chat 
                lang={lang} 
                messages={messages} 
                onSendMessage={(txt) => setMessages([...messages, { id: Date.now().toString(), text: txt, sender: 'me', isMe: true, timestamp: 'Now', read: true }])}
                onAcceptOffer={handleAcceptOffer}
                onRejectOffer={handleRejectOffer}
                markMessagesRead={markMessagesRead}
            />
         } />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;