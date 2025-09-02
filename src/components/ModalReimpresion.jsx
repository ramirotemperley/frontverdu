import React, { useState, useEffect } from 'react';
import './ModalReimpresion.css';

function ModalReimpresion({ tickets, onClose, onConfirm }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '+') {
        e.preventDefault();
        setIndice((prev) => (prev + 1) % tickets.length);
      } else if (e.key === '-') {
        e.preventDefault();
        setIndice((prev) => (prev - 1 + tickets.length) % tickets.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm(tickets[indice]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [indice, tickets, onClose, onConfirm]);

  if (!tickets.length) return null;

  const ticket = tickets[indice];

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Reimprimir Ticket #{ticket.id}</h3>
        <p><strong>Total:</strong> ${ticket.totalVenta}</p>
        <p><strong>Fecha:</strong> {new Date(ticket.fecha).toLocaleString('es-AR')}</p>
        <p>Presioná <strong>Enter</strong> para imprimir, <strong>+ / -</strong> para cambiar, <strong>Esc</strong> para salir.</p>
      </div>
    </div>
  );
}

export default ModalReimpresion;
