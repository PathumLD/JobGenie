import * as React from "react";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    id,
    name,
    ...props 
  }, ref) => {
    // Use name prop or generate a stable ID based on name
    const inputId = id || (name ? `input-${name.replace(/[^a-zA-Z0-9]/g, '-')}` : `input-${React.useId()}`);
    
    const baseInputClasses = "w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200";
    
    const variantClasses = {
      default: "border-gray-300 bg-white hover:border-gray-400 focus:bg-white",
      filled: "border-gray-300 bg-gray-50 hover:bg-gray-100 focus:bg-white",
      outlined: "border-gray-300 bg-transparent hover:border-gray-400 focus:bg-white"
    };

    const inputClasses = cn(
      baseInputClasses,
      variantClasses[variant],
      error && "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500",
      leftIcon && "pl-10",
      rightIcon && "pr-10",
      className
    );

    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            name={name}
            className={inputClasses}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
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

FormInput.displayName = "FormInput";

export { FormInput };
