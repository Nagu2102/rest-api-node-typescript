import { Request, Response, NextFunction, json } from 'express';
import { apiErrorHandler } from '../handlers/errorHandler';
import { StateTypes } from '../models/StateTypes';
import { WeatherStation } from '../models/WeatherStation';
import WeatherDataService from '../services/WeatherDataService';

export default class WeatherData {
  constructor() { }

  async getCurrentConditionsAsync(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await WeatherDataService.GetCurrentConditionsAsync(req.body.Latitude, req.body.Longitude);
      res.json(list);
    } catch (error) {
      apiErrorHandler(error, req, res, 'Get currentConditions failed.');
    }
  }

  async getAllWeatherStationsForStateAsync(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await WeatherDataService.GetAllWeatherStationsForStateAsync(req.body.StateType);
      res.json(list);
    } catch (error) {
      apiErrorHandler(error, req, res, `Get weather stations for state ${req.body.StateType} failed.`);
    }
  }

  async getForecastAsync(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await WeatherDataService.GetForecastAsync(req.body.Latitude, req.body.Longitude);
      res.json(list);
    } catch (error) {
      console.log(error);
      apiErrorHandler(error, req, res, `Get forecast failed.`);
    }
  }

  async getCurrentConditionsForStationAsync(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await WeatherDataService.GetCurrentConditionsForStationAsync(req.body.Station);
      res.json(list);
    } catch (error) {
      apiErrorHandler(error, req, res, `Get current conditions for station failed.`);
    }
  }

  async getClosestWeatherStationAsync(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await WeatherDataService.GetClosestWeatherStationAsync(req.body.Latitude, req.body.Longitude, req.body.StateType, req.body.NotStationIdentifierList);
      res.json(list);
    } catch (error) {
      apiErrorHandler(error, req, res, `Get closest weather station failed.`);
    }
  }
}
