'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, X, Search, Plus } from 'lucide-react';
import { toBengaliNumber } from '../utils/formatters';

export interface ComboboxOption {
  id?: string;
  name: string;
  subtext?: string;
  count?: number;
}

interface SearchableComboboxProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  emptyText?: string;
  onAddNewClick?: () => void;
  addNewButtonLabel?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  label,
  required = false,
  value,
  onChange,
  options,
  placeholder = 'নির্বাচন করুন বা লিখুন...',
  emptyText = 'কোনো তথ্য পাওয়া যায়নি',
  onAddNewClick,
  addNewButtonLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search box when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) =>
      opt.name.toLowerCase().includes(q) ||
      (opt.subtext && opt.subtext.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const hasExactMatch = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return options.some((opt) => opt.name.trim().toLowerCase() === q);
  }, [options, searchQuery]);

  const handleSelectOption = (optName: string) => {
    onChange(optName);
    setIsOpen(false);
  };

  const handleUseCustomText = () => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      onChange(trimmed);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Label and optional Add-New button */}
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-bold text-zinc-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {onAddNewClick && (
          <button
            type="button"
            onClick={onAddNewClick}
            className="text-[11px] text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>{addNewButtonLabel || 'নতুন যোগ করুন'}</span>
          </button>
        )}
      </div>

      {/* Main trigger button/display */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full px-3.5 py-2 rounded-xl border text-xs sm:text-sm bg-zinc-50 hover:bg-white focus-within:bg-white flex items-center justify-between gap-2 cursor-pointer transition-all ${
          isOpen
            ? 'border-amber-500 ring-2 ring-amber-500/20 bg-white'
            : 'border-zinc-300'
        }`}
      >
        <span className={`truncate flex-1 ${value ? 'text-zinc-900 font-medium' : 'text-zinc-400'}`}>
          {value || placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-zinc-400">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setIsOpen(true);
              }}
              title="মুছে ফেলুন"
              className="p-0.5 rounded-md hover:bg-zinc-200 hover:text-zinc-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-600' : 'text-zinc-400'
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
          {/* Quick search input */}
          <div className="p-2 border-b border-zinc-100 bg-zinc-50/80">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredOptions.length > 0) {
                      handleSelectOption(filteredOptions[0].name);
                    } else if (searchQuery.trim()) {
                      handleUseCustomText();
                    }
                  } else if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
                placeholder="খুঁজুন বা নতুন নাম টাইপ করুন..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white rounded-xl border border-zinc-200 focus:border-amber-500 focus:outline-none text-zinc-900 placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-0.5 rounded-md hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-zinc-50 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value?.trim().toLowerCase() === opt.name.trim().toLowerCase();
                return (
                  <button
                    key={opt.id || opt.name}
                    type="button"
                    onClick={() => handleSelectOption(opt.name)}
                    className={`w-full px-3.5 py-2 text-left flex items-center justify-between gap-2 text-xs sm:text-sm transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80 text-amber-950 font-bold'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{opt.name}</span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      {opt.subtext && (
                        <p className="text-[11px] text-zinc-400 font-normal truncate mt-0.5">
                          {opt.subtext}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.count !== undefined && opt.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-600 text-[10px] font-semibold">
                          {toBengaliNumber(opt.count)} বই
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-4 text-center text-xs text-zinc-400">
                {emptyText}
              </div>
            )}

            {/* Custom value entry option if not exact match */}
            {searchQuery.trim() && !hasExactMatch && (
              <button
                type="button"
                onClick={handleUseCustomText}
                className="w-full px-3.5 py-2.5 text-left text-xs text-amber-800 bg-amber-50/50 hover:bg-amber-100 font-bold flex items-center gap-2 transition-colors cursor-pointer border-t border-amber-100"
              >
                <Plus className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">
                  &ldquo;{searchQuery.trim()}&rdquo; নাম হিসেবে ব্যবহার করুন
                </span>
              </button>
            )}
          </div>

          {/* Footer with shortcut to add full profile */}
          {onAddNewClick && (
            <div className="p-2 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">
                মোট {toBengaliNumber(options.length)} টি বিকল্প
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNewClick();
                }}
                className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>{addNewButtonLabel || 'নতুন প্রোফাইল তৈরি করুন'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
