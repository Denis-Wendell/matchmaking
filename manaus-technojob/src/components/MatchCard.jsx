// components/MatchCard.jsx
function MatchCard({ match, userType = 'freelancer' }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {userType === 'freelancer' ? match.titulo : match.nomeFreelancer}
          </h3>
          
          <p className="text-gray-600 mb-3">
            {userType === 'freelancer' ? match.empresa : match.habilidades}
          </p>
          
          <p className="text-gray-700 mb-4 line-clamp-2">
            {match.descricao}
          </p>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {match.tags?.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            <p>🤖 <strong>Análise da IA:</strong> {match.explicacaoIA}</p>
          </div>
          
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Ver Detalhes
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {userType === 'freelancer' ? 'Candidatar-se' : 'Contratar'}
            </button>
          </div>
        </div>
        
        <div className="text-center ml-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
            match.score >= 80 ? 'bg-green-100' : 
            match.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
          }`}>
            <span className={`text-2xl font-bold ${
              match.score >= 80 ? 'text-green-600' : 
              match.score >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {match.score}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Compatibilidade
          </div>
        </div>
      </div>
    </div>
  );
}

export default MatchCard;