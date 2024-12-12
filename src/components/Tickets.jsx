// Tickets.jsx
import React, { useContext } from 'react';
import { TicketsContext } from '../context/TicketsContext';
import './Tickets.css';

function Tickets() {
  const { tickets } = useContext(TicketsContext);

  return (
    <div className="tickets">
      <h3 className="header-title">Historial de Ventas</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Venta</th>
              <th>Fecha</th>
              <th>Vendedor</th>
              <th>Total</th>
              <th>Forma de Pago</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{new Date(ticket.fecha).toLocaleString()}</td>
                <td>{ticket.vendedor || 'N/A'}</td>
                <td>${ticket.total.toFixed(2)}</td>
                <td>{ticket.formaPago}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tickets;
