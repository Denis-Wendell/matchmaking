import React from "react";
import Hero from "../components/landing/Hero";
import HowItWorks from "../components/landing/HowItWorks";
import Benefits from "../components/landing/Benefits";
import StatsCta from "../components/landing/StatsCta";

export default function Home() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <Benefits />
      <StatsCta />
    </main>
  );
}
