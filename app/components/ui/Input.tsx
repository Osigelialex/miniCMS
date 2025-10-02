import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export function Input({ label, error, helperText, required, className = "", ...props }: InputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={props.id} className="block text-sm font-medium text-neutral-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className={`w-full px-4 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow placeholder:text-neutral-400 ${className}`}
        required={required}
        {...props}
      />
      {helperText && <p className="text-xs text-neutral-500 mt-1">{helperText}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
