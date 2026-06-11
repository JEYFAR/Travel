// ============================================
// app.js — Lógica principal de la aplicación
// ============================================

const App = {

  paisActual: null,

  // ===== INICIALIZACIÓN =====
  init() {
    this.aplicarTema();
    this.verificarUsuario();
    this.configurarNavegacion();
    this.configurarBuscador();
    this.configurarTema();
    this.actualizarStats();
  },

  // ===== TEMA OSCURO / CLARO =====
  aplicarTema() {
    const tema = Storage.obtenerTema();
    document.getElementById('app-body').className = tema;
    document.getElementById('btn-tema').textContent = tema === 'dark' ? '☀️' : '🌙';
  },

  configurarTema() {
    document.getElementById('btn-tema').addEventListener('click', () => {
      const body = document.getElementById('app-body');
      const nuevoTema = body.className === 'light' ? 'dark' : 'light';
      body.className = nuevoTema;
      Storage.guardarTema(nuevoTema);
      document.getElementById('btn-tema').textContent = nuevoTema === 'dark' ? '☀️' : '🌙';
    });
  },

  // ===== REGISTRO / BIENVENIDA =====
  verificarUsuario() {
    const usuario = Storage.obtenerUsuario();
    if (!usuario) {
      document.getElementById('modal-registro').classList.remove('hidden');
      this.configurarFormRegistro();
    } else {
      document.getElementById('modal-registro').classList.add('hidden');
      this.mostrarBienvenida(usuario);
    }
  },

  configurarFormRegistro() {
    document.getElementById('form-registro').addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('reg-nombre').value.trim();
      const correo = document.getElementById('reg-correo').value.trim();
      const pais = document.getElementById('reg-pais').value.trim();

      // Validación
      let valido = true;
      if (!nombre) { document.getElementById('err-nombre').textContent = 'El nombre es obligatorio'; valido = false; }
      else document.getElementById('err-nombre').textContent = '';
      if (!correo || !correo.includes('@')) { document.getElementById('err-correo').textContent = 'Correo inválido'; valido = false; }
      else document.getElementById('err-correo').textContent = '';
      if (!pais) { document.getElementById('err-pais').textContent = 'El país es obligatorio'; valido = false; }
      else document.getElementById('err-pais').textContent = '';

      if (!valido) return;

      Storage.guardarUsuario({ nombre, correo, pais });
      document.getElementById('modal-registro').classList.add('hidden');
      this.mostrarBienvenida({ nombre, correo, pais });
    });
  },

  mostrarBienvenida(usuario) {
    const historial = Storage.obtenerHistorial();
    const saludo = historial.length > 0
      ? `¡Bienvenido nuevamente, ${usuario.nombre}! 👋`
      : `¡Hola, ${usuario.nombre}! 👋`;
    document.getElementById('bienvenida-msg').textContent = saludo;
    document.getElementById('nav-usuario').textContent = `👤 ${usuario.nombre}`;
  },

  // ===== NAVEGACIÓN =====
  configurarNavegacion() {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const seccion = link.dataset.section;
        this.mostrarSeccion(seccion);
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  },

  mostrarSeccion(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`section-${id}`).classList.add('active');

    if (id === 'favoritos') this.renderFavoritos();
    if (id === 'historial') this.renderHistorial();
    if (id === 'dashboard') this.actualizarStats();
  },

  // ===== BUSCADOR =====
  configurarBuscador() {
    const btnBuscar = document.getElementById('btn-buscar');
    const inputPais = document.getElementById('input-pais');

    btnBuscar.addEventListener('click', () => this.buscarPais());
    inputPais.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.buscarPais();
    });
  },

  async buscarPais() {
    const nombre = document.getElementById('input-pais').value.trim();
    const errDiv = document.getElementById('err-busqueda');

    if (!nombre) {
      errDiv.textContent = 'Escribe el nombre de un país';
      return;
    }
    errDiv.textContent = '';

    this.mostrarLoader(true);
    document.getElementById('resultados').classList.add('hidden');

    try {
      // 1. Información del país
      const pais = await Countries.buscarPais(nombre);
      this.paisActual = pais;

      const capital = pais.capital ? pais.capital[0] : pais.name.common;
      const lat = pais.capitalInfo?.latlng?.[0] || pais.latlng[0];
      const lon = pais.capitalInfo?.latlng?.[1] || pais.latlng[1];

      // Código de moneda
      const codigoMoneda = pais.currencies ? Object.keys(pais.currencies)[0] : 'USD';
      const nombreMoneda = pais.currencies
        ? Object.values(pais.currencies)[0].name
        : 'Dólar';

      // Renderizar info del país
      Countries.renderCard(pais, document.getElementById('card-pais'));

      // 2. Clima
      try {
        const clima = await Weather.obtenerClima(lat, lon);
        Weather.renderCard(clima, capital, document.getElementById('card-clima'));
      } catch {
        document.getElementById('card-clima').innerHTML = '<p style="color:var(--text2);padding:1rem">No se pudo cargar el clima.</p>';
      }

      // 3. Conversor de moneda
      Currency.renderCard(codigoMoneda, nombreMoneda, document.getElementById('card-moneda'));

      // 4. Atracciones turísticas
      try {
        const atracciones = await Tourism.obtenerAtracciones(lat, lon);
        Tourism.renderCard(atracciones, document.getElementById('card-atracciones'));
      } catch {
        document.getElementById('card-atracciones').innerHTML = '<p style="color:var(--text2);padding:1rem">No se pudieron cargar las atracciones.</p>';
      }

      // Guardar en historial
      Storage.agregarHistorial(pais.name.common);
      this.actualizarStats();

      // Mostrar resultados
      this.mostrarLoader(false);
      document.getElementById('resultados').classList.remove('hidden');

    } catch (error) {
      this.mostrarLoader(false);
      errDiv.textContent = 'País no encontrado. Intenta con otro nombre.';
    }
  },

  mostrarLoader(mostrar) {
    const loader = document.getElementById('loader');
    const btnBuscar = document.getElementById('btn-buscar');
    if (mostrar) {
      loader.classList.remove('hidden');
      btnBuscar.textContent = 'Buscando...';
      btnBuscar.disabled = true;
    } else {
      loader.classList.add('hidden');
      btnBuscar.textContent = 'Buscar';
      btnBuscar.disabled = false;
    }
  },

  // ===== FAVORITOS =====
  renderFavoritos() {
    // Países favoritos
    const favs = Storage.obtenerFavoritos();
    const divFavs = document.getElementById('lista-favoritos');
    if (favs.length === 0) {
      divFavs.innerHTML = '<p class="empty-msg">🌍 Aún no tienes destinos favoritos. ¡Busca un país y guárdalo!</p>';
    } else {
      divFavs.innerHTML = favs.map(f => `
        <div class="fav-card">
          <img src="${f.bandera}" alt="${f.nombre}" />
          <h4>${f.nombre}</h4>
          <button class="btn-danger" onclick="App.eliminarFavorito('${f.cca3}')">Eliminar</button>
        </div>
      `).join('');
    }

    // Atracciones favoritas
    const atracFavs = Storage.obtenerAtraccionesFav();
    const divAtrac = document.getElementById('lista-atracciones-fav');
    if (atracFavs.length === 0) {
      divAtrac.innerHTML = '<p class="empty-msg">⭐ Aún no tienes atracciones favoritas.</p>';
    } else {
      divAtrac.innerHTML = `<div class="atracciones-grid">${atracFavs.map(a => `
        <div class="atraccion-card">
          <img src="${a.imagen}" alt="${a.nombre}" />
          <div class="atrac-body">
            <h4>${a.nombre}</h4>
            <button class="btn-danger" onclick="App.eliminarAtraccionFav('${a.xid}')">Eliminar</button>
          </div>
        </div>
      `).join('')}</div>`;
    }
  },

  eliminarFavorito(cca3) {
    Storage.eliminarFavorito(cca3);
    this.renderFavoritos();
    this.actualizarStats();
  },

  eliminarAtraccionFav(xid) {
    Storage.eliminarAtraccionFav(xid);
    this.renderFavoritos();
    this.actualizarStats();
  },

  // ===== HISTORIAL =====
  renderHistorial() {
    const historial = Storage.obtenerHistorial();
    const div = document.getElementById('lista-historial');
    if (historial.length === 0) {
      div.innerHTML = '<p class="empty-msg">📋 Aún no has consultado ningún país.</p>';
    } else {
      div.innerHTML = historial.map(h => `
        <div class="historial-item">
          <span class="h-icon">🌍</span>
          <span class="h-pais">${h.pais}</span>
          <span class="h-fecha">${h.fecha} — ${h.hora}</span>
        </div>
      `).join('');
    }
  },

  // ===== ESTADÍSTICAS DASHBOARD =====
  actualizarStats() {
    const historial = Storage.obtenerHistorial();
    const favs = Storage.obtenerFavoritos();
    const atracFavs = Storage.obtenerAtraccionesFav();

    document.getElementById('stat-consultas').textContent = historial.length;
    document.getElementById('stat-favoritos').textContent = favs.length;
    document.getElementById('stat-atracciones').textContent = atracFavs.length;
  }
};

// ===== ARRANCAR APP =====
document.addEventListener('DOMContentLoaded', () => App.init());
