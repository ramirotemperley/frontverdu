// UsuariosContext.js
import React, { createContext, useState, useEffect } from 'react';

export const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://192.168.0.102:4000/usuarios');
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const data = await response.json();
        setUsuarios(data); // data será [{ id: 1, nombre: "Ramiro" }, ...]
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        alert(error.message);
      }
    };

    fetchUsuarios();
  }, []);

  const addUsuario = async (usuario) => {
    try {
      const response = await fetch('http://192.168.0.102:4000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear usuario");
      }

      const newUsuario = await response.json();
      // newUsuario tendrá { id: 123, nombre: "..." }
      setUsuarios((prev) => [...prev, newUsuario]);
    } catch (error) {
      console.error('Error al agregar un usuario:', error);
      alert(error.message);
    }
  };

  const deleteUsuario = async (id) => {
    try {
      const response = await fetch(`http://192.168.0.102:4000/usuarios/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar usuario");
      }

      setUsuarios((prev) => prev.filter((u) => u.id !== id));
    } catch (error) {
      console.error('Error al eliminar un usuario:', error);
      alert(error.message);
    }
  };

  return (
    <UsuariosContext.Provider value={{ usuarios, addUsuario, deleteUsuario }}>
      {children}
    </UsuariosContext.Provider>
  );
};
