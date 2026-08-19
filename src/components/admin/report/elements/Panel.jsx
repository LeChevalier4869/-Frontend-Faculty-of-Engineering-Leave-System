/* eslint-disable react/prop-types */

export default function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-900">
            {title}
          </h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {action}
      </header>

      <div className="px-5 py-4">{children}</div>
    </section>
  );
}