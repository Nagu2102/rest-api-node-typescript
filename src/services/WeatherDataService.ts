import { CurrentConditionsResponse } from '../models/CurrentConditionsResponse';
import { ForecastResponse } from '../models/ForecastResponse';
import { StateTypes } from '../models/StateTypes';
import { WeatherStation } from '../models/WeatherStation';
import { ForecastPeriod } from '../models/ForecastPeriod';
import Utilities from './Utilities';

class WeatherDataService {
    constructor() { }

    async GetCurrentConditionsAsync(lat: number, lng: number): Promise<CurrentConditionsResponse | null> {
        const axios = require('axios');

        // tslint:disable-next-line:no-null-keyword
        let response: CurrentConditionsResponse | null = null;

        // Get the current list of stations for the given latitude and longitude.
        const redirectResponseText = await axios.get(`https://api.weather.gov/points/${String(Number(lat).toFixed(4))},${String(Number(lng).toFixed(4))}`);

        // Get the URL of the observation stations from the response
        const observationStationsUrl = redirectResponseText.data.properties.observationStations;

        // Load the observation stations URL from the API
        const observationResponseText = await axios.get(observationStationsUrl);

        // The station list is a property in the response called "features"
        const stations = observationResponseText.data.features;

        // Ensure we have a list of stations
        if (stations && stations.length > 0) {
            // Loop over the list of stations
            for (let i = 0; i < stations.length; i++) {
                const s = stations[i];

                if (s) {
                    // We have a station. Instantiate a WeatherStation object and fill some properties.
                    const station: WeatherStation = {
                        Name: s.properties.name,
                        StationIdentifier: s.properties.stationIdentifier,
                        ElevationInMeters: 0,
                        Latitude: 0,
                        Longitude: 0
                    };

                    if (s.properties.elevation) {
                        station.ElevationInMeters = s.properties.elevation.value;
                    }

                    if (s.geometry.coordinates[0]) {
                        station.Longitude = s.geometry.coordinates[0];
                    }

                    if (s.geometry.coordinates[1]) {
                        station.Latitude = s.geometry.coordinates[1];
                    }

                    // Attempt to get the current conditions for the station provided.
                    response = await this.GetCurrentConditionsForStationAsync(station);
                }

                // If we have current conditions, return it. Otherwise, continue through loop.
                if (response) {
                    break;
                }
            }
        }

        return response;
    }

    async GetAllWeatherStationsForStateAsync(state: StateTypes): Promise<WeatherStation[]> {
        const axios = require('axios');

        const list: WeatherStation[] = [];
        try {
            const response = await axios.get(`https://api.weather.gov/stations?state=${state}`);
            const features = response.data.features;
            features.forEach(s => {
                const station: WeatherStation = {
                    StationIdentifier: s.properties.stationIdentifier,
                    Name: s.properties.name,
                    ElevationInMeters: s.properties.elevation.value,
                    Latitude: NaN,
                    Longitude: NaN
                };

                if (s.properties.elevation.value != undefined) {
                    station.ElevationInMeters = s.properties.elevation.value;
                }

                if (s.geometry.coordinates[0] != undefined) {
                    station.Longitude = s.geometry.coordinates[0];
                }

                if (s.geometry.coordinates[1] != undefined) {
                    station.Latitude = s.geometry.coordinates[1];
                }

                list.push(station);
            });
        }
        catch (error) {
            console.log(error);
        }

        return list;
    }

    async GetForecastAsync(lat: number, lng: number): Promise<ForecastResponse> {
        // Get the gridpoint information for the given latitude and longitude.
        const axios = require('axios');
        const redirectResponseText = await axios.get(`https://api.weather.gov/points/${String(Number(lat).toFixed(4))},${String(Number(lng).toFixed(4))}`);

        // Get the forecast Url from the response
        const forecastUrl = redirectResponseText.data.properties.forecast;

        // Load the forecast Url
        const forecastResponseText = await axios.get(forecastUrl);

        // Parse the json response
        const json2 = forecastResponseText.data;

        // Instantiate a new ForecastResponse object and fill it with the data received
        const response: ForecastResponse = {
            Periods: [],
            ElevationInMeters: json2.properties.elevation.value,
            LastUpdatedDate: json2.properties.updated,
            Latitude: lat,
            Longitude: lng,
            RawData: ''
        };

        json2.properties.periods.forEach(p => {
            const period: ForecastPeriod = {
                Name: p.name,
                StartTime: p.startTime,
                EndTime: p.endTime,
                IsDayTime: p.isDaytime,
                TemperatureInFahrenheit: p.temperature,
                WindSpeed: p.windSpeed,
                WindDirection: p.windDirection,
                ForecastShort: p.shortForecast,
                ForecastLong: p.detailedForecast
            };

            response.Periods.push(period);
        });

        response.RawData = JSON.stringify(forecastResponseText.data);

        return response;
    }

