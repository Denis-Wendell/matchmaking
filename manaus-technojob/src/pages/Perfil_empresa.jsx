// src/pages/Perfil_empresa.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// componentes (substituem os blocos HTML dos modais)
import CandidatosModal from '../components/CandidatosModal';
import PerfilCandidatoModal from '../components/PerfilCandidatoModal';

function Perfil_empresa() {
  const navigate = useNavigate();
  
  // Estados principais
  const [empresaData, setEmpresaData] = useState(null);
  const [activeTab, setActiveTab] = useState('informacoes');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para vagas
  const [vagas, setVagas] = useState([]);
  const [loadingVagas, setLoadingVagas] = useState(false);
  
  // Estados para edição
  const [editData, setEditData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // === Candidatos Modal (lista) ===
  const [candidatosOpen, setCandidatosOpen] = useState(false);
  const [vagaSelecionada, setVagaSelecionada] = useState(null);
  const [candidatos, setCandidatos] = useState([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [candidatosError, setCandidatosError] = useState('');

  // === Perfil completo do candidato (detalhe) ===
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [candidaturaSelecionada, setCandidaturaSelecionada] = useState(null);
  const [detalheLoading, setDetalheLoading] = useState(false);
  const [detalheError, setDetalheError] = useState('');

  // Função para abrir modal de edição
  const abrirModalEdicao = () => {
    setEditData({
      nome: empresaData.nome || '',
      email_corporativo: empresaData.email_corporativo || '',
      telefone: empresaData.telefone || '',
      endereco_completo: empresaData.endereco_completo || '',
      cidade: empresaData.cidade || '',
      estado: empresaData.estado || '',
      cep: empresaData.cep || '',
      setor_atuacao: empresaData.setor_atuacao || '',
      tamanho_empresa: empresaData.tamanho_empresa || 'pequena',
      site_empresa: empresaData.site_empresa || '',
      descricao_empresa: empresaData.descricao_empresa || '',
      principais_beneficios: empresaData.principais_beneficios || '',
      cultura_empresa: empresaData.cultura_empresa || '',
      responsavel_nome: empresaData.responsavel_nome || '',
      responsavel_cargo: empresaData.responsavel_cargo || '',
      responsavel_email: empresaData.responsavel_email || '',
      responsavel_telefone: empresaData.responsavel_telefone || '',
      areas_atuacao: empresaData.areas_atuacao?.join(', ') || '',
      beneficios_array: empresaData.beneficios_array?.join(', ') || '',
      tecnologias_usadas: empresaData.tecnologias_usadas?.join(', ') || '',
    });
    setEditError('');
    setIsEditing(true);
  };

  // Salvar alterações
  const salvarAlteracoes = async () => {
    try {
      setSaveLoading(true);
      setEditError('');
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const dadosParaEnvio = {};
      Object.keys(editData).forEach(key => {
        if (editData[key] && editData[key].toString().trim() !== '') {
          dadosParaEnvio[key] = editData[key];
        }
      });
      if (editData.areas_atuacao && editData.areas_atuacao.trim()) {
        dadosParaEnvio.areas_atuacao = editData.areas_atuacao
          .split(',').map(item => item.trim()).filter(item => item);
      }
      if (editData.beneficios_array && editData.beneficios_array.trim()) {
        dadosParaEnvio.beneficios_array = editData.beneficios_array
          .split(',').map(item => item.trim()).filter(item => item);
      }
      if (editData.tecnologias_usadas && editData.tecnologias_usadas.trim()) {
        dadosParaEnvio.tecnologias_usadas = editData.tecnologias_usadas
          .split(',').map(item => item.trim()).filter(item => item);
      }

      const response = await fetch(`http://localhost:3001/api/empresas/me/perfil`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnvio)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const dadosAtualizados = { ...empresaData, ...result.data };
        setEmpresaData(dadosAtualizados);
        localStorage.setItem('empresaData', JSON.stringify(dadosAtualizados));
        
        setIsEditing(false);
        alert('Perfil atualizado com sucesso!');
      } else {
        setEditError(result.message || 'Erro ao atualizar perfil');
      }

    } catch (error) {
      console.error('Erro ao salvar:', error);
      setEditError('Erro de conexão. Tente novamente.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Atualizar campos do formulário
  const atualizarCampo = (campo, valor) => {
    setEditData(prev => ({ ...prev, [campo]: valor }));
  };

  // Carregar vagas
  const carregarVagas = async () => {
    try {
      setLoadingVagas(true);
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`http://localhost:3001/api/vagas/empresa/minhas?status=todas&pagina=1&limite=50`, {
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

  // ==== Candidatos de uma vaga ====
  const abrirCandidatos = async (vaga) => {
    try {
      setVagaSelecionada(vaga);
      setCandidatosOpen(true);
      setLoadingCandidatos(true);
      setCandidatosError('');
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch(`http://localhost:3001/api/candidaturas/vaga/${vaga.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCandidatos(json.data.candidaturas || []);
      } else {
        setCandidatosError(json.message || 'Falha ao carregar candidatos.');
      }
    } catch (e) {
      console.error(e);
      setCandidatosError('Erro de conexão ao carregar candidatos.');
    } finally {
      setLoadingCandidatos(false);
    }
  };

  // Detalhes do candidato (via candidatura)
  const abrirPerfilCompleto = async (candidaturaId) => {
    try {
      setDetalheLoading(true);
      setDetalheError('');
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await fetch(`http://localhost:3001/api/candidaturas/empresa/${candidaturaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setCandidaturaSelecionada(json.data);
        setPerfilOpen(true);
      } else {
        setDetalheError(json.message || 'Não foi possível carregar o perfil completo.');
      }
    } catch (e) {
      console.error(e);
      setDetalheError('Erro de conexão ao carregar perfil do candidato.');
    } finally {
      setDetalheLoading(false);
    }
  };

  // Formatações
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
    const only = telefone.replace(/\D/g, '');
    if (only.length < 10) return telefone;
    return only.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ativa': 'Ativa',
      'inativa': 'Inativa',
      'pendente': 'Pendente',
      'bloqueada': 'Bloqueada'
    };
    return labels[status] || status || 'Ativa';
  };

  const getStatusColor = (status) => {
    const colors = {
      'ativa': 'bg-green-100 text-green-800',
      'inativa': 'bg-red-100 text-red-800',
      'pendente': 'bg-yellow-100 text-yellow-800',
      'bloqueada': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-green-100 text-green-800';
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

  const tabs = [
    { id: 'informacoes', label: 'Informações da Empresa' },
    { id: 'vagas', label: 'Vagas Publicadas' },
    { id: 'contato', label: 'Contato' }
  ];

  // useEffects
  useEffect(() => {
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
        carregarVagas();
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        setError('Erro ao carregar dados do perfil');
      }
    } else {
      setError('Dados da empresa não encontrados');
    }

    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (activeTab === 'vagas' && empresaData && vagas.length === 0) {
      carregarVagas();
    }
  }, [activeTab, empresaData]); // eslint-disable-line

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

  // ==== Render ====
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

                {/* Métricas */}
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

            {/* Ações */}
            <div className="flex space-x-3">
              <button
                onClick={abrirModalEdicao}
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
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Vagas Ativas</span>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              {vagas.filter(v => v.status === 'ativo').length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total de Vagas</span>
            </div>
            <div className="text-3xl font-bold text-green-600">
              {vagas.length}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Candidaturas</span>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {vagas.reduce((total, vaga) => total + (vaga.candidaturas || 0), 0)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Anos no Mercado</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {empresaData.created_at ? 
                new Date().getFullYear() - new Date(empresaData.created_at).getFullYear() : 
                '0'
              }
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'informacoes', label: 'Informações da Empresa' },
                { id: 'vagas', label: 'Vagas Publicadas' },
                { id: 'contato', label: 'Contato' }
              ].map(tab => (
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

        {/* Conteúdo */}
        <div className="space-y-8">
          {activeTab === 'informacoes' && (
            <>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Sobre a Empresa
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  {empresaData.descricao_empresa || 
                   'Empresa comprometida com a excelência e inovação, buscando sempre os melhores profissionais para integrar nossa equipe.'}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                <div className="space-y-4">
                  {vagas.slice(0, 50).map((vaga) => (
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
                              vaga.status === 'inativo' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {vaga.status === 'ativo' ? 'Ativa' : 
                               vaga.status === 'pausado' ? 'Pausada' : 
                               vaga.status === 'inativo' ? 'Inativa' :
                               vaga.status}
                            </span>
                            <span className="text-xs text-gray-500">
                              {vaga.candidaturas || 0} candidatura(s)
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-gray-500">
                            {formatarData(vaga.created_at)}
                          </div>
                          <button
                            onClick={() => abrirCandidatos(vaga)}
                            className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                          >
                            Ver candidatos
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  onClick={abrirModalEdicao}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Informações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===================== (SUBSTITUÍDO) Modal: Candidatos da Vaga ===================== */}
      <CandidatosModal
        open={candidatosOpen}
        onClose={() => setCandidatosOpen(false)}
        vagaSelecionada={vagaSelecionada}
        loading={loadingCandidatos}
        error={candidatosError}
        candidatos={candidatos}
        onVerPerfil={abrirPerfilCompleto}
      />

      {/* ===================== (SUBSTITUÍDO) Modal: Perfil Completo do Candidato ===================== */}
      <PerfilCandidatoModal
        open={perfilOpen}
        onClose={() => setPerfilOpen(false)}
        loading={detalheLoading}
        error={detalheError}
        candidatura={candidaturaSelecionada}
      />

      {/* ===================== Modal de Edição ===================== */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-gray-900">Editar Perfil da Empresa</h3>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={saveLoading}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {editError && (
                <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-red-700 text-sm">{editError}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-8">
              {/* (formulário de edição) — permanece igual ao seu código original */}
              {/* Informações Básicas */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      value={editData.nome}
                      onChange={(e) => atualizarCampo('nome', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Corporativo *
                    </label>
                    <input
                      type="email"
                      value={editData.email_corporativo}
                      onChange={(e) => atualizarCampo('email_corporativo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      value={editData.telefone}
                      onChange={(e) => atualizarCampo('telefone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Site da Empresa
                    </label>
                    <input
                      type="url"
                      value={editData.site_empresa}
                      onChange={(e) => atualizarCampo('site_empresa', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.exemplo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Setor de Atuação *
                    </label>
                    <input
                      type="text"
                      value={editData.setor_atuacao}
                      onChange={(e) => atualizarCampo('setor_atuacao', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Tecnologia, Saúde, Educação"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tamanho da Empresa *
                    </label>
                    <select
                      value={editData.tamanho_empresa}
                      onChange={(e) => atualizarCampo('tamanho_empresa', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="startup">Startup</option>
                      <option value="pequena">Pequena (1-50 funcionários)</option>
                      <option value="media">Média (51-200 funcionários)</option>
                      <option value="grande">Grande (201-1000 funcionários)</option>
                      <option value="multinacional">Multinacional (1000+ funcionários)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço Completo
                    </label>
                    <textarea
                      value={editData.endereco_completo}
                      onChange={(e) => atualizarCampo('endereco_completo', e.target.value)}
                      rows="2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rua, número, bairro..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={editData.cidade}
                      onChange={(e) => atualizarCampo('cidade', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado (UF)
                    </label>
                    <input
                      type="text"
                      value={editData.estado}
                      onChange={(e) => atualizarCampo('estado', e.target.value)}
                      maxLength="2"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SP"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={editData.cep}
                      onChange={(e) => atualizarCampo('cep', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>

              {/* Sobre a Empresa */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Sobre a Empresa</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição da Empresa *
                    </label>
                    <textarea
                      value={editData.descricao_empresa}
                      onChange={(e) => atualizarCampo('descricao_empresa', e.target.value)}
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descreva sua empresa, missão, valores..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cultura da Empresa
                    </label>
                    <textarea
                      value={editData.cultura_empresa}
                      onChange={(e) => atualizarCampo('cultura_empresa', e.target.value)}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Como é trabalhar na sua empresa..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Principais Benefícios
                    </label>
                    <textarea
                      value={editData.principais_beneficios}
                      onChange={(e) => atualizarCampo('principais_beneficios', e.target.value)}
                      rows="3"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Benefícios oferecidos aos funcionários..."
                    />
                  </div>
                </div>
              </div>

              {/* Responsável */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pessoa Responsável</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Responsável *
                    </label>
                    <input
                      type="text"
                      value={editData.responsavel_nome}
                      onChange={(e) => atualizarCampo('responsavel_nome', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cargo *
                    </label>
                    <input
                      type="text"
                      value={editData.responsavel_cargo}
                      onChange={(e) => atualizarCampo('responsavel_cargo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email do Responsável
                    </label>
                    <input
                      type="email"
                      value={editData.responsavel_email}
                      onChange={(e) => atualizarCampo('responsavel_email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone do Responsável
                    </label>
                    <input
                      type="tel"
                      value={editData.responsavel_telefone}
                      onChange={(e) => atualizarCampo('responsavel_telefone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Arrays */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Áreas e Tecnologias</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Áreas de Atuação
                    </label>
                    <input
                      type="text"
                      value={editData.areas_atuacao}
                      onChange={(e) => atualizarCampo('areas_atuacao', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Separe por vírgulas: Frontend, Backend, Mobile"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separe múltiplas áreas por vírgulas</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Benefícios Oferecidos
                    </label>
                    <input
                      type="text"
                      value={editData.beneficios_array}
                      onChange={(e) => atualizarCampo('beneficios_array', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Separe por vírgulas: Vale alimentação, Plano de saúde, Home office"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separe múltiplos benefícios por vírgulas</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tecnologias Utilizadas
                    </label>
                    <input
                      type="text"
                      value={editData.tecnologias_usadas}
                      onChange={(e) => atualizarCampo('tecnologias_usadas', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Separe por vírgulas: React, Node.js, PostgreSQL"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separe múltiplas tecnologias por vírgulas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3 sticky bottom-0">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saveLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvarAlteracoes}
                disabled={saveLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              >
                {saveLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {saveLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil_empresa;
