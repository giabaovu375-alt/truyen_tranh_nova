import { useEffect, useState, useRef } from 'react';
import {
  Plus, Trash2, ChevronDown, ChevronUp, Loader2, Image, BookOpen, FileText, X, Upload, GripVertical
} from 'lucide-react';
import { supabase, Comic, Chapter, uploadImage } from '../lib/supabase';

export default function AdminPage() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComic, setExpandedComic] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Record<string, Chapter[]>>({});

  // Comic form
  const [showComicForm, setShowComicForm] = useState(false);
  const [comicTitle, setComicTitle] = useState('');
  const [comicDesc, setComicDesc] = useState('');
  const [comicCoverFile, setComicCoverFile] = useState<File | null>(null);
  const [comicCoverPreview, setComicCoverPreview] = useState('');
  const [savingComic, setSavingComic] = useState(false);

  // Chapter form
  const [addingChapterFor, setAddingChapterFor] = useState<string | null>(null);
  const [chapterNum, setChapterNum] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [savingChapter, setSavingChapter] = useState(false);

  // Pages upload
  const [addingPagesFor, setAddingPagesFor] = useState<string | null>(null);
  const [pageFiles, setPageFiles] = useState<File[]>([]);
  const [pagePreviews, setPagePreviews] = useState<string[]>([]);
  const [savingPages, setSavingPages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchComics(); }, []);

  const fetchComics = async () => {
    setLoading(true);
    const { data } = await supabase.from('comics').select('*').order('created_at', { ascending: false });
    setComics(data ?? []);
    setLoading(false);
  };

  const fetchChapters = async (comicId: string) => {
    const { data } = await supabase.from('chapters').select('*').eq('comic_id', comicId).order('chapter_number', { ascending: true });
    setChapters(prev => ({ ...prev, [comicId]: data ?? [] }));
  };

  const toggleComic = (id: string) => {
    if (expandedComic === id) setExpandedComic(null);
    else { setExpandedComic(id); fetchChapters(id); }
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setComicCoverFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setComicCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddComic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comicTitle.trim()) return;
    setSavingComic(true);

    let coverUrl = '';
    if (comicCoverFile) {
      const ext = comicCoverFile.name.split('.').pop();
      const path = `covers/${Date.now()}.${ext}`;
      coverUrl = (await uploadImage(comicCoverFile, path)) ?? '';
    }

    await supabase.from('comics').insert({
      title: comicTitle.trim(),
      description: comicDesc.trim(),
      cover_url: coverUrl,
    });

    resetComicForm();
    fetchComics();
  };

  const resetComicForm = () => {
    setComicTitle(''); setComicDesc(''); setComicCoverFile(null); setComicCoverPreview('');
    setShowComicForm(false); setSavingComic(false);
  };

  const handleDeleteComic = async (id: string) => {
    if (!confirm('Xóa bộ truyện này? Tất cả chương và trang sẽ bị xóa.')) return;
    await supabase.from('comics').delete().eq('id', id);
    fetchComics();
    if (expandedComic === id) setExpandedComic(null);
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingChapterFor || !chapterNum) return;
    setSavingChapter(true);
    await supabase.from('chapters').insert({
      comic_id: addingChapterFor,
      chapter_number: parseInt(chapterNum),
      title: chapterTitle.trim(),
    });
    setChapterNum(''); setChapterTitle(''); setAddingChapterFor(null); setSavingChapter(false);
    fetchChapters(addingChapterFor);
  };

  const handleDeleteChapter = async (chapterId: string, comicId: string) => {
    if (!confirm('Xóa chương này?')) return;
    await supabase.from('chapters').delete().eq('id', chapterId);
    fetchChapters(comicId);
  };

  const handlePageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Sort by name (natural order)
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setPageFiles(files);
    const previews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previews.push(ev.target?.result as string);
        if (previews.length === files.length) setPagePreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadPages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addingPagesFor || pageFiles.length === 0) return;
    setSavingPages(true);
    setUploadProgress(0);

    const { data: existing } = await supabase
      .from('chapter_pages')
      .select('page_number')
      .eq('chapter_id', addingPagesFor)
      .order('page_number', { ascending: false })
      .limit(1);
    const startPage = (existing?.[0]?.page_number ?? 0) + 1;

    const inserts: { chapter_id: string; page_number: number; image_url: string }[] = [];

    for (let i = 0; i < pageFiles.length; i++) {
      const file = pageFiles[i];
      const ext = file.name.split('.').pop();
      const path = `chapters/${addingPagesFor}/page_${startPage + i}.${ext}`;
      const url = await uploadImage(file, path);
      if (url) {
        inserts.push({ chapter_id: addingPagesFor, page_number: startPage + i, image_url: url });
      }
      setUploadProgress(Math.round(((i + 1) / pageFiles.length) * 100));
    }

    if (inserts.length > 0) {
      await supabase.from('chapter_pages').insert(inserts);
    }

    setPageFiles([]); setPagePreviews([]); setAddingPagesFor(null); setSavingPages(false); setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePageFile = (index: number) => {
    setPageFiles(prev => prev.filter((_, i) => i !== index));
    setPagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const movePageFile = (from: number, to: number) => {
    if (to < 0 || to >= pageFiles.length) return;
    const newFiles = [...pageFiles];
    const newPreviews = [...pagePreviews];
    [newFiles[from], newFiles[to]] = [newFiles[to], newFiles[from]];
    [newPreviews[from], newPreviews[to]] = [newPreviews[to], newPreviews[from]];
    setPageFiles(newFiles);
    setPagePreviews(newPreviews);
  };

  return (
    <div className="pt-16 min-h-screen bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl text-[#F5C518] tracking-wider">QUẢN TRỊ</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý truyện tranh, chương và trang</p>
          </div>
          <button onClick={() => setShowComicForm(!showComicForm)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E50914] hover:bg-[#B20710] text-white text-sm font-bold rounded-xl transition-colors uppercase tracking-wider">
            <Plus size={16} /> Thêm Truyện
          </button>
        </div>

        {/* Add comic form */}
        {showComicForm && (
          <div className="mb-8 bg-[#1A1A1A] border border-[#F5C518]/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl text-[#F5C518] tracking-wide flex items-center gap-2">
                <BookOpen size={20} /> THÊM BỘ TRUYỆN MỚI
              </h2>
              <button onClick={resetComicForm} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAddComic} className="space-y-5">
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Tiêu đề *</label>
                <input type="text" placeholder="Tên bộ truyện" value={comicTitle} onChange={e => setComicTitle(e.target.value)} required
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/50 text-sm transition-colors" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Mô tả</label>
                <textarea placeholder="Mô tả về bộ truyện" value={comicDesc} onChange={e => setComicDesc(e.target.value)} rows={3}
                  className="w-full bg-[#0A0A0A] border border-[#333] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#F5C518]/50 text-sm transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1.5 uppercase tracking-wider">Ảnh Bìa *</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <div onClick={() => coverInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-[#333] hover:border-[#F5C518]/50 rounded-xl p-6 text-center transition-colors group">
                      <Upload size={24} className="mx-auto text-gray-600 group-hover:text-[#F5C518] transition-colors mb-2" />
                      <p className="text-gray-500 text-sm group-hover:text-gray-400 transition-colors">Click để chọn ảnh bìa</p>
                      <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP</p>
                    </div>
                    <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverFile} className="hidden" />
                  </div>
                  {comicCoverPreview && (
                    <div className="w-28 aspect-[2/3] rounded-lg overflow-hidden border border-[#333] shrink-0">
                      <img src={comicCoverPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={savingComic}
                  className="px-6 py-2.5 bg-[#E50914] hover:bg-[#B20710] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors uppercase tracking-wider">
                  {savingComic ? <Loader2 size={14} className="animate-spin" /> : 'LƯU TRUYỆN'}
                </button>
                <button type="button" onClick={resetComicForm}
                  className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#222] text-gray-400 text-sm rounded-xl transition-colors border border-[#333]">Hủy</button>
              </div>
            </form>
          </div>
        )}

        {/* Comics list */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 size={32} className="text-[#F5C518] animate-spin" /></div>
        ) : comics.length === 0 ? (
          <div className="text-center py-24 text-gray-600">Chưa có truyện nào. Thêm truyện đầu tiên!</div>
        ) : (
          <div className="space-y-3">
            {comics.map(comic => (
              <div key={comic.id} className="bg-[#1A1A1A] border border-[#222] rounded-xl overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  <div className="w-14 h-[72px] rounded-lg overflow-hidden bg-[#222] shrink-0 border border-[#333]">
                    {comic.cover_url ? (
                      <img src={comic.cover_url} alt={comic.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-gray-700" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold truncate">{comic.title}</h3>
                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-1">{comic.description || 'Không có mô tả'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[#F5C518] text-xs font-bold">{comic.avg_rating > 0 ? `${comic.avg_rating.toFixed(1)}` : '—'}</span>
                      <span className="text-gray-600 text-xs">{comic.rating_count} đánh giá</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleComic(comic.id)}
                      className="p-2 text-gray-500 hover:text-[#F5C518] hover:bg-[#F5C518]/10 rounded-lg transition-colors">
                      {expandedComic === comic.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <button onClick={() => handleDeleteComic(comic.id)}
                      className="p-2 text-gray-500 hover:text-[#E50914] hover:bg-[#E50914]/10 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {expandedComic === comic.id && (
                  <div className="border-t border-[#222] px-4 pb-4">
                    <div className="flex items-center justify-between py-3">
                      <h4 className="text-gray-300 text-sm font-semibold uppercase tracking-wider">Chương</h4>
                      <button onClick={() => setAddingChapterFor(addingChapterFor === comic.id ? null : comic.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F5C518]/10 hover:bg-[#F5C518]/20 text-[#F5C518] border border-[#F5C518]/20 rounded-lg transition-colors font-bold uppercase tracking-wider">
                        <Plus size={13} /> Thêm Chương
                      </button>
                    </div>

                    {addingChapterFor === comic.id && (
                      <form onSubmit={handleAddChapter} className="mb-4 p-4 bg-[#0A0A0A] rounded-xl border border-[#333] space-y-3">
                        <div className="flex gap-3">
                          <div className="w-32">
                            <label className="block text-gray-500 text-xs mb-1">Số chương *</label>
                            <input type="number" placeholder="1" value={chapterNum} onChange={e => setChapterNum(e.target.value)} required min="1"
                              className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#F5C518]/50 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-gray-500 text-xs mb-1">Tiêu đề (tuỳ chọn)</label>
                            <input type="text" placeholder="Tên chương" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)}
                              className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg px-3 py-2 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#F5C518]/50 transition-colors" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" disabled={savingChapter}
                            className="px-4 py-1.5 bg-[#F5C518] hover:bg-[#C9A00C] disabled:opacity-50 text-black text-xs font-bold rounded-lg transition-colors">
                            {savingChapter ? <Loader2 size={12} className="animate-spin" /> : 'Lưu'}
                          </button>
                          <button type="button" onClick={() => setAddingChapterFor(null)}
                            className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-[#222] text-gray-500 text-xs rounded-lg transition-colors border border-[#333]">Hủy</button>
                        </div>
                      </form>
                    )}

                    {(chapters[comic.id] ?? []).length === 0 ? (
                      <p className="text-gray-700 text-sm py-3">Chưa có chương nào.</p>
                    ) : (
                      <div className="space-y-2">
                        {(chapters[comic.id] ?? []).map(ch => (
                          <div key={ch.id} className="bg-[#0A0A0A] rounded-lg overflow-hidden border border-[#222]">
                            <div className="flex items-center justify-between px-4 py-3">
                              <div>
                                <span className="text-white text-sm font-medium">Chương {ch.chapter_number}{ch.title ? `: ${ch.title}` : ''}</span>
                                <span className="text-gray-600 text-xs ml-2">{ch.view_count} lượt xem</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => { setAddingPagesFor(addingPagesFor === ch.id ? null : ch.id); setPageFiles([]); setPagePreviews([]); }}
                                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-[#E50914]/10 hover:bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/20 rounded-lg transition-colors font-bold uppercase tracking-wider">
                                  <Upload size={12} /> Tải Trang
                                </button>
                                <button onClick={() => handleDeleteChapter(ch.id, comic.id)}
                                  className="p-1.5 text-gray-600 hover:text-[#E50914] hover:bg-[#E50914]/10 rounded-lg transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {addingPagesFor === ch.id && (
                              <form onSubmit={handleUploadPages} className="p-4 border-t border-[#222] space-y-4">
                                <div onClick={() => fileInputRef.current?.click()}
                                  className="cursor-pointer border-2 border-dashed border-[#333] hover:border-[#E50914]/50 rounded-xl p-6 text-center transition-colors group">
                                  <Upload size={28} className="mx-auto text-gray-600 group-hover:text-[#E50914] transition-colors mb-2" />
                                  <p className="text-gray-500 text-sm group-hover:text-gray-400">Click hoặc kéo thả để chọn ảnh trang truyện</p>
                                  <p className="text-gray-600 text-xs mt-1">Chọn nhiều ảnh cùng lúc - Sắp xếp theo tên file</p>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePageFiles} className="hidden" />

                                {pagePreviews.length > 0 && (
                                  <div>
                                    <p className="text-gray-400 text-xs mb-2 uppercase tracking-wider">{pageFiles.length} trang đã chọn (kéo để sắp xếp)</p>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                      {pagePreviews.map((preview, i) => (
                                        <div key={i} className="relative group aspect-[2/3] rounded-lg overflow-hidden border border-[#333]">
                                          <img src={preview} alt={`Trang ${i + 1}`} className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                            {i > 0 && (
                                              <button type="button" onClick={() => movePageFile(i, i - 1)}
                                                className="p-1 bg-black/50 text-white rounded text-xs hover:bg-[#F5C518] transition-colors">
                                                <GripVertical size={10} />
                                              </button>
                                            )}
                                            <button type="button" onClick={() => removePageFile(i)}
                                              className="p-1 bg-black/50 text-[#E50914] rounded text-xs hover:bg-[#E50914] hover:text-white transition-colors">
                                              <X size={10} />
                                            </button>
                                          </div>
                                          <div className="absolute bottom-1 left-1 bg-black/70 text-[#F5C518] text-[9px] font-bold px-1 rounded">
                                            {i + 1}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {savingPages && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="text-gray-400">Đang tải lên...</span>
                                      <span className="text-[#F5C518] font-bold">{uploadProgress}%</span>
                                    </div>
                                    <div className="w-full bg-[#222] rounded-full h-2 overflow-hidden">
                                      <div className="bg-[#F5C518] h-full rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  <button type="submit" disabled={savingPages || pageFiles.length === 0}
                                    className="px-5 py-2 bg-[#E50914] hover:bg-[#B20710] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-wider">
                                    {savingPages ? 'ĐANG TẢI LÊN...' : `TẢI ${pageFiles.length} TRANG LÊN`}
                                  </button>
                                  <button type="button" onClick={() => { setAddingPagesFor(null); setPageFiles([]); setPagePreviews([]); }}
                                    className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#222] text-gray-500 text-xs rounded-lg transition-colors border border-[#333]">Hủy</button>
                                </div>
                              </form>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
