import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="text-center py-16">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Manaus <span className="text-amazon-600">TechnoJob</span>
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Conectamos talentos tecnológicos da Amazônia com oportunidades inovadoras 
        usando Inteligência Artificial para encontrar o match perfeito.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/cadastro-freelancer"
          className="bg-amazon-600 hover:bg-amazon-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          🚀 Sou Freelancer
        </Link>
        <Link
          to="/cadastro-empresa"
          className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors"
        >
          🏢 Sou Empresa
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-amazon-600">500+</div>
          <div className="text-gray-600">Freelancers Cadastrados</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-amazon-600">150+</div>
          <div className="text-gray-600">Empresas Parceiras</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-3xl font-bold text-amazon-600">85%</div>
          <div className="text-gray-600">Taxa de Match Sucesso</div>
        </div>
      </div>
    </div>
  );
}

export default Home;