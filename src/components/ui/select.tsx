import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = '', children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={`w-full appearance-none bg-transparent border-b px-0 py-2 pr-7 font-sans text-[15px] font-light text-ivory focus:outline-none transition-colors ${error ? 'border-danger' : 'border-gold/50 focus:border-gold'} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gold"
        strokeWidth={1.25}
      />
    </div>
  )
);

Select.displayName = 'Select';

export { Select, type SelectProps };
