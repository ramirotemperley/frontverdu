// SalesContext.jsx
import React, { createContext, useState } from 'react';

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  // Guardamos las ventas en un objeto donde cada clave es el nombre (o id) del vendedor.
  const [ventasPorVendedor, setVentasPorVendedor] = useState({});

  // Función para agregar un artículo a la venta de un vendedor
  const agregarArticulo = (vendedor, articulo) => {
    setVentasPorVendedor(prevState => {
      const ventasActuales = prevState[vendedor] || [];
      return {
        ...prevState,
        [vendedor]: [...ventasActuales, articulo]
      };
    });
  };

  // Función para obtener la venta de un vendedor
  const obtenerVentas = (vendedor) => {
    return ventasPorVendedor[vendedor] || [];
  };

  // Función para limpiar la venta de un vendedor (al finalizar la venta, por ejemplo)
  const limpiarVentas = (vendedor) => {
    setVentasPorVendedor(prevState => ({
      ...prevState,
      [vendedor]: []
    }));
  };

  return (
    <SalesContext.Provider value={{ ventasPorVendedor, agregarArticulo, obtenerVentas, limpiarVentas }}>
      {children}
    </SalesContext.Provider>
  );
};
