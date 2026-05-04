import { useState } from 'react';
import { apiOrchestrator, apiAuth } from '../services/api';

const AdminPanel = () => {
  const [formData, setFormData] = useState({ nombre: '', apellido: '', correo: '', rol: 'PROFESOR', password: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    try {
      // Utilizamos el endpoint de admin de MS1 que permite especificar el rol
      const res = await apiAuth.post('/usuarios', formData);
      setMsg({ text: 'Usuario creado exitosamente', type: 'success' });
      setFormData({ nombre: '', apellido: '', correo: '', rol: 'PROFESOR', password: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'Error al crear usuario', type: 'error' });
    }
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Crear Usuario (Admin)</h1>
      {msg.text && (
        <div className={`p-4 mb-4 rounded ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 shadow rounded">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input type="text" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="mt-1 p-2 w-full border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Apellido</label>
          <input type="text" value={formData.apellido} onChange={e => setFormData({...formData, apellido: e.target.value})} className="mt-1 p-2 w-full border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Correo (@utec.edu.pe)</label>
          <input type="email" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value})} className="mt-1 p-2 w-full border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña temporal</label>
          <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 p-2 w-full border rounded" required minLength="8"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="mt-1 p-2 w-full border rounded">
            <option value="PROFESOR">Profesor</option>
            <option value="ADMIN">Admin</option>
            <option value="ESTUDIANTE">Estudiante</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700">Crear Usuario</button>
      </form>
    </div>
  );
};

export default AdminPanel;
