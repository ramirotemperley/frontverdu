// src/context/TicketsContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const TicketsContext = createContext();

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Aquí realizamos el GET a /ventas que ya está modificado en el backend
        // para devolver solo las últimas 10.
        const response = await axios.get('http://localhost:4000/ventas');
        setTickets(response.data);
        setCargando(false);
      } catch (error) {
        console.error('Error al obtener tickets:', error.response ? error.response.data : error.message);
        setCargando(false);
      }
    };

    fetchTickets();
  }, []);

  return (
    <TicketsContext.Provider value={{ tickets, setTickets, cargando }}>
      {children}
    </TicketsContext.Provider>
  );
};
