import React, { useState, useContext, createContext } from 'react';
import { createRoot } from 'react-dom/client';

const ConfiguracionInputsContext = createContext();

const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    maxLengthComentario: 250,
    maxLengthTitulo: 100,
  });

  return (
    <ConfiguracionInputsContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfiguracionInputsContext.Provider>
  );
};

const VentanaConfiguracion = () => {
  const { config, setConfig } = useContext(ConfiguracionInputsContext);

  const handleChange = (e) => {
    setConfig((prev) => ({
      ...prev,
      [e.target.name]: parseInt(e.target.value) || 0,
    }));
  };

  return (
    <div className="p-4 border rounded shadow mb-6">
      <h2 className="text-xl font-bold mb-2">Configuración Global</h2>
      <div className="flex flex-col gap-2">
        <label>
          Máximo caracteres para Comentario:
          <input
            type="number"
            name="maxLengthComentario"
            value={config.maxLengthComentario}
            onChange={handleChange}
            className="ml-2 border p-1 rounded"
          />
        </label>
        <label>
          Máximo caracteres para Título:
          <input
            type="number"
            name="maxLengthTitulo"
            value={config.maxLengthTitulo}
            onChange={handleChange}
            className="ml-2 border p-1 rounded"
          />
        </label>
      </div>
    </div>
  );
};

export default VentanaConfiguracion;

const InputComentario = () => {
  const { config } = useContext(ConfiguracionInputsContext);
  const [valor, setValor] = useState('');

  return (
    <div className="mb-4">
      <label className="block font-semibold">Comentario:</label>
      <input
        type="text"
        maxLength={config.maxLengthComentario}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder={`Máximo ${config.maxLengthComentario} caracteres`}
      />
    </div>
  );
};

const InputTitulo = () => {
  const { config } = useContext(ConfiguracionInputsContext);
  const [valor, setValor] = useState('');

  return (
    <div className="mb-4">
      <label className="block font-semibold">Título:</label>
      <input
        type="text"
        maxLength={config.maxLengthTitulo}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-full border p-2 rounded"
        placeholder={`Máximo ${config.maxLengthTitulo} caracteres`}
      />
    </div>
  );
};

const App = () => {
  return (
    <ConfigProvider>
      <div className="max-w-xl mx-auto mt-10">
        <VentanaConfiguracion />
        <InputComentario />
        <InputTitulo />
      </div>
    </ConfigProvider>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
