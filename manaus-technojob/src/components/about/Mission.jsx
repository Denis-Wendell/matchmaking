import React from "react";

export default function Mission() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Nossa Missão
          </h2>

          <p className="mt-6 text-lg font-semibold text-[#2E86FF]">
            Facilitar e otimizar processos de contratação e prestação de
            serviços através do uso de Inteligência Artificial.
          </p>

          <div className="mt-4 space-y-4 text-slate-700 leading-relaxed">
            <p>
              Acreditamos que a tecnologia pode transformar a forma como
              freelancers e empresas se conectam, criando um ecossistema mais
              eficiente, transparente e justo para todos os envolvidos.
            </p>
            <p>
              Nossa plataforma utiliza algoritmos avançados de machine learning
              para analisar perfis, habilidades e necessidades, garantindo
              matches de alta qualidade e reduzindo o tempo e recursos dos
              processos de recrutamento tradicionais.
            </p>
          </div>
        </div>

        <div className="order-first lg:order-none">
          <div className="overflow-hidden rounded-2xl shadow-md">
            <img
              src="/images/mission-ai.jpg"
              alt="Tecnologia de IA em um notebook"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
