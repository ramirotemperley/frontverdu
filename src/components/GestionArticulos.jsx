import React, { useState, useContext } from 'react';
import { ArticulosContext } from '../context/ArticulosContext';
import './GestionArticulos.css';

function GestionArticulos() {
  const { articulos, setArticulos, agregarArticulo, eliminarArticulo } = useContext(ArticulosContext);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [articuloEditado, setArticuloEditado] = useState(null);

  const handleAgregar = () => {
    if (codigo.trim() && nombre.trim()) {
      agregarArticulo({ codigo, nombre });
      setCodigo('');
      setNombre('');
    } else {
      alert('Por favor, completá todos los campos.');
    }
  };

  const iniciarEdicion = (articulo) => {
    setModoEdicion(true);
    setArticuloEditado(articulo);
    setCodigo(articulo.codigo);
    setNombre(articulo.nombre);
  };

  const guardarEdicion = async () => {
    try {
      const response = await fetch(`http://localhost:4000/articulos/${articuloEditado._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo, nombre }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el artículo');
      }

      const articuloActualizado = await response.json();

      // Actualizar el estado con los cambios realizados
      setArticulos((prev) =>
        prev.map((art) => (art._id === articuloActualizado.articulo._id ? articuloActualizado.articulo : art))
      );

      cancelarEdicion();
    } catch (error) {
      console.error('Error al guardar la edición:', error);
    }
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setArticuloEditado(null);
    setCodigo('');
    setNombre('');
  };

  return (
    <div className="gestion-articulos">
      <h2>Gestión de Artículos</h2>
      <div className="form-articulos">
        <input
          type="text"
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        {modoEdicion ? (
          <>
            <button onClick={guardarEdicion}>Guardar</button>
            <button onClick={cancelarEdicion}>Cancelar</button>
          </>
        ) : (
          <button onClick={handleAgregar}>Agregar</button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map((art) => (
            <tr key={art._id}>
              <td>{art.codigo}</td>
              <td>{art.nombre}</td>
              <td>
                <button onClick={() => iniciarEdicion(art)}>Editar</button>
                <button onClick={() => eliminarArticulo(art._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionArticulos;
