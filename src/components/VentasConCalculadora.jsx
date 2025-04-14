// VentasConCalculadora.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import ModalArticulos from './ModalArticulos';
import { SalesContext } from '../context/SalesContext';
import { TicketsContext } from '../context/TicketsContext';
import { UsuariosContext } from '../context/UsuariosContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VentasConCalculadora.css';

function VentasConCalculadora() {
  const { agregarArticulo, obtenerVentas, limpiarVentas, ventasPorVendedor } = useContext(SalesContext);
  const { addTicket } = useContext(TicketsContext);
  const { usuarios } = useContext(UsuariosContext);

  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(
    localStorage.getItem('ultimoVendedor') || 'Vendedor 1'
  );
  const [inputActual, setInputActual] = useState('');
  const [expresiones, setExpresiones] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const inputRef = useRef(null);
  const historial = obtenerVentas(vendedorSeleccionado);

  const getExpresionActual = () => expresiones[vendedorSeleccionado] || '';
  const setExpresionActual = (nuevoValor) => {
    setExpresiones((prev) => ({
      ...prev,
      [vendedorSeleccionado]:
        typeof nuevoValor === 'function'
          ? nuevoValor(prev[vendedorSeleccionado] || '')
          : nuevoValor,
    }));
  };

  useEffect(() => {
    localStorage.setItem('ultimoVendedor', vendedorSeleccionado);
  }, [vendedorSeleccionado]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/') {
        e.preventDefault();
        setMostrarModal(true);
      } else if (e.key === 'Enter' && inputActual.trim()) {
        e.preventDefault();
        agregarDesdeInput();
      } else if (e.key === 'F8') {
        e.preventDefault();
        cambiarVendedor(-1);
      } else if (e.key === 'F9') {
        e.preventDefault();
        cambiarVendedor(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputActual, vendedorSeleccionado, usuarios]);

  const cambiarVendedor = (dir) => {
    const index = usuarios.findIndex((u) => u.nombre === vendedorSeleccionado);
    if (index !== -1) {
      const nuevoIndex = (index + dir + usuarios.length) % usuarios.length;
      setVendedorSeleccionado(usuarios[nuevoIndex].nombre);
    }
    inputRef.current?.focus();
  };

  const agregarDesdeInput = () => {
    const clean = inputActual.trim();
    if (!clean) return;

    if (clean === '.7' || clean === '.8') {
      const formaPagoId = clean === '.7' ? 1 : 2;
      setInputActual('');
      finalizarVenta(formaPagoId);
      return;
    }

    if (!/^\d+(\*\d+)?$/.test(clean)) {
      toast.error('Formato inválido. Usa “1000” o “1000*2”.');
      return;
    }

    const partes = clean.split('*');
    const precio = parseFloat(partes[0]) || 0;
    const cantidad = parseFloat(partes[1]) || 1;
    const unidad = cantidad >= 50 ? 'g' : 'kg';
    const cantidadConvertida = cantidad >= 50 ? cantidad / 1000 : cantidad;

    const item = {
      nombre: 'Verdulería',
      categoria: 'manual',
      precio,
      cantidad: cantidadConvertida,
      cantidadOriginal: cantidad,
      unidad,
      subtotal: precio * cantidadConvertida,
    };

    agregarArticulo(vendedorSeleccionado, item);
    setExpresionActual((prev) => (prev ? `${prev}+${item.subtotal}` : `${item.subtotal}`));
    setInputActual('');
    inputRef.current?.focus();
  };

  const handleSubmitDesdeModal = (articulo, precio, cantidad) => {
    const cantNum = parseFloat(cantidad) || 1;
    const unidad = cantNum >= 50 ? 'g' : 'kg';
    const cantidadConvertida = cantNum >= 50 ? cantNum / 1000 : cantNum;

    const item = {
      ...articulo,
      precio: parseFloat(precio) || 0,
      cantidad: cantidadConvertida,
      cantidadOriginal: cantNum,
      unidad,
      subtotal: (parseFloat(precio) || 0) * cantidadConvertida,
    };

    agregarArticulo(vendedorSeleccionado, item);
    setExpresionActual((prev) =>
      prev ? `${prev}+${item.subtotal}` : `${item.subtotal}`
    );
    setMostrarModal(false);
    inputRef.current?.focus();
  };

  const finalizarVenta = async (formaPagoId) => {
    if (!formaPagoId) {
      toast.error('Forma de pago no válida');
      return;
    }

    const vendedor = usuarios.find((u) => u.nombre === vendedorSeleccionado);
    if (!vendedor) {
      toast.error('Vendedor no encontrado');
      return;
    }

    const totalVenta = historial.reduce((acc, it) => acc + it.subtotal, 0);
    const venta = {
      vendedorId: vendedor.id,
      formaPagoId,
      articulos: historial.map(it => ({
        articuloId: it.id || 1,
        cantidad: 1,
        precio: it.precio,
        total: it.subtotal
      })),
      totalVenta,
      fecha: new Date(),
    };

    try {
      await addTicket(venta);
      limpiarVentas(vendedorSeleccionado);
      setExpresionActual('');
      setInputActual('');
      toast.success('Venta finalizada.');
      inputRef.current?.focus();
    } catch (err) {
      console.error("Error guardando la venta:", err);
      toast.error('Error al guardar la venta.');
    }
  };

  const limpiarLista = () => {
    limpiarVentas(vendedorSeleccionado);
    setExpresionActual('');
    setInputActual('');
    inputRef.current?.focus();
  };

  const total = historial.reduce((acc, it) => acc + it.subtotal, 0);

  return (
    <div className="ventas-con-calculadora">
      <div className="totales-fila" style={{ fontSize: '1.8em' }}>
        <div className="item-total">👤 {vendedorSeleccionado}</div>
        <div className="item-total">🛒 {historial.length} art.</div>
        <div className="item-total">💰 ${total.toFixed(2)}</div>
      </div>

      <div className="visor-cadena">{getExpresionActual() || '0'}</div>

      <div className="input-section">
        <input
          ref={inputRef}
          type="text"
          value={inputActual}
          onChange={(e) => setInputActual(e.target.value)}
          placeholder="Ej: 1000 o 1000*2, .7 / .8"
          className="input-principal"
        />
      </div>

      <div className="lista-articulos">
        {historial.length === 0 ? (
          <p className="lista-vacia">No hay artículos cargados</p>
        ) : (
          historial.map((it, i) => (
            <div key={i} className="item-ticket">
              <span>{it.nombre}</span>
              <span>{it.cantidadOriginal} {it.unidad}</span>
              <span>${it.precio.toFixed(2)}</span>
              <span>= ${it.subtotal.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      <div className="finalizar-venta">
        <p><strong>.7</strong> para efectivo &bull; <strong>.8</strong> para digital</p>
        <button onClick={limpiarLista} className="btn-limpiar">Limpiar Lista</button>
      </div>

      {mostrarModal && (
        <ModalArticulos
          articulos={[]} // si lo estás cargando desde contexto, ajustalo
          onClose={() => setMostrarModal(false)}
          onSubmit={handleSubmitDesdeModal}
        />
      )}
    </div>
  );
}

export default VentasConCalculadora;
