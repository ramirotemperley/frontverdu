// ModalDescuento.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ModalDescuento.css';

function ModalDescuento({ onSubmit, onClose }) {
  const [monto, setMonto] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    // Al montarse el componente se fija el foco en el input
    if(inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const valor = parseFloat(monto);
    if (isNaN(valor) || valor <= 0) {
      alert('Por favor, ingrese un valor numérico positivo');
      return;
    }
    onSubmit(valor);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Restar monto</h3>
        <form onSubmit={handleSubmit}>
          <label>Ingrese el monto a restar:</label>
          <input
            type="number"
            ref={inputRef}  // Se utiliza ref para forzar el autoFocus
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            min="0"
            step="0.01"
            autoFocus  // También se puede agregar autoFocus
          />
          <div className="modal-buttons">
            <button type="submit">Aplicar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalDescuento;
