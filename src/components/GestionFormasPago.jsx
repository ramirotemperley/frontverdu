import React, { useState, useContext } from 'react';
import { FormasPagoContext } from '../context/FormasPagoContext';
import './GestionFormasPago.css';

function GestionFormasPago() {
  const { formasPago, addFormaPago, deleteFormaPago } = useContext(FormasPagoContext);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formaPagoEditada, setFormaPagoEditada] = useState(null);

  const handleAgregar = (e) => {
    e.preventDefault();
    if (!codigo.trim() || !nombre.trim()) {
      alert('Debes ingresar código y nombre');
      return;
    }
    addFormaPago(codigo.trim(), nombre.trim());
    setCodigo('');
    setNombre('');
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta forma de pago?')) {
      deleteFormaPago(id);
    }
  };

  // Ajusta la lógica de edición si es necesario para manejar ambos campos
  // ...

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
        {!modoEdicion ? (
          <button type="submit">Agregar</button>
        ) : (
          <>
            <button type="submit">Guardar</button>
            <button type="button" onClick={() => {
              setModoEdicion(false);
              setFormaPagoEditada(null);
              setCodigo('');
              setNombre('');
            }}>Cancelar</button>
          </>
        )}
      </form>
      <ul>
        {formasPago.map((fp) => (
          <li key={fp.id}>
            {fp.codigo} - {fp.nombre}
            {/* Aquí puedes agregar botones para editar y eliminar */}
            <button onClick={() => handleEliminar(fp.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GestionFormasPago;
