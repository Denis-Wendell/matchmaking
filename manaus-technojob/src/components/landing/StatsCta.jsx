import React from "react";
import { Link } from "react-router-dom";

const stats = [
  { value: "5.000+", label: "Freelancers Cadastrados", color: "text-[#2E86FF]" },
  { value: "1.200+", label: "Empresas Parceiras", color: "text-green-600" },
  { value: "8.500+", label: "Matches Realizados", color: "text-[#2E86FF]" },
  { value: "95%", label: "Taxa de Satisfação", color: "text-orange-600" },
];

export default function StatsCta() {
  return (
    <section id="stats" className="pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className={`text-3xl md:text-4xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-10 md:p-12 text-center text-white bg-gradient-to-r from-[#2E86FF] via-[#5a59ff] to-[#7B2FFF]">
          <h3 className="text-2xl md:text-3xl font-bold">
            Pronto para Encontrar o Match Perfeito?
          </h3>
          <p className="mt-2 text-white/90">
            Junte-se a milhares de profissionais e empresas que já encontraram sucesso
          </p>

          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link to="/cadastro-freelancer" className="rounded-xl bg-white text-slate-900 px-5 py-3 font-semibold hover:bg-slate-100 transition">
              Cadastrar como Freelancer
            </Link>
            <Link to="/cadastro-empresa" className="rounded-xl ring-2 ring-white/60 px-5 py-3 font-semibold hover:bg-white/10 transition">
              Cadastrar Empresa
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
