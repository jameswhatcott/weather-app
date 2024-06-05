document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const cityInput = document.getElementById('search');
    const city = cityInput.value;
    
    console.log(`City: ${city}`);
    
    getGeocodeData(city);
});


// Function to convert Unix timestamp to a readable date format
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000); // Convert from seconds to milliseconds
    return date.toLocaleDateString(); // Format the date as a readable string
}

// Example usage
const timestamp = 1625858400;
const readableDate = formatDate(timestamp);
console.log(readableDate); // Output: "07/10/2021" (the format depends on your locale settings)


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
    const url = `${baseURL}?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=imperial&appid=${apiKey}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Weather data:', data);
            displayWeatherData(data);
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

function displayWeatherData(data) {
    const weatherResult = document.getElementById('dailyWeather');
    weatherResult.innerHTML = '';

    function formatDate(timestamp) {
        const date = new Date(timestamp * 1000); 
        return date.toLocaleDateString(); 
    }

    const today = data.current;
    if (today && today.dt) {
        const todayWeather = document.createElement('div');
        todayWeather.innerHTML = `<h2>Today's Weather</h2>
                                  <p><strong>Date:</strong> ${formatDate(today.dt)}</p>
                                  <p><strong>Temperature:</strong> ${today.temp}°F</p>
                                  <p><strong>Description:</strong> ${today.weather[0].description}</p>`;
        weatherResult.appendChild(todayWeather);
    } else {
        console.error('Error: Today\'s weather data is unavailable.');
    }

    // Display the next 5 days weather forecast
    const dailyForecast = data.daily;
    if (dailyForecast && dailyForecast.length > 0) {
        const nextFiveDays = dailyForecast.slice(1, 6);
        nextFiveDays.forEach((day, index) => {
            if (day && day.dt) {
                const temperature = day.temp.day;
                const description = day.weather[0].description;

                const weatherInfo = document.createElement('div');
                weatherInfo.innerHTML = `<h3>Day ${index + 1}</h3>
                                         <p><strong>Date:</strong> ${formatDate(day.dt)}</p>
                                         <p><strong>Temperature:</strong> ${temperature}°F</p>
                                         <p><strong>Description:</strong> ${description}</p>`;
                weatherResult.appendChild(weatherInfo);
            } else {
                console.error(`Error: Forecast data for day ${index + 1} is unavailable.`);
            }
        });
    } else {
        console.error('Error: Daily forecast data is unavailable.');
    }
}
