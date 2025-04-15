import React, { useState, useEffect, useContext, useRef } from 'react';
import ModalArticulos from './ModalArticulos';
import ModalDescuento from './ModalDescuento';
import { SalesContext } from '../context/SalesContext';
import { TicketsContext } from '../context/TicketsContext';
import { UsuariosContext } from '../context/UsuariosContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VentasConCalculadora.css';

function VentasConCalculadora() {
  const { agregarArticulo, obtenerVentas, limpiarVentas } = useContext(SalesContext);
  const { addTicket } = useContext(TicketsContext);
  const { usuarios } = useContext(UsuariosContext);

  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(
    localStorage.getItem('ultimoVendedor') || ''
  );
  const [inputActual, setInputActual] = useState('');
  const [expresiones, setExpresiones] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDescuento, setMostrarModalDescuento] = useState(false);
  const inputRef = useRef(null);
  const historial = obtenerVentas(vendedorSeleccionado);

  useEffect(() => {
    if (usuarios && usuarios.length > 0) {
      let nuevoVendedor = vendedorSeleccionado;
      if (!nuevoVendedor || !usuarios.some((u) => u.nombre === nuevoVendedor)) {
        nuevoVendedor = usuarios[0].nombre;
      }
      if (nuevoVendedor !== vendedorSeleccionado) {
        setVendedorSeleccionado(nuevoVendedor);
        localStorage.setItem('ultimoVendedor', nuevoVendedor);
      }
    }
  }, [usuarios, vendedorSeleccionado]);

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
      } else if (e.key === '+') {  // Avanzamos al siguiente vendedor
        e.preventDefault();
        cambiarVendedor(1);
      } else if (e.key === '-') {  // Retrocedemos al vendedor anterior
        e.preventDefault();
        cambiarVendedor(-1);
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

    // Si ingresa ".1", abrimos el modal de descuento
    if (clean === '.1') {
      setMostrarModalDescuento(true);
      setInputActual('');
      return;
    }

    // Finalizar venta: .7 para efectivo (ID 1) y .8 para crédito (ID 3)
    if (clean === '.7' || clean === '.8') {
      const formaPagoId = clean === '.7' ? 1 : 3;
      setInputActual('');
      finalizarVenta(formaPagoId);
      return;
    }

    const regexDecimal = /^\d+(\.\d+)?(?:\*\d+(\.\d+)?)?$/;
    if (!regexDecimal.test(clean)) {
      toast.error('Formato inválido. Usa “1000” o “1000.50” o “1000*2” o “1000.50*2.5”.');
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
    setExpresiones((prev) => ({
      ...prev,
      [vendedorSeleccionado]: prev[vendedorSeleccionado]
        ? `${prev[vendedorSeleccionado]}+${item.subtotal}`
        : `${item.subtotal}`
    }));
    setInputActual('');
    inputRef.current?.focus();
  };

  const handleDescuentoSubmit = (monto) => {
    const descuento = {
      nombre: 'Descuento',
      categoria: 'descuento',
      precio: -monto,
      cantidad: 1,
      cantidadOriginal: 1,
      unidad: '',
      subtotal: -monto,
    };

    agregarArticulo(vendedorSeleccionado, descuento);
    setExpresiones((prev) => ({
      ...prev,
      [vendedorSeleccionado]: prev[vendedorSeleccionado]
        ? `${prev[vendedorSeleccionado]}+(${descuento.subtotal})`
        : `${descuento.subtotal}`
    }));
    setMostrarModalDescuento(false);
    inputRef.current?.focus();
  };

  const handleDescuentoClose = () => {
    setMostrarModalDescuento(false);
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
    setExpresiones((prev) => ({
      ...prev,
      [vendedorSeleccionado]: prev[vendedorSeleccionado]
        ? `${prev[vendedorSeleccionado]}+${item.subtotal}`
        : `${item.subtotal}`
    }));
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
      articulos: historial.map((it) => ({
        articuloId: it.id || 1,
        cantidad: 1,
        precio: it.precio,
        total: it.subtotal,
      })),
      totalVenta,
      fecha: new Date(),
    };

    try {
      await addTicket(venta);
      limpiarVentas(vendedorSeleccionado);
      setExpresiones((prev) => ({ ...prev, [vendedorSeleccionado]: '' }));
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
    setExpresiones((prev) => ({ ...prev, [vendedorSeleccionado]: '' }));
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

      <div className="visor-cadena">{expresiones[vendedorSeleccionado] || '0'}</div>

      <div className="input-section">
        <input
          ref={inputRef}
          type="text"
          value={inputActual}
          onChange={(e) => setInputActual(e.target.value)}
          placeholder="Ej: 1000 o 1000.50 o 1000.50*2.5, .7 / .8, .1 para descuento, + o - para cambiar vendedor"
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
        <p>
          <strong>.7</strong> para efectivo &bull; <strong>.8</strong> para crédito &bull; <strong>.1</strong> para descuento
        </p>
        <button onClick={limpiarLista} className="btn-limpiar">
          Limpiar Lista
        </button>
      </div>

      {mostrarModal && (
        <ModalArticulos
          articulos={[]} // Ajusta según corresponda
          onClose={() => setMostrarModal(false)}
          onSubmit={handleSubmitDesdeModal}
        />
      )}

      {mostrarModalDescuento && (
        <ModalDescuento
          onSubmit={handleDescuentoSubmit}
          onClose={handleDescuentoClose}
        />
      )}
    </div>
  );
}

export default VentasConCalculadora;
