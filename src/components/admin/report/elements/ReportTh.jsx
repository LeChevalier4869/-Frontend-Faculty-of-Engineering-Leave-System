/* eslint-disable react/prop-types */

export default function ReportTh({
  children,
  className = "",
  style = {},
  rowSpan,
  colSpan,
}) {
  return (
    <th
      className={`border border-slate-100 px-2 py-2 font-semibold whitespace-nowrap ${className}`}
      style={style}
      rowSpan={rowSpan}
      colSpan={colSpan}
    >
      {children}
    </th>
  );
}