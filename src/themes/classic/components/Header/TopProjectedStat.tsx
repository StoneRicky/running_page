import { useState, useMemo, useCallback } from 'react';
import { useInterval } from '@core/hooks/useInterval';
import useActivities from '../../hooks/useActivities';
import { DIST_UNIT, M_TO_DIST, isRunActivity } from '../../utils/utils';
import { PROJECTED_TITLE, PROJECTED_TOOLTIP } from '../../utils/const';
import YearTargetModal from '../YearTargetModal';

export default function TopProjectedStat() {
  const { activities } = useActivities();
  const [currentYear] = useState(() => new Date().getFullYear());
  const currentYearStr = currentYear.toString();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const currentYearDistance = useMemo(() => {
    return (
      activities
        .filter(
          (a) =>
            a.start_date_local &&
            a.start_date_local.slice(0, 4) === currentYearStr &&
            isRunActivity(a)
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

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <div
        className="group inline-flex h-10 cursor-pointer items-center gap-2.5 rounded-full border border-[var(--color-hr)] bg-[var(--color-background)] p-1 pr-4 shadow-sm backdrop-blur-md transition-all duration-300 select-none hover:scale-[1.02] hover:border-[var(--color-tx)]/40 hover:shadow-md active:scale-[0.98]"
        title={PROJECTED_TOOLTIP(currentYear)}
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsModalOpen(true);
          }
        }}
      >
        {/* 1. 左侧分段小标签 */}
        <span className="inline-flex h-full items-center rounded-full bg-[var(--color-tx)]/10 px-3 text-xs font-bold tracking-wide text-[var(--color-tx)] transition-colors group-hover:bg-[var(--color-brand)] group-hover:text-white dark:bg-white/15 dark:text-white">
          {PROJECTED_TITLE}
        </span>
        {/* 2. 跑量数字 */}
        <span className="font-mono text-base font-extrabold tracking-tight tabular-nums sm:text-lg">
          {projectedValue}
        </span>
        {/* 3. 单位 KM */}
        <span className="text-xs font-bold uppercase opacity-85">
          {DIST_UNIT}
        </span>
        {/* 4. 绿点 */}
        <span className="relative ml-0.5 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm" />
        </span>
      </div>

      {isModalOpen && (
        <YearTargetModal initialYear={currentYear} onClose={handleClose} />
      )}
    </>
  );
}
