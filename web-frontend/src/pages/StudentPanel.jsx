import { useState, useEffect } from 'react';
import { apiOrchestrator } from '../services/api';

const StudentPanel = () => {
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleTestForbidden = async () => {
    try {
      await apiOrchestrator.post('/orchestrator/action', { data: { codigo: 'CS101', nombre: 'Test' } }, {
        headers: { 'X-Action': 'create_class' }
      });
      setMsg({ text: 'Inesperado: pudiste crear la clase', type: 'success' });
    } catch (err) {
      setMsg({ text: 'Éxito en RBAC: Petición denegada por el Orquestador (403 Forbidden)', type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Panel de Estudiante</h1>
      
      {msg.text && (
        <div className={`p-4 mb-4 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}

      <div className="bg-white p-6 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Mis Clases (Vista de Lectura)</h2>
        <p className="text-gray-600 mb-4">Los alumnos solo pueden listar o ver información a través de read_actions en el orquestador.</p>
        
        <button onClick={handleTestForbidden} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">
          Probar vulnerabilidad: Intentar crear clase
        </button>
      </div>
    </div>
  );
};

export default StudentPanel;
