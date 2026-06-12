// ============================================
// countries.js — REST Countries API
// ============================================

const Countries = {

  API_KEY: 'rc_live_80b87eff21c04f3e9fffc72cda9c8d5d',

  // Mapeador de nombres en español a inglés para facilitar la búsqueda en la API v5
  traducirPais(nombre) {
    const diccionario = {
      "japon": "Japan",
      "japón": "Japan",
      "francia": "France",
      "brasil": "Brazil",
      "alemania": "Germany",
      "españa": "Spain",
      "espana": "Spain",
      "estados unidos": "United States",
      "eeuu": "United States",
      "ee.uu.": "United States",
      "reino unido": "United Kingdom",
      "italia": "Italy",
      "belgica": "Belgium",
      "bélgica": "Belgium",
      "suecia": "Sweden",
      "suiza": "Switzerland",
      "rusia": "Russia",
      "china": "China",
      "colombia": "Colombia",
      "mexico": "Mexico",
      "méxico": "Mexico",
      "argentina": "Argentina",
      "chile": "Chile",
      "peru": "Peru",
      "perú": "Peru",
      "ecuador": "Ecuador",
      "venezuela": "Venezuela",
      "canada": "Canada",
      "canadá": "Canada"
    };
    const key = nombre.toLowerCase().trim();
    return diccionario[key] || nombre;
  },

  async buscarPais(nombre) {
    const nombreEnIngles = this.traducirPais(nombre);
    const url = `https://api.restcountries.com/countries/v5/names.common/${encodeURIComponent(nombreEnIngles)}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`
      }
    });
    
    if (!response.ok) throw new Error('País no encontrado');
    const responseData = await response.json();
    const rawCountry = responseData.data?.objects?.[0] || (Array.isArray(responseData.data) ? responseData.data[0] : responseData.data);
    if (!rawCountry) throw new Error('País no encontrado');
    
    return this.mapV5ToV3(rawCountry);
  },

  mapV5ToV3(v5Data) {
    if (!v5Data) return null;
    
    // Si ya tiene el formato v3.1, retornarlo
    if (v5Data.name && v5Data.name.common) return v5Data;

    // Mapear capitales
    const primaryCapital = Array.isArray(v5Data.capitals)
      ? (v5Data.capitals.find(c => c.primary) || v5Data.capitals[0])
      : null;
    const capitalName = primaryCapital ? primaryCapital.name : 'N/A';
    const latlng = primaryCapital && primaryCapital.coordinates
      ? [primaryCapital.coordinates.lat, primaryCapital.coordinates.lng]
      : [0, 0];

    // Mapear monedas
    const currencies = {};
    if (Array.isArray(v5Data.currencies)) {
      v5Data.currencies.forEach(c => {
        if (c.code) {
          currencies[c.code] = {
            name: c.name || '',
            symbol: c.symbol || ''
          };
        }
      });
    }

    // Mapear idiomas
    const languages = {};
    if (Array.isArray(v5Data.languages)) {
      v5Data.languages.forEach(l => {
        const key = l.bcp47 || l.name?.toLowerCase().substring(0, 3) || 'lang';
        languages[key] = l.name;
      });
    }

    return {
      name: {
        common: v5Data.names?.common || 'N/A',
        official: v5Data.names?.official || 'N/A'
      },
      flags: {
        svg: v5Data.flag?.url_svg || '',
        png: v5Data.flag?.url_png || ''
      },
      capital: [capitalName],
      region: v5Data.region || 'N/A',
      subregion: v5Data.subregion || 'N/A',
      population: v5Data.population || 0,
      currencies: currencies,
      languages: languages,
      cca3: v5Data.codes?.alpha_3 || '',
      capitalInfo: {
        latlng: latlng
      },
      latlng: latlng
    };
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
