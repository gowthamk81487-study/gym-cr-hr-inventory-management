'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, Plus, Filter } from 'lucide-react';
import { cn } from '@/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';

export interface Column<T> {
  header: string;
  accessor?: string;
  sortable?: boolean;
  renderCell?: (item: T) => React.ReactNode;
}

export interface FilterOption {
  label: string;
  field: string;
  value: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
  filterOptions?: FilterOption[];
  onAddClick?: () => void;
  addLabel?: string;
  itemsPerPage?: number;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  searchPlaceholder = 'Search...',
  searchFields = [],
  filterOptions = [],
  onAddClick,
  addLabel = 'Add New',
  itemsPerPage = 5
}: TableProps<T>) {
  // Local Table States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page on search or filter change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // 1. Filter Data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Status Filter
    if (selectedFilter !== 'all') {
      const option = filterOptions.find(o => `${o.field}:${o.value}` === selectedFilter);
      if (option) {
        result = result.filter(item => {
          const itemVal = item[option.field];
          return String(itemVal).toLowerCase() === option.value.toLowerCase();
        });
      }
    }

    // Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        // If specific search fields are specified
        if (searchFields.length > 0) {
          return searchFields.some(field => {
            const val = item[field];
            return val && String(val).toLowerCase().includes(query);
          });
        }
        // Fallback: search all primitive fields
        return Object.values(item).some(val => {
          if (typeof val === 'string' || typeof val === 'number') {
            return String(val).toLowerCase().includes(query);
          }
          return false;
        });
      });
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, searchFields, selectedFilter, filterOptions, sortField, sortDirection]);

  // 2. Pagination Math
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 sm:max-w-md items-center gap-3">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4 text-slate-500" />}
            className="w-full"
          />

          {filterOptions.length > 0 && (
            <div className="relative shrink-0">
              <select
                value={selectedFilter}
                onChange={handleFilterChange}
                className="pl-9 pr-8 py-2.5 bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-lg hover:border-slate-700 cursor-pointer appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <option value="all">All Statuses</option>
                {filterOptions.map(option => (
                  <option key={`${option.field}:${option.value}`} value={`${option.field}:${option.value}`}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
            </div>
          )}
        </div>

        {onAddClick && (
          <Button onClick={onAddClick} className="flex items-center gap-2 self-end sm:self-auto text-xs py-2!">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-900/10 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-900/30 text-slate-400 font-semibold text-xs tracking-wider uppercase">
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  onClick={() => column.sortable && column.accessor && handleSort(column.accessor)}
                  className={cn(
                    'p-4 select-none',
                    column.sortable && 'cursor-pointer hover:text-slate-200'
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {column.header}
                    {column.sortable && column.accessor && (
                      <span className="text-slate-500">
                        {sortField === column.accessor ? (
                          sortDirection === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoading ? (
              // Loading skeletons rows
              Array.from({ length: itemsPerPage }).map((_, rIdx) => (
                <tr key={rIdx} className="bg-slate-950/20">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="p-4">
                      <Skeleton className="h-4 w-28" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2 py-6">
                    <p className="text-sm font-medium">No records found</p>
                    <p className="text-xs text-slate-600">Try adjusting your search query or filter options.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Real Rows
              paginatedData.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-900/35 transition-colors text-slate-300 text-sm">
                  {columns.map((column, colIdx) => (
                    <td key={colIdx} className="p-4 align-middle">
                      {column.renderCell
                        ? column.renderCell(item)
                        : column.accessor
                        ? String(item[column.accessor] ?? '-')
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && filteredData.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between text-xs text-slate-400 px-1">
          <div>
            Showing <span className="font-semibold text-slate-300">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-300">
              {Math.min(currentPage * itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-300">{filteredData.length}</span> records
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="py-1 px-2.5!"
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-8 h-8 p-0!"
                >
                  {pageNum}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="py-1 px-2.5!"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
export default Table;
