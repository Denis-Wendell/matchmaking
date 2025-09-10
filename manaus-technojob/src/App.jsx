import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

// Importar páginas
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import CadastroEmpresa from './pages/Cadastro_empresa';
import CadastroFreelancer from './pages/Cadastro_freelancer';
import CadastroVaga from './pages/Cadastro_vaga';
import MatchEmpresa from './pages/Match_empresa';
import MatchVaga from './pages/Match_vaga';
import PerfilEmpresa from './pages/Perfil_empresa';
import PerfilFreelancer from './pages/Perfil_freelancer';

// Importar Layout
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />
          <Route path="/cadastro-freelancer" element={<CadastroFreelancer />} />
          <Route path="/cadastro-vaga" element={<CadastroVaga />} />
          <Route path="/match-empresa" element={<MatchEmpresa />} />
          <Route path="/match-vaga" element={<MatchVaga />} />
          <Route path="/perfil-empresa" element={<PerfilEmpresa />} />
          <Route path="/perfil-freelancer" element={<PerfilFreelancer />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;