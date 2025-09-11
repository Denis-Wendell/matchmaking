import React from "react";

const steps = [
  {
    title: "1. Cadastre-se",
    desc:
      "Freelancers criam perfis detalhados com habilidades e experiências. " +
      "Empresas cadastram informações e necessidades de contratação.",
    icon: "👤",
  },
  {
    title: "2. IA Analisa",
    desc:
      "Nossa Inteligência Artificial analisa perfis, habilidades e requisitos " +
      "para encontrar as melhores combinações possíveis.",
    icon: "🤖",
  },
  {
    title: "3. Match Perfeito",
    desc:
      "Apresentamos matches compatíveis, facilitando conexões eficientes entre " +
      "freelancers qualificados e empresas.",
    icon: "💜",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Como Funciona
          </h2>
          <p className="text-slate-600 mt-2">
            Processo simples e eficiente com tecnologia avançada
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 p-6 text-center"
            >
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-2xl">
                <span aria-hidden>{s.icon}</span>
              </div>
              <h3 className="font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
