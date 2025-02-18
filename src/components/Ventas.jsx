// src/components/Ventas.jsx

import './Ventas.css';
import React, { useState, useContext, useEffect, useRef } from 'react';
import { ArticulosContext } from '../context/ArticulosContext';
import { FormasPagoContext } from '../context/FormasPagoContext';
import { TicketsContext } from '../context/TicketsContext';
import { UsuariosContext } from '../context/UsuariosContext';
import ResumenVenta from './ResumenVenta';
import VistaPreviaArticulo from './VistaPreviaArticulo';
import ListaArticulosSeleccionados from './ListaArticulosSeleccionados';
import VoiceInput from './VoiceInput';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Ventas() {
  const { articulos } = useContext(ArticulosContext);
  const { formasPago } = useContext(FormasPagoContext); 
  const { setTickets } = useContext(TicketsContext);
  const { usuarios, setUsuarios } = useContext(UsuariosContext);

  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [listaSeleccionados, setListaSeleccionados] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [precio, setPrecio] = useState('');
  const [peso, setPeso] = useState('');
  const [pasoActual, setPasoActual] = useState(0);
  const [formaPagoSeleccionada, setFormaPagoSeleccionada] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(
    localStorage.getItem('ultimoVendedor') || 'Vendedor 1'
  );
  const [cursor, setCursor] = useState(0);

  const pesoInputRef = useRef(null);

  const [mostrandoSeleccionPago, setMostrandoSeleccionPago] = useState(false);

  const [fromVoice, setFromVoice] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!usuarios || usuarios.length === 0) {
      console.warn('No hay vendedores disponibles. Verificá el backend.');
    }
  }, [usuarios]);
  

  useEffect(() => {
    localStorage.setItem('ultimoVendedor', vendedorSeleccionado);
  }, [vendedorSeleccionado]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (pasoActual === 1 && fromVoice) {
      console.log('Iniciando temporizador de 5s por haber ingresado por voz en pasoActual=1');
      timerRef.current = setTimeout(() => {
        console.log('Pasaron 5 segundos sin acción tras ingreso por voz');
        if (pasoActual === 1 && fromVoice) {
          console.log('Agregando artículo automáticamente sin peso por timeout');
          handleAgregarArticulo(true);
          document.getElementById('busqueda-input')?.focus();
          setPasoActual(0);
          setFromVoice(false);
        }
      }, 5000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [pasoActual, fromVoice]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setMostrarDropdown(true);
    console.log('Cambio en búsqueda:', e.target.value);
  };

  const articulosFiltrados = articulos.filter((art) => {
    const nombreValido = art.nombre?.toLowerCase() || '';
    const codigoValido = art.codigo?.toString() || ''; // Convierte a string por si es numérico
    
    return (
      nombreValido.includes(busqueda.toLowerCase()) ||
      codigoValido.startsWith(busqueda)
    );
  });

  console.log('Artículos filtrados:', articulosFiltrados);

  const handleSeleccionarArticulo = (articulo) => {
    if (articulo) {
      if (articulo.codigo === '999' || articulo.nombre === '999') {
        setMostrandoSeleccionPago(true);
        setSeleccionado(null);
        setBusqueda('');
        setMostrarDropdown(false);
        setCursor(0);
        setPasoActual(0);
        setFromVoice(false);
        console.log('Seleccionado artículo 999: seleccionando forma de pago');
        return;
      }

      setSeleccionado(articulo);
      setMostrarDropdown(false);
      setBusqueda('');
      setCursor(0);
      setPasoActual(1);
      setMensajeError('');
      setFromVoice(false);
      console.log('Seleccionado artículo:', articulo.nombre);

      setTimeout(() => {
        document.getElementById('precio-input')?.focus();
      }, 100);
    }
  };

  const handleKeyDownBusqueda = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (busqueda === '999') {
        setMostrandoSeleccionPago(true);
        setSeleccionado(null);
        setBusqueda('');
        setMostrarDropdown(false);
        setCursor(0);
        setPasoActual(0);
        setFromVoice(false);
        console.log('Ingreso directo "999": seleccionando forma de pago');
      } else if (mostrarDropdown && articulosFiltrados.length > 0) {
        handleSeleccionarArticulo(articulosFiltrados[cursor] || { nombre: 'Verdulería' });
      } else {
        handleSeleccionarArticulo({ nombre: 'Verdulería' });
      }
    } else if (mostrarDropdown && articulosFiltrados.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((prevCursor) => (prevCursor + 1) % articulosFiltrados.length);
        console.log('Navegando hacia abajo en el dropdown:', (cursor + 1) % articulosFiltrados.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((prevCursor) =>
          prevCursor === 0 ? articulosFiltrados.length - 1 : prevCursor - 1
        );
        console.log('Navegando hacia arriba en el dropdown:', cursor === 0 ? articulosFiltrados.length - 1 : cursor - 1);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('Enter presionado en pasoActual:', pasoActual);

      setFromVoice(false);

      if (pasoActual === 1) {
        if (!precio || isNaN(precio) || parseFloat(precio) <= 0) {
          setMensajeError('Por favor, ingresa un precio válido.');
          document.getElementById('precio-input')?.focus();
          console.log('Precio inválido');
          return;
        }

        document.getElementById('peso-input')?.focus();
        setPasoActual(2);
        console.log('Paso a peso');
      } else if (pasoActual === 2) {
        if (!peso) {
          handleAgregarArticulo(true);
          document.getElementById('busqueda-input')?.focus();
          setPasoActual(0);
          console.log('Peso opcional no ingresado: artículo agregado sin peso');
          return;
        }

        if (isNaN(peso) || parseFloat(peso) <= 0) {
          setMensajeError('Por favor, ingresa un peso válido.');
          document.getElementById('peso-input')?.focus();
          console.log('Peso inválido');
          return;
        }

        handleAgregarArticulo(false);
        document.getElementById('busqueda-input')?.focus();
        setPasoActual(0);
        console.log('Artículo agregado con peso');
      }
    }
  };

  const handleAgregarArticulo = (pesoOpcional) => {
    if (!precio) {
      setMensajeError('Debe ingresar un precio válido.');
      console.log('Precio faltante al agregar artículo');
      return;
    }

    const pesoNumerico = parseFloat(peso);
    let unidadPeso = 'kg';
    let pesoEnKg = 1; // Valor por defecto si no se ingresa peso
    const precioFloat = parseFloat(precio);

    if (pesoNumerico && pesoNumerico > 0) {
      if (pesoNumerico >= 50) {
        unidadPeso = 'g';
        pesoEnKg = pesoNumerico / 1000;
      } else {
        unidadPeso = 'kg';
        pesoEnKg = pesoNumerico;
      }
    }

    const articulo = {
      ...seleccionado,
      precio: precioFloat,
      peso: (pesoNumerico && pesoNumerico > 0) ? pesoNumerico : 1, // Si no hay peso válido, usar 1
      unidadPeso: unidadPeso,
      total: precioFloat * pesoEnKg
    };

    setListaSeleccionados((prev) => [...prev, articulo]);
    setSeleccionado(null);
    setPrecio('');
    setPeso('');
    setMensajeError('');
    console.log('Artículo agregado:', articulo);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown') && !e.target.closest('.input-container')) {
        setMostrarDropdown(false);
        console.log('Clic fuera del dropdown: cerrando dropdown');
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (pasoActual === 0) {
      const busq = document.getElementById('busqueda-input');
      if (busq) busq.focus();
      console.log('Enfocando en búsqueda');
    } else if (pasoActual === 1) {
      const preInput = document.getElementById('precio-input');
      if (preInput) preInput.focus();
      console.log('Enfocando en precio');
    } else if (pasoActual === 2) {
      const pInput = document.getElementById('peso-input');
      if (pInput) pInput.focus();
      console.log('Enfocando en peso');
    }
  }, [pasoActual]);

  useEffect(() => {
    if (mostrarDropdown) {
      const dropdown = document.querySelector('.dropdown');
      if (dropdown) {
        dropdown.style.zIndex = '1000';
        console.log('Mostrando dropdown');
      }
    }
  }, [mostrarDropdown]);

  const totalAcumulado = listaSeleccionados.reduce(
    (total, articulo) => total + (articulo.total || 0),
    0
  );

  const cantidadArticulos = listaSeleccionados.length;

  // Lógica para finalizar venta cuando se actualice formaPagoSeleccionada
  useEffect(() => {
    if (formaPagoSeleccionada) {
      handleFinalizarVenta();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formaPagoSeleccionada]);

  const handleFinalizarVenta = async () => {
    if (!formaPagoSeleccionada) {
      alert('Por favor, selecciona una forma de pago.');
      console.log('Forma de pago no seleccionada');
      return;
    }

    const nuevoTicket = {
      vendedor: vendedorSeleccionado,
      formaPago: formaPagoSeleccionada,
      articulos: listaSeleccionados.map((articulo) => ({
        nombre: articulo.nombre,
        precioUnitario: articulo.precio,
        peso: articulo.peso,
        total: articulo.total,
      })),
      totalVenta: totalAcumulado,
      fecha: new Date(),
    };

    try {
      const response = await axios.post('http://localhost:4000/ventas', nuevoTicket);
      console.log('Venta creada en el backend:', response.data);

      setTickets((prev) => [...prev, response.data.venta]);
      setListaSeleccionados([]);
      setPasoActual(0);
      setMostrandoSeleccionPago(false);
      setMensajeError('');
      toast.success('Venta creada correctamente');
      console.log('Venta finalizada y actualizada en el frontend');
      setFormaPagoSeleccionada('');
    } catch (error) {
      console.error('Error al crear la venta en el backend:', error.response ? error.response.data : error.message);
      toast.error('Hubo un error al crear la venta. Por favor, intenta nuevamente.');
    }
  };

  const handleClickFinalizarVenta = () => {
    setMostrandoSeleccionPago(true);
    console.log('Seleccionando forma de pago');
  };

  return (
    <div className="ventas">
      <ResumenVenta
  cantidadArticulos={cantidadArticulos}
  totalAcumulado={Number(totalAcumulado) || 0}
  vendedores={usuarios}
  vendedorSeleccionado={vendedorSeleccionado}
  setVendedorSeleccionado={setVendedorSeleccionado}
/>

      {mensajeError && (
        <div className="mensaje-error">
          <p>{mensajeError}</p>
        </div>
      )}

      {!mostrandoSeleccionPago && (
        <>
          <VoiceInput
            articulos={articulos}
            setSeleccionado={setSeleccionado}
            setPrecio={setPrecio}
            setPasoActual={setPasoActual}
            pesoInputRef={pesoInputRef}
            setBusqueda={setBusqueda}
            setMostrarDropdown={setMostrarDropdown}
            setCursor={setCursor}
            setMensajeError={setMensajeError}
            setFromVoice={setFromVoice}
          />

          <div className="input-container">
            <input
              id="busqueda-input"
              type="text"
              inputMode="text"
              placeholder="Código o nombre del artículo"
              value={busqueda}
              onChange={handleBusquedaChange}
              onKeyDown={handleKeyDownBusqueda}
              className="input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
            />
            {mostrarDropdown && (
              <ul className="dropdown">
                {articulosFiltrados.length > 0 ? (
                  articulosFiltrados.map((articulo, index) => (
                    <li
                      key={index}
                      onClick={() => handleSeleccionarArticulo(articulo)}
                      className={`dropdown-item ${cursor === index ? 'highlighted' : ''}`}
                    >
                      {articulo.nombre}
                    </li>
                  ))
                ) : (
                  <li className="dropdown-item">No hay artículos disponibles</li>
                )}
              </ul>
            )}
          </div>

          <div className="ventas-inputs-preview-container">
            <div className="ventas-inputs">
              <div>
                <label htmlFor="precio-input">Precio:</label>
                <input
                  id="precio-input"
                  type="number"
                  placeholder="Precio"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="ventas-input"
                />
              </div>
              <div>
                <label htmlFor="peso-input">Peso:</label>
                <input
                  id="peso-input"
                  type="number"
                  placeholder="Peso"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="ventas-input"
                  ref={pesoInputRef}
                />
              </div>
            </div>

            <div className="ventas-vista-previa">
              {seleccionado && (
                <VistaPreviaArticulo
                  seleccionado={seleccionado}
                  precio={precio}
                  peso={peso}
                />
              )}
            </div>

            <div className="ventas-finalizar-container">
              {listaSeleccionados.length > 0 && (
                <button onClick={handleClickFinalizarVenta} className="finalizar-button">
                  Finalizar Venta
                </button>
              )}
            </div>
          </div>

          <ListaArticulosSeleccionados
            listaSeleccionados={listaSeleccionados}
            setListaSeleccionados={setListaSeleccionados}
          />
        </>
      )}

      {mostrandoSeleccionPago && (
        <div className="seleccion-pago-container">
          <h3>Selecciona la forma de pago</h3>
          <div className="formas-pago-botones">
            {formasPago.map((fp) => (
              <button
                key={fp.id}
                onClick={() => {
                  setFormaPagoSeleccionada(fp.nombre);
                }}
                className="boton-forma-pago"
              >
                {fp.nombre}
              </button>
            ))}
          </div>
          <button onClick={() => setMostrandoSeleccionPago(false)} className="volver-button">
            Volver a la Venta
          </button>
        </div>
      )}
    </div>
  );
}

export default Ventas;
