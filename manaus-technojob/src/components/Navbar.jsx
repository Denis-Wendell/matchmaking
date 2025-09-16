import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/about', label: 'Sobre' },
    { path: '/match-vaga', label: 'Match Vaga' },
    { path: '/match-empresa', label: 'Match Empresa' },
    { path: '/perfil-freelancer', label: 'Perfil Freelancer' },
    { path: '/perfil-empresa', label: 'PerfilEmpresa' },
    { path: '/cadastro-empresa', label: 'Cadastro Empresa' },
    { path: '/cadastro-freelancer', label: 'Cadastro Freelancer' },
    { path: '/cadastro-vaga', label: 'Cadastro Vaga' },
    { path: '/vagas-cadastradas', label: 'Vagas Cadastradas' },
    { path: '/minhas-candidaturas', label: 'Minhas Candidaturas' },
    


    

   
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manaus TechnoJob
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Login Button */}
          <div className="flex items-center">
            <Link
              to="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
            >
              Login
            </Link>
          </div>

          {/* Mobile menu button (opcional) */}
          <div className="md:hidden">
            <button className="text-gray-600 hover:text-gray-900 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;