import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const type = localStorage.getItem('userType');
      setIsLoggedIn(loggedIn);
      setUserType(type);

      if (loggedIn && type) {
        const storedData = localStorage.getItem(`${type}Data`);
        if (storedData) {
          try {
            setUserData(JSON.parse(storedData));
          } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
          }
        }
      } else {
        setUserData(null);
      }
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === 'isLoggedIn' || e.key === 'userType' || e.key?.includes('Data')) {
        checkAuth();
      }
    };

    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const getNavLinks = () => {
    if (!isLoggedIn) {
      return [
        { path: '/', label: 'Início' },
        { path: '/cadastro-freelancer', label: 'Cadastro Freelancer' },
        { path: '/cadastro-empresa', label: 'Cadastro Empresa' },
        { path: '/about', label: 'Sobre' },
      ];
    }

    if (userType === 'freelancer') {
      return [
        { path: '/match-vaga', label: 'Match Vaga' },
        { path: '/minhas-candidaturas', label: 'Minhas Candidaturas' },
        { path: '/about', label: 'Sobre' },
      ];
    }

    if (userType === 'empresa') {
      return [
        { path: '/match-empresa', label: 'Match Empresa' },
        { path: '/vagas-cadastradas', label: 'Vagas Cadastradas' },
        { path: '/cadastro-vaga', label: 'Cadastrar Vaga' },
        { path: '/about', label: 'Sobre' },
      ];
    }

    return [];
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('authToken');
    localStorage.removeItem('freelancerData');
    localStorage.removeItem('empresaData');
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    setIsLoggedIn(false);
    setUserType(null);
    setUserData(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          
            {/* wrapper relative para a imagem absolute funcionar */}
            <div className="relative h-10 w-40">
              <img
                src="/images/logo_ManTechno.png"
                alt="Escritório moderno com equipe"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
            </div>
       

          {/* Navigation Links - Desktop */}
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

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors duration-200 shadow-sm"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                {userData && (
                  <Link
                    to={userType === 'freelancer' ? '/perfil-freelancer' : '/perfil-empresa'}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Olá, <span className="font-medium">{userData.nome}</span>
                  </Link>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userType === 'freelancer' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userType === 'freelancer' ? 'Freelancer' : 'Empresa'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Sair
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(link.path)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 pb-3 border-t border-gray-200">
                {!isLoggedIn ? (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-base font-medium"
                  >
                    Login
                  </Link>
                ) : (
                  <div className="space-y-3">
                    {userData && (
                      <div className="px-3">
                        <p className="text-sm text-gray-500">Logado como:</p>
                        <Link
                          to={userType === 'freelancer' ? '/perfil-freelancer' : '/perfil-empresa'}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {userData.nome}
                        </Link>
                        <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                          userType === 'freelancer' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {userType === 'freelancer' ? 'Freelancer' : 'Empresa'}
                        </span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-base font-medium"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
