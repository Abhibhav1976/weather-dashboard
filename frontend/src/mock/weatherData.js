// Mock weather data for development
export const mockCurrentWeather = {
  location: {
    name: "New York",
    region: "New York",
    country: "United States of America",
    lat: 40.71,
    lon: -74.01,
    tz_id: "America/New_York",
    localtime: "2025-01-27 14:30"
  },
  current: {
    last_updated: "2025-01-27 14:30",
    temp_c: 8.0,
    temp_f: 46.4,
    is_day: 1,
    condition: {
      text: "Partly cloudy",
      icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
      code: 1003
    },
    wind_mph: 12.5,
    wind_kph: 20.2,
    wind_degree: 230,
    wind_dir: "SW",
    pressure_mb: 1015.0,
    pressure_in: 29.97,
    precip_mm: 0.0,
    precip_in: 0.0,
    humidity: 65,
    cloud: 75,
    feelslike_c: 5.1,
    feelslike_f: 41.2,
    vis_km: 16.0,
    vis_miles: 9.0,
    uv: 4.0,
    gust_mph: 18.6,
    gust_kph: 29.9
  }
};

export const mockForecast = {
  forecast: {
    forecastday: [
      {
        date: "2025-01-27",
        day: {
          maxtemp_c: 12.0,
          maxtemp_f: 53.6,
          mintemp_c: 3.0,
          mintemp_f: 37.4,
          avgtemp_c: 7.5,
          avgtemp_f: 45.5,
          maxwind_mph: 15.2,
          maxwind_kph: 24.5,
          totalprecip_mm: 0.0,
          totalprecip_in: 0.0,
          avgvis_km: 16.0,
          avgvis_miles: 9.0,
          avghumidity: 68.0,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 10,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: "Partly cloudy",
            icon: "//cdn.weatherapi.com/weather/64x64/day/116.png",
            code: 1003
          },
          uv: 4.0
        },
        hour: [
          {
            time: "2025-01-27 00:00",
            temp_c: 4.0,
            temp_f: 39.2,
            condition: {
              text: "Clear",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png"
            },
            wind_mph: 8.5,
            wind_kph: 13.7,
            humidity: 75
          },
          {
            time: "2025-01-27 06:00",
            temp_c: 3.0,
            temp_f: 37.4,
            condition: {
              text: "Clear",
              icon: "//cdn.weatherapi.com/weather/64x64/night/113.png"
            },
            wind_mph: 7.2,
            wind_kph: 11.6,
            humidity: 78
          },
          {
            time: "2025-01-27 12:00",
            temp_c: 10.0,
            temp_f: 50.0,
            condition: {
              text: "Partly cloudy",
              icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
            },
            wind_mph: 12.0,
            wind_kph: 19.3,
            humidity: 60
          },
          {
            time: "2025-01-27 18:00",
            temp_c: 8.0,
            temp_f: 46.4,
            condition: {
              text: "Partly cloudy",
              icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
            },
            wind_mph: 11.5,
            wind_kph: 18.5,
            humidity: 65
          }
        ]
      },
      {
        date: "2025-01-28",
        day: {
          maxtemp_c: 15.0,
          maxtemp_f: 59.0,
          mintemp_c: 6.0,
          mintemp_f: 42.8,
          avgtemp_c: 10.5,
          avgtemp_f: 50.9,
          maxwind_mph: 18.0,
          maxwind_kph: 29.0,
          totalprecip_mm: 2.5,
          totalprecip_in: 0.1,
          avgvis_km: 14.0,
          avgvis_miles: 8.7,
          avghumidity: 72.0,
          daily_will_it_rain: 1,
          daily_chance_of_rain: 65,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: "Light rain",
            icon: "//cdn.weatherapi.com/weather/64x64/day/296.png",
            code: 1183
          },
          uv: 3.0
        }
      },
      {
        date: "2025-01-29",
        day: {
          maxtemp_c: 9.0,
          maxtemp_f: 48.2,
          mintemp_c: 2.0,
          mintemp_f: 35.6,
          avgtemp_c: 5.5,
          avgtemp_f: 41.9,
          maxwind_mph: 22.0,
          maxwind_kph: 35.4,
          totalprecip_mm: 0.0,
          totalprecip_in: 0.0,
          avgvis_km: 18.0,
          avgvis_miles: 11.2,
          avghumidity: 58.0,
          daily_will_it_rain: 0,
          daily_chance_of_rain: 5,
          daily_will_it_snow: 0,
          daily_chance_of_snow: 0,
          condition: {
            text: "Sunny",
            icon: "//cdn.weatherapi.com/weather/64x64/day/113.png",
            code: 1000
          },
          uv: 5.0
        }
      }
    ]
  }
};

export const mockSearchResults = [
  { name: "New York", region: "New York", country: "United States of America" },
  { name: "London", region: "City of London, Greater London", country: "United Kingdom" },
  { name: "Tokyo", region: "Tokyo", country: "Japan" },
  { name: "Sydney", region: "New South Wales", country: "Australia" },
  { name: "Paris", region: "Ile-de-France", country: "France" }
];

export const getRandomWeatherData = (cityName) => {
  const conditions = [
    { text: "Sunny", icon: "//cdn.weatherapi.com/weather/64x64/day/113.png", code: 1000 },
    { text: "Partly cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/116.png", code: 1003 },
    { text: "Cloudy", icon: "//cdn.weatherapi.com/weather/64x64/day/119.png", code: 1006 },
    { text: "Light rain", icon: "//cdn.weatherapi.com/weather/64x64/day/296.png", code: 1183 },
    { text: "Heavy rain", icon: "//cdn.weatherapi.com/weather/64x64/day/308.png", code: 1195 }
  ];

  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.floor(Math.random() * 30) + 5; // 5-35°C
  
  return {
    location: {
      name: cityName,
      region: "Mock Region",
      country: "Mock Country",
      localtime: new Date().toISOString().slice(0, 16).replace('T', ' ')
    },
    current: {
      temp_c: temp,
      temp_f: Math.round((temp * 9/5) + 32),
      condition: randomCondition,
      wind_mph: Math.floor(Math.random() * 20) + 5,
      wind_kph: Math.floor(Math.random() * 32) + 8,
      wind_dir: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
      humidity: Math.floor(Math.random() * 40) + 40,
      feelslike_c: temp + Math.floor(Math.random() * 6) - 3,
      feelslike_f: Math.round(((temp + Math.floor(Math.random() * 6) - 3) * 9/5) + 32),
      vis_km: Math.floor(Math.random() * 10) + 10,
      vis_miles: Math.floor(Math.random() * 6) + 6,
      pressure_mb: Math.floor(Math.random() * 50) + 1000,
      uv: Math.floor(Math.random() * 8) + 1
    }
  };
};