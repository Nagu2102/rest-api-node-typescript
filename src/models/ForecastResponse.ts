import { ForecastPeriod } from './ForecastPeriod';

export interface ForecastResponse {
    Periods: ForecastPeriod[];
    Latitude: number;
    Longitude: number;
    ElevationInMeters: number;
    LastUpdatedDate: string;
    RawData: string;
}