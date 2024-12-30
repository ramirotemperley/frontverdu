import React, { createContext, useState, useEffect } from 'react';

export const ArticulosContext = createContext();

export const ArticulosProvider = ({ children }) => {
  const [articulos, setArticulos] = useState([]);

  useEffect(() => {
    const fetchArticulos = async () => {
      try {
        const response = await fetch('http://localhost:4000/articulos'); // Ajusta la ruta según tu backend
        const data = await response.json();
        setArticulos(data);
      } catch (error) {
        console.error('Error al cargar los artículos:', error);
      }
    };

    fetchArticulos();
  }, []);

  return (
    <ArticulosContext.Provider value={{ articulos, setArticulos }}>
      {children}
    </ArticulosContext.Provider>
  );
};
