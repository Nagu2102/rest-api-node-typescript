import { ForecastResponse } from './ForecastResponse';
import { WeatherStation } from './WeatherStation';

export interface CurrentConditionsResponse {
    ObservationDate: string;
    WeatherStation: WeatherStation;
    TemperatureFahrenheit: number | null;
    TemperatureCelsius: number | null;
    TextDescription: string;
    DewPointCelsius: number | null;
    DewPointFahrenheit: number | null;
    WindDirection: number | null;
    WindSpeedKilometersPerHour: number | null;
    WindSpeedMilesPerHour: number | null;
    WindGustKilometersPerHour: number | null;
    WindGustMilesPerHour: number | null;
    BarometricPressure: number | null;
    SeaLevelPressure: number | null;
    VisibilityMeters: number | null;
    RelativeHumidityPercent: number | null;
    WindChillCelsius: number | null;
    WindChillFahrenheit: number | null;
    HeatIndexCelsius: number | null;
    HeatIndexFahrenheit: number | null;
    RawData: string;
    Station: WeatherStation;
    ForeCastList: ForecastResponse | null;
}