import { useState } from 'react';
import { apiOrchestrator } from '../services/api';

const ProfessorPanel = () => {
  const [formData, setFormData] = useState({ 
    codigo: '', 
    nombre: '', 
    carreraId: 1, 
    creditos: 4 
  });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      // Orquestador X-Action: create_class
      const res = await apiOrchestrator.post('/orchestrator/action', {
        data: {
          ...formData,
          carreraId: parseInt(formData.carreraId),
          creditos: parseInt(formData.creditos)
        }
      }, {
        headers: { 'X-Action': 'create_class' }
      });
      setMsg({ text: 'Clase/Curso creado exitosamente!', type: 'success' });
      setFormData({ codigo: '', nombre: '', carreraId: 1, creditos: 4 });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Error al crear clase', type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Clase (Profesor)</h1>
      {msg.text && (
        <div className={`p-4 mb-4 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700">Carrera</label>
          <select 
            value={formData.carreraId} 
            onChange={e => setFormData({...formData, carreraId: e.target.value})} 
            className="mt-1 p-2 w-full border rounded"
          >
            <option value="1">Cursos Generales</option>
            <option value="15">Ciencia de la Computación</option>
            <option value="13">Sistemas de Información</option>
            <option value="14">Ciencia de Datos e IA</option>
            <option value="21">Ingeniería Industrial</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Código del Curso</label>
          <input type="text" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="mt-1 p-2 w-full border rounded" placeholder="Ej: CS101" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre del Curso</label>
          <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1 p-2 w-full border rounded" placeholder="Ej: Programación I" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Créditos</label>
          <input type="number" min="1" max="10" value={formData.creditos} onChange={e => setFormData({...formData, creditos: e.target.value})} className="mt-1 p-2 w-full border rounded" required />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Enviar Petición a MS2 vía Orquestador</button>
      </form>
    </div>
  );
};

export default ProfessorPanel;
