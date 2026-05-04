import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiAuth } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    password: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      // /auth/register asigna el rol ESTUDIANTE por defecto
      await apiAuth.post('/auth/register', formData);
      setSuccess('Registro exitoso. Ya puedes iniciar sesión.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarte');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro de Estudiante
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Crea tu cuenta con tu correo @utec.edu.pe
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input 
              type="text" 
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="mt-1 p-2 w-full border rounded border-gray-300" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Apellido</label>
            <input 
              type="text" 
              value={formData.apellido}
              onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              className="mt-1 p-2 w-full border rounded border-gray-300" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input 
              type="email" 
              value={formData.correo}
              onChange={(e) => setFormData({...formData, correo: e.target.value})}
              className="mt-1 p-2 w-full border rounded border-gray-300" 
              placeholder="alumno@utec.edu.pe"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="mt-1 p-2 w-full border rounded border-gray-300" 
              required 
              minLength="8"
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 transition">
            Registrarme
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
