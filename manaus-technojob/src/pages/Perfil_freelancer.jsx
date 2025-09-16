import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Perfil_freelancer() {
  const navigate = useNavigate();
  const [freelancerData, setFreelancerData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Verificar se usuário está logado e é um freelancer
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const freelancerDataStored = localStorage.getItem('freelancerData');

    if (!isLoggedIn || userType !== 'freelancer') {
      navigate('/login');
      return;
    }

    if (freelancerDataStored) {
      try {
        const parsedData = JSON.parse(freelancerDataStored);
        setFreelancerData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados do freelancer:', error);
        setError('Erro ao carregar dados do perfil');
      }
    } else {
      setError('Dados do freelancer não encontrados');
    }

    setLoading(false);
  }, [navigate]);

  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatarCPF = (cpf) => {
    if (!cpf) return 'Não informado';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarCEP = (cep) => {
    if (!cep) return 'Não informado';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatarValorHora = (valor) => {
    if (!valor) return 'Não informado';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  const getNivelExperienciaLabel = (nivel) => {
    const labels = {
      'junior': 'Júnior',
      'pleno': 'Pleno',
      'senior': 'Sênior'
    };
    return labels[nivel] || nivel || 'Não informado';
  };

  const getModalidadeTrabalhoLabel = (modalidade) => {
    const labels = {
      'remoto': 'Remoto',
      'presencial': 'Presencial',
      'hibrido': 'Híbrido'
    };
    return labels[modalidade] || modalidade || 'Não informado';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'pausado': 'Pausado',
      'pendente': 'Pendente'
    };
    return labels[status] || status || 'Não informado';
  };

  const getStatusColor = (status) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-800',
      'inativo': 'bg-red-100 text-red-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-center text-gray-600">Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancerData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg">
          <p className="text-center text-red-700">
            {error || 'Erro ao carregar dados do freelancer'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 mx-auto block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Perfil do Freelancer</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(freelancerData.status)}`}>
          {getStatusLabel(freelancerData.status)}
        </span>
      </div>

      {/* Informações Pessoais */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Informações Pessoais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <p className="text-gray-900 font-medium">{freelancerData.nome || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{freelancerData.email || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <p className="text-gray-900">{formatarTelefone(freelancerData.telefone)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <p className="text-gray-900">{formatarCPF(freelancerData.cpf)}</p>
          </div>
          
          {freelancerData.data_nascimento && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <p className="text-gray-900">{formatarData(freelancerData.data_nascimento)}</p>
            </div>
          )}
          
          {freelancerData.profissao && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profissão</label>
              <p className="text-gray-900">{freelancerData.profissao}</p>
            </div>
          )}
        </div>
      </div>

      {/* Endereço */}
      {(freelancerData.endereco_completo || freelancerData.cidade || freelancerData.estado || freelancerData.cep) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {freelancerData.endereco_completo && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                <p className="text-gray-900">{freelancerData.endereco_completo}</p>
              </div>
            )}
            
            {freelancerData.cidade && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <p className="text-gray-900">{freelancerData.cidade}</p>
              </div>
            )}
            
            {freelancerData.estado && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <p className="text-gray-900">{freelancerData.estado}</p>
              </div>
            )}
            
            {freelancerData.cep && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <p className="text-gray-900">{formatarCEP(freelancerData.cep)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Informações Profissionais */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Informações Profissionais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área de Atuação</label>
            <p className="text-gray-900">{freelancerData.area_atuacao || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Experiência</label>
            <p className="text-gray-900">{getNivelExperienciaLabel(freelancerData.nivel_experiencia)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade de Trabalho</label>
            <p className="text-gray-900">{getModalidadeTrabalhoLabel(freelancerData.modalidade_trabalho)}</p>
          </div>
          
          {freelancerData.valor_hora && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Hora</label>
              <p className="text-gray-900">{formatarValorHora(freelancerData.valor_hora)}</p>
            </div>
          )}
          
          {freelancerData.disponibilidade && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
              <p className="text-gray-900">{freelancerData.disponibilidade}</p>
            </div>
          )}
        </div>
      </div>

      {/* Principais Habilidades */}
      {freelancerData.principais_habilidades && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Principais Habilidades</h2>
          <p className="text-gray-700 leading-relaxed">{freelancerData.principais_habilidades}</p>
        </div>
      )}

      {/* Skills */}
      {freelancerData.skills_array && freelancerData.skills_array.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {freelancerData.skills_array.map((skill, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Idiomas */}
      {freelancerData.idiomas && freelancerData.idiomas.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Idiomas</h2>
          <div className="flex flex-wrap gap-2">
            {freelancerData.idiomas.map((idioma, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {idioma}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resumo Profissional */}
      {freelancerData.resumo_profissional && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Resumo Profissional</h2>
          <p className="text-gray-700 leading-relaxed">{freelancerData.resumo_profissional}</p>
        </div>
      )}

      {/* Experiência Profissional */}
      {freelancerData.experiencia_profissional && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Experiência Profissional</h2>
          <p className="text-gray-700 leading-relaxed">{freelancerData.experiencia_profissional}</p>
        </div>
      )}

      {/* Objetivos Profissionais */}
      {freelancerData.objetivos_profissionais && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Objetivos Profissionais</h2>
          <p className="text-gray-700 leading-relaxed">{freelancerData.objetivos_profissionais}</p>
        </div>
      )}

      {/* Formação Acadêmica */}
      {(freelancerData.formacao_academica || freelancerData.instituicao || freelancerData.ano_conclusao) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Formação Acadêmica</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {freelancerData.formacao_academica && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formação</label>
                <p className="text-gray-900">{freelancerData.formacao_academica}</p>
              </div>
            )}
            
            {freelancerData.instituicao && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                <p className="text-gray-900">{freelancerData.instituicao}</p>
              </div>
            )}
            
            {freelancerData.ano_conclusao && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Conclusão</label>
                <p className="text-gray-900">{freelancerData.ano_conclusao}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certificações */}
      {freelancerData.certificacoes && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Certificações</h2>
          <p className="text-gray-700 leading-relaxed">{freelancerData.certificacoes}</p>
        </div>
      )}

      {/* Links Profissionais */}
      {(freelancerData.url_portfolio || freelancerData.linkedin || freelancerData.github) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Links Profissionais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {freelancerData.url_portfolio && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Portfólio</label>
                <a 
                  href={freelancerData.url_portfolio} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {freelancerData.url_portfolio}
                </a>
              </div>
            )}
            
            {freelancerData.linkedin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <a 
                  href={freelancerData.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {freelancerData.linkedin}
                </a>
              </div>
            )}
            
            {freelancerData.github && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                <a 
                  href={freelancerData.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {freelancerData.github}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Áreas de Interesse */}
      {freelancerData.areas_interesse && freelancerData.areas_interesse.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Áreas de Interesse</h2>
          <div className="flex flex-wrap gap-2">
            {freelancerData.areas_interesse.map((area, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Informações da Conta */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Informações da Conta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Cadastro</label>
            <p className="text-gray-900">{formatarData(freelancerData.created_at)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Última Atualização</label>
            <p className="text-gray-900">{formatarData(freelancerData.updated_at)}</p>
          </div>
          
          {freelancerData.ultimo_login && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Último Login</label>
              <p className="text-gray-900">{formatarData(freelancerData.ultimo_login)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => setIsEditing(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Editar Perfil
        </button>
        
        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('freelancerData');
            localStorage.removeItem('userType');
            localStorage.removeItem('isLoggedIn');
            navigate('/login');
          }}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Sair
        </button>
      </div>

      {/* Modal ou aviso para edição */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Perfil</h3>
            <p className="text-gray-600 mb-4">
              A funcionalidade de edição de perfil está em desenvolvimento. 
              Em breve você poderá atualizar suas informações diretamente por aqui.
            </p>
            <button
              onClick={() => setIsEditing(false)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil_freelancer;