const minute = 60_000;
export const deliveryWindowDays = 30;

export function deliveryPromiseMinutes(value: string | undefined) {
  const digits = "০১২৩৪৫৬৭৮৯";
  const normalized = value?.replace(/[০-৯]/g, (digit) => String(digits.indexOf(digit))).trim();
  const match = normalized?.match(/^(?:(\d+(?:\.\d+)?)\s*(?:থেকে|to|[-–—])\s*)?(\d+(?:\.\d+)?)\s*(মিনিট|ঘণ্টা|ঘন্টা|দিন|minutes?|mins?|hours?|hrs?|days?)(?:\s*\([^()]*\))?$/i);
  if (!match) return null;
  const upper = Number(match[2]);
  const lower = Number(match[1] ?? match[2]);
  const unit = match[3].toLowerCase();
  const multiplier = /^(দিন|day)/.test(unit) ? 1440 : /^(ঘণ্টা|ঘন্টা|h)/.test(unit) ? 60 : 1;
  const duration = upper * multiplier;
  return lower >= 0 && upper >= lower && Number.isSafeInteger(duration * minute) ? duration : null;
}

export function pendingDeadline(verifiedAt: Date | undefined, promises: (number | null)[], now: Date) {
  if (!verifiedAt || verifiedAt > now || !promises.length) return null;
  const known = promises.filter((promise): promise is number => promise !== null);
  if (!known.length) return null;
  const deadline = verifiedAt.getTime() + Math.min(...known) * minute;
  if (!Number.isFinite(new Date(deadline).getTime())) return null;
  return {
    deadline,
    overdue: now.getTime() > deadline,
    incomplete: known.length !== promises.length,
  };
}

export function summarizeDeliveryMinutes(durations: number[]) {
  const sorted = [...durations].sort((a, b) => a - b);
  const count = sorted.length;
  if (!count) return { count, medianMinutes: null, p90Minutes: null };
  const median = (sorted[Math.floor((count - 1) / 2)] + sorted[Math.floor(count / 2)]) / 2;
  return { count, medianMinutes: median / minute, p90Minutes: sorted[Math.ceil(count * 0.9) - 1] / minute };
}
