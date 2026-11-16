import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = '', type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={`
          w-full bg-transparent border-b px-0 py-2
          font-sans text-[15px] font-light text-ivory placeholder:text-muted-ivory/50
          focus:outline-none transition-colors duration-200
          ${error ? 'border-danger' : 'border-gold/50 focus:border-gold'}
          ${type === 'date' ? 'date-input-clean' : ''}
          ${className}
        `}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, type InputProps };
