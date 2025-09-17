import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Perfil_empresa() {
  const navigate = useNavigate();
  const [empresaData, setEmpresaData] = useState(null);
  const [activeTab, setActiveTab] = useState('informacoes');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados apenas para vagas
  const [vagas, setVagas] = useState([]);
  const [loadingVagas, setLoadingVagas] = useState(false);

  useEffect(() => {
    // Verificar se usuário está logado e é uma empresa
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const empresaDataStored = localStorage.getItem('empresaData');

    if (!isLoggedIn || userType !== 'empresa') {
      navigate('/login');
      return;
    }

    if (empresaDataStored) {
      try {
        const parsedData = JSON.parse(empresaDataStored);
        setEmpresaData(parsedData);
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        setError('Erro ao carregar dados do perfil');
      }
    } else {
      setError('Dados da empresa não encontrados');
    }

    setLoading(false);
  }, [navigate]);

  // Carregar vagas quando mudar para a aba de vagas
  useEffect(() => {
    if (activeTab === 'vagas' && empresaData) {
      carregarVagas();
    }
  }, [activeTab, empresaData]);

  // Função simples para carregar vagas
  const carregarVagas = async () => {
    try {
      setLoadingVagas(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/vagas/empresa/minhas?status=todas&pagina=1&limite=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setVagas(result.data.vagas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar vagas:', error);
    } finally {
      setLoadingVagas(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarCNPJ = (cnpj) => {
    if (!cnpj) return 'Não informado';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const getTamanhoEmpresaLabel = (tamanho) => {
    const labels = {
      'startup': 'Startup',
      'pequena': 'Pequena (1-50 funcionários)',
      'media': 'Média (51-200 funcionários)',
      'grande': 'Grande (201-1000 funcionários)',
      'multinacional': 'Multinacional (1000+ funcionários)'
    };
    return labels[tamanho] || tamanho || 'Não informado';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'pausado': 'Pausado',
      'pendente': 'Pendente'
    };
    return labels[status] || status || 'Ativo';
  };

  const getStatusColor = (status) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-800',
      'inativo': 'bg-red-100 text-red-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'pendente': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-green-100 text-green-800';
  };

  const tabs = [
    { id: 'informacoes', label: 'Informações da Empresa' },
    { id: 'vagas', label: 'Vagas Publicadas' },
    { id: 'contato', label: 'Contato' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do perfil...</p>
        </div>
      </div>
    );
  }

  if (error || !empresaData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg max-w-md">
          <p className="text-center text-red-700 mb-4">
            {error || 'Erro ao carregar dados da empresa'}
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
        {/* Header da Empresa */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Logo da Empresa */}
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="text-2xl font-bold text-white">
                  {empresaData.nome?.charAt(0) || 'E'}
                </div>
              </div>

              {/* Informações principais */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {empresaData.nome || 'Nome da Empresa'}
                </h1>
                <div className="text-lg text-gray-600 mb-2">
                  {empresaData.setor_atuacao || 'Setor não informado'}
                </div>
                <div className="text-gray-600 mb-4">
                  {empresaData.cidade && empresaData.estado ? 
                    `${empresaData.cidade}, ${empresaData.estado}` : 
                    'Localização não informada'
                  }
                </div>

                {/* Métricas da empresa */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                    Status: {getStatusLabel(empresaData.status)}
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {getTamanhoEmpresaLabel(empresaData.tamanho_empresa)}
                  </div>
                  {empresaData.created_at && (
                    <div className="text-gray-600">
                      Cadastro: {formatarData(empresaData.created_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex space-x-3">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => navigate('/cadastro-vaga')}
                className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Nova Vaga
              </button>
            </div>
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Vagas Ativas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Vagas Ativas</span>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              8
            </div>
          </div>

          {/* Colaboradores */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Colaboradores</span>
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              127
            </div>
          </div>

          {/* Projetos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Projetos</span>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              156
            </div>
          </div>

          {/* Anos de Mercado */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Anos de Mercado</span>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {empresaData.created_at ? 
                new Date().getFullYear() - new Date(empresaData.created_at).getFullYear() : 
                '7'
              }
            </div>
          </div>
        </div>

        {/* Tabs de navegação */}
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
            <>
              {/* Sobre a Empresa */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Sobre a Empresa
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {empresaData.descricao_empresa || 
                   'Empresa comprometida com a excelência e inovação, buscando sempre os melhores profissionais para integrar nossa equipe.'}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Informações Básicas */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Informações Básicas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">CNPJ:</span>
                        <span className="font-medium">{formatarCNPJ(empresaData.cnpj)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Setor:</span>
                        <span className="font-medium">{empresaData.setor_atuacao || 'Não informado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tamanho:</span>
                        <span className="font-medium">{getTamanhoEmpresaLabel(empresaData.tamanho_empresa)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cadastro:</span>
                        <span className="font-medium">{formatarData(empresaData.created_at)}</span>
                      </div>
                      {empresaData.site_empresa && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Website:</span>
                          <a 
                            href={empresaData.site_empresa}
                            className="text-blue-600 hover:text-blue-800"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {empresaData.site_empresa}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Localização */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Localização
                    </h3>
                    <div className="space-y-3">
                      {empresaData.endereco_completo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Endereço:</span>
                          <span className="font-medium text-right">{empresaData.endereco_completo}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cidade:</span>
                        <span className="font-medium">{empresaData.cidade || 'Não informado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className="font-medium">{empresaData.estado || 'Não informado'}</span>
                      </div>
                      {empresaData.cep && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">CEP:</span>
                          <span className="font-medium">{empresaData.cep}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Áreas de Atuação */}
                {empresaData.areas_atuacao && empresaData.areas_atuacao.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Áreas de Atuação
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {empresaData.areas_atuacao.map((area, index) => (
                        <span 
                          key={index}
                          className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefícios Oferecidos */}
                {empresaData.beneficios_array && empresaData.beneficios_array.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Benefícios Oferecidos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {empresaData.beneficios_array.map((beneficio, index) => (
                        <div key={index} className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{beneficio}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tecnologias Utilizadas */}
                {empresaData.tecnologias_usadas && empresaData.tecnologias_usadas.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tecnologias Utilizadas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {empresaData.tecnologias_usadas.map((tech, index) => (
                        <span 
                          key={index}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'vagas' && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vagas Publicadas
                </h2>
                <button
                  onClick={() => navigate('/cadastro-vaga')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nova Vaga
                </button>
              </div>
              
              {/* Loading */}
              {loadingVagas ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando vagas...</p>
                </div>
              ) : vagas.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma vaga publicada ainda
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Comece publicando sua primeira vaga para atrair os melhores talentos.
                  </p>
                  <button
                    onClick={() => navigate('/cadastro-vaga')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Publicar Primeira Vaga
                  </button>
                </div>
              ) : (
                /* Lista simples das vagas */
                <div className="space-y-4">
                  {vagas.slice(0, 5).map((vaga) => (
                    <div key={vaga.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {vaga.titulo}
                          </h4>
                          <p className="text-gray-600 text-sm mb-2">
                            {vaga.area_atuacao} • {vaga.modalidade_trabalho} • {vaga.localizacao_texto}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              vaga.status === 'ativo' ? 'bg-green-100 text-green-800' :
                              vaga.status === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {vaga.status === 'ativo' ? 'Ativa' : 
                               vaga.status === 'pausado' ? 'Pausada' : 'Inativa'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {vaga.candidaturas || 0} candidatura(s)
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatarData(vaga.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {vagas.length > 5 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => navigate('/vagas-cadastradas')}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver todas as {vagas.length} vagas →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'contato' && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informações de Contato
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Dados da Empresa
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Corporativo
                      </label>
                      <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {empresaData.email_corporativo || 'Não informado'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {formatarTelefone(empresaData.telefone)}
                      </div>
                    </div>
                    {empresaData.site_empresa && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg">
                          <a 
                            href={empresaData.site_empresa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {empresaData.site_empresa}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Pessoa Responsável
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Responsável
                      </label>
                      <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {empresaData.responsavel_nome || 'Não informado'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo
                      </label>
                      <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {empresaData.responsavel_cargo || 'Não informado'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Direto
                      </label>
                      <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                        {empresaData.responsavel_email || 'Não informado'}
                      </div>
                    </div>
                    {empresaData.responsavel_telefone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone Direto
                        </label>
                        <div className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
                          {formatarTelefone(empresaData.responsavel_telefone)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Informações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Logout */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => {
              localStorage.removeItem('authToken');
              localStorage.removeItem('empresaData');
              localStorage.removeItem('userType');
              localStorage.removeItem('isLoggedIn');
              navigate('/login');
            }}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Sair da Conta
          </button>
        </div>
      </div>

      {/* Modal para edição */}
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

export default Perfil_empresa;