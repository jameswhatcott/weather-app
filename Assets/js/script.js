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
    const url = `${baseURL}?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
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
    dates.forEach((dateString, index) => {
        const dayForecasts = dailyForecast[dateString];
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('weather-day');

        const dayHeader = document.createElement('h3');
        dayHeader.textContent = index === 0 ? "Today's Weather" : `Day ${index}`;
        dayDiv.appendChild(dayHeader);

        const dateParagraph = document.createElement('p');
        dateParagraph.innerHTML = `<strong>Date:</strong> ${dateString}`;
        dayDiv.appendChild(dateParagraph);

        const tempParagraph = document.createElement('p');
        tempParagraph.innerHTML = `<strong>Temperature:</strong> ${dayForecasts[0].main.temp}°C`;
        dayDiv.appendChild(tempParagraph);

        const descriptionParagraph = document.createElement('p');
        descriptionParagraph.innerHTML = `<strong>Description:</strong> ${dayForecasts[0].weather[0].description}`;
        dayDiv.appendChild(descriptionParagraph);

        weatherResult.appendChild(dayDiv);
    });
}
