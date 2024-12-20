function ListaArticulosSeleccionados({ listaSeleccionados, handleEditar, handleEliminar }) {
    return (
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
            {listaSeleccionados.map((articulo, index) => {
              const precio = articulo.precio ? articulo.precio.toFixed(2) : '-';
              const peso = articulo.peso !== null ? `${articulo.peso} ${articulo.unidadPeso || 'kg'}` : '-';
              const total = articulo.total !== null ? articulo.total.toFixed(2) : '-';
  
              return (
                <tr key={index}>
                  <td>{articulo.nombre}</td>
                  <td>${precio}</td>
                  <td>{peso}</td>
                  <td>${total}</td>
                  <td>
                    <button onClick={() => handleEditar(index)} className="edit-button">
                      Editar
                    </button>
                    <button onClick={() => handleEliminar(index)} className="delete-button">
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  
  export default ListaArticulosSeleccionados;
  
