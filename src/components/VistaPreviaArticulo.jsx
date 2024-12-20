// VistaPreviaArticulo.jsx
import React from 'react';
import './VistaPreviaArticulo.css'; // Asegúrate de tener tu CSS

const VistaPreviaArticulo = ({ seleccionado, precio, peso }) => {
  let subtotal = 0;
  let unidad = '-';

  const p = parseFloat(precio);
  if (!isNaN(p) && p > 0) {
    const pesoNumerico = parseFloat(peso);
    if (!isNaN(pesoNumerico) && pesoNumerico > 0) {
      let pesoEnKg;
      if (pesoNumerico >= 50) {
        pesoEnKg = pesoNumerico / 1000;
        unidad = 'g';
      } else {
        pesoEnKg = pesoNumerico;
        unidad = 'kg';
      }
      subtotal = p * pesoEnKg;
    } else {
      subtotal = p;
      unidad = '-';
    }
  } else {
    subtotal = 0;
    unidad = '-';
  }

  const formatoPeso = () => {
    const pesoNumerico = parseFloat(peso);
    if (!isNaN(pesoNumerico) && pesoNumerico > 0) {
      return pesoNumerico + ' ' + unidad;
    }
    return '-';
  };

  return (
    <div className="vista-previa-articulo-container">
      {seleccionado ? (
        <div>
          <p className="vista-previa-text">Producto: <span className="vista-previa-value">{seleccionado.nombre}</span></p>
          <p className="vista-previa-text">Precio: <span className="vista-previa-value">{precio || '-'}</span></p>
          <p className="vista-previa-text">Peso: <span className="vista-previa-value">{formatoPeso()}</span></p>
          <p className="vista-previa-text">Subtotal: <span className="vista-previa-value">{subtotal.toFixed(2)}</span></p>
        </div>
      ) : (
        <p className="vista-previa-text">No hay artículo seleccionado</p>
      )}
    </div>
  );
};

export default VistaPreviaArticulo;