    async GetClosestWeatherStationAsync(lat: number, lng: number, state: StateTypes, notStationIdentifierList: string[]): Promise<WeatherStation | null> {
        const GeoCoordinate = require('../lib/index.js').GeoCoordinate;

        // Get all weather stations for the given state
        let stations = await this.GetAllWeatherStationsForStateAsync(state);

        // Specifically exclude any weather stations that shouldn't be included
        // tslint:disable-next-line:no-null-keyword
        if (notStationIdentifierList != null && notStationIdentifierList.length > 0) {
            stations = stations.filter(s => !notStationIdentifierList.some(s2 => s2 == s.StationIdentifier));
        }

        // tslint:disable-next-line:no-null-keyword
        let closestStation: WeatherStation | null = null;
        // tslint:disable-next-line:no-null-keyword
        let closestStationDistance: number | null = null;

        // Loop through the stations until we find the closest one.
        stations.forEach(s => {
            const sCoord = new GeoCoordinate(Number(s.Latitude), Number(s.Longitude));
            const eCoord = new GeoCoordinate(Number(lat), Number(lng));

            const distance = sCoord.GetDistanceTo(eCoord);

            if (!closestStationDistance || closestStationDistance > distance) {
                closestStationDistance = distance;
                closestStation = s;
            }
        });

        return closestStation;
    }

    async GetCurrentConditionsForStationAsync(station: WeatherStation): Promise<CurrentConditionsResponse | null> {
        const axios = require('axios');

        // tslint:disable-next-line:no-null-keyword
        if (station != null) {
            // Get the current observations for the provided weather station
            const observationsText = await axios.get(`https://api.weather.gov/stations/${station.StationIdentifier}/observations/latest`);

            // Get the list of properties which contain the current condition values
            const properties = observationsText.data.properties;

            // Instantiate a CurrentConditionsResponse and fill with the properties
            const response: CurrentConditionsResponse = {
                WeatherStation: station,
                TextDescription: properties.textDescription,
                ObservationDate: properties.timestamp,
                TemperatureCelsius: this.TryConvertToDecimal(properties.temperature.value),
                DewPointCelsius: this.TryConvertToDecimal(properties.dewpoint.value),
                WindDirection: this.TryConvertToDecimal(properties.windDirection.value),
                WindSpeedKilometersPerHour: this.TryConvertToDecimal(properties.windSpeed.value),
                WindGustKilometersPerHour: this.TryConvertToDecimal(properties.windGust.value),
                BarometricPressure: this.TryConvertToDecimal(properties.barometricPressure.value),
                SeaLevelPressure: this.TryConvertToDecimal(properties.seaLevelPressure.value),
                VisibilityMeters: this.TryConvertToDecimal(properties.visibility.value),
                RelativeHumidityPercent: this.TryConvertToDecimal(properties.relativeHumidity.value),
                WindChillCelsius: this.TryConvertToDecimal(properties.windChill.value),
                HeatIndexCelsius: this.TryConvertToDecimal(properties.heatIndex.value),
                // tslint:disable-next-line:no-null-keyword
                TemperatureFahrenheit: null,
                // tslint:disable-next-line:no-null-keyword
                DewPointFahrenheit: null,
                // tslint:disable-next-line:no-null-keyword
                WindSpeedMilesPerHour: null,
                // tslint:disable-next-line:no-null-keyword
                WindGustMilesPerHour: null,
                // tslint:disable-next-line:no-null-keyword
                WindChillFahrenheit: null,
                // tslint:disable-next-line:no-null-keyword
                HeatIndexFahrenheit: null,
                RawData: '',
                Station: station
            };

            // Convert celsius to fahrenheit

            if (response.TemperatureCelsius) {
                response.TemperatureFahrenheit = Utilities.ConvertCelsiusToFahrenheit(response.TemperatureCelsius);
            }

            if (response.DewPointCelsius) {
                response.DewPointFahrenheit = Utilities.ConvertCelsiusToFahrenheit(response.DewPointCelsius);
            }

            if (response.WindChillCelsius) {
                response.WindChillFahrenheit = Utilities.ConvertCelsiusToFahrenheit(response.WindChillCelsius);
            }

            if (response.HeatIndexCelsius) {
                response.HeatIndexFahrenheit = Utilities.ConvertCelsiusToFahrenheit(response.HeatIndexCelsius);
            }

            if (response.WindSpeedKilometersPerHour) {
                response.WindSpeedMilesPerHour = Utilities.ConvertKilometersPerHourToMilesPerHour(response.WindSpeedKilometersPerHour);
            }

            if (response.WindGustKilometersPerHour) {
                response.WindGustMilesPerHour = Utilities.ConvertKilometersPerHourToMilesPerHour(response.WindGustKilometersPerHour);
            }

            response.RawData = JSON.stringify(observationsText.data);
            response.Station = station;

            return response;
        }

        // tslint:disable-next-line:no-null-keyword
        return null;
    }


    TryConvertToDecimal(value: any): number | null {
        const result = Number(value);

        // tslint:disable-next-line:no-null-keyword
        return (Number.isNaN(result)) ? null : result;
    }

}

export default new WeatherDataService();
