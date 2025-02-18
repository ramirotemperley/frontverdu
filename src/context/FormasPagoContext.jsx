import React, { createContext, useState, useEffect } from 'react';

export const FormasPagoContext = createContext();

export const FormasPagoProvider = ({ children }) => {
  const [formasPago, setFormasPago] = useState([]);

  // Obtener formas de pago desde el backend
  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const response = await fetch('http://localhost:4000/formas-pago');
        const data = await response.json();
        setFormasPago(data);
      } catch (error) {
        console.error('Error al obtener las formas de pago:', error);
      }
    };

    fetchFormasPago();
  }, []);

  // Función para agregar una forma de pago
  const addFormaPago = async (codigo, nombre) => {
    try {
      const response = await fetch('http://localhost:4000/formas-pago', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo, nombre }),
      });

      const nuevaFormaPago = await response.json();
      setFormasPago((prevFormasPago) => [...prevFormasPago, nuevaFormaPago.formaPago]);
    } catch (error) {
      console.error('Error al agregar una forma de pago:', error);
    }
  };

  // Función para eliminar una forma de pago
  const deleteFormaPago = async (id) => {
    try {
      await fetch(`http://localhost:4000/formas-pago/${id}`, {
        method: 'DELETE',
      });

      setFormasPago((prevFormasPago) =>
        prevFormasPago.filter((formaPago) => formaPago._id !== id)
      );
    } catch (error) {
      console.error('Error al eliminar una forma de pago:', error);
    }
  };

  return (
    <FormasPagoContext.Provider
      value={{ formasPago, setFormasPago, addFormaPago, deleteFormaPago }}
    >
      {children}
    </FormasPagoContext.Provider>
  );
};
