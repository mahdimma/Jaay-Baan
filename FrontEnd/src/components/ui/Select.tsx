import React from "react";
import { cn } from "../../lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, helperText, options, placeholder, ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            error
              ? "border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600",
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="form-error">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
