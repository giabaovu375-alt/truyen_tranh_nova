import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Comic, Chapter } from './lib/supabase';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ComicDetailPage from './pages/ComicDetailPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import AdminPage from './pages/AdminPage';
import { Shield } from 'lucide-react';

type View =
  | { type: 'home' }
  | { type: 'comic'; comic: Comic }
  | { type: 'reader'; comic: Comic; chapter: Chapter };

function AppInner() {
  const { isAdmin, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');
  const [view, setView] = useState<View>({ type: 'home' });

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setView({ type: 'home' });
    setCurrentPage('home');
  };

  const handleNavigate = (page: 'home' | 'admin') => {
    setCurrentPage(page);
    setView({ type: 'home' });
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5C518] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Header onSearch={handleSearch} searchQuery={searchQuery} currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage === 'admin' && isAdmin ? (
        <AdminPage />
      ) : currentPage === 'admin' && !isAdmin ? (
        <div className="pt-16 min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-4 text-gray-600">
          <Shield size={48} className="text-[#333]" />
          <p className="text-lg">Không có quyền truy cập</p>
        </div>
      ) : view.type === 'home' ? (
        <HomePage searchQuery={searchQuery} onSelectComic={comic => setView({ type: 'comic', comic })} />
      ) : view.type === 'comic' ? (
        <ComicDetailPage comic={view.comic} onBack={() => setView({ type: 'home' })} onReadChapter={chapter => setView({ type: 'reader', comic: view.comic, chapter })} />
      ) : view.type === 'reader' ? (
        <ChapterReaderPage comic={view.comic} chapter={view.chapter} onBack={() => setView({ type: 'comic', comic: view.comic })} onSelectChapter={chapter => setView({ type: 'reader', comic: view.comic, chapter })} />
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
