import { useEffect, useState } from 'react';
import { Flame, Loader2, TrendingUp } from 'lucide-react';
import { supabase, Comic } from '../lib/supabase';
import ComicCard from '../components/ComicCard';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 14;

type Props = {
  searchQuery: string;
  onSelectComic: (comic: Comic) => void;
};

export default function HomePage({ searchQuery, onSelectComic }: Props) {
  const [comics, setComics] = useState<Comic[]>([]);
  const [featured, setFeatured] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);
  useEffect(() => { fetchFeatured(); }, []);
  useEffect(() => { fetchComics(); }, [currentPage, searchQuery]);

  const fetchFeatured = async () => {
    const { data } = await supabase.from('comics').select('*').order('avg_rating', { ascending: false }).limit(6);
    setFeatured(data ?? []);
  };

  const fetchComics = async () => {
    setLoading(true);
    const from = (currentPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    let query = supabase.from('comics').select('*', { count: 'exact' });
    if (searchQuery.trim()) query = query.ilike('title', `%${searchQuery.trim()}%`);
    const { data, count } = await query.order('created_at', { ascending: false }).range(from, to);
    setComics(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="pt-16 min-h-screen bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero banner */}
        {!searchQuery && (
          <div className="relative mb-10 rounded-2xl overflow-hidden bg-gradient-to-r from-[#1A1A1A] via-[#0A0A0A] to-[#1A1A1A] border border-[#222]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#E50914]/10 via-transparent to-[#F5C518]/10" />
            <div className="relative px-6 md:px-10 py-10 md:py-14">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={24} className="text-[#E50914]" />
                <span className="font-display text-4xl md:text-5xl text-[#F5C518] tracking-wider">MANGA NOVA</span>
              </div>
              <p className="text-gray-400 text-sm md:text-base max-w-lg">
                Kho truyện tranh lớn nhất - Đọc miễn phí hàng ngàn bộ manga, manhwa, manhua cập nhật mỗi ngày
              </p>
            </div>
          </div>
        )}

        {/* Featured */}
        {!searchQuery && featured.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={20} className="text-[#E50914]" />
              <h2 className="font-display text-xl text-white tracking-wide">TRUYỆN NỔI BẬT</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#E50914]/30 to-transparent ml-3" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {featured.map(comic => (
                <ComicCard key={comic.id} comic={comic} onClick={() => onSelectComic(comic)} />
              ))}
            </div>
          </section>
        )}

        {/* All comics */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-[#F5C518]" />
              <h2 className="font-display text-xl text-white tracking-wide">
                {searchQuery ? `KẾT QUẢ: "${searchQuery}"` : 'TẤT CẢ TRUYỆN'}
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-[#F5C518]/30 to-transparent ml-3 min-w-[40px]" />
            </div>
            <span className="text-gray-600 text-xs">{total} bộ</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={32} className="text-[#F5C518] animate-spin" />
            </div>
          ) : comics.length === 0 ? (
            <div className="text-center py-24 text-gray-600">
              {searchQuery ? `Không tìm thấy truyện cho "${searchQuery}"` : 'Chưa có truyện nào.'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3">
                {comics.map(comic => (
                  <ComicCard key={comic.id} comic={comic} onClick={() => onSelectComic(comic)} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages}
                onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
