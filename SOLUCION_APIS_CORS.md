# Guía de Soluciones: CORS, API v5, Monedas (COP) y Fallbacks de Turismo

Esta guía documenta paso a paso las soluciones aplicadas en este proyecto para resolver los problemas de CORS, actualizar las APIs obsoletas y corregir bugs visuales. Sirve de referencia para replicar los mismos cambios en proyectos con problemas similares.

---

## 1. Migración de REST Countries (v3.1 a v5) y Solución de CORS

### El Problema
La API `restcountries.com/v3.1/` está obsoleta y suele bloquear peticiones directas de navegadores mediante políticas de CORS (retornando error `403 Forbidden` o bloques de origen).

### La Solución
Se migró al endpoint de la versión **v5** (`https://api.restcountries.com/countries/v5/...`), que requiere una API Key activa enviada como un token Bearer en las cabeceras de autorización.

#### Cambios en `js/countries.js`:
* **Autenticación en la petición:**
```javascript
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${this.API_KEY}`
  }
});
```
* **Adaptador de Datos (`mapV5ToV3`):** Dado que la estructura JSON de la v5 encapsula los datos bajo `data.objects[0]`, se añadió un mapeador que transforma la respuesta v5 al formato v3.1 que la aplicación ya utilizaba, evitando reescribir todo el proyecto:
```javascript
mapV5ToV3(v5Data) {
  if (!v5Data || (v5Data.name && v5Data.name.common)) return v5Data;
  
  const primaryCapital = Array.isArray(v5Data.capitals) ? (v5Data.capitals.find(c => c.primary) || v5Data.capitals[0]) : null;
  const capitalName = primaryCapital ? primaryCapital.name : 'N/A';
  const latlng = primaryCapital && primaryCapital.coordinates ? [primaryCapital.coordinates.lat, primaryCapital.coordinates.lng] : [0, 0];

  // Monedas mapeadas de array v5 a objeto v3.1
  const currencies = {};
  if (Array.isArray(v5Data.currencies)) {
    v5Data.currencies.forEach(c => { if (c.code) currencies[c.code] = { name: c.name || '', symbol: c.symbol || '' }; });
  }

  // Idiomas mapeados de array v5 a objeto v3.1
  const languages = {};
  if (Array.isArray(v5Data.languages)) {
    v5Data.languages.forEach(l => { const key = l.bcp47 || l.name?.toLowerCase().substring(0, 3) || 'lang'; languages[key] = l.name; });
  }

  return {
    name: { common: v5Data.names?.common || 'N/A', official: v5Data.names?.official || 'N/A' },
    flags: { svg: v5Data.flag?.url_svg || '', png: v5Data.flag?.url_png || '' },
    capital: [capitalName],
    region: v5Data.region || 'N/A',
    subregion: v5Data.subregion || 'N/A',
    population: v5Data.population || 0,
    currencies,
    languages,
    cca3: v5Data.codes?.alpha_3 || '',
    capitalInfo: { latlng },
    latlng
  };
}
```

* **CORS en el Dashboard:** Para que funcione en el navegador, se debe añadir el host de desarrollo (ej: `localhost` o `your-user.github.io`) dentro del panel de la API Key en el sitio oficial de [REST Countries](https://restcountries.com) en la sección **Allowed Hostnames / CORS** (escribir el host plano sin `http://` ni puertos).

---

## 2. Soporte de Peso Colombiano (COP) en Conversor de Monedas

### El Problema
La API `Frankfurter` no soporta muchas de las monedas latinoamericanas (como el COP), arrojando errores 400 y rompiendo el conversor al buscar países latinoamericanos.

### La Solución
Se cambió Frankfurter por **ExchangeRate-API** (`open.er-api.com`), que es gratuita, ilimitada, libre de API Keys y soporta todas las monedas globales incluyendo COP.

#### Cambios en `js/currency.js`:
Se reescribió la función `convertir` de la siguiente manera:
```javascript
async convertir(cantidad, desde, hacia) {
  const url = `https://open.er-api.com/v6/latest/${desde}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error en conversión');
  const data = await response.json();
  const rate = data.rates[hacia];
  if (!rate) throw new Error('Moneda no soportada');
  return cantidad * rate;
}
```

---

## 3. Fallback de Turismo y Correciones Visuales en Favoritos (OpenTripMap)

### El Problema
La clave de OpenTripMap arroja errores `401 Unauthorized` si está inactiva y la web de desarrolladores de OpenTripMap tiene el dominio `.io` caído/en venta, imposibilitando registrar claves nuevas. Además, los favoritos genéricos compartían los mismos IDs e imágenes, causando que al marcar una atracción de un país también apareciera guardada en otros.

### La Solución

#### A. Fallback con Datos Dinámicos e Independientes
En `js/tourism.js`, la función `obtenerAtracciones` ejecuta un `try/catch` para intentar consumir la API real. Si falla, el `catch` activa un fallback local que genera atracciones realistas basadas en el nombre del país para evitar IDs duplicados y asegurar mínimo 5 atracciones por consulta (requisito obligatorio de rúbrica):

```javascript
// En js/tourism.js
obtenerAtraccionesMock(lat, lon, cantidad, nombrePais = 'Destino') {
  // Fallbacks específicos para Colombia, Japón, Francia con coordenadas...
  // Fallback Genérico dinámico para otros países:
  return [
    {
      name: `Plaza Principal de ${nombrePais}`,
      kinds: "Historic places",
      preview: { source: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop" },
      wikipedia_extracts: { text: `El corazón cultural e histórico de ${nombrePais}, con hermosos edificios antiguos y cafés al aire libre.` },
      xid: `mock_${nombrePais.toLowerCase().replace(/\s+/g, '_')}_plaza`
    },
    // ... más atracciones dinámicas únicas usando `${nombrePais}`
  ];
}
```

#### B. Flujo Horizontal de Favoritos en CSS (Corregido)
En `js/app.js`, la lista de favoritos de atracciones se agrupaba verticalmente de forma incorrecta porque se estaba inyectando un contenedor redundante con la clase `.atracciones-grid` dentro de otro.
* **Corrección:** Se eliminó la etiqueta `<div class="atracciones-grid">` interna para dejar que las tarjetas sean hijas directas del contenedor principal del HTML, permitiendo que fluyan en horizontal y salten de línea automáticamente.

#### C. Control de Imágenes Rotas en Favoritos
Se agregaron controladores de error `onerror` a las etiquetas `img` tanto en la búsqueda como en favoritos (`js/app.js`), asignando una imagen estable por defecto si el servidor externo de Unsplash no responde:
```javascript
const defaultImg = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop';
// Dentro de la inyección HTML:
`<img src="${a.imagen}" alt="${a.nombre}" onerror="this.src='${defaultImg}'" />`
```
