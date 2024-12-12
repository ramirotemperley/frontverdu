import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Menu.css';

function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="menu">
      <div className="menu-container">
        <div className="menu-logo">
          <h1>Mi Aplicación</h1>
        </div>
        <div className="menu-icon" onClick={toggleMenu}>
          ☰
        </div>
        <ul className={`menu-links ${isOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>Ventas</Link>
          </li>
          <li>
            <Link to="/articulos" onClick={() => setIsOpen(false)}>Artículos</Link>
          </li>
          <li>
            <Link to="/formas-pago" onClick={() => setIsOpen(false)}>Formas de Pago</Link>
          </li>
          <li>
            <Link to="/tickets" onClick={() => setIsOpen(false)}>Tickets</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Menu;
