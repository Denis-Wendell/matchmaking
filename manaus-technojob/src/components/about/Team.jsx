import React from "react";

const people = [
  {
    name: "Marina Silva",
    role: "CEO & Fundadora",
    desc:
      "Especialista em tecnologia e inovação com mais de 10 anos de experiência em RH digital.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    name: "Carlos Santos",
    role: "CTO",
    desc:
      "Engenheiro de software com expertise em IA e ML, liderando nossa equipe técnica.",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Ana Costa",
    role: "Head de Produto",
    desc:
      "Designer de produto focada em experiências que conectam pessoas e oportunidades.",
    color: "from-purple-500 to-fuchsia-500",
  },
];

export default function Team() {
  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
          Nossa Equipe
        </h2>
        <p className="mt-2 text-slate-600">
          Especialistas dedicados ao sucesso da sua carreira
        </p>

        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {people.map((p) => (
            <div
              key={p.name}
              className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm p-6"
            >
              <div
                className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${p.color} grid place-items-center text-white text-2xl`}
              >
                👤
              </div>
              <p className="mt-4 font-semibold text-slate-900">{p.name}</p>
              <p className="text-[#2E86FF] text-sm">{p.role}</p>
              <p className="mt-3 text-sm text-slate-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
