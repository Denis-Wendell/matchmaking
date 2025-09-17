import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Perfil_freelancer() {
  const navigate = useNavigate();
  
  // Estados para dados da API (sua lógica mantida)
  const [freelancerData, setFreelancerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para interface (do seu colega)
  const [activeTab, setActiveTab] = useState('informacoes');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Verificar se usuário está logado e é um freelancer (sua lógica mantida)
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

  // Suas funções de formatação mantidas
  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatarValorHora = (valor) => {
    if (!valor) return 'Não informado';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  const getNivelExperienciaLabel = (nivel) => {
    const labels = {
      'junior': 'Júnior (1-3 anos)',
      'pleno': 'Pleno (3-5 anos)', 
      'senior': 'Sênior (5-8 anos)',
      'especialista': 'Especialista (8+ anos)'
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
      'ativo': 'Disponível',
      'inativo': 'Inativo',
      'pausado': 'Pausado',
      'pendente': 'Pendente'
    };
    return labels[status] || status || 'Disponível';
  };

  const getStatusColor = (status) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-700',
      'inativo': 'bg-red-100 text-red-700',
      'pausado': 'bg-yellow-100 text-yellow-700',
      'pendente': 'bg-blue-100 text-blue-700'
    };
    return colors[status] || 'bg-green-100 text-green-700';
  };

  // Tabs de navegação (do seu colega)
  const tabs = [
    { id: 'informacoes', label: 'Informações Gerais' },
    { id: 'habilidades', label: 'Habilidades' },
    { id: 'experiencia', label: 'Experiência' },
    { id: 'formacao', label: 'Formação' },
    { id: 'contato', label: 'Contato' }
  ];

  const handleEditProfile = () => {
    setIsEditing(true);
    alert('Funcionalidade de edição em desenvolvimento. Em breve você poderá editar seu perfil!');
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('freelancerData');
    localStorage.removeItem('userType');
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-center text-gray-600">Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !freelancerData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg max-w-md">
          <p className="text-center text-red-700 mb-4">
            {error || 'Erro ao carregar dados do freelancer'}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header do Freelancer (design do seu colega) */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Avatar do Freelancer */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {freelancerData.nome?.charAt(0) || 'U'}
                </span>
              </div>

              {/* Informações principais */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {freelancerData.nome || 'Nome não informado'}
                </h1>
                <div className="text-lg text-gray-600 mb-2">
                  {freelancerData.area_atuacao || 'Área não informada'}
                </div>
                <div className="text-gray-600 mb-4">
                  {freelancerData.cidade && freelancerData.estado 
                    ? `${freelancerData.cidade}, ${freelancerData.estado}`
                    : 'Localização não informada'}
                </div>

                {/* Tags de status */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className={`px-3 py-1 rounded-full font-medium ${getStatusColor(freelancerData.status)}`}>
                    {getStatusLabel(freelancerData.status)}
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {getNivelExperienciaLabel(freelancerData.nivel_experiencia)}
                  </div>
                  {freelancerData.valor_hora && (
                    <div className="text-gray-600 font-medium">
                      {formatarValorHora(freelancerData.valor_hora)}/hora
                    </div>
                  )}
                </div>
              </div>
            </div> 
          </div>
        </div>

        {/* Tabs de navegação (do seu colega) */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo das tabs */}
        <div className="space-y-8">
          {activeTab === 'informacoes' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informações Gerais
              </h2>

              {/* Resumo Profissional */}
              {freelancerData.resumo_profissional && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Profissional</h3>
                  <p className="text-gray-700 leading-relaxed">{freelancerData.resumo_profissional}</p>
                </div>
              )}

              {/* Objetivos Profissionais */}
              {freelancerData.objetivos_profissionais && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Objetivos Profissionais</h3>
                  <p className="text-gray-700 leading-relaxed">{freelancerData.objetivos_profissionais}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Área de Atuação:</span>
                      <span className="font-medium">{freelancerData.area_atuacao || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nível:</span>
                      <span className="font-medium">{getNivelExperienciaLabel(freelancerData.nivel_experiencia)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Modalidade:</span>
                      <span className="font-medium">{getModalidadeTrabalhoLabel(freelancerData.modalidade_trabalho)}</span>
                    </div>
                    {freelancerData.disponibilidade && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disponibilidade:</span>
                        <span className="font-medium">{freelancerData.disponibilidade}</span>
                      </div>
                    )}
                    {freelancerData.valor_hora && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor/Hora:</span>
                        <span className="font-medium text-green-600">{formatarValorHora(freelancerData.valor_hora)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Informações Pessoais */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{freelancerData.email || 'Não informado'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Telefone:</span>
                      <span className="font-medium">{formatarTelefone(freelancerData.telefone)}</span>
                    </div>
                    {freelancerData.cidade && freelancerData.estado && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Localização:</span>
                        <span className="font-medium">{freelancerData.cidade}, {freelancerData.estado}</span>
                      </div>
                    )}
                    {freelancerData.data_nascimento && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nascimento:</span>
                        <span className="font-medium">{formatarData(freelancerData.data_nascimento)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Principais Habilidades */}
              {freelancerData.principais_habilidades && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Principais Habilidades</h3>
                  <p className="text-gray-700 leading-relaxed">{freelancerData.principais_habilidades}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'habilidades' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Habilidades Técnicas</h2>

              {/* Skills */}
              {freelancerData.skills_array && freelancerData.skills_array.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Técnicas</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData.skills_array.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Áreas de Interesse */}
              {freelancerData.areas_interesse && freelancerData.areas_interesse.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Áreas de Interesse</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData.areas_interesse.map((area, index) => (
                      <span 
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Idiomas */}
              {freelancerData.idiomas && freelancerData.idiomas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Idiomas</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData.idiomas.map((idioma, index) => (
                      <span 
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {idioma}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!freelancerData.skills_array?.length && !freelancerData.areas_interesse?.length && !freelancerData.idiomas?.length && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma habilidade cadastrada ainda.</p>
                  <button 
                    onClick={handleEditProfile}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Adicionar habilidades
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'experiencia' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Experiência Profissional</h2>

              {freelancerData.experiencia_profissional ? (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Experiência</h3>
                  <p className="text-gray-700 leading-relaxed">{freelancerData.experiencia_profissional}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma experiência cadastrada ainda.</p>
                  <button 
                    onClick={handleEditProfile}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Adicionar experiência
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'formacao' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Formação e Certificações</h2>

              {/* Formação Acadêmica */}
              {(freelancerData.formacao_academica || freelancerData.instituicao || freelancerData.ano_conclusao) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Formação Acadêmica</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    {freelancerData.formacao_academica && (
                      <h4 className="font-semibold text-gray-900">{freelancerData.formacao_academica}</h4>
                    )}
                    {freelancerData.instituicao && (
                      <p className="text-blue-600">{freelancerData.instituicao}</p>
                    )}
                    {freelancerData.ano_conclusao && (
                      <p className="text-gray-600 text-sm">{freelancerData.ano_conclusao}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Certificações */}
              {freelancerData.certificacoes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificações</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700">{freelancerData.certificacoes}</p>
                  </div>
                </div>
              )}

              {!freelancerData.formacao_academica && !freelancerData.certificacoes && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma formação ou certificação cadastrada ainda.</p>
                  <button 
                    onClick={handleEditProfile}
                    className="mt-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Adicionar formação
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contato' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações de Contato</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {freelancerData.email || 'Não informado'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {formatarTelefone(freelancerData.telefone)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {freelancerData.linkedin ? (
                        <a href={freelancerData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                          {freelancerData.linkedin}
                        </a>
                      ) : 'Não informado'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {freelancerData.github ? (
                        <a href={freelancerData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                          {freelancerData.github}
                        </a>
                      ) : 'Não informado'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfólio</label>
                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {freelancerData.url_portfolio ? (
                        <a href={freelancerData.url_portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                          {freelancerData.url_portfolio}
                        </a>
                      ) : 'Não informado'}
                    </div>
                  </div>
                </div>
              </div>

              
              
            </div>
          )}
        </div>

        {/* Informações da Conta */}
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Membro desde:</span> {formatarData(freelancerData.created_at)}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span> {formatarData(freelancerData.updated_at)}
            </div>
            {freelancerData.ultimo_login && (
              <div>
                <span className="font-medium">Último login:</span> {formatarData(freelancerData.ultimo_login)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Perfil_freelancer;