import { lazy, Suspense, useEffect } from 'react';
import { totalStat } from '@assets/index';
import { loadSvgComponent } from '../../utils/svgUtils';
import { initSvgColorAdjustments } from '../../utils/colorUtils';

// Lazy load both github.svg and grid.svg
const GithubSvg = lazy(() => loadSvgComponent(totalStat, './github.svg'));
const GridSvg = lazy(() => loadSvgComponent(totalStat, './grid.svg'));

const SVGStat = () => {
  useEffect(() => {
    // Initialize SVG color adjustments when component mounts
    const timer = setTimeout(() => {
      initSvgColorAdjustments();
    }, 100); // Small delay to ensure SVG is rendered

    return () => clearTimeout(timer);
  }, []);

  return (
    <div id="svgStat" className="mt-8 flex flex-col gap-6">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <div className="rounded-2xl border border-[var(--color-hr)] bg-[var(--color-background)] p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md">
          <GithubSvg className="github-svg h-auto w-full" />
        </div>
        <div className="rounded-2xl border border-[var(--color-hr)] bg-[var(--color-background)] p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-md">
          <GridSvg className="grid-svg h-auto w-full" />
        </div>
      </Suspense>
    </div>
  );
};

export default SVGStat;
