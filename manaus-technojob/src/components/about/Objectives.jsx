import React from "react";

const items = [
  {
    title: "Reduzir a Burocracia",
    desc: "Simplificar e agilizar os processos de contratação, eliminando etapas desnecessárias e reduzindo o tempo para conectar talentos às oportunidades.",
    iconBg: "bg-indigo-100",
    icon: "📄",
  },
  {
    title: "Análise Inteligente",
    desc: "Facilitar a análise de currículos via IA, reduzindo a sobrecarga dos recrutadores e permitindo decisões mais assertivas.",
    iconBg: "bg-green-100",
    icon: "🧠",
  },
  {
    title: "Filtragem Eficiente",
    desc: "Implementar filtros automáticos que identifiquem os candidatos mais qualificados para cada posição específica.",
    iconBg: "bg-violet-100",
    icon: "🔎",
  },
  {
    title: "Qualidade Garantida",
    desc: "Evitar contratações equivocadas, elevando a taxa de sucesso nos processos seletivos.",
    iconBg: "bg-orange-100",
    icon: "✅",
  },
];

export default function Objectives() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Nossos Objetivos
          </h2>
          <p className="text-slate-600 mt-2">
            Transformando o futuro do trabalho freelancer
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-6"
            >
              <div
                className={`h-11 w-11 ${it.iconBg} rounded-xl flex items-center justify-center text-xl`}
              >
                <span aria-hidden>{it.icon}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-900">
                {it.title}
              </h3>
              <p className="mt-2 text-slate-600">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
