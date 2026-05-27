import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="p-2 rounded-lg text-gray-500 hover:text-[#F5C518] hover:bg-[#F5C518]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft size={18} />
      </button>
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`d-${i}`} className="px-2 text-gray-600 text-sm">...</span>
        ) : (
          <button key={page} onClick={() => onPageChange(page as number)}
            className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
              currentPage === page
                ? 'bg-[#F5C518] text-black'
                : 'text-gray-500 hover:text-[#F5C518] hover:bg-[#F5C518]/10'
            }`}>
            {page}
          </button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-gray-500 hover:text-[#F5C518] hover:bg-[#F5C518]/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
