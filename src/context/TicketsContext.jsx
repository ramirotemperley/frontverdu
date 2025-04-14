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

  // Esta función se encarga de POSTear la venta y luego de GET para refrescar la lista de tickets.
  const addTicket = async (nuevoTicket) => {
    try {
      // Enviamos la venta al backend
      await axios.post('http://localhost:4000/ventas', nuevoTicket);

      // Luego, refrescamos la lista de tickets:
      const response = await axios.get('http://localhost:4000/ventas');
      setTickets(response.data);
    } catch (error) {
      console.error('Error al agregar el ticket:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <TicketsContext.Provider value={{ tickets, setTickets, addTicket, cargando }}>
      {children}
    </TicketsContext.Provider>
  );
};
