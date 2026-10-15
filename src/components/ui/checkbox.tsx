import { forwardRef, type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, className = '', ...props }, ref) => (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm font-light text-muted-ivory">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        className={`mt-0.5 h-4 w-4 appearance-none border border-gold/70 bg-transparent checked:bg-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${className}`}
        {...props}
      />
      <span>{label}</span>
    </label>
  )
);

Checkbox.displayName = 'Checkbox';

export { Checkbox, type CheckboxProps };
