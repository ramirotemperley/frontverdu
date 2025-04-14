// SalesContext.jsx
import React, { createContext, useState } from 'react';

export const SalesContext = createContext();

export const SalesProvider = ({ children }) => {
  const [ventasPorVendedor, setVentasPorVendedor] = useState({});

  const agregarArticulo = (vendedor, articulo) => {
    console.log("SalesContext > agregarArticulo => vendedor =", vendedor, "articulo =", articulo);
    setVentasPorVendedor(prev => {
      const ventasActuales = prev[vendedor] || [];
      const nuevaLista = [...ventasActuales, articulo];
      const nuevoEstado = { ...prev, [vendedor]: nuevaLista };
      console.log("SalesContext > nuevoObjeto =>", nuevoEstado);
      return nuevoEstado;
    });
  };

  const obtenerVentas = (vendedor) => {
    console.log("SalesContext > obtenerVentas => vendedor =", vendedor);
    console.log("ventasPorVendedor actual:", ventasPorVendedor);
    return ventasPorVendedor[vendedor] || [];
  };

  const limpiarVentas = (vendedor) => {
    console.log("SalesContext > limpiarVentas => vendedor =", vendedor);
    setVentasPorVendedor(prev => {
      const nuevoEstado = { ...prev, [vendedor]: [] };
      console.log("SalesContext > limpiarVentas => nuevoObjeto =", nuevoEstado);
      return nuevoEstado;
    });
  };

  return (
    <SalesContext.Provider value={{
      agregarArticulo,
      obtenerVentas,
      limpiarVentas,
      ventasPorVendedor  // 🔁 Lo exponemos para que el componente escuche los cambios
    }}>
      {children}
    </SalesContext.Provider>
  );
};
