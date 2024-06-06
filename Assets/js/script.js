document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("myForm");
    const cityInput = document.getElementById("city");
    const weatherResult = document.getElementById("weatherResult");
    const searchHistory = document.getElementById("searchHistory");

    const apiKey = "658c0441ad4e1c5ad68aea928a6f1e08"; // Replace with your OpenWeather API key
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];

    // Load stored data on page load
    updateHistoryButtons();
    const lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        fetchWeatherData(lastCity);
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            fetchWeatherData(city);
            localStorage.setItem("lastCity", city);
        }
    });

    function fetchWeatherData(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.cod === "200") {
                    displayWeatherData(data);
                    addToHistory(city);
                } else {
                    console.error("Error fetching weather data:", data.message);
                }
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
            });
    }

    function displayWeatherData(data) {
        const today = data.list[0];
        const iconUrl = `http://openweathermap.org/img/wn/${today.weather[0].icon}@2x.png`;

        weatherResult.innerHTML = `
            <div id="todayWeather" class="weather-day">
                <h3>Today's Weather</h3>
                <img src="${iconUrl}" alt="${today.weather[0].description}">
                <p>Temperature: ${today.main.temp}°F</p>
                <p>Weather: ${today.weather[0].description}</p>
                <p>Humidity: ${today.main.humidity}%</p>
                <p>Wind: ${today.wind.speed} m/s</p>
            </div>
        `;

        const forecastData = getDailyForecast(data.list);
        const forecastHtml = forecastData.map(day => {
            const date = new Date(day.dt * 1000).toLocaleDateString();
            const iconUrl = `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
            return `
                <div class="weather-day">
                    <h3>${date}</h3>
                    <img src="${iconUrl}" alt="${day.weather[0].description}">
                    <p>Temperature: ${day.main.temp}°F</p>
                    <p>Weather: ${day.weather[0].description}</p>
                    <p>Humidity: ${day.main.humidity}%</p>
                    <p>Wind: ${day.wind.speed} m/s</p>
                </div>
            `;
        }).join('');

        weatherResult.innerHTML += `
            <div class="forecast-container">
                ${forecastHtml}
            </div>
        `;
    }

    function getDailyForecast(list) {
        const dailyData = [];
        const seenDates = new Set();

        for (let item of list) {
            const date = new Date(item.dt * 1000);
            const day = date.getUTCDate();
            const hour = date.getUTCHours();

            if (!seenDates.has(day) && hour === 12) {
                dailyData.push(item);
                seenDates.add(day);

                if (dailyData.length === 5) {
                    break;
                }
            }
        }

        return dailyData;
    }

    function addToHistory(city) {
        if (!history.includes(city)) {
            if (history.length >= 8) {
                history.pop();
            }
            history.unshift(city);
            updateHistoryButtons();
            localStorage.setItem("searchHistory", JSON.stringify(history));
        }
    }

    function updateHistoryButtons() {
        searchHistory.innerHTML = '';
        history.forEach(city => {
            const button = document.createElement("button");
            button.textContent = city;
            button.classList.add("history-button");
            button.addEventListener("click", () => {
                fetchWeatherData(city);
                localStorage.setItem("lastCity", city);
            });
            searchHistory.appendChild(button);
        });
    }
});
