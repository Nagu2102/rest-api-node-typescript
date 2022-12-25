import { Router } from 'express';
import WeatherData from '../controllers/WeatherData';

class WeatherDataRoutes {
  router = Router();
  WeatherData = new WeatherData();

  constructor() {
    this.intializeRoutes();
  }
  intializeRoutes() {
    this.router.route('/CurrentConditions').get(this.WeatherData.getCurrentConditionsAsync);
    this.router.route('/WeatherStationsForState').get(this.WeatherData.getAllWeatherStationsForStateAsync);
    this.router.route('/CurrentConditionsForStation').get(this.WeatherData.getCurrentConditionsForStationAsync);
    this.router.route('/Forecast').get(this.WeatherData.getForecastAsync);
    this.router.route('/:id').get(this.WeatherData.getClosestWeatherStationAsync);
  }
}
export default new WeatherDataRoutes().router;
