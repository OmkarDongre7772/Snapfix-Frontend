import { forwardRef } from "react";

const VARIANTS = {
  primary:   "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] shadow-sm",
  secondary: "border border-border bg-surface text-text hover:bg-gray-50 active:scale-[0.98]",
  ghost:     "text-text-muted hover:text-text hover:bg-gray-50 active:scale-[0.98]",
  danger:    "bg-danger text-white hover:bg-red-700 active:scale-[0.98] shadow-sm",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Button
 * @param {string}   variant  — "primary" | "secondary" | "ghost" | "danger"
 * @param {string}   size     — "sm" | "md" | "lg"
 * @param {boolean}  loading  — shows spinner, disables click
 * @param {boolean}  fullWidth
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    disabled,
    className = "",
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2 font-medium rounded transition-all duration-150",
        "focus-ring",
        VARIANTS[variant] ?? VARIANTS.primary,
        SIZES[size] ?? SIZES.md,
        fullWidth && "w-full",
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading && (
        <svg
          className="w-4 h-4 animate-spin flex-shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
});

export default Button;
