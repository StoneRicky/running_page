import { ComponentType } from 'react';

// 定义一个空的占位组件，当找不到 SVG 或不需要加载时显示
const EmptySvg = () => null;

type SvgComponent = {
  default: ComponentType<any>;
};

const FailedLoadSvg = () => {
  console.log('Failed to load SVG component');
  return <div></div>;
};

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
    return { default: module as ComponentType<any> };
  } catch (error) {
    console.error(error);
    return { default: FailedLoadSvg };
  }
};
