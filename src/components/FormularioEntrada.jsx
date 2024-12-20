import React from 'react';

function FormularioEntrada({
  busqueda,
  onBusquedaChange,
  onKeyDownBusqueda,
  articulosFiltrados,
  cursor,
  onSeleccionarArticulo,
  pasoActual,
  precio,
  onPrecioChange,
  peso,
  onPesoChange,
  seleccionado,
  total
}) {
  return (
    <div className="input-container">
      <input
        id="busqueda-input"
        type="text"
        placeholder="Código o nombre del artículo"
        value={busqueda}
        onChange={onBusquedaChange}
        onKeyDown={onKeyDownBusqueda}
        className="input"
        autoComplete="off"
      />
      {articulosFiltrados.length > 0 && (
        <ul className="dropdown">
          {articulosFiltrados.map((articulo, index) => (
            <li
              key={articulo.codigo + articulo.nombre}
              onClick={() => onSeleccionarArticulo(articulo)}
              className={`dropdown-item ${index === cursor ? 'selected' : ''}`}
            >
              {articulo.nombre}
            </li>
          ))}
        </ul>
      )}
      {pasoActual > 0 && (
        <div className="input-section">
          <div className="inputs">
            <input
              id="precio-input"
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => onPrecioChange(e.target.value)}
              className="input"
            />
            <input
              id="peso-input"
              type="number"
              placeholder="Peso"
              value={peso}
              onChange={(e) => onPesoChange(e.target.value)}
              className="input"
            />
          </div>
          {seleccionado && (
            <div className="preview-card">
              <p>
                <strong>Artículo:</strong> {seleccionado.nombre}
              </p>
              <p>
                <strong>Peso:</strong> {peso || '1 kg'}
              </p>
              <p>
                <strong>Total:</strong> ${total.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FormularioEntrada;
