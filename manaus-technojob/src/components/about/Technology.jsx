import React from "react";

const bullets = [
  {
    title: "Algoritmos de Machine Learning",
    desc: "Análise preditiva para identificar os melhores matches.",
  },
  {
    title: "Processamento de Linguagem Natural",
    desc: "Análise automática de currículos e descrições de vagas.",
  },
  {
    title: "Análise de Compatibilidade",
    desc: "Pontuação baseada em múltiplos critérios.",
  },
];

export default function Technology() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-2xl overflow-hidden shadow-md">
          <img
            src="/images/tech-dashboard.jpg"
            alt="Dashboard com gráficos de IA"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Tecnologia Avançada
          </h2>
          <p className="mt-3 text-slate-600">
            Utilizamos tecnologias modernas de IA e ML para garantir matches
            precisos e eficientes.
          </p>

          <ul className="mt-6 space-y-4">
            {bullets.map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm">
                  •
                </span>
                <div>
                  <p className="font-semibold text-slate-900">{b.title}</p>
                  <p className="text-slate-600">{b.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
