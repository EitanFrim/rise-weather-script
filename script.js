(function() {
    const apiKey = '390d1e94306741efa47155236240806'; // Replace with your WeatherAPI key
    const geoApiUrl = 'http://api.weatherapi.com/v1/search.json';
    const weatherApiUrl = 'http://api.weatherapi.com/v1/forecast.json';

    function createWeatherDiv(containerId) {
        const container = containerId ? document.getElementById(containerId) : document.body;
        const weatherDiv = document.createElement('div');
        weatherDiv.id = 'weather-widget';
        weatherDiv.innerHTML = `
            <div>
                <label for="location">Enter city name or coordinates (lat,lon): </label>
                <input type="text" id="location" placeholder="City or lat,lon">
                <button id="getWeatherBtn">Get Weather</button>
            </div>
            <div id="weatherResults"></div>
        `;
        container.appendChild(weatherDiv);

        document.getElementById('getWeatherBtn').addEventListener('click', getWeather);
    }

    function getWeather() {
        const location = document.getElementById('location').value.trim();
        if (!location) {
            alert('Please enter a city name or coordinates.');
            return;
        }

        const isCoordinates = location.includes(',');
        if (isCoordinates) {
            const [lat, lon] = location.split(',');
            if (!lat || !lon) {
                alert('Please enter valid coordinates in the format lat,lon.');
                return;
            }
            fetchWeatherByCoordinates(lat, lon);
        } else {
            fetchCoordinatesByCityName(location);
        }
    }

    function fetchCoordinatesByCityName(cityName) {
        const query = `key=${apiKey}&q=${cityName}`;

        fetch(`${geoApiUrl}?${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    alert('City not found. Please enter a valid city name.');
                    return;
                }
                const { lat, lon } = data[0];
                fetchWeatherByCoordinates(lat, lon);
            })
            .catch(error => console.error('Error fetching coordinates:', error));
    }

    function fetchWeatherByCoordinates(lat, lon) {
        const query = `key=${apiKey}&q=${lat},${lon}&days=14`;

        fetch(`${weatherApiUrl}?${query}`)
            .then(response => response.json())
            .then(data => displayWeather(data))
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function displayWeather(data) {
        if (!data || !data.forecast || !data.forecast.forecastday) {
            alert('Error fetching weather data. Please try again.');
            return;
        }

        const weatherResults = document.getElementById('weatherResults');
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const tempsByDay = {};

        data.forecast.forecastday.forEach(item => {
            const date = new Date(item.date);
            const day = daysOfWeek[date.getUTCDay()];
            if (!tempsByDay[day]) {
                tempsByDay[day] = [];
            }
            tempsByDay[day].push(item.day.avgtemp_c);
        });

        weatherResults.innerHTML = '<h3>Average Temperatures for the Next 2 Weeks:</h3>';
        const resultTable = document.createElement('table');
        resultTable.innerHTML = '<tr><th>Day</th><th>Average Temperature (°C)</th></tr>';

        Object.keys(tempsByDay).forEach(day => {
            const avgTemp = (tempsByDay[day].reduce((sum, temp) => sum + temp, 0) / tempsByDay[day].length).toFixed(2);
            resultTable.innerHTML += `<tr><td>${day}</td><td>${avgTemp}</td></tr>`;
        });

        weatherResults.appendChild(resultTable);
    }

    window.createWeatherDiv = createWeatherDiv;
})();