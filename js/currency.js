// ============================================
// currency.js — Frankfurter API
// ============================================

const Currency = {

  codigoMoneda: 'USD', // moneda del país actual

  async convertir(cantidad, desde, hacia) {
    const url = `https://open.er-api.com/v6/latest/${desde}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error en conversión');
    const data = await response.json();
    const rate = data.rates[hacia];
    if (!rate) throw new Error('Moneda no soportada');
    return cantidad * rate;
  },

  renderCard(codigoMoneda, nombreMoneda, contenedor) {
    this.codigoMoneda = codigoMoneda;

    contenedor.innerHTML = `
      <h3>💱 Conversor de Moneda</h3>
      <p style="font-size:0.85rem;color:var(--text2);margin-bottom:1rem">
        Moneda del destino: <strong>${nombreMoneda} (${codigoMoneda})</strong>
      </p>
      <div class="currency-form">
        <div class="form-group">
          <label>Cantidad</label>
          <input type="number" id="currency-amount" value="100" min="1" style="padding:0.6rem 0.8rem;border:1.5px solid var(--border);border-radius:10px;font-size:0.9rem;background:var(--bg);color:var(--text);width:100%;font-family:'Inter',sans-serif;" />
        </div>
        <div class="form-group">
          <label>Desde</label>
          <select id="currency-from">
            <option value="USD">USD — Dólar</option>
            <option value="COP">COP — Peso colombiano</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — Libra esterlina</option>
          </select>
        </div>
        <button class="btn-primary" id="btn-convertir">Convertir</button>
      </div>
      <div id="currency-result">Ingresa una cantidad y presiona Convertir</div>
    `;

    document.getElementById('btn-convertir').addEventListener('click', async () => {
      const cantidad = document.getElementById('currency-amount').value;
      const desde = document.getElementById('currency-from').value;
      const hacia = this.codigoMoneda;
      const resultDiv = document.getElementById('currency-result');

      if (desde === hacia) {
        resultDiv.textContent = `${cantidad} ${desde} = ${cantidad} ${hacia}`;
        return;
      }

      resultDiv.textContent = 'Calculando...';
      try {
        const resultado = await this.convertir(cantidad, desde, hacia);
        resultDiv.textContent = `${cantidad} ${desde} = ${resultado.toLocaleString('es-CO', { maximumFractionDigits: 2 })} ${hacia}`;
      } catch {
        resultDiv.textContent = 'No se pudo convertir esta moneda.';
      }
    });
  }
};
