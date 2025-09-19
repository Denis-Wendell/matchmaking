// src/pages/Perfil_freelancer.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FreelancerEditModal from '../components/FreelancerEditModal';

function Perfil_freelancer() {
  const navigate = useNavigate();
  
  // Dados
  const [freelancerData, setFreelancerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // UI
  const [activeTab, setActiveTab] = useState('informacoes');

  // Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [editError, setEditError] = useState('');

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
        console.error('Erro ao carregar dados do freelancer:', e);
        setError('Erro ao carregar dados do perfil');
      }
    } else {
      setError('Dados do freelancer não encontrados');
    }

    setLoading(false);
  }, [navigate]);

  // Helpers
  const formatarData = (dataString) => {
    if (!dataString) return 'Não informado';
    return new Date(dataString).toLocaleDateString('pt-BR');
  };
  const formatarTelefone = (telefone) => {
    if (!telefone) return 'Não informado';
    return telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };
  const formatarValorHora = (valor) => {
    if (!valor && valor !== 0) return 'Não informado';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
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

  // Abrir modal preenchendo dados
  const abrirModalEdicao = () => {
    const f = freelancerData || {};
    setEditData({
      nome: f.nome || '',
      email: f.email || '',
      telefone: f.telefone || '',
      cidade: f.cidade || '',
      estado: f.estado || '',
      cep: f.cep || '',
      endereco_completo: f.endereco_completo || '',
      area_atuacao: f.area_atuacao || '',
      nivel_experiencia: f.nivel_experiencia || 'junior',
      modalidade_trabalho: f.modalidade_trabalho || 'remoto',
      disponibilidade: f.disponibilidade || '',
      valor_hora: f.valor_hora ?? '',
      resumo_profissional: f.resumo_profissional || '',
      objetivos_profissionais: f.objetivos_profissionais || '',
      principais_habilidades: f.principais_habilidades || '',
      skills_array: Array.isArray(f.skills_array) ? f.skills_array.join(', ') : '',
      idiomas: Array.isArray(f.idiomas) ? f.idiomas.join(', ') : '',
      areas_interesse: Array.isArray(f.areas_interesse) ? f.areas_interesse.join(', ') : '',
      experiencia_profissional: f.experiencia_profissional || '',
      formacao_academica: f.formacao_academica || '',
      instituicao: f.instituicao || '',
      ano_conclusao: f.ano_conclusao || '',
      certificacoes: f.certificacoes || '',
      url_portfolio: f.url_portfolio || '',
      linkedin: f.linkedin || '',
      github: f.github || '',
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

      // Monta payload limpando e convertendo listas
      const payload = {};
      Object.keys(editData).forEach((k) => {
        const v = editData[k];
        if (v !== null && v !== undefined && String(v).trim() !== '') payload[k] = v;
      });

      // normaliza enums/num
      if (payload.nivel_experiencia) payload.nivel_experiencia = String(payload.nivel_experiencia).toLowerCase();
      if (payload.modalidade_trabalho) payload.modalidade_trabalho = String(payload.modalidade_trabalho).toLowerCase();
      if (payload.valor_hora !== undefined && payload.valor_hora !== '') {
        payload.valor_hora = parseFloat(payload.valor_hora);
      }

      // listas
      const toArray = (str) =>
        String(str)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);

      if (payload.skills_array) payload.skills_array = toArray(payload.skills_array);
      if (payload.idiomas) payload.idiomas = toArray(payload.idiomas);
      if (payload.areas_interesse) payload.areas_interesse = toArray(payload.areas_interesse);

      // Chamada API — ajuste se seu endpoint for outro
      const res = await fetch('http://localhost:3001/api/freelancers/me/perfil', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (res.ok && json.success) {
        const atualizado = { ...freelancerData, ...json.data };
        setFreelancerData(atualizado);
        localStorage.setItem('freelancerData', JSON.stringify(atualizado));
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
        {/* Header */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {freelancerData.nome?.charAt(0) || 'U'}
                </span>
              </div>

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

                <div className="flex items-center space-x-4 text-sm">
                  <div className={`px-3 py-1 rounded-full font-medium ${getStatusColor(freelancerData.status)}`}>
                    {getStatusLabel(freelancerData.status)}
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    {getNivelExperienciaLabel(freelancerData.nivel_experiencia)}
                  </div>
                  {freelancerData.valor_hora !== undefined && freelancerData.valor_hora !== null && (
                    <div className="text-gray-600 font-medium">
                      {formatarValorHora(freelancerData.valor_hora)}/hora
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
                onClick={handleLogout}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'informacoes', label: 'Informações Gerais' },
                { id: 'habilidades', label: 'Habilidades' },
                { id: 'experiencia', label: 'Experiência' },
                { id: 'formacao', label: 'Formação' },
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

        {/* Conteúdo das tabs — (seu conteúdo original permanece igual) */}
        <div className="space-y-8">
          {activeTab === 'informacoes' && (
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Informações Gerais
              </h2>

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
                    {freelancerData.valor_hora !== undefined && freelancerData.valor_hora !== null && (
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
                    onClick={abrirModalEdicao}
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
                    onClick={abrirModalEdicao}
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
                    onClick={abrirModalEdicao}
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

        {/* Info da conta */}
        <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Conta</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div><span className="font-medium">Membro desde:</span> {formatarData(freelancerData.created_at)}</div>
            <div><span className="font-medium">Última atualização:</span> {formatarData(freelancerData.updated_at)}</div>
            {freelancerData.ultimo_login && (
              <div><span className="font-medium">Último login:</span> {formatarData(freelancerData.ultimo_login)}</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Edição (novo componente) */}
      <FreelancerEditModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        data={editData}
        onChange={atualizarCampo}
        onSave={salvarAlteracoes}
        loading={saveLoading}
        error={editError}
      />
    </div>
  );
}

export default Perfil_freelancer;
