import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full resize-y bg-transparent border-b px-0 py-2 font-sans text-[15px] font-light text-ivory placeholder:text-muted-ivory/50 focus:outline-none transition-colors ${error ? 'border-danger' : 'border-gold/50 focus:border-gold'} ${className}`}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export { Textarea, type TextareaProps };
