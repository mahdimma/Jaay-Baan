import React from "react";
import { cn } from "../../lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, ...props }, ref) => {
    const [direction, setDirection] = React.useState<"rtl" | "ltr">("rtl");

    const handleDirection = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value.trim() === "") {
        // When empty, keep RTL for Persian context
        setDirection("rtl");
      } else {
        // Check if the text contains English characters
        const hasEnglish = /[A-Za-z]/.test(value);
        // Check if the text contains Persian/Arabic characters
        const hasPersian = /[\u0600-\u06FF\u200C-\u200D\u2066-\u2069]/.test(
          value
        );

        // If it has English characters and no Persian characters, use LTR
        // Otherwise, use RTL (prioritizes Persian/Arabic)
        if (hasEnglish && !hasPersian) {
          setDirection("ltr");
        } else {
          setDirection("rtl");
        }
      }

      // Call the original onChange if it exists
      props.onChange?.(e);
    };

    // Set initial direction to RTL for Persian context
    React.useEffect(() => {
      setDirection("rtl");
    }, []);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          dir={direction}
          className={cn(
            "w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
            error
              ? "border-red-300 dark:border-red-600 text-red-900 dark:text-red-100 placeholder-red-300 dark:placeholder-red-400 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 dark:border-gray-600",
            className
          )}
          ref={ref}
          {...props}
          onChange={handleDirection}
        />
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

Input.displayName = "Input";

export default Input;
