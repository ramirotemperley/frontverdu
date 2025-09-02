import React, { useState, useContext } from 'react';
import { FormasPagoContext } from '../context/FormasPagoContext';
import './GestionFormasPago.css';

function GestionFormasPago() {
  const { formasPago, setFormasPago, addFormaPago, deleteFormaPago } = useContext(FormasPagoContext);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formaPagoEditada, setFormaPagoEditada] = useState(null);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) {
      alert('Debes ingresar código y nombre.');
      return;
    }
    if (modoEdicion) {
      handleGuardarEdicion();
    } else {
      addFormaPago(codigo.trim(), nombre.trim());
      setCodigo('');
      setNombre('');
    }
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta forma de pago?')) {
      deleteFormaPago(id);
    }
  };

  const iniciarEdicion = (formaPago) => {
    setModoEdicion(true);
    setFormaPagoEditada(formaPago);
    setCodigo(formaPago.codigo);
    setNombre(formaPago.nombre);
  };

  const handleGuardarEdicion = async () => {
    try {
      const response = await fetch(`http://192.168.0.102:4000/formas-pago/${formaPagoEditada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo, nombre }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la forma de pago');
      }

      const formaPagoActualizada = await response.json();

      // Actualizar el estado local con la forma de pago editada
      setFormasPago((prevFormasPago) =>
        prevFormasPago.map((fp) =>
          fp.id === formaPagoActualizada.formaPago.id ? formaPagoActualizada.formaPago : fp
        )
      );

      cancelarEdicion();
    } catch (error) {
      console.error('Error al guardar la edición:', error);
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setFormaPagoEditada(null);
    setCodigo('');
    setNombre('');
  };

  return (
    <div className="gestion-formas-pago">
      <h2>Gestión de Formas de Pago</h2>
      <form className="form-formas-pago" onSubmit={handleAgregar}>
        <input
          type="text"
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre de la forma de pago"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button type="submit">{modoEdicion ? 'Guardar' : 'Agregar'}</button>
        {modoEdicion && (
          <button type="button" onClick={cancelarEdicion}>
            Cancelar
          </button>
        )}
      </form>
      <ul>
        {formasPago.map((fp) => (
          <li key={fp.id}>
            {fp.codigo} - {fp.nombre}
            <button onClick={() => iniciarEdicion(fp)}>Editar</button>
            <button onClick={() => handleEliminar(fp.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GestionFormasPago;
