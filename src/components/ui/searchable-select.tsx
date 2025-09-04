'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SearchableSelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  className?: string;
  error?: string;
  helperText?: string;
}

export function SearchableSelect({
  id,
  label,
  placeholder = 'Search and select...',
  value,
  onChange,
  options,
  className,
  error,
  helperText
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const generatedId = React.useId();
  const selectId = id || `searchable-select-${generatedId}`;

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Get selected option label
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setHighlightedIndex(-1);
    
    // If user is typing and dropdown is closed, open it
    if (!isOpen && newSearchTerm) {
      setIsOpen(true);
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    onChange(optionValue);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleOptionSelect(filteredOptions[highlightedIndex].value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm('');
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div ref={dropdownRef} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            id={selectId}
            type="text"
            value={isOpen ? searchTerm : displayValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-activedescendant={highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined}
            className={cn(
              'w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200',
              'border-gray-300 bg-white hover:border-gray-400 focus:bg-white',
              error && 'border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500'
            )}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={cn(
                'h-5 w-5 text-gray-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {isOpen && (
          <div 
            role="listbox"
            aria-label="Select an option"
            className="absolute z-50 w-full min-w-[400px] mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  id={`${selectId}-option-${index}`}
                  role="option"
                  tabIndex={0}
                  aria-selected={index === highlightedIndex}
                  className={cn(
                    'px-4 py-3 cursor-pointer transition-colors duration-150 text-sm leading-relaxed',
                    index === highlightedIndex
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'hover:bg-gray-50',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !option.disabled && handleOptionSelect(option.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!option.disabled) {
                        handleOptionSelect(option.value);
                      }
                    }
                  }}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-sm text-center">
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs flex items-center space-x-1 mt-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 text-xs mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
