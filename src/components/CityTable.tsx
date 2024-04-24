import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

interface City {
  weatherData: any;
  cou_name_en: string;
  name: string;
  country: string;
  timezone: string;
}

const CityTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [currentLocationWeather, setCurrentLocationWeather] =
    useState<any>(null);

  useEffect(() => {
    // Function to fetch weather data for current location
    const fetchCurrentLocationWeather = async () => {
      try {
        // Check if geolocation is supported by the browser
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              const response = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${
                  import.meta.env.VITE_APP_API_KEY
                }&units=metric`
              );
              setCurrentLocationWeather(response.data);
            },
            (error) => {
              console.error("Error getting user's location:", error);
            }
          );
        } else {
          console.error("Geolocation is not supported by this browser.");
        }
      } catch (error) {
        console.error(
          "Error fetching weather data for current location:",
          error
        );
      }
    };

    // Fetch weather data for current location
    fetchCurrentLocationWeather();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records?where=search(name%2C%20%22${searchTerm}%22)&limit=20`
        );

        if (response.data.total_count === 0) {
          setCities([]);
        } else {
          setCities(response.data.results);
        }
      } catch (error) {
        console.error("Error fetching city data:", error);
        setCities([]);
      }
    };

    // fetchData(); call after searchTerm is updated wait for 2sec
    if (searchTerm) {
      setTimeout(fetchData, 1000);
    }
  }, [searchTerm]);

  return (
    <div className="flex flex-col min-h-screen w-full px-4 py-8 bg-gradient-to-b from-blue-200 to-blue-400">
      {currentLocationWeather && (
        <div className="mb-3">
          <h2 className="text-xl font-bold mb-2">Current Location Weather</h2>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2"> Current Location: {currentLocationWeather.name}</h3>
            <p>Temperature: {currentLocationWeather.main.temp}°C</p>
            <p>Weather: {currentLocationWeather.weather[0].main}</p>
            <p>Description: {currentLocationWeather.weather[0].description}</p>
          </div>
        </div>
      )}
      <div className="min-w-full mx-auto p-4 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a city"
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 w-full md:w-auto"
          />
          <button
            onClick={() => {
              setSearchTerm("");
              setCities([]);
            }}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:bg-gray-400"
          >
            Clear
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-200 border text-start">
                  City Name
                </th>
                <th className="py-3 px-4 bg-gray-200 border text-start">
                  Country
                </th>
                <th className="py-3 px-4 bg-gray-200 border text-start">
                  Timezone
                </th>
                <th className="py-3 px-4 bg-gray-200 border text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.name} className="border-b">
                  <td className="py-3 px-4">{city.name}</td>
                  <td className="py-3 px-4">{city.cou_name_en}</td>
                  <td className="py-3 px-4">{city.timezone}</td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/weather/${city.name}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                    >
                      Weather
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CityTable;
