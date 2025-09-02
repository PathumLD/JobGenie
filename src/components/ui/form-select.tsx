import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    options,
    placeholder,
    variant = 'default',
    id,
    name,
    ...props 
  }, ref) => {
    // Use name prop or generate a stable ID based on name
    const generatedId = React.useId();
    const selectId = id || (name ? `select-${name.replace(/[^a-zA-Z0-9]/g, '-')}` : `select-${generatedId}`);
    
    const baseSelectClasses = "w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 appearance-none";
    
    const variantClasses = {
      default: "border-gray-300 bg-white hover:border-gray-400 focus:bg-white",
      filled: "border-gray-300 bg-gray-50 hover:bg-gray-100 focus:bg-white",
      outlined: "border-gray-300 bg-transparent hover:border-gray-400 focus:bg-white"
    };

    const selectClasses = cn(
      baseSelectClasses,
      variantClasses[variant],
      error && "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500",
      leftIcon && "pl-10",
      className
    );

    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <select
            id={selectId}
            ref={ref}
            className={selectClasses}
            defaultValue={props.defaultValue}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Custom dropdown arrow */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </div>
        
        {error && (
          <p className="text-red-500 text-xs flex items-center space-x-1">
            <span>⚠</span>
            <span>{error}</span>
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-gray-500 text-xs">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";

export { FormSelect };
