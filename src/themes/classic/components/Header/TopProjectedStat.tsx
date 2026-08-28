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
    <div className="inline-flex w-fit flex-col gap-1.5 rounded-2xl border border-[var(--color-hr)] bg-white/40 px-5 py-3.5 shadow-sm backdrop-blur-md transition-all duration-300 select-none hover:border-[var(--color-tx)]/40 hover:shadow-md dark:bg-black/25">
      {/* Row 1: Left label "Projected", Right pulsing live green dot */}
      <div className="flex items-center justify-between gap-4">
        <span className="text-xs font-semibold tracking-wider uppercase opacity-75">
          Projected
        </span>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
        </span>
      </div>

      {/* Row 2: Left numerical value, Right KM unit */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-2xl leading-none font-extrabold tracking-tight tabular-nums sm:text-3xl lg:text-4xl">
          {formatted}
        </span>
        <span className="text-xs font-bold uppercase opacity-80 sm:text-sm">
          {DIST_UNIT}
        </span>
      </div>
    </div>
  );
}
