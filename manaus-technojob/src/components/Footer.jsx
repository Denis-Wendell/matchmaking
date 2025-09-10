function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      {/* Container com largura MUITO limitada e centralizado */}
      <div className="w-full max-w-4xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Logo e Descrição */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              Manaus TechnoJob
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Conectando talentos às oportunidades 
              através de Inteligência Artificial
            </p>
          </div>

          {/* Para Freelancers */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-4">
              Para Freelancers
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => setCurrentPage('freelancer')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Cadastre seu Currículo
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('vagas')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Encontrar Vagas
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('perfil')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Meu Perfil
                </button>
              </li>
            </ul>
          </div>

          {/* Para Empresas */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-4">
              Para Empresas
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => setCurrentPage('empresa')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Cadastre sua Empresa
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('cadastro-vaga')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Cadastrar Vaga
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('talentos')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Encontrar Talentos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('perfil-empresa')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Perfil da Empresa
                </button>
              </li>
            </ul>
          </div>

          {/* Suporte */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-4">
              Suporte
            </h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => setCurrentPage('about')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Sobre Nós
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('contato')}
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright - Também limitado */}
        <div className="border-t border-gray-700 mt-12 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Manaus TechnoJob. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;