import * as React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    variant = 'default',
    id,
    name,
    ...props 
  }, ref) => {
    // Use name prop or generate a stable ID based on name
    const generatedId = React.useId();
    const textareaId = id || (name ? `textarea-${name.replace(/[^a-zA-Z0-9]/g, '-')}` : `textarea-${generatedId}`);
    
    const baseTextareaClasses = "w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-vertical";
    
    const variantClasses = {
      default: "border-gray-300 bg-white hover:border-gray-400 focus:bg-white",
      filled: "border-gray-300 bg-gray-50 hover:bg-gray-100 focus:bg-white",
      outlined: "border-gray-300 bg-transparent hover:border-gray-400 focus:bg-white"
    };

    const textareaClasses = cn(
      baseTextareaClasses,
      variantClasses[variant],
      error && "border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500",
      className
    );

    return (
      <div className="space-y-1.5">
        {label && (
          <label 
            htmlFor={textareaId} 
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          ref={ref}
          name={name}
          className={textareaClasses}
          {...props}
        />
        
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

Textarea.displayName = "Textarea";

export { Textarea };
