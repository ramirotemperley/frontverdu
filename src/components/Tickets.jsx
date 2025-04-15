import React, { useContext } from 'react';
import { TicketsContext } from '../context/TicketsContext';
import { UsuariosContext } from '../context/UsuariosContext';
import { FormasPagoContext } from '../context/FormasPagoContext';
import './Tickets.css';

function Tickets() {
  const { tickets } = useContext(TicketsContext);
  const { usuarios } = useContext(UsuariosContext);
  const { formasPago } = useContext(FormasPagoContext);

  // Función para buscar el nombre del vendedor a partir del vendedorId
  const getVendedorNombre = (vendedorId) => {
    const vendedor = usuarios.find(u => u.id === vendedorId);
    return vendedor ? vendedor.nombre : 'N/A';
  };

  // Función para buscar el nombre de la forma de pago a partir del formaPagoId
  const getFormaPagoNombre = (formaPagoId) => {
    const forma = formasPago.find(fp => fp.id === formaPagoId);
    return forma ? forma.nombre : '';
  };

  // Ayuda a formatear la fecha. Si la fecha no viene en un formato válido, podrías 
  // revisar el formato que retorna el backend o usar alguna librería (ej. date-fns o moment.js)
  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
  };

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
                <td>{ticket.fecha ? formatFecha(ticket.fecha) : 'N/A'}</td>
                <td>{getVendedorNombre(ticket.vendedorId)}</td>
                <td>${Number(ticket.totalVenta).toFixed(2)}</td>
                <td>{getFormaPagoNombre(ticket.formaPagoId)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Tickets;
