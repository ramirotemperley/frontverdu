import React, { useState, useContext } from 'react';
import { FormasPagoContext } from '../context/FormasPagoContext';
import './GestionFormasPago.css';

function GestionFormasPago() {
  const { formasPago, setFormasPago } = useContext(FormasPagoContext);
  const [formaPago, setFormaPago] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formaPagoEditada, setFormaPagoEditada] = useState(null);

  const agregarFormaPago = () => {
    if (formaPago) {
      setFormasPago([...formasPago, formaPago]);
      setFormaPago('');
    }
  };

  const eliminarFormaPago = (fp) => {
    setFormasPago(formasPago.filter((item) => item !== fp));
  };

  const iniciarEdicion = (fp) => {
    setModoEdicion(true);
    setFormaPagoEditada(fp);
    setFormaPago(fp);
  };

  const guardarEdicion = () => {
    setFormasPago(
      formasPago.map((fp) => (fp === formaPagoEditada ? formaPago : fp))
    );
    cancelarEdicion();
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setFormaPagoEditada(null);
    setFormaPago('');
  };

  return (
    <div className="gestion-formas-pago">
      <h2>Gestión de Formas de Pago</h2>
      <div className="form-formas-pago">
        <input
          type="text"
          placeholder="Forma de Pago"
          value={formaPago}
          onChange={(e) => setFormaPago(e.target.value)}
        />
        {modoEdicion ? (
          <>
            <button onClick={guardarEdicion}>Guardar</button>
            <button onClick={cancelarEdicion}>Cancelar</button>
          </>
        ) : (
          <button onClick={agregarFormaPago}>Agregar</button>
        )}
      </div>
      <ul>
        {formasPago.map((fp, index) => (
          <li key={index}>
            {fp}
            <button onClick={() => iniciarEdicion(fp)}>Editar</button>
            <button onClick={() => eliminarFormaPago(fp)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GestionFormasPago;
