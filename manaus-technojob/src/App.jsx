import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// páginas essenciais
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";

import CadastroEmpresa from "./pages/Cadastro_empresa";
import CadastroFreelancer from "./pages/Cadastro_freelancer";
import CadastroVaga from "./pages/Cadastro_vaga";
import MatchEmpresa from "./pages/Match_empresa";
import MatchVaga from "./pages/Match_vaga";
import PerfilEmpresa from "./pages/Perfil_empresa";
import PerfilFreelancer from "./pages/Perfil_freelancer";
import Vagas_cadastrada_empresa from "./pages/vagas_cadastras_empresa";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />
        <Route path="/cadastro-freelancer" element={<CadastroFreelancer />} />
        <Route path="/cadastro-vaga" element={<CadastroVaga />} />
        <Route path="/match-empresa" element={<MatchEmpresa />} />
        <Route path="/match-vaga" element={<MatchVaga />} />
        <Route path="/perfil-empresa" element={<PerfilEmpresa />} />
        <Route path="/perfil-freelancer" element={<PerfilFreelancer />} />
        <Route path="/vagas-cadastradas" element={<Vagas_cadastrada_empresa />} />
      </Route>
    </Routes>
  );
}
