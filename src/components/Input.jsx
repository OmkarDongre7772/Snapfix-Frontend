import { forwardRef, useId } from "react";

/**
 * Input — labeled form field with error state.
 *
 * @param {string}  label    — visible label above the field
 * @param {string}  error    — error message shown below; also applies error styling
 * @param {string}  hint     — small helper text below (hidden when error is present)
 * @param {string}  type     — HTML input type, defaults to "text"
 */
const Input = forwardRef(function Input(
  { label, error, hint, id: idProp, className = "", ...props },
  ref
) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        className={[
          "w-full rounded border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-subtle",
          "transition-colors duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          error
            ? "border-danger focus-visible:ring-danger"
            : "border-border hover:border-gray-400 focus-visible:border-ring",
        ].join(" ")}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        {...props}
      />

      {error && (
        <p id={`${id}-error`} className="text-xs text-danger font-medium" role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-text-muted">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
