import React, { useState, useEffect, useRef } from 'react';
import '../styles/ModalArticulos.css';

const t9Map = {
  '1': ['.'],
  '2': ['a', 'b', 'c'],
  '3': ['d', 'e', 'f'],
  '4': ['g', 'h', 'i'],
  '5': ['j', 'k', 'l'],
  '6': ['m', 'n', 'o'],
  '7': ['p', 'q', 'r', 's'],
  '8': ['t', 'u', 'v'],
  '9': ['w', 'x', 'y', 'z'],
  '0': [' '],
};

export default function ModalArticulos({ articulos, onClose, onSubmit }) {
  const [seleccionado, setSeleccionado] = useState(0);
  const [modo, setModo] = useState('busqueda');
  const [busqueda, setBusqueda] = useState('');
  const [coincidencias, setCoincidencias] = useState(articulos);
  const [inputPrecio, setInputPrecio] = useState('');
  const inputRef = useRef(null);
  const precioRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [modo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modo === 'busqueda') {
        if (e.key === '+') {
          e.preventDefault();
          setSeleccionado((prev) => Math.min(prev + 1, coincidencias.length - 1));
        } else if (e.key === '-') {
          e.preventDefault();
          setSeleccionado((prev) => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (coincidencias[seleccionado]) {
            setModo('precio');
            setTimeout(() => precioRef.current?.focus(), 100);
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          setBusqueda((prev) => prev.slice(0, -1));
        } else if (t9Map[e.key]) {
          e.preventDefault();
          setBusqueda((prev) => prev + e.key);
        }
      } else if (modo === 'precio') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const partes = inputPrecio.split('*');
          const precio = parseFloat(partes[0]) || 0;
          const cantidad = partes[1] ? parseFloat(partes[1]) : 1;
          onSubmit(coincidencias[seleccionado], precio, cantidad);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setModo('busqueda');
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modo, coincidencias, seleccionado, inputPrecio]);

  useEffect(() => {
    if (busqueda === '') {
      setCoincidencias(articulos);
    } else {
      const letras = busqueda.split('').flatMap(digito => t9Map[digito] || []);
      const regex = new RegExp('[' + letras.join('') + ']', 'i');
      const filtrados = articulos.filter(a => regex.test(a.nombre));
      setCoincidencias(filtrados);
      setSeleccionado(0);
    }
  }, [busqueda, articulos]);

  return (
    <div className="modal-overlay" style={styles.overlay}>
      <div className="modal-content" style={styles.modal}>
        <h3>Buscar artículo (teclado numérico tipo T9)</h3>

        {modo === 'busqueda' ? (
          <>
            <input
              ref={inputRef}
              type="text"
              value={busqueda}
              readOnly
              style={styles.inputBusqueda}
              placeholder="Usa el teclado numérico"
            />
            <div style={styles.lista}>
              {coincidencias.map((a, i) => (
                <div
                  key={a.id}
                  style={{
                    padding: '5px',
                    background: i === seleccionado ? '#ddd' : '#fff',
                    fontWeight: i === seleccionado ? 'bold' : 'normal',
                    cursor: 'pointer'
                  }}
                >
                  {a.nombre} ({a.categoria})
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
              {coincidencias[seleccionado]?.nombre} ({coincidencias[seleccionado]?.categoria})
            </div>
            <input
              ref={precioRef}
              type="text"
              value={inputPrecio}
              onChange={(e) => setInputPrecio(e.target.value)}
              placeholder="Ej: 1200*2"
              style={styles.inputPrecio}
            />
          </>
        )}

        <div style={{ marginTop: '10px' }}>
          <button onClick={onClose}>Cancelar</button>
          <button
            onClick={() => {
              const partes = inputPrecio.split('*');
              const precio = parseFloat(partes[0]) || 0;
              const cantidad = partes[1] ? parseFloat(partes[1]) : 1;
              onSubmit(coincidencias[seleccionado], precio, cantidad);
            }}
            disabled={modo === 'busqueda'}
          >
            Agregar
          </button>
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
    maxHeight: '200px', overflowY: 'auto', marginTop: '10px'
  },
  inputBusqueda: {
    fontSize: '1.5em', marginBottom: '10px', width: '100%', textAlign: 'center'
  },
  inputPrecio: {
    fontSize: '1.5em', marginTop: '10px', width: '100%'
  }
};