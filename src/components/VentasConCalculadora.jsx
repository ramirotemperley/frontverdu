import React, { useState, useEffect, useContext, useRef } from 'react';
import ModalArticulos from './ModalArticulos';
import { ArticulosContext } from '../context/ArticulosContext';
import { UsuariosContext } from '../context/UsuariosContext';
import { FormasPagoContext } from '../context/FormasPagoContext';
import { SalesContext } from '../context/SalesContext';
import { TicketsContext } from '../context/TicketsContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VentasConCalculadora.css';

function VentasConCalculadora() {
  const { articulos } = useContext(ArticulosContext);
  const { usuarios } = useContext(UsuariosContext);
  const { formasPago } = useContext(FormasPagoContext);
  const { agregarArticulo, obtenerVentas, limpiarVentas } = useContext(SalesContext);
  const { setTickets } = useContext(TicketsContext);

  // En lugar de expresion, guardamos un OBJETO con la cadena de cada vendedor
  const [expresiones, setExpresiones] = useState({});
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(
    localStorage.getItem('ultimoVendedor') || 'Vendedor 1'
  );
  const [inputActual, setInputActual] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formaPagoSeleccionada, setFormaPagoSeleccionada] = useState('');

  const inputRef = useRef(null);
  const historial = obtenerVentas(vendedorSeleccionado);

  // Helpers para acceder / mutar la expresión del vendedor actual
  const getExpresionActual = () => {
    return expresiones[vendedorSeleccionado] || '';
  };

  const setExpresionActual = (nuevoValor) => {
    setExpresiones((prev) => ({
      ...prev,
      [vendedorSeleccionado]:
        typeof nuevoValor === 'function'
          ? nuevoValor(prev[vendedorSeleccionado] || '')
          : nuevoValor
    }));
  };

  useEffect(() => {
    localStorage.setItem('ultimoVendedor', vendedorSeleccionado);
  }, [vendedorSeleccionado]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/') {
        e.preventDefault();
        setMostrarModal(true);
      } else if (e.key === '+' && inputActual) {
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
  }, [inputActual, usuarios, vendedorSeleccionado]);

  useEffect(() => {
    // Autoenfocar al montar
    inputRef.current?.focus();
  }, []);

  const cambiarVendedor = (dir) => {
    const index = usuarios.findIndex((u) => u.nombre === vendedorSeleccionado);
    if (index !== -1) {
      const nuevoIndex = (index + dir + usuarios.length) % usuarios.length;
      setVendedorSeleccionado(usuarios[nuevoIndex].nombre);
    }
    // Reenfocamos
    inputRef.current?.focus();
  };

  const agregarDesdeInput = () => {
    if (!inputActual.trim()) return;

    const partes = inputActual.split('*');
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
    // Reemplaza setExpresion(...) por setExpresionActual(...)
    setExpresionActual((prev) => (prev ? `${prev}+${inputActual}` : inputActual));

    setInputActual('');
    inputRef.current?.focus();
  };

  const handleSubmitDesdeModal = (articulo, precio, cantidad) => {
    const cantidadConvertida = cantidad >= 50 ? cantidad / 1000 : cantidad;
    const unidad = cantidad >= 50 ? 'g' : 'kg';

    const item = {
      ...articulo,
      precio,
      cantidad: cantidadConvertida,
      cantidadOriginal: cantidad,
      unidad,
      subtotal: precio * cantidadConvertida,
    };

    agregarArticulo(vendedorSeleccionado, item);
    // Igual acá
    setExpresionActual((prev) =>
      prev ? `${prev}+${precio}*${cantidad}` : `${precio}*${cantidad}`
    );
    setMostrarModal(false);
    inputRef.current?.focus();
  };

  const total = historial.reduce((acc, item) => acc + item.subtotal, 0);
  const cantidadArticulos = historial.length;

  const finalizarVenta = async () => {
    if (!formaPagoSeleccionada) {
      return toast.error('Seleccioná una forma de pago.');
    }
    const vendedor = usuarios.find((u) => u.nombre === vendedorSeleccionado);
    if (!vendedor) {
      return toast.error('Vendedor no encontrado.');
    }

    const venta = {
      vendedorId: vendedor.id,
      formaPagoId: formaPagoSeleccionada,
      articulos: historial.map((item) => ({
        articuloId: item.id || 1,
        cantidad: 1,
        precio: item.precio,
        total: item.subtotal,
      })),
      totalVenta: total,
      fecha: new Date(),
    };

    try {
      const res = await fetch('http://localhost:4000/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venta),
      });
      const data = await res.json();

      setTickets((prev) => [
        ...prev,
        {
          ...venta,
          id: data.ventaId,
          vendedor: vendedor.nombre,
        },
      ]);

      limpiarVentas(vendedorSeleccionado);
      // Ahora, para este vendedor, borramos la expresión:
      setExpresionActual('');
      setFormaPagoSeleccionada('');
      toast.success('Venta finalizada.');
      inputRef.current?.focus();
    } catch (err) {
      toast.error('Error al guardar la venta.');
      console.error(err);
    }
  };

  const limpiarLista = () => {
    limpiarVentas(vendedorSeleccionado);
    // Borrar la expresión del vendedor actual
    setExpresionActual('');
    inputRef.current?.focus();
  };

  return (
    <div className="ventas-con-calculadora">
      <div className="totales-fila" style={{ fontSize: '2em' }}>
        <div className="item-total">👤 {vendedorSeleccionado}</div>
        <div className="item-total">🛒 {cantidadArticulos} art.</div>
        <div className="item-total">💰 ${total.toFixed(2)}</div>
      </div>

      {/* Acá en lugar de {expresion || '0'} usamos la función getExpresionActual() */}
      <div className="visor-cadena">
        {getExpresionActual() || '0'}
      </div>

      <div className="input-section">
        <input
          ref={inputRef}
          type="text"
          value={inputActual}
          onChange={(e) => setInputActual(e.target.value)}
          placeholder="Ej: 1000 o 1000*2"
          className="input-principal"
        />
        <button onClick={agregarDesdeInput} className="btn-agregar">+</button>
        <button onClick={() => setMostrarModal(true)} className="btn-modal">/</button>
      </div>

      <div className="lista-articulos">
        {historial.length === 0 && (
          <p className="lista-vacia">No hay artículos cargados</p>
        )}
        {historial.map((item, i) => (
          <div key={i} className="item-ticket">
            <span>{item.nombre}</span>
            <span>{item.cantidadOriginal} {item.unidad}</span>
            <span>${item.precio.toFixed(2)}</span>
            <span>= ${item.subtotal.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="finalizar-venta">
        <h4>Forma de pago:</h4>
        <div className="formas-pago">
          {formasPago.map((fp) => (
            <button
              key={fp.id}
              onClick={() => setFormaPagoSeleccionada(fp.id)}
              className={formaPagoSeleccionada === fp.id ? 'seleccionada' : ''}
            >
              {fp.nombre}
            </button>
          ))}
        </div>
        <button onClick={finalizarVenta} className="btn-finalizar">Finalizar Venta</button>
        <button onClick={limpiarLista} className="btn-limpiar">Limpiar Lista</button>
      </div>

      {mostrarModal && (
        <ModalArticulos
          articulos={articulos}
          onClose={() => setMostrarModal(false)}
          onSubmit={handleSubmitDesdeModal}
        />
      )}
    </div>
  );
}

export default VentasConCalculadora;
