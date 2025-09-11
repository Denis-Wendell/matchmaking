import React from "react";

const bullets = [
  { text: "Redução da Burocracia", sub: "Processo de contratação mais ágil e eficiente" },
  { text: "Análise Inteligente", sub: "IA analisa currículos e reduz sobrecarga dos recrutadores" },
  { text: "Filtragem Eficiente", sub: "Candidatos pré-qualificados para cada vaga" },
  { text: "Matches Qualificados", sub: "Evita contratações com candidatos desqualificados" },
];

export default function Benefits() {
  return (
    <section id="beneficios" className="py-16 bg-gradient-to-b from-white to-slate-50/70">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Benefícios para Empresas
          </h2>

          <ul className="mt-6 space-y-4">
            {bullets.map((b) => (
              <li key={b.text} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-600 text-sm">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{b.text}</p>
                  <p className="text-slate-600">{b.sub}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="order-first lg:order-none">
          <div className="overflow-hidden rounded-2xl shadow-md">
            <img
              src="/images/benefits-hiring.jpg"
              alt="Gestor analisando candidatos na tela"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
