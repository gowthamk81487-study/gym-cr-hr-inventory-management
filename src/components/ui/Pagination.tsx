import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  totalRecords?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  totalRecords,
  itemsPerPage
}) => {
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-slate-400', className)}>
      {totalRecords !== undefined && itemsPerPage !== undefined && (
        <div>
          Showing <span className="font-semibold text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
          <span className="font-semibold text-slate-300">
            {Math.min(currentPage * itemsPerPage, totalRecords)}
          </span>{' '}
          of <span className="font-semibold text-slate-300">{totalRecords}</span> records
        </div>
      )}
      
      <div className="flex items-center gap-1.5 ml-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2!"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPages().map(page => (
          <Button
            key={page}
            variant={currentPage === page ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className="w-8 h-8 p-0!"
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2!"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
