import React, { useState, useEffect, useRef } from 'react';
import '../styles/ModalArticulos.css';

export default function ModalArticulos({ articulos, onClose, onSubmit }) {
  const [seleccionado, setSeleccionado] = useState(0);
  const [inputExpresion, setInputExpresion] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSeleccionado((prev) => Math.min(prev + 1, articulos.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSeleccionado((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        confirmar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [seleccionado, inputExpresion]);

  const confirmar = () => {
    const partes = inputExpresion.split('*');
    const precio = parseFloat(partes[0]) || 0;
    const cantidad = partes[1] ? parseFloat(partes[1]) : 1;
    onSubmit(articulos[seleccionado], precio, cantidad);
  };

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modal}>
        <h3>Seleccione artículo (↑↓) y escriba precio*cantidad</h3>

        <div style={styles.lista}>
          {articulos.map((a, i) => (
            <div
              key={a.id}
              style={{
                padding: '5px',
                background: i === seleccionado ? '#ddd' : '#fff',
                cursor: 'pointer',
              }}
              onClick={() => setSeleccionado(i)}
            >
              {a.nombre} ({a.categoria})
            </div>
          ))}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputExpresion}
          onChange={(e) => setInputExpresion(e.target.value)}
          placeholder="Ej: 1200*2"
          style={{ fontSize: '1.5em', marginTop: '10px', width: '100%' }}
        />

        <div style={{ marginTop: '10px' }}>
          <button onClick={onClose}>Cancelar</button>
          <button onClick={confirmar} disabled={!inputExpresion}>Agregar</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999
  },
  modal: {
    background: '#fff', padding: '20px', borderRadius: '10px',
    width: '400px', maxHeight: '80vh', overflowY: 'auto'
  },
  lista: {
    maxHeight: '200px', overflowY: 'auto', marginBottom: '10px'
  }
};
