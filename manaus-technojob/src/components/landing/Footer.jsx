import React from "react";

export default function Footer() {
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
              <li><a href="#inicio" className="hover:text-white">Cadastre seu Currículo</a></li>
              <li><a href="#inicio" className="hover:text-white">Encontrar Vagas</a></li>
              <li><a href="#inicio" className="hover:text-white">Meu Perfil</a></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white">Para Empresas</p>
            <ul className="mt-3 space-y-2">
              <li><a href="#inicio" className="hover:text-white">Cadastre sua Empresa</a></li>
              <li><a href="#inicio" className="hover:text-white">Cadastrar Vaga</a></li>
              <li><a href="#inicio" className="hover:text-white">Encontrar Talentos</a></li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-white">Suporte</p>
            <ul className="mt-3 space-y-2">
              <li><a href="#inicio" className="hover:text-white">Sobre Nós</a></li>
              <li><a href="#inicio" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 flex-wrap border-t border-white/10 pt-6">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Manaus TechnoJob. Todos os direitos reservados.
          </p>

          <a
            href="#inicio"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm hover:bg-white/15"
            title="Designed by Readdy"
          >
            <span>Designed by</span>
            <span className="inline-block h-2 w-2 rounded-full bg-fuchsia-400" />
            <span className="font-medium">Readdy</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
