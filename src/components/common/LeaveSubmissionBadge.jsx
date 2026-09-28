import PropTypes from "prop-types";

import { isSubmittedByAdmin } from "../../utils/leaveSubmission";

const SIZE = {
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2 py-1 text-xs",
};

export default function LeaveSubmissionBadge({ leave, size = "md", className = "" }) {
  const byAdmin = isSubmittedByAdmin(leave);
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border font-medium ${SIZE[size] || SIZE.md} ${
        byAdmin
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      } ${className}`}
    >
      {byAdmin ? "แอดมินยื่นให้" : "ยื่นเอง"}
    </span>
  );
}

LeaveSubmissionBadge.propTypes = {
  leave: PropTypes.object,
  size: PropTypes.oneOf(["sm", "md"]),
  className: PropTypes.string,
};
