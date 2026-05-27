import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, List, Loader2 } from 'lucide-react';
import { supabase, Comic, Chapter, ChapterPage } from '../lib/supabase';

type Props = {
  comic: Comic;
  chapter: Chapter;
  onBack: () => void;
  onSelectChapter: (chapter: Chapter) => void;
};

export default function ChapterReaderPage({ comic, chapter, onBack, onSelectChapter }: Props) {
  const [pages, setPages] = useState<ChapterPage[]>([]);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchAllChapters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter.id]);

  const fetchPages = async () => {
    setLoading(true);
    const { data } = await supabase.from('chapter_pages').select('*').eq('chapter_id', chapter.id).order('page_number', { ascending: true });
    setPages(data ?? []);
    setLoading(false);
  };

  const fetchAllChapters = async () => {
    const { data } = await supabase.from('chapters').select('*').eq('comic_id', comic.id).order('chapter_number', { ascending: true });
    setAllChapters(data ?? []);
  };

  const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  const handleChapterChange = async (ch: Chapter) => {
    await supabase.from('chapters').update({ view_count: ch.view_count + 1 }).eq('id', ch.id);
    onSelectChapter({ ...ch, view_count: ch.view_count + 1 });
    setShowChapterList(false);
  };

  return (
    <div className="pt-16 min-h-screen bg-[#0A0A0A]">
      {/* Top nav */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#F5C518]/20">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 text-gray-500 hover:text-[#F5C518] transition-colors rounded-lg hover:bg-[#F5C518]/10">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{comic.title}</p>
            <p className="text-[#F5C518] text-xs">Chương {chapter.chapter_number}{chapter.title ? `: ${chapter.title}` : ''}</p>
          </div>
          <button onClick={() => setShowChapterList(!showChapterList)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#222] border border-[#333] rounded-lg text-gray-400 hover:text-[#F5C518] text-xs transition-colors">
            <List size={14} /> Chương
          </button>
        </div>

        {showChapterList && (
          <div className="border-t border-[#222] bg-[#0A0A0A] max-h-60 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 py-2 grid grid-cols-3 sm:grid-cols-4 gap-1">
              {allChapters.map(ch => (
                <button key={ch.id} onClick={() => handleChapterChange(ch)}
                  className={`px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    ch.id === chapter.id ? 'bg-[#F5C518] text-black font-bold' : 'text-gray-500 hover:text-[#F5C518] hover:bg-[#F5C518]/10'
                  }`}>
                  Ch. {ch.chapter_number}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pages */}
      <div className="pt-12 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-24"><Loader2 size={36} className="text-[#F5C518] animate-spin" /></div>
        ) : pages.length === 0 ? (
          <div className="text-center py-24 text-gray-600">Chương này chưa có trang nào.</div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {pages.map(page => (
              <div key={page.id} className="mb-0.5">
                <img src={page.image_url} alt={`Trang ${page.page_number}`} className="w-full" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="sticky bottom-0 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#F5C518]/20 py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <button onClick={() => prevChapter && handleChapterChange(prevChapter)} disabled={!prevChapter}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#222] disabled:opacity-20 disabled:cursor-not-allowed border border-[#333] rounded-xl text-white text-sm transition-colors">
            <ChevronLeft size={16} /> Chương trước
          </button>
          <span className="text-[#F5C518] text-sm font-bold">{currentIndex + 1} / {allChapters.length}</span>
          <button onClick={() => nextChapter && handleChapterChange(nextChapter)} disabled={!nextChapter}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E50914] hover:bg-[#B20710] disabled:opacity-20 disabled:cursor-not-allowed rounded-xl text-white text-sm font-bold transition-colors">
            Chương tiếp <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
