import React, { createContext, useState, useEffect } from 'react';

export const UsuariosContext = createContext();

export const UsuariosProvider = ({ children }) => {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await fetch('http://localhost:4000/usuarios');
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const data = await response.json();
        setUsuarios(data);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        alert(error.message);
      }
    };

    fetchUsuarios();
  }, []);

  
const addUsuario = async (usuario) => {
  try {
    const response = await fetch('http://localhost:4000/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usuario),
    });

    if (!response.ok) { // Verificar si hay errores HTTP
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear usuario");
    }

    const newUsuario = await response.json();
    setUsuarios((prevUsuarios) => [...prevUsuarios, newUsuario]); // <- Sin .usuario
  } catch (error) {
    console.error('Error al agregar un usuario:', error);
    alert(error.message); // Mostrar error al usuario
  }
};

const deleteUsuario = async (id) => {
  try {
    const response = await fetch(`http://localhost:4000/usuarios/${id}`, { 
      method: 'DELETE' 
    });

    if (!response.ok) { // Si el servidor responde con error
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al eliminar usuario");
    }

    setUsuarios((prevUsuarios) => 
      prevUsuarios.filter((usuario) => usuario._id !== id)
    );
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