import React, { useState, useContext } from 'react';
import { UsuariosContext } from '../context/UsuariosContext';
import './Usuarios.css';

function Usuarios() {
  const { usuarios, setUsuarios } = useContext(UsuariosContext);
  const [nuevoUsuario, setNuevoUsuario] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditado, setUsuarioEditado] = useState(null);

  const agregarUsuario = () => {
    if (nuevoUsuario.trim()) {
      setUsuarios([...usuarios, nuevoUsuario.trim()]);
      setNuevoUsuario('');
    }
  };

  const eliminarUsuario = (usuario) => {
    setUsuarios(usuarios.filter((u) => u !== usuario));
  };

  const iniciarEdicion = (usuario) => {
    setModoEdicion(true);
    setUsuarioEditado(usuario);
    setNuevoUsuario(usuario);
  };

  const guardarEdicion = () => {
    setUsuarios(
      usuarios.map((u) => (u === usuarioEditado ? nuevoUsuario.trim() : u))
    );
    cancelarEdicion();
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setUsuarioEditado(null);
    setNuevoUsuario('');
  };

  return (
    <div className="gestion-usuarios">
      <h2>Gestión de Usuarios</h2>
      <div className="form-usuarios">
        <input
          type="text"
          placeholder="Nombre del Usuario"
          value={nuevoUsuario}
          onChange={(e) => setNuevoUsuario(e.target.value)}
        />
        {modoEdicion ? (
          <>
            <button onClick={guardarEdicion}>Guardar</button>
            <button onClick={cancelarEdicion}>Cancelar</button>
          </>
        ) : (
          <button onClick={agregarUsuario}>Agregar</button>
        )}
      </div>
      <ul>
        {usuarios.map((usuario, index) => (
          <li key={index}>
            {usuario}
            <button onClick={() => iniciarEdicion(usuario)}>Editar</button>
            <button onClick={() => eliminarUsuario(usuario)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Usuarios;
