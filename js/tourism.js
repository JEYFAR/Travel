// ============================================
// tourism.js — OpenTripMap API
// ============================================

const Tourism = {

  API_KEY: '5ae2e3f221c38a28845f05b6ac3f23e1a1b17e4ae3b4f37bfb9d4e6e',

  async obtenerAtracciones(lat, lon, cantidad = 8) {
    // Primero obtenemos la lista de lugares
    const urlLista = `https://api.opentripmap.com/0.1/en/places/radius?radius=50000&lon=${lon}&lat=${lat}&kinds=interesting_places&limit=${cantidad}&format=json&apikey=${this.API_KEY}`;
    const resp = await fetch(urlLista);
    if (!resp.ok) throw new Error('Error al obtener atracciones');
    const lista = await resp.json();

    // Luego obtenemos detalles de cada lugar
    const detalles = await Promise.all(
      lista.slice(0, cantidad).map(lugar => this.obtenerDetalle(lugar.xid))
    );
    return detalles.filter(d => d && d.name);
  },

  async obtenerDetalle(xid) {
    try {
      const url = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${this.API_KEY}`;
      const resp = await fetch(url);
      const data = await resp.json();
      return data;
    } catch {
      return null;
    }
  },

  renderCard(atracciones, contenedor) {
    const imagenesDefault = [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=200&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=200&fit=crop',
    ];

    const items = atracciones.map((a, i) => {
      const imagen = a.preview?.source || imagenesDefault[i % imagenesDefault.length];
      const nombre = a.name || 'Lugar turístico';
      const categoria = a.kinds ? a.kinds.split(',')[0].replace(/_/g, ' ') : 'Atracción';
      const descripcion = a.wikipedia_extracts?.text
        ? a.wikipedia_extracts.text.substring(0, 100) + '...'
        : 'Lugar de interés turístico en este destino.';
      const xid = a.xid;
      const esFav = Storage.obtenerAtraccionesFav().some(f => f.xid === xid);

      return `
        <div class="atraccion-card">
          <img src="${imagen}" alt="${nombre}" onerror="this.src='${imagenesDefault[i % imagenesDefault.length]}'" />
          <div class="atrac-body">
            <div class="atrac-cat">${categoria}</div>
            <h4>${nombre}</h4>
            <p>${descripcion}</p>
            <button class="btn-fav ${esFav ? 'guardado' : ''}"
              onclick="Tourism.toggleFavAtraccion(this, '${xid}', '${nombre.replace(/'/g, "\\'")}', '${imagen}')">
              ${esFav ? '⭐ Guardado' : '☆ Favorito'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    contenedor.innerHTML = `
      <h3>🗺 Atracciones Turísticas</h3>
      <div class="atracciones-grid">${items}</div>
    `;
  },

  toggleFavAtraccion(btn, xid, nombre, imagen) {
    const favs = Storage.obtenerAtraccionesFav();
    if (favs.some(f => f.xid === xid)) {
      Storage.eliminarAtraccionFav(xid);
      btn.textContent = '☆ Favorito';
      btn.classList.remove('guardado');
    } else {
      Storage.agregarAtraccionFav({ xid, nombre, imagen });
      btn.textContent = '⭐ Guardado';
      btn.classList.add('guardado');
    }
    App.actualizarStats();
  }
};
