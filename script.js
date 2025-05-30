document.addEventListener("DOMContentLoaded", () => {
  const cookieBanner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("acceptCookies");
  const weatherSection = document.getElementById("weatherSection");

  // Cookie helpers
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(";").shift() : null;
  }

  function setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
  }

  // User info object
  const userInfo = {
    cookies: {
      agreed: getCookie("cookiesAgreed") === "true",
    },
    data: {
      timestamp: new Date().toISOString(),
    },
  };

  // Collect user data
  function collectUserData(data) {
    console.log("📊 Collecting user data:", data);
  }

  // Show cookie banner or weather section
  if (userInfo.cookies.agreed) {
    collectUserData(userInfo.data);
    showWeatherSection();
  } else {
    cookieBanner.classList.remove("hidden");
  }

  // Accept cookies button
  acceptBtn.addEventListener("click", () => {
    setCookie("cookiesAgreed", "true", 365); // Remember for 1 year
    userInfo.cookies.agreed = true;

    collectUserData(userInfo.data);

    cookieBanner.classList.add("hidden");
    showWeatherSection();
  });

  // Show weather section
  function showWeatherSection() {
    weatherSection.classList.remove("hidden");
    setupWeatherFunctionality();
  }

  // Weather functionality
  function setupWeatherFunctionality() {
    const getWeatherBtn = document.getElementById("getWeather");
    const cityInput = document.getElementById("cityInput");
    const weatherInfo = document.getElementById("weatherInfo");
    const forecastContainer = document.getElementById("forecastContainer");

    getWeatherBtn.addEventListener("click", async () => {
      const city = cityInput.value.trim();
      if (!city) {
        weatherInfo.innerHTML = "<p>Please enter a city name.</p>";
        return;
      }

      weatherInfo.innerHTML = `<p>Looking up "${city}"...</p>`;

      const apiKey = "ddf3573f6a1c4babad4161843253005"; // Replace with your actual key
      const weatherUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=no`;

      try {
        const response = await fetch(weatherUrl);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Weather API error (HTTP ${response.status}): ${text}`);
        }

        const data = await response.json();

        const current = data.current || {};
        const location = data.location || {};
        const forecast = data.forecast?.forecastday || [];

        if (!current || !location) {
          throw new Error("Invalid response from weather API");
        }

        // Map weather condition to icon
        const weatherIconMap = {
          Sunny: "sun",
          Cloudy: "cloud",
          Rain: "cloud-rain",
          Drizzle: "cloud-showers-heavy",
          Thunderstorm: "bolt",
          Snow: "snowflake",
          Mist: "smog",
          Fog: "smog",
          Haze: "smog",
          Smoke: "smog",
          Dust: "wind",
          Tornado: "wind",
          default: "cloud",
        };

        // Get today's condition safely
        const conditionText = Array.isArray(current.condition)
          ? current.condition[0]?.text || "Unknown"
          : current.condition?.text || "Unknown";

        const iconKey = Object.keys(weatherIconMap).find(key =>
          conditionText.includes(key)
        );
        const iconClass = iconKey ? weatherIconMap[iconKey] : "cloud";

        weatherInfo.innerHTML = `
          <div class="weather-card">
            <i class="fas fa-${iconClass} weather-icon"></i>
            <h2>${location.name}</h2>
            <p class="weather-temp">${current.temp_c ?? "N/A"}°C</p>
            <p class="weather-desc">${conditionText}</p>
            <div class="details">
              <p><i class="fas fa-tint"></i> Humidity: ${current.humidity ?? "N/A"}%</p>
              <p><i class="fas fa-wind"></i> Wind: ${current.wind_kph ?? "N/A"} km/h</p>
              <p><i class="fas fa-tachometer-alt"></i> Pressure: ${current.pressure_mb ?? "N/A"} hPa</p>
            </div>
          </div>
        `;

        // Forecast for next 6 days
        forecastContainer.innerHTML = "";

        forecast.slice(1, 7).forEach((day, index) => {
          const date = new Date(day.date);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          const condition = day.day?.condition?.text || "Unknown";

          const forecastIconKey = Object.keys(weatherIconMap).find(key =>
            condition.includes(key)
          );
          const forecastIcon = forecastIconKey ? weatherIconMap[forecastIconKey] : "cloud";

          const forecastCard = document.createElement("div");
          forecastCard.className = "forecast-card";
          forecastCard.innerHTML = `
            <h4>${dayName}</h4>
            <i class="fas fa-${forecastIcon} forecast-icon"></i>
            <p>${Math.round(day.day.avgtemp_c)}°C</p>
            <p class="small-desc">${condition}</p>
          `;
          forecastContainer.appendChild(forecastCard);
        });

      } catch (error) {
        console.error("Error fetching weather data:", error);
        weatherInfo.innerHTML = `<p style="color:red;">⚠️ ${error.message}</p>`;
      }
    });
  }
});