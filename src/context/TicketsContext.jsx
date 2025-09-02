// src/context/TicketsContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export const TicketsContext = createContext();

const API_BASE  = 'http://192.168.0.102:4000';
const PRINT_URL = 'http://192.168.0.102:3002/print'; // sólo usado por el backend

export const TicketsProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCarga]  = useState(true);

  // 1) Carga inicial del historial de ventas
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/ventas`);
        setTickets(data);
      } catch (e) {
        console.error('Error al obtener tickets:', e);
        toast.error('Error al cargar historial de ventas');
      } finally {
        setCarga(false);
      }
    })();
  }, []);

  // 2) Generador de texto para la primera impresión (interno del contexto)
  const generarTextoTicket = (lista) => {
    const hoy   = new Date();
    const fecha = hoy.toLocaleDateString('es-AR');
    const hora  = hoy.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const encabezado = `VERDULERIA\n${fecha} ${hora}\n\n`;

    const cuerpo = lista.map(it => {
      const nombreLimpio = (it.nombre || 'VERDULERIA')
        .toUpperCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9 ]/g, '');
      let pesoStr = '-';
      if (it.peso != null) {
        const peso = Number(it.peso);
        pesoStr = peso >= 50 ? `${peso.toFixed(0)}g` : `${peso.toFixed(2)}kg`;
      }
      const precioFmt = `$${Number(it.precio).toFixed(2)}`;
      return `${nombreLimpio.padEnd(12)} ${pesoStr.padEnd(6)} ${precioFmt.padStart(8)}`;
    }).join('\n');

    const total = lista.reduce((sum, it) => sum + Number(it.precio), 0);
    return (
      encabezado +
      cuerpo +
      `\n\nTOTAL:           $${total.toFixed(2)}\n\nGRACIAS POR SU COMPRA\n\n\n`
    );
  };

  // 3) addTicket: guarda la venta y envía la primera impresión al servidor de impresión
  const addTicket = async ({ articulosPrint, articulosBD, vendedorId, formaPagoId }) => {
    try {
      // Guardar en DB
      const totalVenta = articulosBD.reduce((s, it) => s + it.total, 0);
      await axios.post(`${API_BASE}/ventas`, {
        totalVenta,
        vendedorId,
        formaPagoId,
        articulos: articulosBD
      });

      // Refrescar lista
      const { data } = await axios.get(`${API_BASE}/ventas`);
      setTickets(data);

      // Primera impresión: backend maneja el fetch a PRINT_URL
      await axios.post(`${API_BASE}/ventas/imprimir`, { articulosPrint });

    } catch (error) {
      console.error('Error al agregar/imprimir ticket:', error);
      toast.error('Error al guardar o imprimir la venta');
    }
  };

  // 4) reimprimirTicket: SOLO llama al backend. No genera texto ni hace fetch a la impresora.
  const reimprimirTicket = async ({ id }) => {
    if (!id) {
      toast.error('ID de venta no proporcionado');
      throw new Error('ID de venta no proporcionado');
    }
    try {
      // El endpoint /ventas/imprimir lee de la DB, formatea y envía a la impresora
      await axios.post(`${API_BASE}/ventas/imprimir`, { id });
      toast.success('🖨️ Ticket reenviado a impresión');
    } catch (error) {
      console.error('Error al reimprimir ticket:', error);
      toast.error('Error al reimprimir ticket');
      throw error;
    }
  };

  return (
    <TicketsContext.Provider value={{
      tickets,
      cargando,
      addTicket,
      reimprimirTicket,
    }}>
      {children}
    </TicketsContext.Provider>
  );
};
