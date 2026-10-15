import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gold text-emerald-900 hover:bg-gold/90 border border-gold',
  outline:
    'bg-transparent text-gold border border-gold/70 hover:bg-gold hover:text-emerald-900',
  ghost:
    'bg-transparent text-gold hover:text-ivory border border-transparent',
  danger:
    'bg-transparent text-danger border border-danger/70 hover:bg-danger hover:text-ivory',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-5 py-2 text-[11px]',
  md: 'px-8 py-3.5 text-[12px]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          font-sans font-medium uppercase tracking-label
          transition-colors duration-300
          disabled:opacity-50 disabled:pointer-events-none
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, type ButtonProps };
