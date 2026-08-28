import { useState, useMemo, useCallback } from 'react';
import { useInterval } from '@core/hooks/useInterval';
import useActivities from '../../hooks/useActivities';
import { DIST_UNIT, M_TO_DIST } from '../../utils/utils';

function formatNumberWithCommas(val: string): string {
  const parts = val.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

export default function TopProjectedStat() {
  const { activities } = useActivities();
  const currentYear = new Date().getFullYear();
  const currentYearStr = currentYear.toString();

  const currentYearDistance = useMemo(() => {
    return (
      activities
        .filter(
          (a) =>
            a.start_date_local &&
            a.start_date_local.slice(0, 4) === currentYearStr
        )
        .reduce((sum, a) => sum + (a.distance || 0), 0) / M_TO_DIST
    );
  }, [activities, currentYearStr]);

  const getProjected = useCallback(() => {
    const startOfYear = new Date(currentYear, 0, 1, 0, 0, 0, 0).getTime();
    const endOfYear = new Date(currentYear + 1, 0, 1, 0, 0, 0, 0).getTime();
    const now = Date.now();
    const totalMs = endOfYear - startOfYear;
    const elapsedMs = Math.max(0, now - startOfYear);
    const progress = totalMs > 0 ? elapsedMs / totalMs : 0;

    if (progress <= 0 || currentYearDistance <= 0) {
      return currentYearDistance.toFixed(5);
    }
    const projected = currentYearDistance / progress;
    return projected.toFixed(5);
  }, [currentYear, currentYearDistance]);

  const [projectedValue, setProjectedValue] = useState<string>(getProjected);

  useInterval(() => {
    setProjectedValue(getProjected());
  }, 100);

  const formatted = formatNumberWithCommas(projectedValue);

  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--color-hr)] bg-white/40 px-4 shadow-sm backdrop-blur-md transition-all duration-300 select-none hover:border-[var(--color-tx)]/40 hover:shadow-md dark:bg-black/25">
      {/* 1. 数字 */}
      <span className="font-mono text-base font-extrabold tracking-tight tabular-nums sm:text-lg">
        {formatted}
      </span>
      {/* 2. KM */}
      <span className="text-xs font-bold uppercase opacity-85">
        {DIST_UNIT}
      </span>
      {/* 3. PROJECTED */}
      <span className="text-xs font-semibold tracking-wider uppercase opacity-75">
        Projected
      </span>
      {/* 4. 绿点 */}
      <span className="relative ml-0.5 flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
      </span>
    </div>
  );
}
