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
        <span className="resumen-valor">{cantidadArticulos}</span>
      </div>
      <div className="resumen-item">
        <span className="resumen-label">Total:</span>
        <span className="resumen-valor">${totalAcumulado.toFixed(2)}</span>
      </div>
      <div className="resumen-item">
        <span className="resumen-label">Vendedor:</span>
        <select
          className="resumen-select"
          value={vendedorSeleccionado}
          onChange={(e) => setVendedorSeleccionado(e.target.value)}
        >
          <option value="">Seleccionar vendedor</option>
          {vendedores.map((vendedor) => (
            <option key={vendedor.id} value={vendedor.nombre}>
              {vendedor.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ResumenVenta;
