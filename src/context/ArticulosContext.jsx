import React, { createContext, useState } from 'react';

export const ArticulosContext = createContext();

export const ArticulosProvider = ({ children }) => {
  const [articulos, setArticulos] = useState([
    // Artículos de Frutas
    { codigo: '1', nombre: 'Manzana' },
    { codigo: '2', nombre: 'Banana' },
    { codigo: '3', nombre: 'Naranja' },
    { codigo: '4', nombre: 'Pera' },
    { codigo: '5', nombre: 'Durazno' },
    { codigo: '6', nombre: 'Ciruela' },
    { codigo: '7', nombre: 'Frutilla' },
    { codigo: '8', nombre: 'Melón' },
    { codigo: '9', nombre: 'Sandía' },
    { codigo: '10', nombre: 'Kiwi' },
    { codigo: '11', nombre: 'Ananá' },
    { codigo: '12', nombre: 'Limón' },
    { codigo: '13', nombre: 'Mango' },
    { codigo: '14', nombre: 'Mandarina' },
    { codigo: '15', nombre: 'Uva' },
    { codigo: '16', nombre: 'Arándano' },
    { codigo: '17', nombre: 'Granada' },
    { codigo: '18', nombre: 'Pomelo' },
    { codigo: '19', nombre: 'Cereza' },
    { codigo: '20', nombre: 'Higo' },
    // Artículos de Verduras
    { codigo: '21', nombre: 'Lechuga' },
    { codigo: '22', nombre: 'Tomate' },
    { codigo: '23', nombre: 'Zanahoria' },
    { codigo: '24', nombre: 'Cebolla' },
    { codigo: '25', nombre: 'Pimiento' },
    { codigo: '26', nombre: 'Pepino' },
    { codigo: '27', nombre: 'Calabaza' },
    { codigo: '28', nombre: 'Brócoli' },
    { codigo: '29', nombre: 'Espinaca' },
    { codigo: '30', nombre: 'Coliflor' },
    { codigo: '31', nombre: 'Ajo' },
    { codigo: '32', nombre: 'Berenjena' },
    { codigo: '33', nombre: 'Chaucha' },
    { codigo: '34', nombre: 'Remolacha' },
    { codigo: '35', nombre: 'Repollo' },
    { codigo: '36', nombre: 'Apio' },
    { codigo: '37', nombre: 'Rábano' },
    { codigo: '38', nombre: 'Puerro' },
    { codigo: '39', nombre: 'Zapallo' },
    { codigo: '40', nombre: 'Batata' },
    // Artículo para finalizar la venta
    { codigo: '9999', nombre: 'Terminar' },
    // Artículo por defecto
    { codigo: '0', nombre: 'Verdulería' },
  ]);

  return (
    <ArticulosContext.Provider value={{ articulos, setArticulos }}>
      {children}
    </ArticulosContext.Provider>
  );
};
