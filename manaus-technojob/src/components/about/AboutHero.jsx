import React from "react";

export default function AboutHero() {
  return (
    <section className="relative h-[56vh] w-full flex items-center justify-center">
      <img
        src="/images/about-hero.jpg"
        alt="Escritório moderno com equipe"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-slate-900/55" />
      <div className="relative z-10 max-w-4xl px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">
          Sobre o TalentMatch
        </h1>
        <p className="mt-3 text-white/90 text-lg">
          Revolucionando o mercado de trabalho através da Inteligência Artificial
        </p>
      </div>
    </section>
  );
}
