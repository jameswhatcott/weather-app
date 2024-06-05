document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const cityInput = document.getElementById('search');
    const city = cityInput.value;

    console.log(`City: ${city}`);

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
        } else {
            console.log('No results found');
        }
    })
    .catch(error => {
        console.error('Error fetching geocode data:', error);
    });
}