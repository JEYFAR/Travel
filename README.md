# ✈️ Travel Planner Pro

Plataforma inteligente de planificación de viajes desarrollada con HTML5, CSS3 y JavaScript Vanilla.

## 👥 Integrantes
- Ricardo Jesús Cudriz González
- Jesús David Ayala Noche
- Steven Manuel Yépez Navarro

## 🚀 Funcionalidades
- Registro de viajero con LocalStorage
- Buscador de países del mundo
- Información general del país (REST Countries API)
- Clima actual del destino (Open-Meteo API)
- Conversor de moneda (Frankfurter API)
- Atracciones turísticas (OpenTripMap API)
- Destinos y atracciones favoritas
- Historial de consultas
- Modo oscuro / claro
- Dashboard con estadísticas
- Diseño responsive

## 🛠 Tecnologías
- HTML5 semántico
- CSS3 (Flexbox, Grid, Variables CSS, Media Queries)
- JavaScript ES6+ (Async/Await, Fetch API, LocalStorage)

## 📁 Estructura
```
TravelPlannerPro/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── countries.js
│   ├── weather.js
│   ├── currency.js
│   ├── tourism.js
│   └── storage.js
└── README.md
```

## 🌐 APIs utilizadas
| API | Uso | Notas de Robustez / Implementación |
|-----|-----|-----|
| REST Countries | Información general del país | Versión v5 con autenticación por token y diccionario de traducción español-inglés integrado. |
| Open-Meteo | Clima actual | Consulta directa mediante coordenadas geográficas en tiempo real. |
| ExchangeRate-API | Conversión de monedas | Reemplaza a Frankfurter para dar soporte total a todas las divisas globales (incluyendo COP, USD, EUR y GBP). |
| OpenTripMap | Atracciones turísticas | Implementada con un sistema de **degradación aceptable (Graceful Degradation)**: si la API no está disponible o la clave está inactiva, activa un fallback local que genera dinámicamente un mínimo de 5 atracciones turísticas detalladas, con fotos y descripciones únicas según el país consultado. |

## 🔗 Demo
[GitHub Pages](https://jeyfar.github.io/Travel/)
