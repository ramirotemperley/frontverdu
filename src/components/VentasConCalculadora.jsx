/* ------------------------------------------------------------------
 * src/components/VentasConCalculadora.jsx
 * ------------------------------------------------------------------ */
import React, {
  useState, useEffect, useContext, useRef
} from 'react';

import ModalArticulos   from './ModalArticulos';
import ModalDescuento   from './ModalDescuento';
import ModalReimpresion from './ModalReimpresion';

import { SalesContext }     from '../context/SalesContext';
import { TicketsContext }   from '../context/TicketsContext';
import { UsuariosContext }  from '../context/UsuariosContext';
import { ArticulosContext } from '../context/ArticulosContext';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VentasConCalculadora.css';

function VentasConCalculadora() {
  /* ---------------------------- contextos ---------------------------- */
  const { agregarArticulo, limpiarVentas, ventasPorVendedor } = useContext(SalesContext);
  const { addTicket, tickets, reimprimirTicket }             = useContext(TicketsContext);
  const { usuarios }                                         = useContext(UsuariosContext);
  const { articulos }                                        = useContext(ArticulosContext);

  /* ----------------------------- estados ----------------------------- */
  const [vendedorSel, setVendedorSel]     = useState(localStorage.getItem('ultimoVendedor') || '');
  const [inputActual,  setInputActual]    = useState('');
  const [expresiones,  setExpresiones]    = useState({});
  const [showModalArt, setShowModalArt]   = useState(false);
  const [showModalDesc, setShowModalDesc] = useState(false);
  const [showReimpresion, setShowReimpresion] = useState(false);
  const [historial, setHistorial]         = useState([]);
  const [isMobile, setIsMobile]           = useState(false);

  const inputRef = useRef(null);

  /* ----------------------- detección de móvil ------------------------ */
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  /* ---------------- actualizar historial ----------------------------- */
  useEffect(() => {
    setHistorial(ventasPorVendedor[vendedorSel] || []);
  }, [ventasPorVendedor, vendedorSel]);

  /* ---- inicializar vendedor válido y guardar en localStorage -------- */
  useEffect(() => {
    if (usuarios.length) {
      let nuevo = vendedorSel;
      if (!usuarios.some(u => u.nombre === vendedorSel)) {
        nuevo = usuarios[0].nombre;
      }
      if (nuevo !== vendedorSel) {
        setVendedorSel(nuevo);
        localStorage.setItem('ultimoVendedor', nuevo);
      }
    }
  }, [usuarios, vendedorSel]);

  useEffect(() => { localStorage.setItem('ultimoVendedor', vendedorSel); }, [vendedorSel]);

  /* --------------------------- focus inicial ------------------------- */
  useEffect(() => { inputRef.current?.focus(); }, []);

  /* --------------------- atajos de teclado (desktop) ----------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showModalArt || showModalDesc || showReimpresion) return;
      if (e.key === '/') { e.preventDefault(); setShowModalArt(true); }
      else if (e.key === 'Enter') { e.preventDefault(); agregarDesdeInput(); }
      else if (e.key === '+' && !isMobile) { e.preventDefault(); cambiarVendedor(1); }
      else if (e.key === '-' && !isMobile) { e.preventDefault(); cambiarVendedor(-1); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    inputActual, vendedorSel,
    showModalArt, showModalDesc, showReimpresion, isMobile
  ]);

  /* ------------------------- helpers UI ------------------------------ */
  const cambiarVendedor = (dir) => {
    const idx = usuarios.findIndex(u => u.nombre === vendedorSel);
    if (idx !== -1) {
      const nuevo = usuarios[(idx + dir + usuarios.length) % usuarios.length].nombre;
      setVendedorSel(nuevo);
    }
    inputRef.current?.focus();
  };

  /* --------------------- procesar entrada principal ------------------ */
  const agregarDesdeInput = () => {
    const clean = inputActual.trim();
    if (!clean) return;

    if (clean === '.1') { setShowModalDesc(true); setInputActual(''); return; }     // descuento
    if (clean === '.7' || clean === '.8') {                                          // finalizar
      const formaPagoId = clean === '.7' ? 1 : 3;
      setInputActual(''); finalizarVenta(formaPagoId); return;
    }
    if (clean === '.2') { setShowReimpresion(true); setInputActual(''); return; }   // reimpresión

    const regex = /^\d+(\.\d+)?(?:\*\d+(\.\d+)?)?$/;
    if (!regex.test(clean)) {
      toast.error('Formato inválido → usa 1000  |  1000*2  |  1000.50*1.5');
      return;
    }

    const [precioStr, cantStr] = clean.split('*');
    const precio   = parseFloat(precioStr) || 0;
    const cantOrig = cantStr ? parseFloat(cantStr) : null;
    const unidad   = cantOrig != null ? (cantOrig >= 50 ? 'g' : 'kg') : null;
    const cantidad = cantOrig != null ? (unidad === 'g' ? cantOrig / 1000 : cantOrig) : 1;

    const item = {
      nombre: 'Verdulería',
      categoria: 'manual',
      precio,
      cantidad,
      cantidadOriginal: cantOrig,
      unidad,
      subtotal: precio * cantidad,
    };

    agregarArticulo(vendedorSel, item);
    setExpresiones(prev => ({
      ...prev,
      [vendedorSel]: prev[vendedorSel]
        ? `${prev[vendedorSel]}+${item.subtotal}`
        : `${item.subtotal}`
    }));

    setInputActual('');
    inputRef.current?.focus();
  };

  /* ---------------------- reimpresión (modal) ------------------------ */
  const enviarReimpresion = async (ticket) => {
    try {
      //  ←── SOLO ESTA LÍNEA CAMBIA
      await reimprimirTicket({ id: ticket.id });
    } catch (_) {/* toast viene del contexto */}
    setShowReimpresion(false);
    inputRef.current?.focus();
  };

  /* ------------------ finalizar venta y guardar ---------------------- */
  const finalizarVenta = async (formaPagoId) => {
    const vendedor = usuarios.find(u => u.nombre === vendedorSel);
    if (!vendedor) { toast.error('Vendedor no encontrado'); return; }

    const articulosBD = historial.map(it => ({
      articuloId: it.id || 1,
      cantidad  : it.cantidad,
      precio    : it.precio,
      total     : it.subtotal,
      peso      : it.cantidadOriginal ?? null,
    }));
    const articulosPrint = historial.map(it => ({
      nombre: it.nombre,
      precio: it.subtotal,
      peso  : it.cantidadOriginal ?? null,
    }));

    try {
      await addTicket({
        articulosPrint,
        articulosBD,
        vendedorId : vendedor.id,
        formaPagoId
      });

      limpiarVentas(vendedorSel);
      setExpresiones(prev => ({ ...prev, [vendedorSel]: '' }));
      setInputActual('');
      toast.success('Venta finalizada.');
      inputRef.current?.focus();
    } catch (err) {
      console.error('Error guardando la venta:', err);
      toast.error('Error al guardar la venta.');
    }
  };

  /* ------------------- descuento desde modal ------------------------- */
  const handleDescuentoSubmit = (monto) => {
    const desc = {
      nombre  : 'Descuento',
      categoria: 'descuento',
      precio  : -monto,
      cantidad: 1,
      cantidadOriginal: 1,
      unidad  : '',
      subtotal: -monto,
    };
    agregarArticulo(vendedorSel, desc);
    setExpresiones(prev => ({
      ...prev,
      [vendedorSel]: prev[vendedorSel]
        ? `${prev[vendedorSel]}+(${desc.subtotal})`
        : `${desc.subtotal}`
    }));
    setShowModalDesc(false);
    inputRef.current?.focus();
  };

  /* ------------------ limpiar lista actual --------------------------- */
  const limpiarLista = () => {
    limpiarVentas(vendedorSel);
    setExpresiones(prev => ({ ...prev, [vendedorSel]: '' }));
    setInputActual('');
    inputRef.current?.focus();
  };

  /* ----------------------------- total ------------------------------- */
  const total = Math.round(
    historial.reduce((a, it) => a + it.subtotal, 0) * 100
  ) / 100;

  /* =============================== JSX =============================== */
  return (
    <div className="ventas-con-calculadora">
      {/* ---------- cabecera totales ---------- */}
      <div className="totales-fila" style={{ fontSize: '1.8em' }}>
        <div className="item-total">👤 {vendedorSel}</div>
        <div className="item-total">🛒 {historial.length} art.</div>
        <div className="item-total">
          💰 ${Math.floor(total).toLocaleString('es-AR')}
          <span className="centavos-chicos">
            ,{total.toFixed(2).split('.')[1]}
          </span>
        </div>
      </div>

      {/* ---------- visor de expresiones ---------- */}
      <div className="visor-cadena">{expresiones[vendedorSel] || '0'}</div>

      {/* ---------- input principal + cambio de vendedor ---------- */}
      <div className="input-section" style={{ display: 'flex', alignItems: 'center' }}>
        {isMobile ? (
          <select
            value={vendedorSel}
            onChange={e => setVendedorSel(e.target.value)}
            className="select-vendedor"
          >
            {usuarios.map(u => (
              <option key={u.id} value={u.nombre}>{u.nombre}</option>
            ))}
          </select>
        ) : (
          <>
            <button onClick={() => cambiarVendedor(-1)} className="btn-vendedor">◀️</button>
            <button onClick={() => cambiarVendedor(1)}  className="btn-vendedor">▶️</button>
          </>
        )}

        <input
          ref={inputRef}
          type="tel"
          inputMode="decimal"
          pattern="[0-9.*]*"
          autoComplete="off"
          value={inputActual}
          onChange={e => setInputActual(e.target.value)}
          placeholder="1000*2  |  .7/.8  |  / buscar"
          className="input-principal"
        />
      </div>

      {/* ---------- listado de artículos ---------- */}
      <div className="lista-articulos">
        {historial.length === 0
          ? <p className="lista-vacia">No hay artículos cargados</p>
          : historial.map((it, i) => (
              <div key={i} className="item-ticket">
                <span>{it.nombre}</span>
                <span>{it.cantidadOriginal ?? '-'} {it.unidad ?? ''}</span>
                <span>${it.precio.toFixed(2)}</span>
                <span>= ${Math.floor(it.subtotal)}
                  <span style={{ fontSize: '0.7em', verticalAlign: 'super' }}>
                    ,{it.subtotal.toFixed(2).split('.')[1]}
                  </span>
                </span>
              </div>
            ))
        }
      </div>

      {/* ---------- acciones finales ---------- */}
      <div className="finalizar-venta">
        <p>
          <strong>.7</strong> efectivo  •  <strong>.8</strong> crédito  •  <strong>.1</strong> descuento
        </p>
        <button onClick={limpiarLista} className="btn-limpiar">Limpiar Lista</button>
      </div>

      {/* ---------- modales ---------- */}
      {showModalArt && (
        <ModalArticulos
          articulos={articulos}
          onClose={() => setShowModalArt(false)}
          onSubmit={(art, p, c) => {
            const cantNum = parseFloat(c) || 1;
            const unidad = cantNum >= 50 ? 'g' : 'kg';
            const cantConv = unidad === 'g' ? cantNum / 1000 : cantNum;
            agregarArticulo(vendedorSel, {
              ...art,
              precio: parseFloat(p) || 0,
              cantidad: cantConv,
              cantidadOriginal: cantNum,
              unidad,
              subtotal: (parseFloat(p) || 0) * cantConv,
            });
            setExpresiones(prev => ({
              ...prev,
              [vendedorSel]: prev[vendedorSel]
                ? `${prev[vendedorSel]}+${(parseFloat(p) || 0) * cantConv}`
                : `${(parseFloat(p) || 0) * cantConv}`,
            }));
            setShowModalArt(false);
            inputRef.current?.focus();
          }}
        />
      )}

      {showModalDesc && (
        <ModalDescuento
          onSubmit={handleDescuentoSubmit}
          onClose={() => setShowModalDesc(false)}
        />
      )}

      {showReimpresion && (
        <ModalReimpresion
          tickets={[...tickets]
            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
            .slice(0, 10)}
          onClose={() => setShowReimpresion(false)}
          onConfirm={enviarReimpresion}
        />
      )}
    </div>
  );
}

export default VentasConCalculadora;
