// ============================================
// weather.js — Open-Meteo API
// ============================================

const Weather = {

  // Códigos WMO de clima
  descripcionClima(codigo) {
    const codigos = {
      0: { desc: 'Despejado', icono: '☀️' },
      1: { desc: 'Mayormente despejado', icono: '🌤️' },
      2: { desc: 'Parcialmente nublado', icono: '⛅' },
      3: { desc: 'Nublado', icono: '☁️' },
      45: { desc: 'Niebla', icono: '🌫️' },
      48: { desc: 'Niebla con escarcha', icono: '🌫️' },
      51: { desc: 'Llovizna ligera', icono: '🌦️' },
      61: { desc: 'Lluvia ligera', icono: '🌧️' },
      63: { desc: 'Lluvia moderada', icono: '🌧️' },
      65: { desc: 'Lluvia intensa', icono: '🌧️' },
      71: { desc: 'Nieve ligera', icono: '🌨️' },
      80: { desc: 'Chubascos', icono: '🌦️' },
      95: { desc: 'Tormenta', icono: '⛈️' },
    };
    return codigos[codigo] || { desc: 'Variable', icono: '🌡️' };
  },

  async obtenerClima(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener clima');
    return await response.json();
  },

  renderCard(data, capital, contenedor) {
    const c = data.current;
    const clima = this.descripcionClima(c.weathercode);

    contenedor.innerHTML = `
      <h3>🌤 Clima en ${capital}</h3>
      <div class="weather-grid">
        <div class="weather-item">
          <span class="w-icon">${clima.icono}</span>
          <div>
            <div class="w-label">Estado</div>
            <div class="w-value">${clima.desc}</div>
          </div>
        </div>
        <div class="weather-item">
          <span class="w-icon">🌡️</span>
          <div>
            <div class="w-label">Temperatura</div>
            <div class="w-value">${c.temperature_2m}°C</div>
          </div>
        </div>
        <div class="weather-item">
          <span class="w-icon">💧</span>
          <div>
            <div class="w-label">Humedad</div>
            <div class="w-value">${c.relative_humidity_2m}%</div>
          </div>
        </div>
        <div class="weather-item">
          <span class="w-icon">💨</span>
          <div>
            <div class="w-label">Viento</div>
            <div class="w-value">${c.wind_speed_10m} km/h</div>
          </div>
        </div>
      </div>
    `;
  }
};
