const CATEGORIES = {
  POTHOLE:     { label: "Pothole",       icon: "🕳️" },
  STREETLIGHT: { label: "Streetlight",   icon: "💡" },
  GARBAGE:     { label: "Garbage",       icon: "🗑️" },
  WATER_LEAK:  { label: "Water Leak",    icon: "💧" },
  ROAD_DAMAGE: { label: "Road Damage",   icon: "🛣️" },
};

/**
 * CategoryBadge — icon + label pill for a report category.
 * @param {string} category  — raw backend enum value
 * @param {string} size      "sm" | "md"
 */
export default function CategoryBadge({ category, size = "md" }) {
  const { label, icon } = CATEGORIES[category] ?? { label: category ?? "Unknown", icon: "📌" };
  const sizeClass = size === "sm"
    ? "px-2 py-0.5 text-xs gap-1"
    : "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span className={`inline-flex items-center rounded-full font-medium bg-[var(--color-muted-bg)] text-text-muted ${sizeClass}`}>
      <span aria-hidden="true">{icon}</span>
      {label}
    </span>
  );
}

// Export the raw map for use in forms
export { CATEGORIES };
