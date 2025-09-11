import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";         // use o seu Navbar existente
import SiteFooter from "./SiteFooter"; // rodapé global

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
