// src/components/VoiceInput.jsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faMicrophoneSlash } from '@fortawesome/free-solid-svg-icons';

const VoiceInput = ({
  articulos,
  setSeleccionado,
  setPrecio,
  setPasoActual,
  pesoInputRef,
  setBusqueda,
  setMostrarDropdown,
  setCursor,
  setMensajeError,
  setFromVoice
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');

  const startRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('El reconocimiento de voz no es compatible con tu navegador.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscription('Escuchando...');
      console.log('Reconocimiento de voz iniciado');
    };

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript.toLowerCase().trim();
      setTranscription(`Reconocido: ${result}`);
      console.log('Resultado de reconocimiento:', result);

      const match = result.match(/(\w+)\s+(\d+)/);
      if (match) {
        const producto = match[1];
        const precioReconocido = parseFloat(match[2]);

        const articuloEncontrado = articulos.find(
          (art) => art.nombre.toLowerCase() === producto.toLowerCase()
        );

        if (articuloEncontrado) {
          setSeleccionado(articuloEncontrado);
          setPrecio(precioReconocido.toString());
          console.log('Artículo encontrado vía voz:', articuloEncontrado.nombre, 'Precio:', precioReconocido);

          // Simular el flujo manual tras seleccionar un artículo
          setBusqueda('');
          setMostrarDropdown(false);
          setCursor(0);
          setMensajeError('');
          setFromVoice(true); // Indicar que viene por voz
          setPasoActual(1);

          // Enfocar el campo de precio
          setTimeout(() => {
            const precioInput = document.getElementById('precio-input');
            if (precioInput) precioInput.focus();
          }, 100);

        } else {
          setTranscription('Producto no encontrado en la lista.');
          console.log('Producto no encontrado:', producto);
        }
      } else {
        setTranscription('Por favor, diga el producto y el precio correctamente (ejemplo: banana 200).');
        console.log('Formato de reconocimiento incorrecto');
      }
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setTranscription('Permiso denegado para acceder al micrófono.');
      } else {
        setTranscription(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Reconocimiento de voz finalizado');
      if (transcription.startsWith('Reconocido:')) {
        setTranscription('Diga el producto y el precio...');
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Error al iniciar el reconocimiento:', err);
      setTranscription('No se pudo iniciar el reconocimiento de voz.');
    }
  };

  return (
    <div className="voice-input-container">
      <button
        onClick={startRecognition}
        disabled={isListening}
        className={`mic-button ${isListening ? 'listening' : ''}`}
        aria-label="Activar reconocimiento de voz"
      >
        <FontAwesomeIcon icon={isListening ? faMicrophoneSlash : faMicrophone} />
      </button>
      <p className="transcription-text">{transcription}</p>
    </div>
  );
};

export default VoiceInput;
