import { Application } from 'express';
import WeatherDataRoutes from './WeatherDataRoutes';

export default class Routes {

  constructor(app: Application) {
    // WeatherData Routes
    app.use('/api/WeatherData', WeatherDataRoutes);
  }
}
