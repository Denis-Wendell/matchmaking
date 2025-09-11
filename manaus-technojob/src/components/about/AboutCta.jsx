import React from "react";
import { Link } from "react-router-dom";

export default function AboutCta() {
  return (
    <section className="py-16">
      <div className="max-w-full">
        <div className="rounded-none md:rounded-3xl mx-auto max-w-6xl p-10 md:p-12 text-center text-white bg-gradient-to-r from-[#2E86FF] via-[#5a59ff] to-[#7B2FFF]">
          <h3 className="text-2xl md:text-3xl font-bold">
            Pronto para Fazer Parte da Revolução?
          </h3>
          <p className="mt-2 text-white/90">
            Junte-se a nós e transforme a forma como você encontra oportunidades ou talentos
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/cadastro-freelancer"
              className="rounded-xl bg-white text-slate-900 px-5 py-3 font-semibold hover:bg-slate-100 transition"
            >
              Começar Agora
            </Link>
            <Link
              to="/cadastro-empresa"
              className="rounded-xl ring-2 ring-white/60 px-5 py-3 font-semibold hover:bg-white/10 transition"
            >
              Falar Conosco
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
