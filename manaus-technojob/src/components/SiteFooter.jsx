import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter() {
  return (
    <footer className="bg-[#0B1220] text-slate-300 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 pb-10">
          <div>
            <p className="text-xl font-semibold text-white">Manaus TechnoJob</p>
            <p className="mt-3 text-slate-400">
              Conectando talentos às oportunidades através de Inteligência Artificial
            </p>
          </div>

          <div>
            <p className="font-semibold text-white">Para Freelancers</p>
            <ul className="mt-3 space-y-2">
              <li><Link to="/cadastro-freelancer" className="hover:text-white">Cadastre seu Currículo</Link></li>
              <li><Link to="/match-vaga" className="hover:text-white">Encontrar Vagas</Link></li>
              <li><Link to="/perfil-freelancer" className="hover:text-white">Meu Perfil</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white">Para Empresas</p>
            <ul className="mt-3 space-y-2">
              <li><Link to="/cadastro-empresa" className="hover:text-white">Cadastre sua Empresa</Link></li>
              <li><Link to="/cadastro-vaga" className="hover:text-white">Cadastrar Vaga</Link></li>
              <li><Link to="/match-empresa" className="hover:text-white">Encontrar Talentos</Link></li>
              <li><Link to="/perfil-empresa" className="hover:text-white">Perfil da Empresa</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white">Suporte</p>
            <ul className="mt-3 space-y-2">
              <li><Link to="/about" className="hover:text-white">Sobre Nós</Link></li>
              <li><a href="/about#contato" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-white/10 pt-6">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Manaus TechnoJob. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
