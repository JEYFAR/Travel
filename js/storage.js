// ============================================
// storage.js — Manejo de LocalStorage
// ============================================

const Storage = {

  // ===== USUARIO =====
  guardarUsuario(datos) {
    localStorage.setItem('tpp_usuario', JSON.stringify(datos));
  },

  obtenerUsuario() {
    const data = localStorage.getItem('tpp_usuario');
    return data ? JSON.parse(data) : null;
  },

  // ===== FAVORITOS (PAÍSES) =====
  obtenerFavoritos() {
    const data = localStorage.getItem('tpp_favoritos');
    return data ? JSON.parse(data) : [];
  },

  agregarFavorito(pais) {
    const favs = this.obtenerFavoritos();
    const existe = favs.find(f => f.cca3 === pais.cca3);
    if (!existe) {
      favs.push(pais);
      localStorage.setItem('tpp_favoritos', JSON.stringify(favs));
    }
  },

  eliminarFavorito(cca3) {
    const favs = this.obtenerFavoritos().filter(f => f.cca3 !== cca3);
    localStorage.setItem('tpp_favoritos', JSON.stringify(favs));
  },

  esFavorito(cca3) {
    return this.obtenerFavoritos().some(f => f.cca3 === cca3);
  },

  // ===== ATRACCIONES FAVORITAS =====
  obtenerAtraccionesFav() {
    const data = localStorage.getItem('tpp_atracciones_fav');
    return data ? JSON.parse(data) : [];
  },

  agregarAtraccionFav(atraccion) {
    const favs = this.obtenerAtraccionesFav();
    const existe = favs.find(a => a.xid === atraccion.xid);
    if (!existe) {
      favs.push(atraccion);
      localStorage.setItem('tpp_atracciones_fav', JSON.stringify(favs));
    }
  },

  eliminarAtraccionFav(xid) {
    const favs = this.obtenerAtraccionesFav().filter(a => a.xid !== xid);
    localStorage.setItem('tpp_atracciones_fav', JSON.stringify(favs));
  },

  // ===== HISTORIAL =====
  obtenerHistorial() {
    const data = localStorage.getItem('tpp_historial');
    return data ? JSON.parse(data) : [];
  },

  agregarHistorial(nombrePais) {
    const historial = this.obtenerHistorial();
    const ahora = new Date();
    historial.unshift({
      pais: nombrePais,
      fecha: ahora.toLocaleDateString('es-CO'),
      hora: ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    });
    // Máximo 50 entradas
    if (historial.length > 50) historial.pop();
    localStorage.setItem('tpp_historial', JSON.stringify(historial));
  },

  // ===== TEMA =====
  guardarTema(tema) {
    localStorage.setItem('tpp_tema', tema);
  },

  obtenerTema() {
    return localStorage.getItem('tpp_tema') || 'light';
  }
};
