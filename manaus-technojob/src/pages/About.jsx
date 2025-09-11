import React from "react";
import AboutHero from "../components/about/AboutHero";
import Mission from "../components/about/Mission";
import Objectives from "../components/about/Objectives";
import Technology from "../components/about/Technology";
import Team from "../components/about/Team";
import AboutCta from "../components/about/AboutCta";

export default function About() {
  return (
    <main className="bg-white text-slate-900">
      <AboutHero />
      <Mission />
      <Objectives />
      <Technology />
      <Team />
      <AboutCta />
    </main>
  );
}
