// ============================================
// countries.js — REST Countries API
// ============================================

const Countries = {

  async buscarPais(nombre) {
    const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(nombre)}?fullText=false`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('País no encontrado');
    const data = await response.json();
    return data[0];
  },

  renderCard(pais, contenedor) {
    const nombre = pais.name.common;
    const bandera = pais.flags.svg || pais.flags.png;
    const capital = pais.capital ? pais.capital[0] : 'N/A';
    const region = pais.region || 'N/A';
    const subregion = pais.subregion || 'N/A';
    const poblacion = pais.population.toLocaleString('es-CO');
    const monedas = pais.currencies
      ? Object.values(pais.currencies).map(m => `${m.name} (${m.symbol})`).join(', ')
      : 'N/A';
    const idiomas = pais.languages
      ? Object.values(pais.languages).join(', ')
      : 'N/A';
    const esFav = Storage.esFavorito(pais.cca3);

    contenedor.innerHTML = `
      <div class="country-header">
        <img class="flag" src="${bandera}" alt="Bandera de ${nombre}" />
        <div>
          <h3>${nombre}</h3>
          <span style="font-size:0.85rem;color:var(--text2)">${region} · ${subregion}</span>
        </div>
      </div>
      <div class="country-info">
        <div class="info-item">
          <span class="info-label">🏛 Capital</span>
          <span class="info-value">${capital}</span>
        </div>
        <div class="info-item">
          <span class="info-label">👥 Población</span>
          <span class="info-value">${poblacion}</span>
        </div>
        <div class="info-item">
          <span class="info-label">💰 Moneda</span>
          <span class="info-value">${monedas}</span>
        </div>
        <div class="info-item">
          <span class="info-label">🗣 Idioma</span>
          <span class="info-value">${idiomas}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-fav ${esFav ? 'guardado' : ''}" id="btn-guardar-fav">
          ${esFav ? '❤️ En favoritos' : '🤍 Guardar favorito'}
        </button>
      </div>
    `;

    // Botón favorito
    document.getElementById('btn-guardar-fav').addEventListener('click', () => {
      if (Storage.esFavorito(pais.cca3)) {
        Storage.eliminarFavorito(pais.cca3);
        document.getElementById('btn-guardar-fav').textContent = '🤍 Guardar favorito';
        document.getElementById('btn-guardar-fav').classList.remove('guardado');
      } else {
        Storage.agregarFavorito({ cca3: pais.cca3, nombre, bandera });
        document.getElementById('btn-guardar-fav').textContent = '❤️ En favoritos';
        document.getElementById('btn-guardar-fav').classList.add('guardado');
      }
      App.actualizarStats();
    });
  }
};
