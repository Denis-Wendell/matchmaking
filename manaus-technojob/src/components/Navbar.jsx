import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados para controlar autenticação e tipo de usuário
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificar estado de autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const type = localStorage.getItem('userType');
      
      console.log('🔄 Navbar verificando auth:', { loggedIn, type }); // Debug
      
      setIsLoggedIn(loggedIn);
      setUserType(type);

      if (loggedIn && type) {
        // Carregar dados do usuário
        const storedData = localStorage.getItem(`${type}Data`);
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            setUserData(parsedData);
            console.log('✅ Dados do usuário carregados:', parsedData.nome); // Debug
          } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
          }
        }
      } else {
        setUserData(null);
      }
    };

    // Verificar estado inicial
    checkAuth();

    // Listener para mudanças no localStorage (entre abas)
    const handleStorageChange = (e) => {
      if (e.key === 'isLoggedIn' || e.key === 'userType' || e.key?.includes('Data')) {
        console.log('🔄 Storage mudou, verificando auth novamente'); // Debug
        checkAuth();
      }
    };

    // IMPORTANTE: Listener para o evento customizado do performLogin
    const handleAuthChange = () => {
      console.log('🔄 Evento authStateChanged recebido'); // Debug
      checkAuth();
    };

    // Adicionar todos os listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // Definir links baseado no estado de autenticação
  const getNavLinks = () => {
    if (!isLoggedIn) {
      // Usuário não logado
      return [
        { path: '/', label: 'Início' },
        { path: '/cadastro-freelancer', label: 'Cadastro Freelancer' },
        { path: '/cadastro-empresa', label: 'Cadastro Empresa' },
        { path: '/about', label: 'Sobre' },
      ];
    }

    if (userType === 'freelancer') {
      // Freelancer logado (SEM o link do perfil)
      return [
        { path: '/match-vaga', label: 'Match Vaga' },
        { path: '/minhas-candidaturas', label: 'Minhas Candidaturas' },
        { path: '/about', label: 'Sobre' },
      ];
    }

    if (userType === 'empresa') {
      // Empresa logada (SEM o link do perfil)
      return [
        { path: '/match-empresa', label: 'Match Empresa' },
        { path: '/vagas-cadastradas', label: 'Vagas Cadastradas' },
        { path: '/cadastro-vaga', label: 'Cadastrar Vaga' },
        { path: '/about', label: 'Sobre' },
      ];
    }

    return [];
  };

  // Função para logout
  const handleLogout = () => {
    console.log('🚪 Fazendo logout'); // Debug
    
    // Limpar localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    localStorage.removeItem('authToken');
    localStorage.removeItem('freelancerData');
    localStorage.removeItem('empresaData');
    
    // Disparar evento para sincronizar
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    
    // Atualizar estados locais
    setIsLoggedIn(false);
    setUserType(null);
    setUserData(null);
    
    // Redirecionar para home
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;
  const navLinks = getNavLinks();

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
                {/* Nome do usuário + Link para perfil */}
                {userData && (
                  <Link
                    to={userType === 'freelancer' ? '/perfil-freelancer' : '/perfil-empresa'}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    Olá, <span className="font-medium">{userData.nome}</span>
                  </Link>
                )}
                
                {/* Badge do tipo de usuário */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  userType === 'freelancer' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {userType === 'freelancer' ? 'Freelancer' : 'Empresa'}
                </span>

                {/* Botão de logout */}
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
              
              {/* Mobile User Actions */}
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