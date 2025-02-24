// context/ArticulosContext.js
import React, { createContext, useState, useEffect } from 'react';

// Creamos el contexto
export const ArticulosContext = createContext();

// Creamos el Provider que envolverá tus componentes
export const ArticulosProvider = ({ children }) => {
  const [articulos, setArticulos] = useState([]);

  // 1. Cargar artículos al montar el contexto
  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        const response = await fetch('http://localhost:4000/articulos');
        if (!response.ok) {
          throw new Error('Error al cargar los artículos');
        }
        const data = await response.json();
        // data debería ser un array de objetos con { id, codigo, nombre }
        setArticulos(data);
      } catch (error) {
        console.error('Error al cargar los artículos:', error);
      }
    };

    fetchArticulos();
  }, []);

  // 2. Agregar un artículo
  const agregarArticulo = async ({ codigo, nombre }) => {
    try {
      const response = await fetch('http://localhost:4000/articulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, nombre }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar el artículo');
      }

      // Suponemos que tu backend responde con { articulo: { id, codigo, nombre } }
      const { articulo } = await response.json();
      setArticulos((prev) => [...prev, articulo]);
    } catch (error) {
      console.error('Error al agregar el artículo:', error);
    }
  };

  // 3. Eliminar un artículo (usando 'id' en lugar de '_id')
  const eliminarArticulo = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/articulos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el artículo');
      }

      // Filtramos del estado usando id
      setArticulos((prev) => prev.filter((art) => art.id !== id));
    } catch (error) {
      console.error('Error al eliminar el artículo:', error);
    }
  };

  // Devolvemos el provider con los valores
  return (
    <ArticulosContext.Provider
      value={{ articulos, setArticulos, agregarArticulo, eliminarArticulo }}
    >
      {children}
    </ArticulosContext.Provider>
  );
};
