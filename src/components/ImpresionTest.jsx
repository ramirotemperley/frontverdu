import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { TicketsContext } from '../context/TicketsContext';
const API_URL = 'http://192.168.0.101:3002';

export default function ImpresionTest() {
  const [texto, setTexto] = useState("🍎 Ticket de prueba\n2x Banana $500\n1x Tomate $300\nTotal: $800");
  const [estado, setEstado] = useState("Cargando...");
  const [ultimo, setUltimo] = useState("");
  const { addTicket } = useContext(TicketsContext);

  const consultarEstado = async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      setEstado(data.estado);
      setUltimo(data.ultimo);
    } catch (err) {
      setEstado("❌ Error al conectar");
    }
  };

  const imprimir = async () => {
    try {
      await fetch(`${API_URL}/print`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texto }),
      });
      consultarEstado(); // actualiza estado después
    } catch (err) {
      alert("Error al imprimir");
    }
  };

  const reimprimir = async () => {
    try {
      await fetch(`${API_URL}/reprint`, { method: "POST" });
      consultarEstado();
    } catch (err) {
      alert("Error al reimprimir");
    }
  };

  useEffect(() => {
    consultarEstado();
    const intervalo = setInterval(consultarEstado, 3000); // actualiza cada 3 seg
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div style={{ fontFamily: 'monospace', padding: 20 }}>
      <h2>🖨️ Test de Impresión</h2>
      <p><strong>Estado:</strong> {estado}</p>
      <p><strong>Último ticket:</strong> {ultimo}</p>

      <textarea
        rows={8}
        cols={40}
        value={texto}
        onChange={e => setTexto(e.target.value)}
      /><br /><br />

      <button onClick={imprimir}>🟢 Imprimir</button>{' '}
      <button onClick={reimprimir}>♻️ Reimprimir</button>
      <hr />
<h4>🧪 Test de impresión completa</h4>
<button onClick={() => {
  const testTicket = {
    articulos: [
      { nombre: "Tomate", peso: 1.2, precio: 700 },
      { nombre: "Huevos", precio: 900 },
      { nombre: "Banana", peso: 2.0, precio: 800 }
    ],
    formaPago: "Transferencia"
  };
  addTicket(testTicket);
}}>
  🖨️ Probar impresión desde React
</button>

    </div>
  );
}

