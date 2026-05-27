import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, BookOpen, Loader2, Star, Flame } from 'lucide-react';
import { supabase, Comic, Chapter } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

type Props = {
  comic: Comic;
  onBack: () => void;
  onReadChapter: (chapter: Chapter) => void;
};

export default function ComicDetailPage({ comic, onBack, onReadChapter }: Props) {
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comicData, setComicData] = useState<Comic>(comic);
  const [ratingMsg, setRatingMsg] = useState('');

  useEffect(() => {
    fetchChapters();
    if (user) fetchUserRating();
  }, [comic.id, user]);

  const fetchChapters = async () => {
    setLoading(true);
    const { data } = await supabase.from('chapters').select('*').eq('comic_id', comic.id).order('chapter_number', { ascending: true });
    setChapters(data ?? []);
    setLoading(false);
  };

  const fetchUserRating = async () => {
    if (!user) return;
    const { data } = await supabase.from('ratings').select('stars').eq('comic_id', comic.id).eq('user_id', user.id).maybeSingle();
    if (data) setUserRating(data.stars);
  };

  const refreshComic = async () => {
    const { data } = await supabase.from('comics').select('*').eq('id', comic.id).maybeSingle();
    if (data) setComicData(data);
  };

  const handleRate = async (stars: number) => {
    if (!user) { setRatingMsg('Đăng nhập để đánh giá'); return; }
    setUserRating(stars);
    await supabase.from('ratings').upsert({ comic_id: comic.id, user_id: user.id, stars }, { onConflict: 'comic_id,user_id' });
    setRatingMsg('Đã lưu!');
    setTimeout(() => setRatingMsg(''), 2000);
    refreshComic();
  };

  const handleReadChapter = async (chapter: Chapter) => {
    await supabase.from('chapters').update({ view_count: chapter.view_count + 1 }).eq('id', chapter.id);
    onReadChapter({ ...chapter, view_count: chapter.view_count + 1 });
  };

  return (
    <div className="pt-16 min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#F5C518] mb-6 transition-colors group text-sm">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Trở về
        </button>

        {/* Comic info */}
        <div className="flex flex-col sm:flex-row gap-6 mb-10">
          <div className="shrink-0 w-full sm:w-52 md:w-60">
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#1A1A1A] shadow-2xl shadow-black/50 border border-[#333]">
              {comicData.cover_url ? (
                <img src={comicData.cover_url} alt={comicData.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm text-center px-4">{comicData.title}</div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{comicData.title}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                <Star size={18} className="text-[#F5C518] fill-[#F5C518]" />
                <span className="text-[#F5C518] font-bold text-lg">{comicData.avg_rating > 0 ? comicData.avg_rating.toFixed(1) : '—'}</span>
                {comicData.rating_count > 0 && <span className="text-gray-500 text-sm">({comicData.rating_count} đánh giá)</span>}
              </div>
            </div>

            {comicData.description && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xl">{comicData.description}</p>
            )}

            {/* Action buttons */}
            {chapters.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                <button onClick={() => handleReadChapter(chapters[0])}
                  className="flex items-center gap-2 px-6 py-3 bg-[#E50914] hover:bg-[#B20710] text-white font-bold rounded-xl transition-colors text-sm uppercase tracking-wider">
                  <BookOpen size={16} />
                  Đọc Từ Chương 1
                </button>
                {chapters.length > 1 && (
                  <button onClick={() => handleReadChapter(chapters[chapters.length - 1])}
                    className="flex items-center gap-2 px-6 py-3 bg-[#1A1A1A] hover:bg-[#222] text-white font-bold rounded-xl transition-colors text-sm border border-[#F5C518]/30 hover:border-[#F5C518]/60">
                    <Flame size={16} className="text-[#F5C518]" />
                    Chương {chapters[chapters.length - 1].chapter_number} (Mới nhất)
                  </button>
                )}
              </div>
            )}

            {/* User rating */}
            <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 inline-block">
              <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Đánh giá của bạn</p>
              <StarRating rating={userRating} size={22} interactive onRate={handleRate} hovered={hoveredStar} onHover={setHoveredStar} />
              {ratingMsg && <p className="text-[#F5C518] text-xs mt-2">{ratingMsg}</p>}
            </div>
          </div>
        </div>

        {/* Chapters list */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <BookOpen size={18} className="text-[#F5C518]" />
            <h2 className="font-display text-xl text-white tracking-wide">DANH SÁCH CHƯƠNG</h2>
            <span className="text-gray-600 text-xs">({chapters.length})</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#F5C518]/30 to-transparent ml-3" />
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="text-[#F5C518] animate-spin" /></div>
          ) : chapters.length === 0 ? (
            <p className="text-gray-600 py-12 text-center">Chưa có chương nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {chapters.map(ch => (
                <button key={ch.id} onClick={() => handleReadChapter(ch)}
                  className="flex items-center justify-between px-4 py-3 bg-[#1A1A1A] hover:bg-[#222] border border-[#222] hover:border-[#F5C518]/40 rounded-lg transition-all group text-left">
                  <span className="text-white text-sm group-hover:text-[#F5C518] transition-colors font-medium truncate">
                    Chương {ch.chapter_number}{ch.title ? `: ${ch.title}` : ''}
                  </span>
                  <div className="flex items-center gap-1 text-gray-600 text-xs shrink-0 ml-2 group-hover:text-gray-400">
                    <Eye size={12} />
                    <span>{ch.view_count.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
