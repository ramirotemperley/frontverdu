import React, { createContext, useState, useEffect } from 'react';

export const ArticulosContext = createContext();

export const ArticulosProvider = ({ children }) => {
  const [articulos, setArticulos] = useState([]);

  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        const response = await fetch('http://localhost:4000/articulos'); // Ruta del backend
        const data = await response.json();
        setArticulos(data);
      } catch (error) {
        console.error('Error al cargar los artículos:', error);
      }
    };

    fetchArticulos();
  }, []);

  // Función para agregar un artículo
  const agregarArticulo = async ({ codigo, nombre }) => {
    try {
      const response = await fetch('http://localhost:4000/articulos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo, nombre }),
      });

      if (!response.ok) {
        throw new Error('Error al agregar el artículo');
      }

      const articuloAgregado = await response.json();
      setArticulos((prev) => [...prev, articuloAgregado.articulo]);
    } catch (error) {
      console.error('Error al agregar el artículo:', error);
    }
  };

  // Función para eliminar un artículo
  const eliminarArticulo = async (id) => {
    try {
      const response = await fetch(`http://localhost:4000/articulos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el artículo');
      }

      setArticulos((prev) => prev.filter((articulo) => articulo._id !== id));
    } catch (error) {
      console.error('Error al eliminar el artículo:', error);
    }
  };

  return (
    <ArticulosContext.Provider value={{ articulos, setArticulos, agregarArticulo, eliminarArticulo }}>
      {children}
    </ArticulosContext.Provider>
  );
};
