import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section id="inicio" className="relative h-[88vh] w-full flex items-center justify-center">
      <img
        src="/images/hero-office.jpg"
        alt="Equipe trabalhando em escritório"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-slate-900/60" />

      <div className="relative z-10 max-w-5xl px-6 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white">
          Conectamos <span className="text-[#2E86FF]">Talentos</span> às
          <span className="text-[#2E86FF]"> Oportunidades</span>
        </h1>

        <p className="mt-5 text-slate-100/90 text-lg md:text-xl">
          Plataforma inteligente de matchmaking que facilita a contratação e
          otimiza processos através de IA
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/cadastro-freelancer"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold bg-[#2E86FF] text-white hover:opacity-90 transition"
          >
            Sou Freelancer
          </Link>
          <Link
            to="/cadastro-empresa"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 transition"
          >
            Sou Empresa
          </Link>
        </div>
      </div>
    </section>
  );
}
