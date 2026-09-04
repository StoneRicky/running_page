import { useState, useEffect, useMemo, memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { Activity } from '../../utils/utils';
import { DIST_UNIT, M_TO_DIST, isRunActivity } from '../../utils/utils';
import styles from './style.module.css';

interface ProgressLineChartProps {
  year: number;
  targetDistance: number;
  activities: Activity[];
}

interface DayDataPoint {
  day: number;
  date: string;
  expected: number;
  actual: number | null;
}

interface TooltipPayloadItem {
  value: number;
  dataKey: string;
  name: string;
  color: string;
  payload: DayDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomChartTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const actual = data.actual;
  const expected = data.expected;
  const diff = actual !== null ? Number((actual - expected).toFixed(1)) : null;

  return (
    <div className={styles.chartTooltip}>
      <div className={styles.chartTooltipDate}>{data.date}</div>
      <div className={styles.chartTooltipRow}>
        <span className={styles.chartTooltipDotActual} />
        <span className={styles.chartTooltipLabel}>实际累计:</span>
        <span className={styles.chartTooltipValActual}>
          {actual !== null ? `${actual.toFixed(1)} ${DIST_UNIT}` : '未到该日期'}
        </span>
      </div>
      <div className={styles.chartTooltipRow}>
        <span className={styles.chartTooltipDotExpected} />
        <span className={styles.chartTooltipLabel}>基准目标:</span>
        <span className={styles.chartTooltipValExpected}>
          {expected.toFixed(1)} {DIST_UNIT}
        </span>
      </div>
      {diff !== null && (
        <div className={styles.chartTooltipDiff}>
          {diff >= 0 ? (
            <span className="font-semibold text-emerald-500">
              超前进度 +{diff} {DIST_UNIT}
            </span>
          ) : (
            <span className="font-semibold text-neutral-400">
              落后进度 {diff} {DIST_UNIT}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

function ProgressLineChart({
  year,
  targetDistance,
  activities,
}: ProgressLineChartProps) {
  // 检测是否为移动端/窄屏（< 640px）
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 640px)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const { chartData, monthTicks, tickMap, yDomainMax } = useMemo(() => {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDays = isLeap ? 366 : 365;

    const currentActualYear = new Date().getFullYear();
    const isCurrentYear = year === currentActualYear;
    const isPastYear = year < currentActualYear;

    let currentDayOfYear = totalDays;
    if (isCurrentYear) {
      const startOfYear = new Date(year, 0, 1, 0, 0, 0, 0);
      const now = new Date();
      const diffMs = now.getTime() - startOfYear.getTime();
      currentDayOfYear = Math.min(
        totalDays,
        Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
      );
    } else if (!isPastYear) {
      currentDayOfYear = 0;
    }

    const daysInMonths = [
      31,
      isLeap ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];

    // 移动端展示指定月份: 1月、4月、7月、10月、12月 (索引 0, 3, 6, 9, 11)
    const mobileMonthIndices = new Set([0, 11]);

    const ticks: number[] = [];
    const tMap: Record<number, string> = {};
    let accDays = 0;
    for (let m = 0; m < 12; m++) {
      // 锚定在当月15日（月中），使月份文字居中对齐该月份区间
      const dayNum = accDays + 15;
      if (!isMobile || mobileMonthIndices.has(m)) {
        ticks.push(dayNum);
      }
      tMap[dayNum] = `${m + 1}月`;
      accDays += daysInMonths[m];
    }

    const dayToDateMap: string[] = [];
    for (let m = 0; m < 12; m++) {
      const monthStr = String(m + 1).padStart(2, '0');
      for (let d = 1; d <= daysInMonths[m]; d++) {
        const dayStr = String(d).padStart(2, '0');
        dayToDateMap.push(`${year}-${monthStr}-${dayStr}`);
      }
    }

    const yearStr = year.toString();
    const dailyDistances = new Float64Array(totalDays + 1);

    activities
      .filter(
        (a) =>
          a.start_date_local &&
          a.start_date_local.slice(0, 4) === yearStr &&
          isRunActivity(a)
      )
      .forEach((a) => {
        const datePart = a.start_date_local.slice(0, 10);
        const m = parseInt(datePart.slice(5, 7), 10) - 1;
        const d = parseInt(datePart.slice(8, 10), 10);
        if (m >= 0 && m < 12 && d >= 1 && d <= daysInMonths[m]) {
          let dayOfYear = d;
          for (let prevM = 0; prevM < m; prevM++) {
            dayOfYear += daysInMonths[prevM];
          }
          if (dayOfYear >= 1 && dayOfYear <= totalDays) {
            dailyDistances[dayOfYear] += (a.distance || 0) / M_TO_DIST;
          }
        }
      });

    let runningTotal = 0;
    let maxDist = targetDistance;
    const data: DayDataPoint[] = [];

    for (let day = 1; day <= totalDays; day++) {
      runningTotal += dailyDistances[day];
      const expected = Number(((day / totalDays) * targetDistance).toFixed(1));
      const hasActual = !isCurrentYear || day <= currentDayOfYear;
      const actual = hasActual ? Number(runningTotal.toFixed(1)) : null;

      if (actual !== null && actual > maxDist) {
        maxDist = actual;
      }

      data.push({
        day,
        date: dayToDateMap[day - 1] || '',
        expected,
        actual,
      });
    }

    const yMax = Math.ceil((maxDist * 1.06) / 200) * 200;

    return {
      chartData: data,
      monthTicks: ticks,
      tickMap: tMap,
      yDomainMax: yMax,
    };
  }, [year, targetDistance, activities, isMobile]);

  return (
    <div className="w-full">
      {/* Chart Legend Header */}
      <div className="mb-2.5 flex items-center justify-between text-xs text-[var(--color-run-table-thead)] opacity-85 sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="inline-block h-[2px] w-3 bg-[var(--color-run-table-thead)] opacity-50 [border-top:1px_dashed_currentColor]" />
            <span>参照线（理论进度）</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-[2.5px] w-3 rounded-full bg-[var(--color-primary)]" />
            <span className="font-semibold text-[var(--color-primary)]">
              实际线（累计跑量）
            </span>
          </div>
        </div>
        <span className="text-xs opacity-60">单位: {DIST_UNIT}</span>
      </div>

      {/* Recharts Container */}
      <div className={`h-[230px] w-full min-w-0 ${styles.chartFadeIn}`}>
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={0}
        >
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 12, left: 0, bottom: 2 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-hr)"
              opacity={0.35}
              vertical={false}
            />
            <XAxis
              dataKey="day"
              ticks={monthTicks}
              interval={0}
              tickFormatter={(val: number) => tickMap[val] || ''}
              stroke="var(--color-run-table-thead)"
              tick={{
                fill: 'var(--color-run-table-thead)',
                fontSize: 13,
                opacity: 0.85,
              }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-hr)', opacity: 0.4 }}
            />
            <YAxis
              width={34}
              tickMargin={2}
              domain={[0, yDomainMax]}
              stroke="var(--color-run-table-thead)"
              tick={{
                fill: 'var(--color-run-table-thead)',
                fontSize: 13,
                opacity: 0.85,
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) =>
                val >= 1000 ? `${(val / 1000).toFixed(1)}k` : `${val}`
              }
            />
            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{
                stroke: 'var(--color-primary)',
                strokeWidth: 1,
                strokeDasharray: '2 2',
                opacity: 0.5,
              }}
            />
            {/* Reference Target Pace Line (Dashed) — fixed, no animation */}
            <Line
              type="linear"
              dataKey="expected"
              name="参照线"
              stroke="var(--color-run-table-thead)"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              opacity={0.55}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
              isUpdateAnimationActive={false}
            />
            {/* Actual Cumulative Distance Line (Solid Brand Color) */}
            <Line
              type="monotone"
              dataKey="actual"
              name="实际线"
              stroke="var(--color-primary)"
              strokeWidth={2.25}
              dot={false}
              connectNulls={false}
              activeDot={{
                r: 4.5,
                fill: 'var(--color-primary)',
                stroke: 'var(--color-background)',
                strokeWidth: 2,
              }}
              isAnimationActive={true}
              animationDuration={300}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default memo(ProgressLineChart);
