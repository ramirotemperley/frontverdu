// src/context/FormasPagoContext.js

import React, { createContext, useState } from 'react';

export const FormasPagoContext = createContext();

export const FormasPagoProvider = ({ children }) => {
  // Inicializamos con una forma de pago predeterminada: "Efectivo"
  // Puedes agregar más si lo deseas.
  const [formasPago] = useState([
    {
      id: 1,
      codigo: 'EFE', // Opcional
      nombre: 'Efectivo',
    },
  ]);

  // Sin backend, no intentamos agregar, editar o eliminar.
  // Estas funciones podrían estar vacías o no definirse.
  
  return (
    <FormasPagoContext.Provider value={{ formasPago }}>
      {children}
    </FormasPagoContext.Provider>
  );
};


/*import React, { createContext, useState, useEffect } from 'react';

export const FormasPagoContext = createContext();

export const FormasPagoProvider = ({ children }) => {
  const [formasPago, setFormasPago] = useState([]);

  // Obtener formas de pago desde el backend
  useEffect(() => {
    const fetchFormasPago = async () => {
      try {
        const response = await fetch('http://localhost:4000/formas-pago');
        const data = await response.json();
        // data debería ser un array de objetos { id, codigo, nombre }
        setFormasPago(data);
      } catch (error) {
        console.error('Error al obtener las formas de pago:', error);
      }
    };

    fetchFormasPago();
  }, []);

  // Función para agregar una forma de pago con codigo y nombre
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
      // Se espera que nuevaFormaPago sea algo como: { id: ..., codigo: ..., nombre: ... }
      setFormasPago((prevFormasPago) => [...prevFormasPago, nuevaFormaPago]);
    } catch (error) {
      console.error('Error al agregar una forma de pago:', error);
    }
  };

  // Función para eliminar una forma de pago por id
  const deleteFormaPago = async (id) => {
    try {
      await fetch(`http://localhost:4000/formas-pago/${id}`, {
        method: 'DELETE',
      });

      setFormasPago((prevFormasPago) =>
        prevFormasPago.filter((formaPago) => formaPago.id !== id)
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
};*/
