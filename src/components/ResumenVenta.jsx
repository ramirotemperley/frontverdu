import React from 'react';
import './ResumenVenta.css';

const ResumenVenta = ({
  cantidadArticulos,
  totalAcumulado,
  vendedores,
  vendedorSeleccionado,
  setVendedorSeleccionado,
}) => {
  return (
    <div className="resumen-venta">
      <div className="resumen-item">
        <span className="resumen-label">Artículos:</span>
        <span className="resumen-value">{cantidadArticulos}</span>
      </div>
      <div className="resumen-item">
        <span className="resumen-label">Total:</span>
        <span className="resumen-value">${totalAcumulado.toFixed(2)}</span>
      </div>
      <div className="resumen-item">
        <span className="resumen-label">Vendedor:</span>
        <select
          className="resumen-select"
          value={vendedorSeleccionado}
          onChange={(e) => setVendedorSeleccionado(e.target.value)}
        >
          {vendedores.map((vendedor, index) => (
            <option key={index} value={vendedor}>
              {vendedor}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ResumenVenta;


