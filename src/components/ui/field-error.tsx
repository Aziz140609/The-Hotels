interface FieldErrorProps {
  message?: string;
}

export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 font-sans text-[12px] text-danger font-light">
      {message}
    </p>
  );
}
