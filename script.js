    const apiKey = '6193941a920a4247b39192318240307';
    const apiUrlForecast = 'https://api.weatherapi.com/v1/forecast.json';
    let useCelsius = true;

    const backgroundImages = {
        "Default": "url('https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg')"
    };

    async function fetchForecast(location) {
        try {
            const response = await fetch(`${apiUrlForecast}?key=${apiKey}&q=${location}&days=7`);
            if (!response.ok) {
                throw new Error('Weather forecast data not available');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            alert('Could not fetch weather data. Please try again later.');
            return null;
        }
    }

    function processForecastData(data) {
        return {
            current: {
                name: data.location.name,
                region: data.location.region,
                country: data.location.country,
                tempC: data.current.temp_c,
                tempF: data.current.temp_f,
                feelsLikeC: data.current.feelslike_c,
                feelsLikeF: data.current.feelslike_f,
                humidity: data.current.humidity,
                condition: data.current.condition.text,
                icon: data.current.condition.icon,
                windKph: data.current.wind_kph,
                windMph: data.current.wind_mph,
                precipitationProbability: data.current.precip_mm / 10,
            },
            hourly: data.forecast.forecastday[0].hour.map(hour => ({
                time: hour.time,
                tempC: hour.temp_c,
                tempF: hour.temp_f,
                feelsLikeC: hour.feelslike_c,
                feelsLikeF: hour.feelslike_f,
                humidity: hour.humidity,
                condition: hour.condition.text,
                icon: hour.condition.icon,
                windKph: hour.wind_kph,
                windMph: hour.wind_mph,
                precipitationProbability: hour.precip_mm / 10,
            })),
            daily: data.forecast.forecastday.map(day => ({
                date: day.date,
                maxTempC: day.day.maxtemp_c,
                maxTempF: day.day.maxtemp_f,
                minTempC: day.day.mintemp_c,
                minTempF: day.day.mintemp_f,
                feelsLikeMaxC: day.day.maxwind_kph,
                feelsLikeMaxF: day.day.maxwind_mph,
                humidity: day.day.avghumidity,
                condition: day.day.condition.text,
                icon: day.day.condition.icon,
                maxWindKph: day.day.maxwind_kph,
                maxWindMph: day.day.maxwind_mph,
                precipitationProbability: day.day.totalprecip_mm / 10,
            }))
        };
    }

    document.getElementById('locationForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const location = document.getElementById('locationInput').value;
        document.getElementById('loading').style.display = 'block';

        const forecastData = await fetchForecast(location);

        document.getElementById('loading').style.display = 'none';

        if (forecastData) {
            const forecast = processForecastData(forecastData);

            displayWeather(forecast.current);
            displayHourlyForecast(forecast.hourly);
            displayDailyForecast(forecast.daily);
            setBackgroundImage(forecast.current.condition);
        }
    });

    function displayWeather(weather) {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = currentDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const weatherDisplay = document.getElementById('weatherDisplay');
        weatherDisplay.innerHTML = `
            <div class="weather">
                <p class="weather-condition">${weather.condition}</p>
                <h2 class="weather-location">${weather.name}, ${weather.country}</h2>
                <p class="weather-date">${formattedDate}</p>
                <p class="weather-time">${formattedTime}</p>
                <div id="currentTemp" class="weather-temp" data-temp-c="${weather.tempC}" data-temp-f="${weather.tempF}">
                    ${useCelsius ? weather.tempC + ' °C' : weather.tempF + ' °F'}
                </div>
                <img src="${weather.icon}" alt="${weather.condition}" class="weather-icon">
            </div>
            
            <div id="weatherDetails" class="weather-details">
                <div id="feelsLike" class="weather-detail-item">
                    <div class="icon">
                        <i class="fas fa-temperature-high"></i>
                    </div>
                    <div class="weather-detail">
                        Feels like <span class="weather-feels-like" data-feels-like-c="${weather.feelsLikeC}" data-feels-like-f="${weather.feelsLikeF}">
                            ${useCelsius ? weather.feelsLikeC + ' °C' : weather.feelsLikeF + ' °F'}
                        </span>
                    </div>
                </div>
                    
                <div id="humidity" class="weather-detail-item">
                    <div class="icon">
                        <i class="fas fa-tint"></i>
                    </div>
                    <div class="weather-detail">
                        Humidity <span class="weather-humidity">${weather.humidity}%</span>
                    </div>
                </div>
                
                <div id="precipitation" class="weather-detail-item">
                    <div class="icon">
                        <i class="fas fa-cloud-showers-heavy"></i>
                    </div>
                    <div class="weather-detail">
                        Chance of Rain <span class="weather-precipitation">${weather.precipitationProbability.toFixed(1)}%</span>
                    </div>    
                </div>
                
                <div id="wind" class="weather-detail-item" data-wind-kph="${weather.windKph}" data-wind-mph="${weather.windMph}">
                    <div class="icon">
                        <i class="fas fa-wind"></i>
                    </div>
                    <div class="weather-detail">
                        Wind <span class="weather-wind">${useCelsius ? weather.windKph + ' km/h' : weather.windMph + ' mph'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function displayHourlyForecast(hourly) {
        const hourlyForecast = document.getElementById('hourlyForecast');
        hourlyForecast.innerHTML = ''; 

        hourly.forEach(hour => {
            const time = new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

            hourlyForecast.innerHTML += `
                <div class="hour forecast-item">
                    <h3 class="hour-time">${time}</h3>
                    <p class="hour-temp" data-temp-c="${hour.tempC}" data-temp-f="${hour.tempF}">
                        ${useCelsius ? `${hour.tempC} °C` : `${hour.tempF} °F`}
                    </p>
                    <img src="${hour.icon}" alt="${hour.condition}" class="hour-icon">
                </div>
            `;
        });
    }

    function displayDailyForecast(daily) {
        const dailyForecast = document.getElementById('dailyForecast');
        dailyForecast.innerHTML = ''; 

        daily.forEach(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

            dailyForecast.innerHTML += `
                <div class="day forecast-item">
                    <h3 class="day-name">${dayName}</h3>
                    <p class="day-temp">
                        <span class="max-temp" data-max-temp-c="${day.maxTempC}" data-max-temp-f="${day.maxTempF}">
                            ${useCelsius ? `${day.maxTempC} °C` : `${day.maxTempF} °F`}
                        </span>
                        <span class="min-temp" data-min-temp-c="${day.minTempC}" data-min-temp-f="${day.minTempF}">
                            ${useCelsius ? `${day.minTempC} °C` : `${day.minTempF} °F`}
                        </span>
                    </p>

                    <img src="${day.icon}" alt="${day.condition}" class="day-icon">
                </div>
            `;
        });
    }

    document.getElementById('toggleUnits').addEventListener('click', () => {
        useCelsius = !useCelsius;
        updateUnits();
        updateToggleUnitsButton();
    });

    function updateUnits() {
        updateTemperatureUnits();
        updateFeelsLikeUnits();
        updateWind();
        updatePrecipitationUnits();
    }

    function updateToggleUnitsButton() {
        const toggleButton = document.getElementById('toggleUnits');
        toggleButton.textContent = useCelsius ? '°C' : '°F';
        toggleButton.style.fontWeight = 'bold';
    }

    function updateTemperatureUnits() {
        const currentTempElement = document.getElementById('currentTemp');
        if (currentTempElement) {
            currentTempElement.textContent = useCelsius 
                ? `${currentTempElement.dataset.tempC} °C` 
                : `${currentTempElement.dataset.tempF} °F`;
        }

        document.querySelectorAll('.hour-temp').forEach(tempElement => {
            tempElement.textContent = useCelsius 
                ? `${tempElement.dataset.tempC} °C` 
                : `${tempElement.dataset.tempF} °F`;
        });

        document.querySelectorAll('.day-temp .max-temp').forEach(tempElement => {
            tempElement.textContent = useCelsius 
                ? `${tempElement.dataset.maxTempC} °C` 
                : `${tempElement.dataset.maxTempF} °F`;
        });

        document.querySelectorAll('.day-temp .min-temp').forEach(tempElement => {
            tempElement.textContent = useCelsius 
                ? `${tempElement.dataset.minTempC} °C` 
                : `${tempElement.dataset.minTempF} °F`;
        });
    }

    function updateFeelsLikeUnits() {
        const feelsLikeElements = document.querySelectorAll('[data-feels-like-c], [data-feels-like-f]');
        feelsLikeElements.forEach(element => {
            const feelsLikeCelsius = parseFloat(element.getAttribute('data-feels-like-c'));
            const feelsLikeFahrenheit = parseFloat(element.getAttribute('data-feels-like-f'));
            element.textContent = useCelsius
                ? `${feelsLikeCelsius} °C`
                : `${feelsLikeFahrenheit} °F`;
        });
    }

    function updateWind() {
        document.querySelectorAll('.weather-wind').forEach(element => {
            const parentElement = element.closest('.weather-detail-item');
            const windKph = parseFloat(parentElement.dataset.windKph);
            const windMph = parseFloat(parentElement.dataset.windMph);

            let windValue = 'N/A';
            if (!isNaN(windKph) && useCelsius) {
                windValue = `${windKph.toFixed(1)} km/h`;
            } else if (!isNaN(windMph) && !useCelsius) {
                windValue = `${windMph.toFixed(1)} mph`;
            }

            element.textContent = windValue;
        });
    }

    function updatePrecipitationUnits() {
        document.querySelectorAll('.weather-precipitation').forEach(element => {
            const precipitationProbability = parseFloat(element.textContent);
            element.textContent = `${precipitationProbability.toFixed(1)}%`;
        });
    }

    document.getElementById('toggleDaily').addEventListener('click', () => {
        document.getElementById('dailyForecast').style.display = 'flex';
        document.getElementById('hourlyForecast').style.display = 'none';
        setSelectedButton('toggleDaily');
    });

    document.getElementById('toggleHourly').addEventListener('click', () => {
        document.getElementById('dailyForecast').style.display = 'none';
        document.getElementById('hourlyForecast').style.display = 'flex';
        setSelectedButton('toggleHourly');
    });

    function setSelectedButton(buttonId) {
        document.getElementById('toggleDaily').classList.remove('selected-button');
        document.getElementById('toggleHourly').classList.remove('selected-button');
        
        document.getElementById(buttonId).classList.add('selected-button');

        const otherButtonId = buttonId === 'toggleDaily' ? 'toggleHourly' : 'toggleDaily';
        document.getElementById(otherButtonId).classList.add('unselected-button');
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const defaultLocation = 'Antalya, Turkey';
        document.getElementById('loading').style.display = 'block';

        const forecastData = await fetchForecast(defaultLocation);

        document.getElementById('loading').style.display = 'none';

        if (forecastData) {
            const forecast = processForecastData(forecastData);

            displayWeather(forecast.current);
            displayHourlyForecast(forecast.hourly);
            displayDailyForecast(forecast.daily);
            setBackgroundImage(forecast.current.condition);
        }

        document.getElementById('dailyForecast').style.display = 'flex';
        document.getElementById('hourlyForecast').style.display = 'none';
        setSelectedButton('toggleDaily');
        updateToggleUnitsButton();
    });

    function setBackgroundImage(condition) {
        const body = document.body;
        const imageUrl = backgroundImages[condition] || backgroundImages['Default'];
        body.style.backgroundImage = imageUrl;
        body.style.backgroundSize = 'cover';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.backgroundPosition = 'center';
        body.style.backgroundAttachment = 'fixed'; 
        body.style.border = '2px solid black'; 
    }