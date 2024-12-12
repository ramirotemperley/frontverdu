import React, { createContext, useState } from 'react';

export const FormasPagoContext = createContext();

export const FormasPagoProvider = ({ children }) => {
  const [formasPago, setFormasPago] = useState(['Efectivo', 'Tarjeta']);

  return (
    <FormasPagoContext.Provider value={{ formasPago, setFormasPago }}>
      {children}
    </FormasPagoContext.Provider>
  );
};
