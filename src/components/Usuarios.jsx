import React, { useState, useContext } from 'react';
import { UsuariosContext } from '../context/UsuariosContext';
import './Usuarios.css';

function Usuarios() {
  const { usuarios, addUsuario, deleteUsuario } = useContext(UsuariosContext);
  const [nuevoUsuario, setNuevoUsuario] = useState('');

  const handleAgregar = () => {
    const nombre = nuevoUsuario.trim();
    if (!nombre) {
      alert('Por favor, ingresá un nombre.');
      return;
    }
    if (usuarios.some(u => u.nombre === nombre)) { // <- Validar duplicados
      alert('¡Este nombre ya existe!');
      return;
    }
    addUsuario({ nombre });
    setNuevoUsuario('');
  };

  const handleEliminar = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      deleteUsuario(id);
    }
  };

  return (
    <div className="gestion-usuarios">
      <h2>Gestión de Vendedores</h2>
      <div className="form-usuarios">
        <input
          type="text"
          placeholder="Nombre del vendedor"
          value={nuevoUsuario}
          onChange={(e) => setNuevoUsuario(e.target.value)}
        />
        <button onClick={handleAgregar}>Agregar</button>
      </div>
      <ul>
        {usuarios?.map((usuario) => (
          // Validación doble: usuario existe y tiene _id + nombre
          usuario?._id && usuario?.nombre && (
            <li key={usuario._id}>
              {usuario.nombre}
              <button onClick={() => handleEliminar(usuario._id)}>Eliminar</button>
            </li>
          )
        ))}
      </ul>
    </div>
  );
}

export default Usuarios;