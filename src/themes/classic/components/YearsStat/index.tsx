import { useMemo } from 'react';
import YearStat from '../YearStat';
import TopProjectedStat from '../Header/TopProjectedStat';
import useActivities from '../../hooks/useActivities';
import { INFO_MESSAGE } from '../../utils/const';

const YearsStat = ({
  year,
  onClick,
}: {
  year: string;
  onClick: (_year: string) => void;
}) => {
  const { years } = useActivities();

  // Memoize the years array calculation
  const yearsArrayUpdate = useMemo(() => {
    // make sure the year click on front
    let updatedYears = years.slice();
    updatedYears.push('Total');
    updatedYears = updatedYears.filter((x) => x !== year);
    updatedYears.unshift(year);
    return updatedYears;
  }, [years, year]);

  const infoMessage = useMemo(() => {
    return INFO_MESSAGE(years.length, year);
  }, [years.length, year]);

  return (
    <div className="w-full pb-16 lg:w-full lg:pr-16">
      <div className="mb-6 pl-6">
        <TopProjectedStat />
      </div>
      <section className="pb-6 pl-6">
        <p className="leading-relaxed">
          {infoMessage}
          <br />
        </p>
      </section>
      {yearsArrayUpdate.map((yearItem) => (
        <YearStat key={yearItem} year={yearItem} onClick={onClick} />
      ))}
    </div>
  );
};

export default YearsStat;
