/**
 * EmptyState — shown when a list has no items.
 * @param {string}    icon     emoji or text icon
 * @param {string}    title
 * @param {string}    description
 * @param {ReactNode} action   optional CTA (Button, Link, etc.)
 */
export default function EmptyState({ icon = "📭", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="text-4xl mb-4 select-none">{icon}</div>
      {title && <h3 className="text-base font-semibold text-text mb-1">{title}</h3>}
      {description && <p className="text-sm text-text-muted max-w-xs">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
