// ---------------------------------------------------------
// InformeVentas.jsx  – muestra totales, efectivo/crédito y
//                      total & conteo de ventas por empleado
// ---------------------------------------------------------
import React, { useState } from 'react';
import axios from 'axios';
import './InformeVentas.css';

const API_URL = 'http://192.168.0.102:4000/informes';

export default function InformeVentas() {
  /* filtros */
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [clave, setClave] = useState('');

  /* datos */
  const [datos, setDatos]     = useState(null);
  const [cargando, setCarga]  = useState(false);
  const [error, setError]     = useState('');

  const consultar = async () => {
    setError('');
    if (!desde || !hasta)   { setError('⚠️ Elegí ambas fechas'); return; }
    if (clave !== 'verdu123'){ setError('⚠️ Clave incorrecta');  return; }

    setCarga(true);
    try {
      const { data } = await axios.get(API_URL, { params: { desde, hasta, clave } });
      setDatos(data);
    } catch {
      setError('❌ No se pudo obtener el informe');
    } finally {
      setCarga(false);
    }
  };

  const fmt = n => Number(n).toLocaleString('es-AR');

  return (
    <div className="informe-wrap">
      <h2>📊 Informe de Ventas</h2>

      {/* filtros */}
      <div className="filtros">
        <input  type="date" value={desde} onChange={e => setDesde(e.target.value)} />
        <input  type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
        <input  type="password" placeholder="clave" value={clave} onChange={e => setClave(e.target.value)} />
        <button onClick={consultar}>Consultar</button>
      </div>

      {cargando && <p className="info">Cargando…</p>}
      {error    && <p className="error">{error}</p>}

      {datos && (
        <>
          {/* ───── totales globales ───── */}
          <div className="tarjetas">
            <article>
              <h4>Total $</h4>
              <p>${fmt(datos.total)}</p>
            </article>
            <article>
              <h4>Efectivo</h4>
              <p>${fmt(datos.efectivo)}</p>
            </article>
            <article>
              <h4>Crédito</h4>
              <p>${fmt(datos.credito)}</p>
            </article>
            <article>
              <h4># Ventas</h4>
              <p>{fmt(datos.cantVentas || 0)}</p>
            </article>
          </div>

          {/* ───── detalle por empleado ───── */}
          <h3>Por empleado</h3>
          {datos.empleados?.length ? (
            <div className="tabla-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Total $</th>
                    <th># Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {datos.empleados.map((e, i) => (
                    <tr key={i}>
                      <td>{e.nombre}</td>
                      <td>${fmt(e.total)}</td>
                      <td>{fmt(e.ventas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No hubo ventas en ese rango.</p>
          )}
        </>
      )}
    </div>
  );
}
