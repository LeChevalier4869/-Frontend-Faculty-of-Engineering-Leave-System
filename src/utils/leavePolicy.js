export function normalizeSex(sex) {
  const s = String(sex || "").trim();
  if (!s) return "";
  if (s === "ชาย" || s.toUpperCase() === "MALE") return "MALE";
  if (s === "หญิง" || s.toUpperCase() === "FEMALE") return "FEMALE";
  return s.toUpperCase();
}

export function isFemaleOnlyLeaveTypeName(name) {
  const n = String(name || "").trim();
  if (!n) return false;

  // Explicit female-only marker in Thai
  if (n.includes("(สตรี") || n.includes("สตรี")) return true;

  // Maternity leave (but not the special case: husband helping wife during childbirth)
  if (n.includes("คลอด")) {
    if (n.includes("ช่วยเหลือภริยา")) return false;
    return true;
  }

  return false;
}

export function filterLeaveTypesBySex(leaveTypes, sex) {
  const normalized = normalizeSex(sex);
  const list = Array.isArray(leaveTypes) ? leaveTypes : [];
  if (!normalized) return list;

  if (normalized === "MALE") {
    return list.filter((t) => !isFemaleOnlyLeaveTypeName(t?.name));
  }

  return list;
}

export function filterLeaveBalancesBySex(balances, sex) {
  const normalized = normalizeSex(sex);
  const list = Array.isArray(balances) ? balances : [];
  if (!normalized) return list;

  if (normalized === "MALE") {
    return list.filter((b) => !isFemaleOnlyLeaveTypeName(b?.leaveType?.name));
  }

  return list;
}

export function filterLeaveTypesMapBySex(leaveTypesMap, sex) {
  const normalized = normalizeSex(sex);
  const map = leaveTypesMap && typeof leaveTypesMap === "object" ? leaveTypesMap : {};
  if (!normalized) return map;

  if (normalized === "MALE") {
    const next = {};
    Object.entries(map).forEach(([id, name]) => {
      if (!isFemaleOnlyLeaveTypeName(name)) next[id] = name;
    });
    return next;
  }

  return map;
}

export function filterLeaveBalancesLatestYear(balances) {
  const list = Array.isArray(balances) ? balances : [];
  if (!list.length) return list;

  const byType = new Map();
  list.forEach((b) => {
    const typeId = b?.leaveTypeId;
    if (typeId == null) return;

    const current = byType.get(typeId);
    if (!current) {
      byType.set(typeId, b);
      return;
    }

    const y1 = Number(current?.year);
    const y2 = Number(b?.year);
    const id1 = Number(current?.id);
    const id2 = Number(b?.id);

    if (Number.isFinite(y2) && (!Number.isFinite(y1) || y2 > y1)) {
      byType.set(typeId, b);
      return;
    }

    if (Number.isFinite(y1) && Number.isFinite(y2) && y2 === y1) {
      if (Number.isFinite(id2) && (!Number.isFinite(id1) || id2 > id1)) {
        byType.set(typeId, b);
      }
    }
  });

  return Array.from(byType.values());
}

/**
 * Format remainingDays for UI display.
 * If negative, shows as "ลาเกิน X วัน".
 * Returns { text, className }.
 */
export function formatRemainingDays(remainingDays) {
  const num = Number(remainingDays) || 0;
  if (num < 0) {
    return {
      text: `ลาเกิน ${Math.abs(num)} วัน`,
      className: "text-rose-600",
    };
  }
  return {
    text: String(num),
    className: "text-emerald-600",
  };
}
