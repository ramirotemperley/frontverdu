import React, { createContext, useState, useEffect } from 'react';

export const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);

  // Obtener usuarios desde el backend
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:4000/usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    };

    fetchUsuarios();
  }, []);

  // Función para agregar un usuario
  const addUsuario = async (usuario) => {
    try {
      const response = await fetch('http://localhost:4000/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
      });

      const newUsuario = await response.json();
      setUsuarios((prevUsuarios) => [...prevUsuarios, newUsuario]);
    } catch (error) {
      console.error('Error al agregar un usuario:', error);
    }
  };

  // Función para eliminar un usuario
  const deleteUsuario = async (id) => {
    try {
      await fetch(`http://localhost:4000/usuarios/${id}`, {
        method: 'DELETE',
      });
      setUsuarios((prevUsuarios) =>
        prevUsuarios.filter((usuario) => usuario.id !== id)
      );
    } catch (error) {
      console.error('Error al eliminar un usuario:', error);
    }
  };

  return (
    <UsuariosContext.Provider value={{ usuarios, setUsuarios, addUsuario, deleteUsuario }}>
      {children}
    </UsuariosContext.Provider>
  );
};
