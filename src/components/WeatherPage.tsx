import React, { useState, useEffect } from "react";
import axios from "axios";
import { Weather } from "../utils/interfaces";
import { useParams } from "react-router-dom";

const WeatherPage: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [weatherData, setWeatherData] = useState<Weather | null>(null);
  const [forecastData, setForecastData] = useState<any[] | null>(null);
  const [averageTempByDay, setAverageTempByDay] = useState<any>({});

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${
            import.meta.env.VITE_APP_API_KEY
          }`
        );
        setWeatherData(response.data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };

    const fetchForecastData = async () => {
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${
            import.meta.env.VITE_APP_API_KEY
          }`
        );

        // Filter the forecast data to only include the next 7 days
        const next7DaysForecast = response.data.list.filter((forecast: any) => {
          const forecastDate = new Date(forecast.dt * 1000);
          const today = new Date();
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return forecastDate <= nextWeek && forecastDate > today;
        });

        setForecastData(next7DaysForecast);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
      }
    };

    fetchWeatherData();
    fetchForecastData();
  }, [cityName]);

  // Calculate average temperature for each day and store the icon
  useEffect(() => {
    if (forecastData) {
      const tempByDay: any = {};
      forecastData.forEach((forecast: any) => {
        const date = new Date(forecast.dt * 1000).toDateString();
        if (!tempByDay[date]) {
          tempByDay[date] = {
            tempSum: 0,
            count: 0,
            icon: forecast.weather[0].icon,
          };
        }
        tempByDay[date].tempSum += forecast.main.temp;
        tempByDay[date].count += 1;
        tempByDay[date].main = forecast.weather[0].description;
      });

      const averageTemp: any = {};
      Object.keys(tempByDay).forEach((date) => {
        averageTemp[date] = {
          temp: tempByDay[date].tempSum / tempByDay[date].count,
          icon: tempByDay[date].icon,
          main: tempByDay[date].main,
        };
      });

      setAverageTempByDay(averageTemp);
    }
  }, [forecastData]);

  // Function to get icon URL based on icon code
  const getIconUrl = (iconCode: string) => {
    return `https://openweathermap.org/img/w/${iconCode}.png`;
  };

  const getDay = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString("en-US", { weekday: "long" });
  };
  return (
    <div className="flex flex-col min-h-screen w-full px-4 py-8 bg-gradient-to-b from-blue-200 to-blue-400">
      <h2 className="text-3xl font-bold mb-6 text-center text-white decoration-wavy">
        Weather Forecast for {cityName}
      </h2>

      <div className="grid grid-cols-1 max-w-2xl mx-auto gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Today's Weather</h3>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          {weatherData && (
            <div className="flex justify-around items-start">
              <div className="text-center">
                <p className="text-lg font-semibold">Temperature</p>
                <p className="text-lg font-semibold">
                  {weatherData.main.temp} K / {weatherData.main.temp}°C
                </p>
                <div className="flex flex-col mt-2">
                  <p className="text-sm text-gray-600">
                    Humidity: {weatherData.main.humidity}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Wind Speed: {weatherData.wind.speed} m/s
                  </p>
                  <p className="text-sm text-gray-600">
                    Pressure: {weatherData.main.pressure} hPa
                  </p>
                  <p className="text-sm text-gray-600">
                    Description: {weatherData.weather[0].description}
                  </p>
                </div>
              </div>
              <div className="text-center">
                <img
                  src={getIconUrl(weatherData.weather[0].icon)}
                  alt="Weather Icon"
                  className="w-24 h-24 drop-shadow-lg"
                />
                <p className="text-xl font-bold">
                  {weatherData.weather[0].main}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Forecast</h3>
          {forecastData && (
            <div className="flex justify-between gap-4 overflow-y-auto hidescrollbar">
              {Object.keys(averageTempByDay).map((date, index) => (
                <div
                  key={index}
                  className="bg-gray-100 rounded-lg p-4 flex flex-col items-center text-center"
                >
                  <p className="text-lg font-semibold mb-2">{getDay(date)}</p>
                  <img
                    src={getIconUrl(averageTempByDay[date].icon)}
                    alt="Weather Icon"
                    className="w-12 h-12 mb-2"
                  />
                  <p className="text-lg font-semibold">
                    {averageTempByDay[date].temp.toFixed(2)} K
                  </p>
                  <p className="text-sm text-gray-600 capitalize font-medium">
                    {averageTempByDay[date].main}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherPage;
