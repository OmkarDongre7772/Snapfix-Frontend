// Maps backend status strings to visual variants
const STATUS_MAP = {
  // Report statuses
  CREATED:             { label: "Created",            color: "bg-gray-100 text-gray-600" },
  IN_PROGRESS:         { label: "In Progress",        color: "bg-warning-light text-warning" },
  COMPLETED:           { label: "Completed",          color: "bg-success-light text-success" },

  // Task statuses
  ASSIGNED:            { label: "Assigned",           color: "bg-blue-50 text-blue-600" },
  PROOF_SUBMITTED:     { label: "Proof Submitted",    color: "bg-purple-50 text-purple-600" },
  VERIFIED_BY_CITIZEN: { label: "Verified",           color: "bg-success-light text-success" },
  REJECTED:            { label: "Rejected",           color: "bg-danger-light text-danger" },
  PAYMENT_RELEASED:    { label: "Paid",               color: "bg-success-light text-success font-semibold" },

  // Bid statuses
  ACTIVE:              { label: "Active",             color: "bg-blue-50 text-blue-600" },
  APPROVED:            { label: "Approved",           color: "bg-success-light text-success" },
  WITHDRAWN:           { label: "Withdrawn",          color: "bg-gray-100 text-gray-500" },
};

/**
 * StatusBadge — color-coded pill for any backend status string.
 *
 * @param {string} status — raw backend status value (e.g. "IN_PROGRESS")
 * @param {string} className
 */
export default function StatusBadge({ status, className = "" }) {
  const { label, color } = STATUS_MAP[status] ?? {
    label: status ?? "Unknown",
    color: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        color,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
