export function daysInMonth(monthIndex, buddhistYear) {
  return new Date(
    buddhistYear - 543,
    monthIndex + 1,
    0
  ).getDate();
}

export function weekdayOf(monthIndex, buddhistYear, day) {
  return new Date(
    buddhistYear - 543,
    monthIndex,
    day
  ).getDay();
}

export function symbolFor(empIndex, day) {
  const seed = (empIndex * 7 + day * 3) % 23;

  if (seed === 0) return "ป";
  if (seed === 3) return "ก";
  if (seed === 11) return "ล";
  if (seed === 19) return "ข";

  return "✓";
}