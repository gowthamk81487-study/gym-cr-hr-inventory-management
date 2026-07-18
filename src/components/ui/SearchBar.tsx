'use client';

import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils';
import Input from './Input';
import Button from './Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search records...',
  className
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    if (onClear) onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        leftIcon={<Search className="h-4 w-4 text-slate-500" />}
        rightIcon={
          value ? (
            <button
              onClick={handleClear}
              className="p-1 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : undefined
        }
      />
    </div>
  );
};

export default SearchBar;
