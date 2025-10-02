interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function Textarea({ label, error, helperText, required, className = "", ...props }: TextareaProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={props.id} className="block text-sm font-medium text-neutral-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        className={`w-full px-4 py-3 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow placeholder:text-neutral-400 resize-y ${className}`}
        required={required}
        {...props}
      />
      {helperText && <p className="text-xs text-neutral-500 mt-1">{helperText}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}