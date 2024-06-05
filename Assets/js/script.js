document.getElementById('myForm').addEventListener('submit', function(event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Get the input element
    const cityInput = document.getElementById('city');
    
    // Get the value of the input element
    const city = cityInput.value;
    
    // Log the value to the console (or do something else with it)
    console.log(`City: ${city}`);
    
    // Calling the getGeocodeData function with the input value
    getGeocodeData(city);
});

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
                
                // Fetch weather data using the obtained latitude and longitude
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

    // Log the data to inspect its structure
    console.log('Data to be displayed:', data);

    // Function to convert Unix timestamp to a readable date format
    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
        return date.toLocaleDateString(); // Format the date as a readable string
    }

    // Display today's weather and next 5 days' weather forecast
    const forecastList = data.list;
    const city = data.city.name;

    // Create a header for the city
    const cityHeader = document.createElement('h2');
    cityHeader.textContent = `Weather forecast for ${city}`;
    weatherResult.appendChild(cityHeader);

    // Group the forecast data by day
    const dailyForecast = {};
    forecastList.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toLocaleDateString();
        if (!dailyForecast[dateString]) {
            dailyForecast[dateString] = [];
        }
        dailyForecast[dateString].push(forecast);
    });

    // Display today's weather and the next 5 days
    const dates = Object.keys(dailyForecast).slice(0, 6); // Get the first 6 days including today
    dates.forEach((dateString, index) => {
        const dayForecasts = dailyForecast[dateString];
        const dayDiv = document.createElement('div');
        dayDiv.innerHTML = `<h3>${index === 0 ? "Today's Weather" : `Day ${index}`}</h3>
                            <p><strong>Date:</strong> ${dateString}</p>
                            <p><strong>Temperature:</strong> ${dayForecasts[0].main.temp}°F</p>
                            <p><strong>Description:</strong> ${dayForecasts[0].weather[0].description}</p>`;
        weatherResult.appendChild(dayDiv);
    });
}

