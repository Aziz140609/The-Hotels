import { forwardRef, type LabelHTMLAttributes } from 'react';

const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className = '', ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`
        block font-sans text-[11px] font-medium uppercase tracking-label text-gold
        ${className}
      `}
      {...props}
    />
  );
});

Label.displayName = 'Label';

export { Label };
