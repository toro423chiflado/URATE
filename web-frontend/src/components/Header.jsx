import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';

const Header = () => {
  const navigate = useNavigate();
  const user = authService.getUser();
  const roles = authService.getRoles();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <header className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <Link to="/dashboard" className="text-xl font-bold">UTEC Rate</Link>
        <span className="text-sm bg-indigo-800 px-2 py-1 rounded">Rol: {roles.join(', ')}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span>{user.nombre}</span>
        {user.foto && <img src={user.foto} alt="profile" className="w-8 h-8 rounded-full" />}
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold transition"
        >
          Salir
        </button>
      </div>
    </header>
  );
};

export default Header;
