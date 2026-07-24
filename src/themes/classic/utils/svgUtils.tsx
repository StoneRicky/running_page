import type { ComponentType, SVGProps } from 'react';
const EmptySvg = () => null;
type SvgComponentType = ComponentType<SVGProps<SVGSVGElement>>;
type SvgComponent = {
  default: SvgComponentType;
};

const FailedLoadSvg: SvgComponentType = () => null;

export const loadSvgComponent = async (
  stats: Record<string, () => Promise<unknown>>,
  path: string
): Promise<SvgComponent> => {
  // --- 统一过滤逻辑开始 ---
  // 如果路径包含 "Total"，或者路径根本不在 stats 的键值对里
  if (path.includes('Total') || !stats[path]) {
    // 打印一个友好的调试信息（可选）
    console.log(`[SVG Skip] 跳过加载总计或不存在的图标: ${path}`);
    return { default: EmptySvg };
  }
  // --- 统一过滤逻辑结束 ---

  const loader = stats[path];

  // 这里的类型检查作为最后的保险
  if (typeof loader !== 'function') {
    return { default: EmptySvg };
  }
  try {
    const module = await stats[path]();
    return { default: module as SvgComponentType };
  } catch (error) {
    console.error(error);
    return { default: FailedLoadSvg };
  }
};
