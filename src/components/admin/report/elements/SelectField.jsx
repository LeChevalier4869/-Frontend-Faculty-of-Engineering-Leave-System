/* eslint-disable react/prop-types */

import { ChevronDown } from "lucide-react";

export default function SelectField({
  value,
  onChange,
  options,
  optionValues,
}) {
  const values = optionValues || options;

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400"
      >
        {options.map((label, i) => (
          <option key={label} value={values[i]}>
            {label}
          </option>
        ))}
      </select>

      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  );
}