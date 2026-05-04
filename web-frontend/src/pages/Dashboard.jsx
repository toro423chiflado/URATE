import { Link } from 'react-router-dom';
import { authService } from '../services/auth';

const Dashboard = () => {
  const roles = authService.getRoles().map(r => String(r).toUpperCase());

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Control</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {roles.includes('ADMIN') && (
          <Link to="/admin" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Admin Panel</h5>
            <p className="font-normal text-gray-700">Gestionar usuarios y crear profesores.</p>
          </Link>
        )}

        {(roles.includes('PROFESOR') || roles.includes('ADMIN')) && (
          <Link to="/professor" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Professor Panel</h5>
            <p className="font-normal text-gray-700">Crear y gestionar clases.</p>
          </Link>
        )}

        <Link to="/student" className="block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">Student Panel</h5>
          <p className="font-normal text-gray-700">Ver clases disponibles e inscritas.</p>
        </Link>
        
      </div>
    </div>
  );
};

export default Dashboard;
