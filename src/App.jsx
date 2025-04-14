import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ArticulosProvider } from './context/ArticulosContext';
import { FormasPagoProvider } from './context/FormasPagoContext';
import { TicketsProvider } from './context/TicketsContext';
import { UsuariosProvider } from './context/UsuariosContext';
import { SalesProvider } from './context/SalesContext';

import Menu from './components/Menu';
import GestionArticulos from './components/GestionArticulos';
import GestionFormasPago from './components/GestionFormasPago';
import Tickets from './components/Tickets';
import Usuarios from './components/Usuarios';
import VentasConCalculadora from './components/VentasConCalculadora'; 
import './App.css';

function App() {
  return (
    <ArticulosProvider>
      <FormasPagoProvider>
        <TicketsProvider>
          <UsuariosProvider>
            <SalesProvider>
              <Router>
                <Menu />
                <Routes>
                  {/* Redirige de "/" a "/calculadora" */}
                  <Route path="/" element={<Navigate to="/calculadora" />} />
                  <Route path="/articulos" element={<GestionArticulos />} />
                  <Route path="/formas-pago" element={<GestionFormasPago />} />
                  <Route path="/tickets" element={<Tickets />} />
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/calculadora" element={<VentasConCalculadora />} />
                </Routes>
              </Router>
            </SalesProvider>
          </UsuariosProvider>
        </TicketsProvider>
      </FormasPagoProvider>
    </ArticulosProvider>
  );
}

export default App;
