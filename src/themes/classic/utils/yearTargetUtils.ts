import type { Activity } from './utils';
import { M_TO_DIST } from './utils';

export interface YearTargetStat {
  year: number;
  targetDistance: number;
  completedDistance: number;
  progressRate: number;
  isCompleted: boolean;
  isPastYear: boolean;
  isCurrentYear: boolean;
  totalDays: number;
  dayOfYear: number;
  remainingDays: number;
  timeProgressRate: number;
  expectedDistance: number;
  scheduleDiff: number;
  isAhead: boolean;
  requiredDailyDistance: number;
  requiredWeeklyDistance: number;
  requiredMonthlyDistance: number;
  actualDailyDistance: number;
  actualWeeklyDistance: number;
  projectedYearDistance: number;
  runCount: number;
  activeRunDays: number;
  completionDate?: string;
  estimatedGoalDate?: string;
  motivationMessage: string;
}

export const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

export const getTotalDaysInYear = (year: number): number => {
  return isLeapYear(year) ? 366 : 365;
};

export const calculateYearTargetStat = (
  targetYear: number,
  activities: Activity[]
): YearTargetStat => {
  const currentActualYear = new Date().getFullYear();
  const isPastYear = targetYear < currentActualYear;
  const isCurrentYear = targetYear === currentActualYear;
  const isFutureYear = targetYear > currentActualYear;

  const totalDays = getTotalDaysInYear(targetYear);

  let dayOfYear = totalDays;
  if (isCurrentYear) {
    const startOfYear = new Date(targetYear, 0, 1, 0, 0, 0, 0);
    const now = new Date();
    const diffMs = now.getTime() - startOfYear.getTime();
    dayOfYear = Math.min(
      totalDays,
      Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1)
    );
  } else if (isFutureYear) {
    dayOfYear = 0;
  }

  const remainingDays = Math.max(0, totalDays - dayOfYear);
  const timeProgressRate = totalDays > 0 ? (dayOfYear / totalDays) * 100 : 0;

  const targetYearStr = targetYear.toString();
  const yearActivities = activities
    .filter(
      (a) =>
        a.start_date_local && a.start_date_local.slice(0, 4) === targetYearStr
    )
    .sort((a, b) => {
      return (
        new Date(a.start_date_local.replace(' ', 'T')).getTime() -
        new Date(b.start_date_local.replace(' ', 'T')).getTime()
      );
    });

  const completedDistance =
    yearActivities.reduce((sum, a) => sum + (a.distance || 0), 0) / M_TO_DIST;
  const targetDistance = targetYear; // 2025 -> 2025 km, 2026 -> 2026 km

  const progressRate =
    targetDistance > 0 ? (completedDistance / targetDistance) * 100 : 0;
  const isCompleted = completedDistance >= targetDistance;

  const remainingDistance = Math.max(0, targetDistance - completedDistance);
  const expectedDistance = targetDistance * (dayOfYear / totalDays);
  const scheduleDiff = completedDistance - expectedDistance;
  const isAhead = scheduleDiff >= 0;

  const requiredDailyDistance =
    remainingDays > 0 && !isCompleted ? remainingDistance / remainingDays : 0;
  const requiredWeeklyDistance = requiredDailyDistance * 7;
  const remainingMonths = Math.max(0.1, remainingDays / 30.44);
  const requiredMonthlyDistance =
    remainingDays > 0 && !isCompleted ? remainingDistance / remainingMonths : 0;

  const actualDailyDistance = dayOfYear > 0 ? completedDistance / dayOfYear : 0;
  const actualWeeklyDistance = actualDailyDistance * 7;

  const projectedYearDistance = isPastYear
    ? completedDistance
    : actualDailyDistance * totalDays;

  const runCount = yearActivities.length;
  const activeRunDays = new Set(
    yearActivities.map((a) => a.start_date_local.slice(0, 10))
  ).size;

  let completionDate: string | undefined;
  if (isCompleted) {
    let accumulated = 0;
    for (const act of yearActivities) {
      accumulated += (act.distance || 0) / M_TO_DIST;
      if (accumulated >= targetDistance) {
        completionDate = act.start_date_local.slice(0, 10);
        break;
      }
    }
  }

  let estimatedGoalDate: string | undefined;
  if (!isCompleted && actualDailyDistance > 0 && isCurrentYear) {
    const daysNeeded = Math.ceil(remainingDistance / actualDailyDistance);
    const estDate = new Date(Date.now() + daysNeeded * 24 * 60 * 60 * 1000);
    if (estDate.getFullYear() === targetYear) {
      const month = String(estDate.getMonth() + 1).padStart(2, '0');
      const day = String(estDate.getDate()).padStart(2, '0');
      estimatedGoalDate = `${estDate.getFullYear()}-${month}-${day}`;
    } else {
      estimatedGoalDate = `${estDate.getFullYear()} 年前`;
    }
  }

  let motivationMessage = '';
  if (isPastYear) {
    if (isCompleted) {
      motivationMessage = `${targetYear} 年度 KPI 挑战圆满达成！累计跑量超出目标 ${(completedDistance - targetDistance).toFixed(1)} KM。`;
    } else {
      motivationMessage = `${targetYear} 年度已结算，完成度 ${progressRate.toFixed(1)}%，新的一年继续向前！`;
    }
  } else if (isCompleted) {
    motivationMessage = `太棒了！已提前达成 ${targetYear} 年度 ${targetDistance} KM 目标，达成日期：${completionDate || '已完成'}！`;
  } else if (isAhead) {
    motivationMessage = `节奏极佳！当前跑量超前时间进度 ${Math.abs(scheduleDiff).toFixed(1)} KM，保持状态预计将在 ${estimatedGoalDate || '年底前'} 提前达成！`;
  } else {
    motivationMessage = `当前跑量略落后时间进度 ${Math.abs(scheduleDiff).toFixed(1)} KM，接下来每日保持约 ${requiredDailyDistance.toFixed(1)} KM 即可如期达标！`;
  }

  return {
    year: targetYear,
    targetDistance,
    completedDistance,
    progressRate,
    isCompleted,
    isPastYear,
    isCurrentYear,
    totalDays,
    dayOfYear,
    remainingDays,
    timeProgressRate,
    expectedDistance,
    scheduleDiff,
    isAhead,
    requiredDailyDistance,
    requiredWeeklyDistance,
    requiredMonthlyDistance,
    actualDailyDistance,
    actualWeeklyDistance,
    projectedYearDistance,
    runCount,
    activeRunDays,
    completionDate,
    estimatedGoalDate,
    motivationMessage,
  };
};
