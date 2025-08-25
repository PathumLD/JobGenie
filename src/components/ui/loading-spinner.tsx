import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'white' | 'emerald' | 'blue' | 'gray';
  className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ size = 'md', color = 'default', className }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12'
    };

    const colorClasses = {
      default: 'text-emerald-600',
      white: 'text-white',
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      gray: 'text-gray-600'
    };

    const spinnerClasses = cn(
      'animate-spin rounded-full border-2 border-current border-t-transparent',
      sizeClasses[size],
      colorClasses[color],
      className
    );

    return (
      <div ref={ref} className={spinnerClasses} role="status" aria-label="Loading">
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
