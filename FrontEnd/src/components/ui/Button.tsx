import React from "react";
import { cn } from "../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  text?: string;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      text,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-700 dark:active:bg-blue-800",
      secondary:
        "bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 border border-blue-200 shadow-sm hover:shadow-md dark:bg-blue-800/40 dark:text-blue-200 dark:border-blue-600/50 dark:hover:bg-blue-700/60 dark:active:bg-blue-600/70",
      outline:
        "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 shadow-sm hover:shadow-md dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:border-slate-500 dark:active:bg-slate-600",
      ghost:
        "text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 dark:active:bg-slate-600",
      danger:
        "bg-red-600 text-red-50 hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md dark:bg-red-700 dark:hover:bg-red-800 dark:active:bg-red-900",
    };

    const sizes = {
      sm: "px-3 py-2 text-sm gap-2 min-h-[36px]",
      md: "px-5 py-2.5 text-sm gap-2 min-h-[40px]",
      lg: "px-6 py-3 text-base gap-2.5 min-h-[44px]",
    };

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          "relative overflow-hidden m-0.5",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        <span className="flex items-center">
          {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
          <span className={loading ? "opacity-70" : ""}>
            {text || children}
          </span>
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
