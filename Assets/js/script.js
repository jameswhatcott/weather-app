document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const cityInput = document.getElementById('city');
    const city = cityInput.value;
    console.log(`City: ${city}`);
    addCityToHistory(city);
    getGeocodeData(city);
});

function addCityToHistory(city) {
    const searchHistory = document.getElementById('searchHistory');
    const buttons = searchHistory.getElementsByTagName('button');
    
    // If there are already 8 buttons, remove the oldest one
    if (buttons.length >= 8) {
        searchHistory.removeChild(buttons[0]);
    }
    
    // Create a new button for the searched city
    const cityButton = document.createElement('button');
    cityButton.classList.add('cityButton');
    cityButton.textContent = city;
    cityButton.addEventListener('click', function() {
        getGeocodeData(city);
    });
    
    // Append the new button to the search history div
    searchHistory.appendChild(cityButton);
}

function getGeocodeData(city) {
    const apiKey = '658c0441ad4e1c5ad68aea928a6f1e08';
    const baseURL = 'http://api.openweathermap.org/geo/1.0/direct';
    const url = `${baseURL}?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.length > 0) {
                const { lat, lon, name, country } = data[0];
                console.log(`City: ${name}, Country: ${country}, Latitude: ${lat}, Longitude: ${lon}`);
                getWeatherData(lat, lon);
            } else {
                console.log('No results found');
            }
        })
        .catch(error => {
            console.error('Error fetching geocode data:', error);
        });
}

function getWeatherData(lat, lon) {
    const apiKey = '658c0441ad4e1c5ad68aea928a6f1e08';
    const baseURL = 'https://api.openweathermap.org/data/2.5/forecast';
    const url = `${baseURL}?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather data:', data);
            if (data.list && data.city) {
                displayWeatherData(data);
            } else {
                console.error('Error: Weather data is incomplete.');
                const weatherResult = document.getElementById('weatherResult');
                weatherResult.innerHTML = 'Weather data is not available. Please try again later.';
            }
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            const weatherResult = document.getElementById('weatherResult');
            weatherResult.innerHTML = 'Error fetching weather data. Please try again later.';
        });
}

function displayWeatherData(data) {
    const weatherResult = document.getElementById('weatherResult');
    weatherResult.innerHTML = '';

    console.log('Data to be displayed:', data);

    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString();
    }

    const forecastList = data.list;
    const city = data.city.name;

    const cityHeader = document.createElement('h2');
    cityHeader.textContent = `Weather forecast for ${city}`;
    weatherResult.appendChild(cityHeader);

    const dailyForecast = {};
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toLocaleDateString();
        if (!dailyForecast[dateString]) {
            dailyForecast[dateString] = [];
        }
        dailyForecast[dateString].push(forecast);
    });

    const dates = Object.keys(dailyForecast).slice(0, 6);

    // Display today's weather
    const todayDiv = document.createElement('div');
    todayDiv.id = 'todayWeather';
    const todayHeader = document.createElement('h3');
    todayHeader.textContent = "Today's Weather";
    todayDiv.appendChild(todayHeader);

    const todayForecast = dailyForecast[dates[0]][0];
    const todayDateParagraph = document.createElement('p');
    todayDateParagraph.innerHTML = `<strong>Date:</strong> ${dates[0]}`;
    todayDiv.appendChild(todayDateParagraph);

    const todayIcon = document.createElement('img');
    const todayIconUrl = `http://openweathermap.org/img/wn/${todayForecast.weather[0].icon}@2x.png`;
    todayIcon.src = `${todayIconUrl}`;
    todayDiv.appendChild(todayIcon);

    const todayTempParagraph = document.createElement('p');
    todayTempParagraph.innerHTML = `<strong>Temperature:</strong> ${todayForecast.main.temp}°F`;
    todayDiv.appendChild(todayTempParagraph);

    const todayHumidityParagraph = document.createElement('p');
    todayHumidityParagraph.innerHTML = `<strong>Humidity:</strong> ${todayForecast.main.humidity}%`;
    todayDiv.appendChild(todayHumidityParagraph);

    const todayWindSpeed = document.createElement('p');
    todayWindSpeed.innerHTML = `<strong>Wind Speed:</strong> ${todayForecast.wind.speed}mph`;
    todayDiv.appendChild(todayWindSpeed);

    weatherResult.appendChild(todayDiv);

    // Display the next 5 days' weather
    const forecastContainer = document.createElement('div');
    forecastContainer.classList.add('forecast-container');
    dates.slice(1).forEach((dateString, index) => {
        const dayForecasts = dailyForecast[dateString];
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('weather-day');

        const dayHeader = document.createElement('h3');
        dayHeader.textContent = `Day ${index + 1}`;
        dayDiv.appendChild(dayHeader);

        const dateParagraph = document.createElement('p');
        dateParagraph.innerHTML = `<strong>Date:</strong> ${dateString}`;
        dayDiv.appendChild(dateParagraph);

        const icon = document.createElement('img');
        const iconUrl = `http://openweathermap.org/img/wn/${dayForecasts[0].weather[0].icon}@2x.png`;
        icon.src = `${iconUrl}`;
        dayDiv.appendChild(icon);

        const tempParagraph = document.createElement('p');
        tempParagraph.innerHTML = `<strong>Temperature:</strong> ${dayForecasts[0].main.temp}°F`;
        dayDiv.appendChild(tempParagraph);

        const humidityParagraph = document.createElement('p');
        humidityParagraph.innerHTML = `<strong>Humidity:</strong> ${dayForecasts[0].main.humidity}%`;
        dayDiv.appendChild(humidityParagraph);

        const windSpeedParagraph = document.createElement('p');
        windSpeedParagraph.innerHTML = `<strong>Wind Speed:</strong> ${dayForecasts[0].wind.speed}mph`;
        dayDiv.appendChild(windSpeedParagraph);

        forecastContainer.appendChild(dayDiv);
    });

    weatherResult.appendChild(forecastContainer);
}
