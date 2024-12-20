import React, { useState, useContext } from 'react';
import { ArticulosContext } from '../context/ArticulosContext';
import './GestionArticulos.css';

function GestionArticulos() {
  const { articulos, setArticulos } = useContext(ArticulosContext);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [modoEdicion, setModoEdicion] = useState(false);
  const [articuloEditado, setArticuloEditado] = useState(null);

  const agregarArticulo = () => {
    if (nombre && codigo) {
      setArticulos([...articulos, { codigo, nombre }]);
      setCodigo('');
      setNombre('');
    }
  };

  const eliminarArticulo = (codigo) => {
    setArticulos(articulos.filter((art) => art.codigo !== codigo));
  };

  const iniciarEdicion = (articulo) => {
    setModoEdicion(true);
    setArticuloEditado(articulo);
    setCodigo(articulo.codigo);
    setNombre(articulo.nombre);
  };

  const guardarEdicion = () => {
    setArticulos(
      articulos.map((art) =>
        art.codigo === articuloEditado.codigo ? { codigo, nombre } : art
      )
    );
    cancelarEdicion();
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
          <button onClick={agregarArticulo}>Agregar</button>
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
            <tr key={art.codigo}>
              <td>{art.codigo}</td>
              <td>{art.nombre}</td>
              <td>
                <button onClick={() => iniciarEdicion(art)}>Editar</button>
                <button onClick={() => eliminarArticulo(art.codigo)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionArticulos;