// ============================================
// tourism.js — OpenTripMap API
// ============================================

const Tourism = {

  API_KEY: '5ae2e3f221c38a28845f05b69aaaeb75508672e665468460818f4ff5',

  async obtenerAtracciones(lat, lon, cantidad = 8, nombrePais = '') {
    try {
      // Primero obtenemos la lista de lugares
      const urlLista = `https://api.opentripmap.com/0.1/en/places/radius?radius=50000&lon=${lon}&lat=${lat}&kinds=interesting_places&limit=${cantidad}&format=json&apikey=${this.API_KEY}`;
      const resp = await fetch(urlLista);
      if (!resp.ok) throw new Error('Error al obtener atracciones');
      const lista = await resp.json();

      // Luego obtenemos detalles de cada lugar
      const detalles = await Promise.all(
        lista.slice(0, cantidad).map(lugar => this.obtenerDetalle(lugar.xid))
      );
      const res = detalles.filter(d => d && d.name);
      if (res.length > 0) return res;
      throw new Error('Sin atracciones');
    } catch (e) {
      console.warn("OpenTripMap API failed or unauthorized. Using local fallback.");
      return this.obtenerAtraccionesMock(lat, lon, cantidad, nombrePais);
    }
  },

  obtenerAtraccionesMock(lat, lon, cantidad, nombrePais = 'Destino') {
    // Si estamos en Colombia (lat alrededor de 4.71, lon alrededor de -74.07)
    if (nombrePais.toLowerCase() === 'colombia' || (Math.abs(lat - 4.71) < 5 && Math.abs(lon - (-74.07)) < 5)) {
      return [
        {
          name: "Museo del Oro",
          kinds: "Museums",
          preview: { source: "https://images.unsplash.com/photo-1590073844006-33379778ae09?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El Museo del Oro en Bogotá expone la colección de orfebrería prehispánica más grande del mundo, con fascinantes piezas de oro y alfarería." },
          xid: "mock_oro"
        },
        {
          name: "Cerro de Monserrate",
          kinds: "Natural places, viewpoints",
          preview: { source: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El cerro de Monserrate es el más conocido de los cerros Orientales de Bogotá. Tiene una altitud de 3152 m y alberga un santuario católico con vistas espectaculares." },
          xid: "mock_monserrate"
        },
        {
          name: "La Candelaria",
          kinds: "Historic places",
          preview: { source: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "La Candelaria es el corazón histórico y cultural de Bogotá. Cuenta con hermosas calles empedradas y arquitectura colonial colorida." },
          xid: "mock_candelaria"
        },
        {
          name: "Catedral de Sal de Zipaquirá",
          kinds: "Architectural landmarks",
          preview: { source: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "La Catedral de Sal es un recinto construido en el interior de las minas de sal de Zipaquirá, considerada una joya arquitectónica y religiosa única." },
          xid: "mock_zipaquira"
        },
        {
          name: "Parque Nacional Natural Tayrona",
          kinds: "Natural reserves, beaches",
          preview: { source: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El Parque Tayrona es un área protegida en el Caribe colombiano, conocida por sus calas bordeadas de palmeras, selvas tropicales y abundante biodiversidad." },
          xid: "mock_tayrona"
        }
      ];
    }
    // Si estamos en Japón (Tokio: lat 35.67, lon 139.65)
    if (Math.abs(lat - 35.67) < 5 && Math.abs(lon - 139.65) < 5) {
      return [
        {
          name: "Templo Senso-ji",
          kinds: "Temples",
          preview: { source: "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "Sensō-ji es un templo budista antiguo localizado en Asakusa, Tokio. Es el templo más antiguo y uno de los más significativos de la ciudad." },
          xid: "mock_sensoji"
        },
        {
          name: "Monte Fuji",
          kinds: "Natural places",
          preview: { source: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El monte Fuji es el pico más alto de la isla de Honshū y de todo Japón. Es un símbolo icónico de gran belleza natural." },
          xid: "mock_fuji"
        },
        {
          name: "Santuario Meiji",
          kinds: "Historic shrines",
          preview: { source: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El Santuario Meiji es un templo sintoísta dedicado a los espíritus deificados del Emperador Meiji y su esposa, situado en un hermoso bosque en medio de Tokio." },
          xid: "mock_meiji"
        },
        {
          name: "Kinkaku-ji (Pabellón de Oro)",
          kinds: "Temples, historic places",
          preview: { source: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "Kinkaku-ji es un templo zen en Kioto cuyo nombre oficial es Rokuon-ji. Las dos plantas superiores están completamente recubiertas con pan de oro." },
          xid: "mock_kinkakuji"
        },
        {
          name: "Parque de Nara",
          kinds: "Parks, natural places",
          preview: { source: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "Un gran parque público situado en la ciudad de Nara, famoso por sus templos históricos y los cientos de ciervos sika que deambulan libremente." },
          xid: "mock_narapark"
        }
      ];
    }
    // Si estamos en Francia (París: lat 48.85, lon 2.35)
    if (Math.abs(lat - 48.85) < 5 && Math.abs(lon - 2.35) < 5) {
      return [
        {
          name: "Torre Eiffel",
          kinds: "Monuments",
          preview: { source: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "La Torre Eiffel es una estructura de hierro construida para la Exposición Universal de 1889 en París. Es el monumento cobrado más visitado del mundo." },
          xid: "mock_eiffel"
        },
        {
          name: "Museo del Louvre",
          kinds: "Museums",
          preview: { source: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El Museo del Louvre es el museo de arte más grande del mundo y un monumento histórico en París, hogar de la famosa Gioconda." },
          xid: "mock_louvre"
        },
        {
          name: "Catedral de Notre Dame",
          kinds: "Churches",
          preview: { source: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "Notre-Dame de París es una catedral de culto católico, sede de la archidiócesis de París y una de las joyas más importantes del arte gótico." },
          xid: "mock_notredame"
        },
        {
          name: "Palacio de Versalles",
          kinds: "Castles, historic places",
          preview: { source: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El Palacio de Versalles es un imponente edificio que funcionó como residencia real en siglos pasados. Es famoso por su arquitectura barroca y sus espectaculares jardines." },
          xid: "mock_versailles"
        },
        {
          name: "Arco del Triunfo",
          kinds: "Monuments, historic places",
          preview: { source: "https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400&h=200&fit=crop" },
          wikipedia_extracts: { text: "El Arco del Triunfo es uno de los monumentos más famosos de París. Se encuentra en la plaza Charles de Gaulle, en el extremo occidental de la avenida de los Campos Elíseos." },
          xid: "mock_arc"
        }
      ];
    }
    // Genérico para cualquier otra coordenada
    return [
      {
        name: `Plaza Principal de ${nombrePais}`,
        kinds: "Historic places",
        preview: { source: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop" },
        wikipedia_extracts: { text: `El corazón cultural e histórico de ${nombrePais}, con hermosos edificios antiguos y cafés al aire libre.` },
        xid: `mock_${nombrePais.toLowerCase().replace(/\s+/g, '_')}_plaza`
      },
      {
        name: `Reserva de Parque Natural de ${nombrePais}`,
        kinds: "Nature reserves",
        preview: { source: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&h=200&fit=crop" },
        wikipedia_extracts: { text: `Una hermosa reserva natural protegida en ${nombrePais} con vistas espectaculares, senderos y gran biodiversidad local.` },
        xid: `mock_${nombrePais.toLowerCase().replace(/\s+/g, '_')}_parque`
      },
      {
        name: `Museo Histórico de ${nombrePais}`,
        kinds: "Museums",
        preview: { source: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=400&h=200&fit=crop" },
        wikipedia_extracts: { text: `Fascinante museo en ${nombrePais} con colecciones que narran la rica historia y patrimonio de este destino.` },
        xid: `mock_${nombrePais.toLowerCase().replace(/\s+/g, '_')}_museo`
      },
      {
        name: `Mirador Panorámico de ${nombrePais}`,
        kinds: "Viewpoints",
        preview: { source: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=200&fit=crop" },
        wikipedia_extracts: { text: `Punto panorámico espectacular que ofrece las mejores vistas de la región en ${nombrePais} y sus paisajes.` },
        xid: `mock_${nombrePais.toLowerCase().replace(/\s+/g, '_')}_viewpoint`
      },
      {
        name: `Mercado Local de ${nombrePais}`,
        kinds: "Markets",
        preview: { source: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=200&fit=crop" },
        wikipedia_extracts: { text: `Colorido mercado en ${nombrePais} donde degustar comida típica y adquirir souvenirs tradicionales hechos a mano.` },
        xid: `mock_${nombrePais.toLowerCase().replace(/\s+/g, '_')}_market`
      }
    ];
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

  renderCard(atracciones, contenedor, nombrePais = 'Destino') {
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
              onclick="Tourism.toggleFavAtraccion(this, '${xid}', '${nombre.replace(/'/g, "\\'")}', '${imagen}', '${nombrePais.replace(/'/g, "\\'")}')">
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

  toggleFavAtraccion(btn, xid, nombre, imagen, nombrePais = 'Atracción') {
    const favs = Storage.obtenerAtraccionesFav();
    if (favs.some(f => f.xid === xid)) {
      Storage.eliminarAtraccionFav(xid);
      btn.textContent = '☆ Favorito';
      btn.classList.remove('guardado');
    } else {
      Storage.agregarAtraccionFav({ xid, nombre, imagen, pais: nombrePais });
      btn.textContent = '⭐ Guardado';
      btn.classList.add('guardado');
    }
    App.actualizarStats();
  }
};
