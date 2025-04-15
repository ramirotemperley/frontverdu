// SalesContext.jsx
import React, { createContext, useState } from 'react';

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [ventasPorVendedor, setVentasPorVendedor] = useState({});

  const agregarArticulo = (vendedor, articulo) => {
    setVentasPorVendedor(prev => {
      const ventasActuales = prev[vendedor] || [];
      const nuevaLista = [...ventasActuales, articulo];
      return { ...prev, [vendedor]: nuevaLista };
    });
  };

  const obtenerVentas = (vendedor) => {
    return ventasPorVendedor[vendedor] || [];
  };

  const limpiarVentas = (vendedor) => {
    setVentasPorVendedor(prev => ({
      ...prev,
      [vendedor]: []
    }));
  };

  // Nueva función para remover el último artículo ingresado
  const removerUltimoArticulo = (vendedor) => {
    setVentasPorVendedor(prev => {
      const ventasActuales = prev[vendedor] || [];
      if (ventasActuales.length === 0) return prev; // Nada que remover
      const nuevaLista = ventasActuales.slice(0, -1); // Remueve el último elemento
      return { ...prev, [vendedor]: nuevaLista };
    });
  };

  return (
    <SalesContext.Provider value={{
      agregarArticulo,
      obtenerVentas,
      limpiarVentas,
      removerUltimoArticulo,  // Se expone la función para eliminar el último artículo
      ventasPorVendedor
    }}>
      {children}
    </SalesContext.Provider>
  );
};
