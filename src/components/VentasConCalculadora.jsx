import React, { useState, useEffect, useContext, useRef } from 'react';
import ModalArticulos from './ModalArticulos';
import ResumenVenta from './ResumenVenta';
import { ArticulosContext } from '../context/ArticulosContext';
import { UsuariosContext } from '../context/UsuariosContext';
import { FormasPagoContext } from '../context/FormasPagoContext';
import { SalesContext } from '../context/SalesContext';
import { TicketsContext } from '../context/TicketsContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function VentasConCalculadora() {
  const { articulos } = useContext(ArticulosContext);
  const { usuarios } = useContext(UsuariosContext);
  const { formasPago } = useContext(FormasPagoContext);
  const { agregarArticulo, obtenerVentas, limpiarVentas } = useContext(SalesContext);
  const { setTickets } = useContext(TicketsContext);

  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(localStorage.getItem('ultimoVendedor') || 'Vendedor 1');
  const [inputActual, setInputActual] = useState('');
  const [expresion, setExpresion] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formaPagoSeleccionada, setFormaPagoSeleccionada] = useState('');
  const inputRef = useRef(null);

  const historial = obtenerVentas(vendedorSeleccionado);

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

  const cambiarVendedor = (dir) => {
    const index = usuarios.findIndex((u) => u.nombre === vendedorSeleccionado);
    if (index !== -1) {
      const nuevoIndex = (index + dir + usuarios.length) % usuarios.length;
      setVendedorSeleccionado(usuarios[nuevoIndex].nombre);
    }
  };

  const agregarDesdeInput = () => {
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
    setExpresion((prev) => (prev ? `${prev}+${inputActual}` : inputActual));
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
    setExpresion((prev) => (prev ? `${prev}+${precio}*${cantidad}` : `${precio}*${cantidad}`));
    setMostrarModal(false);
  };

  const total = historial.reduce((acc, item) => acc + item.subtotal, 0);
  const cantidadArticulos = historial.length;

  const finalizarVenta = async () => {
    if (!formaPagoSeleccionada) return toast.error('Seleccioná una forma de pago.');
    const vendedor = usuarios.find((u) => u.nombre === vendedorSeleccionado);
    if (!vendedor) return toast.error('Vendedor no encontrado.');

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
      setTickets((prev) => [...prev, { ...venta, id: data.ventaId, vendedor: vendedor.nombre }]);
      limpiarVentas(vendedorSeleccionado);
      setFormaPagoSeleccionada('');
      setExpresion('');
      toast.success('Venta finalizada.');
    } catch (err) {
      toast.error('Error al guardar la venta.');
      console.error(err);
    }
  };

  return (
    <div className="ventas-con-calculadora">
      <ResumenVenta
        cantidadArticulos={cantidadArticulos}
        totalAcumulado={total}
        vendedores={usuarios}
        vendedorSeleccionado={vendedorSeleccionado}
        setVendedorSeleccionado={setVendedorSeleccionado}
      />

      <div className="input-section">
        <input
          ref={inputRef}
          type="text"
          value={inputActual}
          onChange={(e) => setInputActual(e.target.value)}
          placeholder="Ej: 1000 o 1000*2"
          style={{ fontSize: '2em' }}
        />
        <button onClick={agregarDesdeInput}>+</button>
        <button onClick={() => setMostrarModal(true)}>/</button>
      </div>

      <div className="expresion-display" style={{ fontSize: '1.5em' }}>{expresion}</div>

      <div className="lista-articulos">
        {historial.map((item, i) => (
          <div key={i} className="item-linea">
            {item.nombre} - {item.cantidadOriginal} {item.unidad} - ${item.subtotal.toFixed(2)}
          </div>
        ))}
      </div>

      <div className="finalizar-venta">
        <h4>Forma de pago:</h4>
        {formasPago.map((fp) => (
          <button
            key={fp.id}
            onClick={() => setFormaPagoSeleccionada(fp.id)}
            className={formaPagoSeleccionada === fp.id ? 'seleccionada' : ''}
          >
            {fp.nombre}
          </button>
        ))}
        <button onClick={finalizarVenta}>Finalizar Venta</button>
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
