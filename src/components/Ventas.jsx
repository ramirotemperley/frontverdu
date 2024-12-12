// Ventas.jsx
import React, { useState, useEffect, useContext } from 'react';
import { ArticulosContext } from '../context/ArticulosContext';
import { FormasPagoContext } from '../context/FormasPagoContext';
import { TicketsContext } from '../context/TicketsContext';
import { UsuariosContext } from '../context/UsuariosContext'; // Nuevo contexto
import './Ventas.css';

function Ventas() {
  const { articulos } = useContext(ArticulosContext);
  const { formasPago } = useContext(FormasPagoContext);
  const { setTickets } = useContext(TicketsContext);
  const { usuarios } = useContext(UsuariosContext); // Lista de vendedores

  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  const [listaSeleccionados, setListaSeleccionados] = useState([]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [precio, setPrecio] = useState('');
  const [peso, setPeso] = useState('');
  const [pasoActual, setPasoActual] = useState(0); // 0: búsqueda, 1: precio, 2: peso
  const [ventaFinalizada, setVentaFinalizada] = useState(false);
  const [formaPagoSeleccionada, setFormaPagoSeleccionada] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [vendedorSeleccionado, setVendedorSeleccionado] = useState(''); // Vendedor seleccionado

  // Filtrar artículos según la búsqueda
  const articulosFiltrados = articulos.filter(
    (art) =>
      art.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      art.codigo.startsWith(busqueda)
  );

  // Función para calcular el total basado en precio y peso
  const totalCalculado = (precioParam, pesoParam) => {
    const precioNumerico = precioParam || parseFloat(precio) || 0;
    let pesoNumerico = pesoParam || parseFloat(peso);

    let pesoEnKg = pesoNumerico;
    let unidadPeso = 'kg';

    // Si el peso no es válido, se asigna 1 kg por defecto
    if (
      isNaN(pesoNumerico) ||
      pesoNumerico <= 0 ||
      pesoParam === null ||
      peso === ''
    ) {
      pesoNumerico = 1;
      pesoEnKg = 1;
      unidadPeso = null;
    } else {
      if (pesoNumerico >= 50) {
        pesoEnKg = pesoNumerico / 1000;
        unidadPeso = 'g';
      } else {
        unidadPeso = 'kg';
      }
    }

    return {
      total: precioNumerico * pesoEnKg,
      pesoEnKg,
      unidadPeso,
      pesoNumerico,
    };
  };

  // Manejar cambios en la búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setMostrarDropdown(true);
  };

  // Manejar la selección de un artículo
  const handleSeleccionarArticulo = (articulo) => {
    if (articulo.nombre === 'Terminar') {
      if (listaSeleccionados.length === 0) {
        setMensajeError('No hay artículos en la venta para finalizar.');
        return;
      }
      setVentaFinalizada(true);
      setSeleccionado(null);
      setBusqueda('');
      setPasoActual(0);
    } else {
      setSeleccionado(articulo);
      setMostrarDropdown(false);
      setBusqueda('');
      setPasoActual(1);
    }
  };

  // Confirmar la selección del artículo con precio y peso
  const handleConfirmarSeleccion = () => {
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      setMensajeError('Por favor, ingresa un precio válido.');
      return;
    }

    let pesoNumerico = parseFloat(peso);

    // Si el peso no es válido, se asigna 1 y se marca como predeterminado
    let pesoPredeterminado = false;
    if (isNaN(pesoNumerico) || pesoNumerico <= 0 || peso === '') {
      pesoNumerico = 1;
      pesoPredeterminado = true;
    }

    setMensajeError('');

    const { total, unidadPeso } = totalCalculado(precioNumerico, pesoNumerico);

    setListaSeleccionados((prev) => [
      ...prev,
      {
        ...seleccionado,
        precio: precioNumerico,
        peso: pesoPredeterminado ? null : pesoNumerico,
        total,
        unidadPeso,
      },
    ]);

    setSeleccionado(null);
    setPasoActual(0);
    setBusqueda('');
    setPrecio('');
    setPeso('');
  };
  // Manejar eventos de teclado
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (pasoActual === 0) {
        if (articulosFiltrados.length > 0) {
          handleSeleccionarArticulo(articulosFiltrados[0]);
        } else {
          // Usar "Verdulería" como artículo por defecto
          const articuloVerduleria = articulos.find(
            (art) => art.nombre === 'Verdulería'
          );
          if (articuloVerduleria) {
            handleSeleccionarArticulo(articuloVerduleria);
          } else {
            setMensajeError('No se encontró el artículo "Verdulería".');
          }
        }
      } else if (pasoActual === 1) {
        setPasoActual(2);
      } else if (pasoActual === 2) {
        handleConfirmarSeleccion();
      }
    }
  };

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown') && !e.target.closest('.input-container')) {
        setMostrarDropdown(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Enfocar el input correspondiente según el paso actual
  useEffect(() => {
    if (pasoActual === 0) {
      document.getElementById('busqueda-input')?.focus();
    } else if (pasoActual === 1) {
      document.getElementById('precio-input')?.focus();
    } else if (pasoActual === 2) {
      document.getElementById('peso-input')?.focus();
    }
  }, [pasoActual]);

  // Eliminar un artículo de la lista
  const handleEliminar = (index) => {
    setListaSeleccionados((prev) => prev.filter((_, i) => i !== index));
  };

  // Editar un artículo de la lista
  const handleEditar = (index) => {
    const articuloAEditar = listaSeleccionados[index];
    setSeleccionado(articuloAEditar);
    setPrecio(articuloAEditar.precio.toString());
    setPeso(
      articuloAEditar.peso !== null ? articuloAEditar.peso.toString() : ''
    );
    handleEliminar(index);
    setPasoActual(1);
  };

  // Calcular el total acumulado de la venta
  const totalAcumulado = listaSeleccionados.reduce(
    (total, articulo) => total + articulo.total,
    0
  );

  const cantidadArticulos = listaSeleccionados.length;

  const { total, unidadPeso } = totalCalculado();

  // Finalizar la venta seleccionando la forma de pago
  const finalizarVenta = (formaPago) => {
    const nuevoTicket = {
      id: Date.now(),
      articulos: listaSeleccionados,
      total: totalAcumulado,
      formaPago,
      vendedor: vendedorSeleccionado, // Agregar vendedor al ticket
      fecha: new Date(),
    };
    setTickets((prev) => [...prev, nuevoTicket]);
    setListaSeleccionados([]);
    setVentaFinalizada(false);
    setFormaPagoSeleccionada('');
    setPasoActual(0);
  };

  // Cancelar la finalización de la venta y regresar a la selección de artículos
  const cancelarFinalizacion = () => {
    setVentaFinalizada(false);
  };

  // Renderizar la selección de forma de pago si la venta está finalizada
  if (ventaFinalizada) {
    return (
      <div className="seleccion-forma-pago">
        <h2>Detalle de la Venta</h2>
        <p>
          <strong>Cantidad de Artículos:</strong> {cantidadArticulos}
        </p>
        <p>
          <strong>Total a Pagar:</strong> ${totalAcumulado.toFixed(2)}
        </p>
        <h3>Seleccione la Forma de Pago</h3>
        <ul>
          {formasPago.map((fp, index) => (
            <li key={index}>
              <button onClick={() => finalizarVenta(fp)}>{fp}</button>
            </li>
          ))}
        </ul>
        <button onClick={cancelarFinalizacion} className="volver-button">
          Volver a la Venta
        </button>
      </div>
    );
  };

  return (
    <div className="ventas">
      <h3 className="header-title">Seleccionar Artículos</h3>

      <div className="total-container">
        <h4>Cantidad de Artículos: {cantidadArticulos}</h4>
        <h4>Total Acumulado: ${totalAcumulado.toFixed(2)}</h4>
        <div className="vendedor-container">
          <label htmlFor="vendedor">Vendedor:</label>
          <select
            id="vendedor"
            value={vendedorSeleccionado}
            onChange={(e) => setVendedorSeleccionado(e.target.value)}
          >
            <option value="">Seleccionar vendedor</option>
            {usuarios.map((usuario) => (
              <option key={usuario} value={usuario}>
                {usuario}
              </option>
            ))}
          </select>
        </div>
      </div>
      {mensajeError && (
        <div className="mensaje-error">
          <p>{mensajeError}</p>
        </div>
      )}

      <div className="input-container">
        <input
          id="busqueda-input"
          type="text"
          placeholder="Código o nombre del artículo"
          value={busqueda}
          onChange={handleBusquedaChange}
          onKeyDown={handleKeyDown}
          className="input"
          autoComplete="off"
        />
        {mostrarDropdown && articulosFiltrados.length > 0 && (
          <ul className="dropdown">
            {articulosFiltrados.map((articulo) => (
              <li
                key={articulo.codigo + articulo.nombre}
                onClick={() => handleSeleccionarArticulo(articulo)}
                className="dropdown-item"
              >
                {articulo.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>

      {pasoActual > 0 && (
        <div className="input-section">
          <div className="inputs">
            <input
              id="precio-input"
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input"
            />
            <input
              id="peso-input"
              type="number"
              placeholder="Peso"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input"
            />
          </div>
          {seleccionado && (
            <div className="preview-card">
              <p>
                <strong>Artículo:</strong> {seleccionado.nombre}
              </p>
              <p>
                <strong>Peso:</strong>{' '}
                {peso !== ''
                  ? peso
                    ? `${peso} ${unidadPeso}`
                    : '-'
                  : '1 kg'}
              </p>
              <p>
                <strong>Total:</strong> ${total.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Artículo</th>
              <th>Precio</th>
              <th>Peso</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaSeleccionados.map((articulo, index) => (
              <tr key={index}>
                <td>{articulo.nombre}</td>
                <td>${articulo.precio.toFixed(2)}</td>
                <td>
                  {articulo.peso !== null
                    ? `${articulo.peso} ${articulo.unidadPeso}`
                    : '-'}
                </td>
                <td>${articulo.total.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => handleEditar(index)}
                    className="edit-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(index)}
                    className="delete-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botón para finalizar la venta */}
      {listaSeleccionados.length > 0 && (
        <button
          onClick={() => setVentaFinalizada(true)}
          className="finalizar-button"
        >
          Finalizar Venta
        </button>
      )}
    </div>
  );
}

export default Ventas;

