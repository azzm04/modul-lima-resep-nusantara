// src/components/Pagination.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
/* eslint-disable react/prop-types */

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  totalItems 
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center space-y-4 mt-8">
      <div className="text-sm text-gray-600">
        Menampilkan <span className="font-semibold text-gray-800">{startItem}</span> - 
        <span className="font-semibold text-gray-800"> {endItem}</span> dari 
        <span className="font-semibold text-gray-800"> {totalItems}</span> resep
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border transition-all ${
            currentPage === 1
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500'
          }`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 rounded-lg border transition-all ${
                  currentPage === page
                    ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                    : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg border transition-all ${
            currentPage === totalPages
              ? 'border-gray-200 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-500'
          }`}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}