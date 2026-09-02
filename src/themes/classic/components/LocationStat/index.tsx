import YearStat from '../YearStat';
import TopProjectedStat from '../Header/TopProjectedStat';
import {
  CHINESE_LOCATION_INFO_MESSAGE_FIRST,
  CHINESE_LOCATION_INFO_MESSAGE_SECOND,
} from '../../utils/const';
import CitiesStat from './CitiesStat';
import LocationSummary from './LocationSummary';
import PeriodStat from './PeriodStat';

interface ILocationStatProps {
  changeYear: (_year: string) => void;
  changeCity: (_city: string) => void;
  changeTitle: (_title: string) => void;
}

const LocationStat = ({
  changeYear,
  changeCity,
  changeTitle,
}: ILocationStatProps) => (
  <div className="w-full pb-16 lg:w-full lg:pr-16">
    <div className="mb-4 px-2 lg:px-0 lg:pl-6">
      <TopProjectedStat />
    </div>
    <section className="mb-6 px-2 lg:px-0 lg:pl-6">
      <div className="inline-block rounded-2xl border border-[var(--color-hr)] bg-[var(--color-background)] p-4 text-xs font-medium text-[var(--color-tx)] shadow-sm backdrop-blur-md sm:text-sm">
        <p className="leading-relaxed">
          {CHINESE_LOCATION_INFO_MESSAGE_FIRST}.
          <br />
          {CHINESE_LOCATION_INFO_MESSAGE_SECOND}.
          <br />
          <br />
          <span className="italic opacity-80">
            Yesterday you said tomorrow.
          </span>
        </p>
      </div>
    </section>
    <LocationSummary />
    <CitiesStat onClick={changeCity} />
    <PeriodStat onClick={changeTitle} />
    <YearStat year="Total" onClick={changeYear} />
  </div>
);

export default LocationStat;
