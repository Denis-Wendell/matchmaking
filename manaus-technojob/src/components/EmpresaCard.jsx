// src/components/EmpresaCard.jsx
import React from 'react';
import Card from './Card';
import Button from './Button';

function EmpresaCard({ empresa, onInteresse, onVerDetalhes, onCompartilhar }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Logo */}
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
            {empresa.logo}
          </div>

          {/* Informações principais */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">
                {empresa.nome}
              </h3>
              <div className="flex items-center space-x-2">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {empresa.matchPercentual}% Match
                </div>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {empresa.localizacao}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-3a1 1 0 00-1 1v1h2V4a1 1 0 00-1-1zm7.5 3h-15v6h15V6z" clipRule="evenodd" />
                </svg>
                {empresa.modalidade}
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {empresa.porte} porte
              </span>
              <span className="flex items-center font-medium text-green-600">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {empresa.salarioRange}
              </span>
            </div>

            <p className="text-gray-700 mb-4">{empresa.descricao}</p>

            {/* Tecnologias */}
            {empresa.tecnologias && empresa.tecnologias.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {empresa.tecnologias.map((tech, index) => (
                    <span 
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefícios */}
            {empresa.beneficios && empresa.beneficios.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {empresa.beneficios.map((beneficio, index) => (
                    <span 
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {beneficio}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Informações adicionais */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{empresa.vagasAbertas}</span> vagas disponíveis
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCompartilhar && onCompartilhar(empresa)}
                >
                  🔗 Compartilhar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onVerDetalhes && onVerDetalhes(empresa)}
                >
                  Ver Detalhes →
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => onInteresse && onInteresse(empresa)}
                >
                  Interesse na Empresa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default EmpresaCard;