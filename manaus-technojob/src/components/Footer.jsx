import { useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      {/* Container com largura MUITO limitada e centralizado */}
      <div className="w-full max-w-4xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          {/* Logo e Descrição */}
          <div className="md:col-span-3">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              Manaus TechnoJob
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Conectando talentos às oportunidades 
              através de Inteligência Artificial
            </p>
                        
          </div>

          

          {/* Suporte */}
          <div className="md:col-span-1">
            <h4 className="text-white font-semibold mb-4">
              Suporte
            </h4>
            <ul className="space-y-3">
              <li>
                <HashLink
                  to="/About#"
                  smooth
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Sobre Nós
                </HashLink>
              </li>
              <li>
                <HashLink
                  to="/About#contato"
                  smooth
                  className="text-gray-400 hover:text-blue-400 transition-colors text-left block text-sm"
                >
                  Contato
                </HashLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright - Também limitado */}
        <div className="border-t border-gray-700 mt-12 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Manaus TechnoJob. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;