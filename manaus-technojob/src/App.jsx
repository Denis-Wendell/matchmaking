import { useState } from 'react'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de teste */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-amazon-600">
            Manaus TechnoJob
          </h1>
          <p className="text-gray-600">Sistema de Matchmaking com IA</p>
        </div>
      </header>

      {/* Conteúdo de teste */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Teste do Tailwind CSS</h2>
          <p className="text-gray-600 mb-4">
            Se você consegue ver este cartão com bordas arredondadas e sombra, 
            o Tailwind está funcionando perfeitamente!
          </p>
          
          {/* Botão de teste */}
          <button 
            onClick={() => setCount(count + 1)}
            className="bg-amazon-600 hover:bg-amazon-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cliques: {count}
          </button>
        </div>

        {/* Cards de teste */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-amazon-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-amazon-600 text-xl">🤖</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">IA Avançada</h3>
            <p className="text-gray-600 text-sm">
              Sistema inteligente para matching de freelancers e vagas.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🎯</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Matching Inteligente</h3>
            <p className="text-gray-600 text-sm">
              Algoritmos que encontram a combinação perfeita.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">⚡</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Resultados Rápidos</h3>
            <p className="text-gray-600 text-sm">
              Matches personalizados em tempo real.
            </p>
          </div>
        </div>

        {/* Seção com gradiente */}
        <div className="bg-manaus-gradient rounded-xl p-8 text-white text-center mt-8">
          <h2 className="text-2xl font-bold mb-4">Ecossistema Tech Amazonense</h2>
          <p className="text-amazon-100">
            Conectando talentos da Amazônia com oportunidades inovadoras
          </p>
        </div>
      </main>
    </div>
  )
}

export default App