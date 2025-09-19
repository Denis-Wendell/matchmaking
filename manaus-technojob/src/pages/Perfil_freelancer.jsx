// src/pages/Perfil_freelancer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Perfil_freelancer() {
  const navigate = useNavigate();

  // ====== Estados principais ======
  const [freelancerData, setFreelancerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI
  const [activeTab, setActiveTab] = useState('informacoes');
  const [isEditing, setIsEditing] = useState(false);

  // Edição
  const [editData, setEditData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // ====== Autenticação / bootstrap ======
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userType = localStorage.getItem('userType');
    const freelancerDataStored = localStorage.getItem('freelancerData');

    if (!isLoggedIn || userType !== 'freelancer') {
      navigate('/login');
      return;
    }

    if (freelancerDataStored) {
      try {
        const parsed = JSON.parse(freelancerDataStored);
        setFreelancerData(parsed);
      } catch (e) {
        console.error(e);
        setError('Erro ao carregar dados do perfil');
      }
    } else {
      setError('Dados do freelancer não encontrados');
    }
    setLoading(false);
  }, [navigate]);

  // ====== Helpers ======
  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    const only = telefone.replace(/\D/g, '');
    if (only.length < 10) return telefone;
    return only.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatarValorHora = (valor) => {
    if (valor === null || valor === undefined || valor === '') return 'Não informado';
    const n = Number(valor);
    if (Number.isNaN(n)) return 'Não informado';
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
  };

  const getNivelExperienciaLabel = (nivel) => {
    const labels = {
      junior: 'Júnior (1-3 anos)',
      pleno: 'Pleno (3-5 anos)',
      senior: 'Sênior (5-8 anos)',
      especialista: 'Especialista (8+ anos)',
    };
    return labels[nivel] || nivel || 'Não informado';
  };

  const getModalidadeTrabalhoLabel = (modalidade) => {
    const labels = { remoto: 'Remoto', presencial: 'Presencial', hibrido: 'Híbrido' };
    return labels[modalidade] || modalidade || 'Não informado';
  };

  const getStatusLabel = (status) => {
    const labels = { ativo: 'Disponível', inativo: 'Inativo', pausado: 'Pausado', pendente: 'Pendente' };
    return labels[status] || status || 'Disponível';
  };

  const getStatusColor = (status) => {
    const colors = {
      ativo: 'bg-green-100 text-green-700',
      inativo: 'bg-red-100 text-red-700',
      pausado: 'bg-yellow-100 text-yellow-700',
      pendente: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-green-100 text-green-700';
  };

  // ====== Tabs ======
  const tabs = [
    { id: 'informacoes', label: 'Informações Gerais' },
    { id: 'habilidades', label: 'Habilidades' },
    { id: 'experiencia', label: 'Experiência' },
    { id: 'formacao', label: 'Formação' },
    { id: 'contato', label: 'Contato' },
  ];

  // ====== Edição ======
  const abrirModalEdicao = () => {
    const f = freelancerData || {};
    setEditData({
      nome: f.nome || '',
      email: f.email || '',
      telefone: f.telefone || '',
      endereco_completo: f.endereco_completo || '',
      cidade: f.cidade || '',
      estado: f.estado || '',
      cep: f.cep || '',
      data_nascimento: f.data_nascimento || '',
      area_atuacao: f.area_atuacao || '',
      nivel_experiencia: f.nivel_experiencia || 'junior',
      modalidade_trabalho: f.modalidade_trabalho || 'remoto',
      disponibilidade: f.disponibilidade || '',
      valor_hora: (f.valor_hora ?? '').toString(),
      resumo_profissional: f.resumo_profissional || '',
      objetivos_profissionais: f.objetivos_profissionais || '',
      experiencia_profissional: f.experiencia_profissional || '',
      formacao_academica: f.formacao_academica || '',
      instituicao: f.instituicao || '',
      ano_conclusao: f.ano_conclusao || '',
      certificacoes: f.certificacoes || '',
      linkedin: f.linkedin || '',
      github: f.github || '',
      url_portfolio: f.url_portfolio || '',
      // Arrays como texto
      skills_array: (f.skills_array || []).join(', '),
      idiomas: (f.idiomas || []).join(', '),
      areas_interesse: (f.areas_interesse || []).join(', '),
      status: f.status || 'ativo',
    });
    setEditError('');
    setIsEditing(true);
  };

  const atualizarCampo = (campo, valor) => {
    setEditData((prev) => ({ ...prev, [campo]: valor }));
  };

  const salvarAlteracoes = async () => {
    try {
      setSaveLoading(true);
      setEditError('');

      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const dados = {};
      Object.keys(editData).forEach((k) => {
        const v = editData[k];
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          dados[k] = v;
        }
      });

      const splitCsv = (txt) =>
        String(txt)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      if (dados.skills_array) dados.skills_array = splitCsv(dados.skills_array);
      if (dados.idiomas) dados.idiomas = splitCsv(dados.idiomas);
      if (dados.areas_interesse) dados.areas_interesse = splitCsv(dados.areas_interesse);

      if (dados.nivel_experiencia) dados.nivel_experiencia = dados.nivel_experiencia.toLowerCase();
      if (dados.modalidade_trabalho) dados.modalidade_trabalho = dados.modalidade_trabalho.toLowerCase();

      if (dados.valor_hora !== undefined && dados.valor_hora !== '') {
        const n = Number(String(dados.valor_hora).replace(',', '.'));
        if (!Number.isNaN(n)) dados.valor_hora = n;
      }

      const res = await fetch('http://localhost:3001/api/freelancers/me/perfil', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(dados),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const atualizados = { ...freelancerData, ...json.data };
        setFreelancerData(atualizados);
        localStorage.setItem('freelancerData', JSON.stringify(atualizados));
        setIsEditing(false);
        alert('Perfil atualizado com sucesso!');
      } else {
        setEditError(json.message || 'Erro ao atualizar perfil');
      }
    } catch (e) {
      console.error(e);
      setEditError('Erro de conexão. Tente novamente.');
    } finally {
      setSaveLoading(false);
    }
  };

  // ====== Render ======
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
          <p className="text-center text-red-700 mb-4">{error || 'Erro ao carregar dados do freelancer'}</p>
          <button onClick={() => navigate('/login')} className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Fazer Login Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{freelancerData.nome?.charAt(0) || 'U'}</span>
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{freelancerData.nome || 'Nome não informado'}</h1>
                <div className="text-lg text-gray-600 mb-2">{freelancerData.area_atuacao || 'Área não informada'}</div>
                <div className="text-gray-600 mb-4">
                  {freelancerData.cidade && freelancerData.estado ? `${freelancerData.cidade}, ${freelancerData.estado}` : 'Localização não informada'}
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className={`px-3 py-1 rounded-full font-medium ${getStatusColor(freelancerData.status)}`}>{getStatusLabel(freelancerData.status)}</div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {getNivelExperienciaLabel(freelancerData.nivel_experiencia)}
                  </div>
                  {freelancerData.valor_hora != null && (
                    <div className="text-gray-600 font-medium">{formatarValorHora(freelancerData.valor_hora)}/hora</div>
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
                onClick={() => navigate('/match')}
                className="px-6 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Ver Vagas
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* ===== Conteúdo das abas ===== */}
        <div className="space-y-8">
          {/* Informações Gerais */}
          {activeTab === 'informacoes' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informações Gerais</h2>

              {freelancerData.resumo_profissional && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Profissional</h3>
                  <p className="text-gray-700 leading-relaxed">{freelancerData.resumo_profissional}</p>
                </div>
              )}

              {freelancerData.objetivos_profissionais && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Objetivos Profissionais</h3>
                  <p className="text-gray-700 leading-relaxed">{freelancerData.objetivos_profissionais}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        <span className="font-medium">
                          {freelancerData.cidade}, {freelancerData.estado}
                        </span>
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

              {freelancerData.principais_habilidades && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Principais Habilidades</h3>
                  <p className="text-gray-700 leading-relaxed">{freelancerData.principais_habilidades}</p>
                </div>
              )}
            </div>
          )}

          {/* Habilidades */}
          {activeTab === 'habilidades' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Habilidades Técnicas</h2>

              {freelancerData.skills_array && freelancerData.skills_array.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills Técnicas</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData.skills_array.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {freelancerData.areas_interesse && freelancerData.areas_interesse.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Áreas de Interesse</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData.areas_interesse.map((area, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {freelancerData.idiomas && freelancerData.idiomas.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Idiomas</h3>
                  <div className="flex flex-wrap gap-2">
                    {freelancerData.idiomas.map((idioma, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {idioma}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!freelancerData.skills_array?.length && !freelancerData.areas_interesse?.length && !freelancerData.idiomas?.length && (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhuma habilidade cadastrada ainda.</p>
                  <button onClick={abrirModalEdicao} className="mt-2 text-blue-600 hover:text-blue-800 underline">
                    Adicionar habilidades
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Experiência */}
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
                  <button onClick={abrirModalEdicao} className="mt-2 text-blue-600 hover:text-blue-800 underline">
                    Adicionar experiência
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Formação */}
          {activeTab === 'formacao' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Formação e Certificações</h2>

              {(freelancerData.formacao_academica || freelancerData.instituicao || freelancerData.ano_conclusao) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Formação Acadêmica</h3>
                  <div className="border border-gray-200 rounded-lg p-4">
                    {freelancerData.formacao_academica && <h4 className="font-semibold text-gray-900">{freelancerData.formacao_academica}</h4>}
                    {freelancerData.instituicao && <p className="text-blue-600">{freelancerData.instituicao}</p>}
                    {freelancerData.ano_conclusao && <p className="text-gray-600 text-sm">{freelancerData.ano_conclusao}</p>}
                  </div>
                </div>
              )}

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
                  <button onClick={abrirModalEdicao} className="mt-2 text-blue-600 hover:text-blue-800 underline">
                    Adicionar formação
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Contato */}
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
                      ) : (
                        'Não informado'
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {freelancerData.github ? (
                        <a href={freelancerData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                          {freelancerData.github}
                        </a>
                      ) : (
                        'Não informado'
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfólio</label>
                    <div className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50">
                      {freelancerData.url_portfolio ? (
                        <a href={freelancerData.url_portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all">
                          {freelancerData.url_portfolio}
                        </a>
                      ) : (
                        'Não informado'
                      )}
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

      {/* ===================== Modal de Edição ===================== */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-gray-900">Editar Perfil do Freelancer</h3>
                <button onClick={() => setIsEditing(false)} disabled={saveLoading} className="text-gray-400 hover:text-gray-600 p-1">
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
              {/* (mesmo formulário completo da mensagem anterior) */}
              {/* Básico */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <input
                      type="text"
                      value={editData.nome}
                      onChange={(e) => atualizarCampo('nome', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => atualizarCampo('email', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={editData.telefone}
                      onChange={(e) => atualizarCampo('telefone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input
                      type="date"
                      value={editData.data_nascimento}
                      onChange={(e) => atualizarCampo('data_nascimento', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                    <textarea
                      rows="2"
                      value={editData.endereco_completo}
                      onChange={(e) => atualizarCampo('endereco_completo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rua, número, bairro..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={editData.cidade}
                      onChange={(e) => atualizarCampo('cidade', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
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

              {/* Profissional */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Perfil Profissional</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Área de Atuação *</label>
                    <input
                      type="text"
                      value={editData.area_atuacao}
                      onChange={(e) => atualizarCampo('area_atuacao', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nível *</label>
                    <select
                      value={editData.nivel_experiencia}
                      onChange={(e) => atualizarCampo('nivel_experiencia', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="junior">Júnior</option>
                      <option value="pleno">Pleno</option>
                      <option value="senior">Sênior</option>
                      <option value="especialista">Especialista</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                    <select
                      value={editData.modalidade_trabalho}
                      onChange={(e) => atualizarCampo('modalidade_trabalho', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="remoto">Remoto</option>
                      <option value="presencial">Presencial</option>
                      <option value="hibrido">Híbrido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidade</label>
                    <input
                      type="text"
                      value={editData.disponibilidade}
                      onChange={(e) => atualizarCampo('disponibilidade', e.target.value)}
                      placeholder="Período integral, Meio período, PJ, etc."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor/Hora (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.valor_hora}
                      onChange={(e) => atualizarCampo('valor_hora', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 85.00"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumo Profissional</label>
                    <textarea
                      rows="3"
                      value={editData.resumo_profissional}
                      onChange={(e) => atualizarCampo('resumo_profissional', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos Profissionais</label>
                    <textarea
                      rows="3"
                      value={editData.objetivos_profissionais}
                      onChange={(e) => atualizarCampo('objetivos_profissionais', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experiência Profissional</label>
                    <textarea
                      rows="4"
                      value={editData.experiencia_profissional}
                      onChange={(e) => atualizarCampo('experiencia_profissional', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Formação e Certificações */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Formação e Certificações</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
                    <input
                      type="text"
                      value={editData.formacao_academica}
                      onChange={(e) => atualizarCampo('formacao_academica', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Curso/Área"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instituição</label>
                    <input
                      type="text"
                      value={editData.instituicao}
                      onChange={(e) => atualizarCampo('instituicao', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano de Conclusão</label>
                    <input
                      type="number"
                      value={editData.ano_conclusao}
                      onChange={(e) => atualizarCampo('ano_conclusao', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Certificações</label>
                    <textarea
                      rows="2"
                      value={editData.certificacoes}
                      onChange={(e) => atualizarCampo('certificacoes', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Liste certificações em texto"
                    />
                  </div>
                </div>
              </div>

              {/* Links e Arrays */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Links e Competências</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn (URL)</label>
                    <input
                      type="url"
                      value={editData.linkedin}
                      onChange={(e) => atualizarCampo('linkedin', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GitHub (URL)</label>
                    <input
                      type="url"
                      value={editData.github}
                      onChange={(e) => atualizarCampo('github', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfólio (URL)</label>
                    <input
                      type="url"
                      value={editData.url_portfolio}
                      onChange={(e) => atualizarCampo('url_portfolio', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills Técnicas</label>
                    <input
                      type="text"
                      value={editData.skills_array}
                      onChange={(e) => atualizarCampo('skills_array', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Separe por vírgulas: React, Node.js, PostgreSQL"
                    />
                    <p className="text-xs text-gray-500 mt-1">Obrigatório: adicione ao menos uma skill</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Idiomas</label>
                    <input
                      type="text"
                      value={editData.idiomas}
                      onChange={(e) => atualizarCampo('idiomas', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Separe por vírgulas: Português, Inglês"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Áreas de Interesse</label>
                    <input
                      type="text"
                      value={editData.areas_interesse}
                      onChange={(e) => atualizarCampo('areas_interesse', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Separe por vírgulas: Frontend, Mobile"
                    />
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
                {saveLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {saveLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Perfil_freelancer;
