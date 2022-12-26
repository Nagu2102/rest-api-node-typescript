import { ForecastPeriod } from './ForecastPeriod';

export interface ForecastResponse {
    Periods: ForecastPeriod[];
    ElevationInMeters: number;
    LastUpdatedDate: string;
    RawData: string;
}