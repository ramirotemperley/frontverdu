import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ArticulosProvider } from './context/ArticulosContext';
import { FormasPagoProvider } from './context/FormasPagoContext';
import { TicketsProvider } from './context/TicketsContext';
import { UsuariosProvider } from './context/UsuariosContext'; // Importamos el nuevo contexto
import Menu from './components/Menu';
import Ventas from './components/Ventas';
import GestionArticulos from './components/GestionArticulos';
import GestionFormasPago from './components/GestionFormasPago';
import Tickets from './components/Tickets';
import Usuarios from './components/Usuarios'; // Importamos el componente Usuarios
import './App.css';

function App() {
  return (
    <ArticulosProvider>
      <FormasPagoProvider>
        <TicketsProvider>
          <UsuariosProvider> {/* Envolvemos la aplicación con el contexto de usuarios */}
            <Router>
              <Menu />
              <Routes>
                <Route path="/" element={<Ventas />} />
                <Route path="/articulos" element={<GestionArticulos />} />
                <Route path="/formas-pago" element={<GestionFormasPago />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/usuarios" element={<Usuarios />} /> {/* Nueva ruta para Usuarios */}
              </Routes>
            </Router>
          </UsuariosProvider>
        </TicketsProvider>
      </FormasPagoProvider>
    </ArticulosProvider>
  );
}

export default App;
