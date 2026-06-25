/**
 * Card — white surface container with consistent padding, radius, and shadow.
 *
 * @param {string}  className  — extra classes to merge
 * @param {string}  padding    — "sm" | "md" | "lg" — defaults to "md"
 */
export default function Card({ children, className = "", padding = "md", ...props }) {
  const paddings = { sm: "p-4", md: "p-6", lg: "p-8" };

  return (
    <div
      className={[
        "bg-surface rounded-lg border border-border shadow-sm",
        paddings[padding] ?? paddings.md,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
