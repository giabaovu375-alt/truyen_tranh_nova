import { useState } from 'react';
import { Search, Flame, User, LogOut, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

type Props = {
  onSearch: (q: string) => void;
  searchQuery: string;
  currentPage: 'home' | 'admin';
  onNavigate: (page: 'home' | 'admin') => void;
};

export default function Header({ onSearch, searchQuery, currentPage, onNavigate }: Props) {
  const { user, isAdmin, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenu, setMobileMenu] = useState(false);

  const openLogin = () => { setAuthMode('login'); setShowAuth(true); setMobileMenu(false); };
  const openRegister = () => { setAuthMode('register'); setShowAuth(true); setMobileMenu(false); };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#F5C518]/20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          {/* Logo */}
          <button onClick={() => onNavigate('home')}
            className="flex items-center gap-2 shrink-0 group">
            <Flame size={28} className="text-[#E50914] group-hover:text-[#F5C518] transition-colors" />
            <div className="flex flex-col leading-none">
              <span className="font-display text-2xl text-[#F5C518] tracking-wider">MANGA NOVA</span>
            </div>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xl relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5C518]/40" />
            <input type="text" placeholder="Tìm truyện..." value={searchQuery} onChange={e => onSearch(e.target.value)}
              className="w-full bg-[#1A1A1A] border border-[#333] rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/50 transition-colors text-sm" />
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button onClick={() => onNavigate(currentPage === 'admin' ? 'home' : 'admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === 'admin'
                    ? 'bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/30'
                    : 'text-gray-400 hover:text-[#F5C518] hover:bg-[#F5C518]/10'
                }`}>
                <Shield size={15} />
                Admin
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] rounded-lg border border-[#333]">
                  <User size={15} className="text-[#F5C518]" />
                  <span className="text-sm text-white max-w-[100px] truncate">{user.email?.split('@')[0]}</span>
                </div>
                <button onClick={signOut} className="p-2 text-gray-500 hover:text-[#E50914] hover:bg-[#E50914]/10 rounded-lg transition-colors" title="Đăng xuất">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <>
                <button onClick={openLogin} className="px-4 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">Đăng Nhập</button>
                <button onClick={openRegister} className="px-4 py-1.5 bg-[#E50914] hover:bg-[#B20710] text-white text-sm font-bold rounded-lg transition-colors">Đăng Ký</button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2 text-gray-400 hover:text-[#F5C518] transition-colors">
            {mobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-[#F5C518]/20 bg-[#0A0A0A] px-4 py-3 space-y-2">
            {isAdmin && (
              <button onClick={() => { onNavigate(currentPage === 'admin' ? 'home' : 'admin'); setMobileMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#F5C518] hover:bg-[#F5C518]/10 transition-colors">
                <Shield size={15} /> Trang Admin
              </button>
            )}
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
                  <User size={15} className="text-[#F5C518]" /> {user.email}
                </div>
                <button onClick={() => { signOut(); setMobileMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#E50914] hover:bg-[#E50914]/10 transition-colors">
                  <LogOut size={15} /> Đăng Xuất
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button onClick={openLogin} className="flex-1 py-2 text-sm text-gray-400 hover:text-white border border-[#333] rounded-lg transition-colors">Đăng Nhập</button>
                <button onClick={openRegister} className="flex-1 py-2 text-sm text-white bg-[#E50914] hover:bg-[#B20710] rounded-lg transition-colors font-bold">Đăng Ký</button>
              </div>
            )}
          </div>
        )}
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} defaultMode={authMode} />}
    </>
  );
}
