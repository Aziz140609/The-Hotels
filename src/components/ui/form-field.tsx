import type { ReactNode } from 'react';
import { Label } from './label';
import { FieldError } from './field-error';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  error,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="mb-1.5">
        {label}
      </Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}
