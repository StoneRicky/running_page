import { useState, useEffect, useMemo, useRef, type TouchEvent } from 'react';
import useActivities from '../../hooks/useActivities';
import { DIST_UNIT } from '../../utils/utils';
import {
  calculateYearTargetStat,
  type YearTargetStat,
} from '../../utils/yearTargetUtils';
import styles from './style.module.css';

interface YearTargetModalProps {
  initialYear?: number | string;
  onClose: () => void;
}

// 统一风格的精细 SVG 矢量图标集 (1.75px 细线条，现代极简)
const RunIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10l-1.5-3" />
    <path d="m14 13-3.5 2L7 13" />
    <path d="m4 17 3-2 1.5 4.5" />
    <circle cx="15" cy="4" r="1.5" />
    <path d="M10 17.5 8 22" />
  </svg>
);

const LightningIcon = ({
  className = 'w-3.5 h-3.5',
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const TargetIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const CalendarIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

const TrendingUpIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrophyIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

const FlagIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" x2="4" y1="22" y2="15" />
  </svg>
);

const ClockIcon = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const FlameIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z" />
  </svg>
);

const CloseIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

const YearTargetModal = ({ initialYear, onClose }: YearTargetModalProps) => {
  const { activities, years } = useActivities();
  const [currentActualYear] = useState(() => new Date().getFullYear());

  // Parse initial selected year
  const defaultYear = initialYear
    ? parseInt(initialYear.toString(), 10) || currentActualYear
    : currentActualYear;

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);

  // Available numeric years from activities (sorted descending)
  const availableYears = useMemo(() => {
    const numYears = years
      .map((y) => parseInt(y, 10))
      .filter((y) => !Number.isNaN(y));

    if (!numYears.includes(currentActualYear)) {
      numYears.push(currentActualYear);
    }
    return Array.from(new Set(numYears)).sort((a, b) => b - a);
  }, [years, currentActualYear]);

  // Calculate stats for the selected year
  const stats: YearTargetStat = useMemo(() => {
    return calculateYearTargetStat(selectedYear, activities);
  }, [selectedYear, activities]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Format numbers with commas
  const formatNumber = (num: number, decimals = 1): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Mobile drag-to-dismiss gesture handling
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartYRef = useRef(0);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (modalContentRef.current && modalContentRef.current.scrollTop <= 0) {
      touchStartYRef.current = e.touches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartYRef.current;
    if (diff > 0) {
      // Pulling down
      setDragY(diff);
    } else {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragY > 80) {
      onClose();
    }
    setDragY(0);
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={modalContentRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.25s ease',
        }}
      >
        {/* Mobile Drag Handle */}
        <div className={styles.dragHandle} />

        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close modal"
          title="关闭"
        >
          <CloseIcon />
        </button>

        {/* Header Area */}
        <div className="mb-4">
          {/* Year Switcher */}
          <div className="mb-3.5 pr-8">
            <div className={styles.yearSelector}>
              {availableYears.map((yr) => {
                const isSelected = yr === selectedYear;
                const isCurr = yr === currentActualYear;
                return (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`${styles.yearButton} ${
                      isSelected ? styles.yearButtonActive : ''
                    }`}
                  >
                    <span>{yr}</span>
                    {isCurr && <FlameIcon className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-primary)]">
                {selectedYear}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--color-run-table-thead)] opacity-85 sm:text-sm">
                目标{' '}
                <span className="font-bold">
                  {formatNumber(stats.targetDistance, 0)} {DIST_UNIT}
                </span>
              </p>
            </div>

            {/* Status Badge */}
            <div>
              {stats.isCompleted ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <TrophyIcon className="h-3.5 w-3.5" />
                  <span>已达成 {stats.progressRate.toFixed(1)}%</span>
                </span>
              ) : stats.isPastYear ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-500/30 bg-neutral-500/15 px-3 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-500/20 dark:text-neutral-300">
                  <FlagIcon className="h-3.5 w-3.5" />
                  <span>最终完成 {stats.progressRate.toFixed(1)}%</span>
                </span>
              ) : stats.isAhead ? (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <LightningIcon className="h-3.5 w-3.5" />
                  <span>
                    超前进度 +{stats.scheduleDiff.toFixed(1)} {DIST_UNIT}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <ClockIcon className="h-3.5 w-3.5" />
                  <span>
                    落后进度 {stats.scheduleDiff.toFixed(1)} {DIST_UNIT}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className={`mb-4 p-4 ${styles.glassBox}`}>
          <div className="mb-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div>
              <strong className="text-[var(--color-primary)]">已完成: </strong>
              <span className="font-bold text-[var(--color-run-table-thead)]">
                {formatNumber(stats.completedDistance, 2)} {DIST_UNIT}
              </span>
            </div>
            <div className="rounded-lg bg-[var(--color-primary)]/15 px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)]">
              {stats.progressRate.toFixed(1)}%
            </div>
            <div>
              <strong className="text-[var(--color-primary)]">目标: </strong>
              <span className="font-bold text-[var(--color-run-table-thead)]">
                {formatNumber(stats.targetDistance, 0)} {DIST_UNIT}
              </span>
            </div>
          </div>

          {/* Running Distance Progress Bar */}
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, stats.progressRate)}%`,
                backgroundColor: stats.isCompleted
                  ? '#10b981'
                  : 'var(--color-primary)',
              }}
            />
          </div>
        </div>

        {/* 4 Core Dimensions Matrix (2x2 Grid) */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Card 1: Basic Distance */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.cardHeaderIcon}>
                  <RunIcon className="h-3.5 w-3.5" />
                </span>
                <span className={styles.cardHeaderTitle}>跑量进度</span>
              </div>
              <span className={styles.cardHeaderTag}>DISTANCE</span>
            </div>
            <div className={styles.dataRow}>
              <strong>
                {stats.isPastYear ? '当年累计跑量:' : '本年已跑里程:'}
              </strong>
              <span>
                {formatNumber(stats.completedDistance, 2)} {DIST_UNIT}
              </span>
            </div>
            <div className={styles.dataRow}>
              <strong>
                {stats.isCompleted
                  ? '超额完成里程:'
                  : stats.isPastYear
                    ? '最终未达差额:'
                    : '仍需跑量:'}
              </strong>
              <span
                className={
                  stats.isCompleted
                    ? 'font-bold text-emerald-500'
                    : 'font-bold text-amber-500 dark:text-amber-400'
                }
              >
                {stats.isCompleted ? '+' : ''}
                {formatNumber(
                  stats.isCompleted
                    ? stats.completedDistance - stats.targetDistance
                    : stats.targetDistance - stats.completedDistance,
                  2
                )}{' '}
                {DIST_UNIT}
              </span>
            </div>
            <div className={styles.dataRow}>
              <strong>累计跑步记录:</strong>
              <span>
                {stats.runCount} 次 ({stats.activeRunDays} 天活跃)
              </span>
            </div>
          </div>

          {/* Card 2: Timeline Pacing */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.cardHeaderIcon}>
                  <CalendarIcon className="h-3.5 w-3.5" />
                </span>
                <span className={styles.cardHeaderTitle}>时间与节奏</span>
              </div>
              <span className={styles.cardHeaderTag}>TIMELINE</span>
            </div>
            <div className={styles.dataRow}>
              <strong>当前所处天数:</strong>
              <span>
                第 {stats.dayOfYear} 天 / 共 {stats.totalDays} 天
              </span>
            </div>
            <div className={styles.dataRow}>
              <strong>全年剩余天数:</strong>
              <span>{stats.remainingDays} 天</span>
            </div>
            <div className={styles.dataRow}>
              <strong>当前理论应跑:</strong>
              <span>
                {formatNumber(stats.expectedDistance, 1)} {DIST_UNIT}
              </span>
            </div>
          </div>

          {/* Card 3: Required Quota */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.cardHeaderIcon}>
                  <TargetIcon className="h-3.5 w-3.5" />
                </span>
                <span className={styles.cardHeaderTitle}>达成所需配额</span>
              </div>
              <span className={styles.cardHeaderTag}>QUOTA</span>
            </div>
            {stats.isCompleted ? (
              <div className="flex h-20 items-center justify-center text-center text-xs font-bold text-emerald-500">
                已提前达标，无需额外跑量配额！
              </div>
            ) : stats.isPastYear ? (
              <div className="flex h-20 items-center justify-center text-center text-xs opacity-75">
                该年度已结束结算
              </div>
            ) : (
              <>
                <div className={styles.dataRow}>
                  <strong>剩余每日需跑:</strong>
                  <span>
                    {stats.requiredDailyDistance.toFixed(2)} {DIST_UNIT}/天
                  </span>
                </div>
                <div className={styles.dataRow}>
                  <strong>剩余每周需跑:</strong>
                  <span>
                    {stats.requiredWeeklyDistance.toFixed(1)} {DIST_UNIT}/周
                  </span>
                </div>
                <div className={styles.dataRow}>
                  <strong>剩余每月需跑:</strong>
                  <span>
                    {stats.requiredMonthlyDistance.toFixed(1)} {DIST_UNIT}/月
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Card 4: Actual Rate & Projection */}
          <div className={styles.statCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardHeaderLeft}>
                <span className={styles.cardHeaderIcon}>
                  <TrendingUpIcon className="h-3.5 w-3.5" />
                </span>
                <span className={styles.cardHeaderTitle}>
                  {stats.isPastYear ? '实际速率与结算' : '实际速率与预测'}
                </span>
              </div>
              <span className={styles.cardHeaderTag}>
                {stats.isPastYear ? 'SETTLED' : 'FORECAST'}
              </span>
            </div>
            <div className={styles.dataRow}>
              <strong>
                {stats.isPastYear ? '当年实际日均:' : '当前实际日均:'}
              </strong>
              <span>
                {stats.actualDailyDistance.toFixed(2)} {DIST_UNIT}/天
              </span>
            </div>
            <div className={styles.dataRow}>
              <strong>
                {stats.isCompleted
                  ? '实际达标日期:'
                  : stats.isPastYear
                    ? '挑战结果:'
                    : '预计达标日期:'}
              </strong>
              <span
                className={`font-bold ${
                  stats.isCompleted
                    ? 'text-emerald-500'
                    : stats.isPastYear
                      ? 'text-neutral-500 dark:text-neutral-400'
                      : stats.estimatedGoalDate
                        ? 'text-emerald-500'
                        : 'text-amber-500 dark:text-amber-400'
                }`}
              >
                {stats.isCompleted
                  ? stats.completionDate || '已完成'
                  : stats.isPastYear
                    ? '未达成'
                    : stats.estimatedGoalDate || '推算中...'}
              </span>
            </div>
            <div className={styles.dataRow}>
              <strong>
                {stats.isPastYear ? '年度最终跑量:' : '全年预计总量:'}
              </strong>
              <span>
                {formatNumber(
                  stats.isPastYear
                    ? stats.completedDistance
                    : stats.projectedYearDistance,
                  1
                )}{' '}
                {DIST_UNIT}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearTargetModal;
