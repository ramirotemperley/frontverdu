// src/pages/Tickets.jsx
import React, { useContext } from 'react';
import { TicketsContext } from '../context/TicketsContext';
import { UsuariosContext } from '../context/UsuariosContext';
import { FormasPagoContext } from '../context/FormasPagoContext';
import './Tickets.css';

function Tickets() {
  const { tickets }           = useContext(TicketsContext);
  const { usuarios }          = useContext(UsuariosContext);
  const { formasPago }        = useContext(FormasPagoContext);

  /* ---------- utilidades ---------- */
  const nombreVendedor = (vendedorId) => {
    if (vendedorId == null) return '–';
    const v = usuarios.find(u => Number(u.id) === Number(vendedorId));
    return v ? v.nombre : '–';
  };

  const nombreFormaPago = (formaPagoId) => {
    if (formaPagoId == null) return '–';
    const fp = formasPago.find(f => Number(f.id) === Number(formaPagoId));
    return fp ? fp.nombre : '–';
  };

  const fechaLimpia = (f) => {
    const d = new Date(f);
    if (isNaN(d)) return '–';
    return d.toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false
    });
  };
  
  /* ---------- render ---------- */
  return (
    <div className="tickets">
      <h3 className="header-title">Historial de Ventas</h3>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Vendedor</th>
              <th>Total</th>
              <th>Forma de pago</th>
            </tr>
          </thead>

          <tbody>
          {[...tickets]
  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // ordenar por fecha DESC
  .slice(0, 10) // tomar los primeros 10 (ahora sí, los más recientes)
  .map(t => (
    <tr key={t.id}>
      <td>{t.id}</td>
      <td>{fechaLimpia(t.fecha)}</td>
      <td>{nombreVendedor(t.vendedorId)}</td>
      <td>${Number(t.totalVenta).toFixed(2)}</td>
      <td>{nombreFormaPago(t.formaPagoId)}</td>
    </tr>
))}

</tbody>

        </table>
      </div>
    </div>
  );
}

export default Tickets;
