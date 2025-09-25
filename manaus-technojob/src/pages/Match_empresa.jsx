// src/pages/Match_empresas.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import Loading from '../components/Loading';
import {
  buildCleanSkills,
  computeMatch,
  formatValorHora,
  localizacaoTxt,
  modalidadeLabel,
  nivelLabel,
} from '../utils/matchEmpresaFreelancer';

function Match_empresa() {
  // lista da página atual (vinda já filtrada do back)
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filtros enviados ao back
  const [filtros, setFiltros] = useState({
    area: 'todas',
    modalidade: 'todas',
    nivel: 'todos',
    busca: '',
  });

  // paginação controlada com dados do back
  const [paginacao, setPaginacao] = useState({
    pagina: 1,
    limite: 12,
    total: 0,
    totalPaginas: 1,
  });

  // carregar lista sempre que filtros/página mudarem
  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setError('');

        const url = new URL('http://localhost:3001/api/freelancers');
        url.searchParams.set('status', 'ativo');
        url.searchParams.set('pagina', String(paginacao.pagina));
        url.searchParams.set('limite', String(paginacao.limite));

        if (filtros.area && filtros.area !== 'todas') url.searchParams.set('area', filtros.area);
        if (filtros.modalidade && filtros.modalidade !== 'todas') url.searchParams.set('modalidade', filtros.modalidade);
        if (filtros.nivel && filtros.nivel !== 'todos') url.searchParams.set('nivel', filtros.nivel);
        if (filtros.busca && filtros.busca.trim()) url.searchParams.set('busca', filtros.busca.trim());

        const token = localStorage.getItem('authToken');
        const res = await fetch(url.toString(), {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || 'Erro ao carregar freelancers');

        // Suporta os formatos previstos pelo seu controller paginado
        // Esperado: { success, data: { freelancers, total, totalPaginas, pagina, limite } }
        let lista = [];
        let total = 0;
        let totalPaginas = 1;

        if (json?.data?.freelancers) {
          lista = json.data.freelancers;
          total = json.data.total ?? 0;
          totalPaginas = json.data.totalPaginas ?? 1;
        } else if (Array.isArray(json?.data)) {
          // fallback genérico
          lista = json.data;
          total = json.total ?? json.data.length ?? 0;
          totalPaginas = json.totalPaginas ?? 1;
        } else if (Array.isArray(json)) {
          lista = json;
          total = json.length;
          totalPaginas = 1;
        }

        setFreelancers(Array.isArray(lista) ? lista : []);
        setPaginacao(prev => ({
          ...prev,
          total,
          totalPaginas,
        }));
      } catch (e) {
        console.error(e);
        setError(e.message || 'Falha ao buscar freelancers.');
        setFreelancers([]);
        setPaginacao(prev => ({ ...prev, total: 0, totalPaginas: 1 }));
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [filtros.area, filtros.modalidade, filtros.nivel, filtros.busca, paginacao.pagina, paginacao.limite]);

  const handleFiltroChange = (tipo, valor) => {
    setFiltros(prev => ({ ...prev, [tipo]: valor }));
    // ao mudar filtros, volta para a página 1
    setPaginacao(prev => ({ ...prev, pagina: 1 }));
  };

  // Busca/local highlight opcional (mantemos para “nesta página”,
  // mas a busca principal já vai para o back via filtros.busca)
  const freelancersFiltrados = useMemo(() => {
    if (!filtros.busca) return freelancers;
    const q = filtros.busca.toLowerCase();
    return freelancers.filter(f =>
      (f.nome || '').toLowerCase().includes(q) ||
      (f.profissao || '').toLowerCase().includes(q) ||
      (f.area_atuacao || '').toLowerCase().includes(q) ||
      (Array.isArray(f.skills_array) && f.skills_array.some(s => String(s).toLowerCase().includes(q)))
    );
  }, [freelancers, filtros.busca]);

  if (loading && freelancers.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-lg w-full text-center">
          <p className="text-red-700 mb-3">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Match de Conhecimento</h1>
            <p className="text-xl text-gray-600">Encontre os freelancers mais compatíveis com suas vagas</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            {/* Área */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Área de Atuação</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.area}
                onChange={(e) => handleFiltroChange('area', e.target.value)}
              >
                <option value="Tecnologia">Tecnologia</option>
                <option value="Design Gráfico">Design Gráfico</option>
                <option value="Marketing Digital">Marketing Digital</option>
                <option value="Consultoria">Consultoria</option>
                <option value="Educação">Educação</option>
                <option value="Vendas">Vendas</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Jurídico">Jurídico</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Redação">Redação</option>
                <option value="Tradução">Tradução</option>
                <option value="Fotografia">Fotografia</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            {/* Modalidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.modalidade}
                onChange={(e) => handleFiltroChange('modalidade', e.target.value)}
              >
                <option value="todas">Todas</option>
                <option value="Remoto">Remoto</option>
                <option value="Presencial">Presencial</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            {/* Nível */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Experiência</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filtros.nivel}
                onChange={(e) => handleFiltroChange('nivel', e.target.value)}
              >
                <option value="todos">Todos os níveis</option>
                <option value="Júnior">Júnior</option>
                <option value="Pleno">Pleno</option>
                <option value="Sênior">Sênior</option>
                <option value="Especialista">Especialista</option>
              </select>
            </div>

            {/* Busca livre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={filtros.busca}
                onChange={(e) => handleFiltroChange('busca', e.target.value)}
                placeholder="Busque por nome, área, profissão ou skills…"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Resumo de contagem (página atual + total filtrado) */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">
                {freelancersFiltrados.length}
              </span>{' '}
              {freelancersFiltrados.length === 1 ? 'perfil' : 'perfis'} nesta página
              <span className="mx-2 text-gray-300">•</span>
              <span className="font-medium text-blue-600">
                {paginacao.total}
              </span>{' '}
              no total
            </div>

            <Button
              onClick={() => {
                setFiltros({ area: 'todas', modalidade: 'todas', nivel: 'todos', busca: '' });
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              variant="outline"
              className="py-2"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Lista */}
        {freelancersFiltrados.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-600 mb-4">
              {filtros.busca || filtros.area !== 'todas' || filtros.modalidade !== 'todas' || filtros.nivel !== 'todos'
                ? 'Nenhum freelancer encontrado com os filtros selecionados.'
                : 'Nenhum freelancer disponível no momento.'}
            </p>
            <button
              onClick={() => {
                setFiltros({ area: 'todas', modalidade: 'todas', nivel: 'todos', busca: '' });
                setPaginacao(prev => ({ ...prev, pagina: 1 }));
              }}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Ver todos
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {freelancersFiltrados.map((f) => {
              const skills = buildCleanSkills(f);
              const matchPct = computeMatch(f);
              const nivel = nivelLabel(f.nivel_experiencia);
              const modalidade = modalidadeLabel(f.modalidade_trabalho);
              const valorHora = formatValorHora(f.valor_hora);
              const compatTxt = `${f.area_atuacao || 'Área'} ${nivel !== '—' ? nivel : ''}`.trim();

              return (
                <div key={f.id} className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{f.nome}</h3>

                          <div className="flex items-center text-blue-600 mb-2">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">
                              {f.profissao || `${f.area_atuacao || 'Profissional'} ${nivel !== '—' ? `• ${nivel}` : ''}`}
                            </span>
                          </div>

                          <div className="flex items-center text-gray-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {localizacaoTxt(f)}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 mb-1">{valorHora}</div>
                          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            Match: {matchPct}%
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {f.area_atuacao && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">{f.area_atuacao}</span>
                        )}
                        {nivel !== '—' && (
                          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">{nivel}</span>
                        )}
                        {modalidade !== '—' && (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{modalidade}</span>
                        )}
                        {f.disponibilidade && (
                          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                            {f.disponibilidade}
                          </span>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-blue-700">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">Compatível com: {compatTxt}</span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">
                        {f.experiencia_profissional || f.resumo_profissional || 'Sem resumo profissional informado.'}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Principais Habilidades:</h4>
                        <div className="flex flex-wrap gap-2">
                          {buildCleanSkills(f).length > 0 ? (
                            buildCleanSkills(f).map((s, i) => (
                              <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">{s}</span>
                            ))
                          ) : (
                            <span className="text-gray-500 text-sm">Não informado</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Formação:</h4>
                          <p className="text-sm text-gray-600">
                            {f.formacao_academica
                              ? `${f.formacao_academica}${f.instituicao ? ` - ${f.instituicao}` : ''}`
                              : 'Não informado'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Certificações:</h4>
                          <p className="text-sm text-gray-600">{f.certificacoes || 'Não informado'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                          <a
                            href={f.url_portfolio || '#'}
                            target={f.url_portfolio ? '_blank' : '_self'}
                            rel="noreferrer"
                            className={`flex items-center text-sm ${f.url_portfolio ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400 pointer-events-none'}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 6H4v4h12v-4z" clipRule="evenodd" />
                            </svg>
                            Portfólio
                          </a>
                          <a
                            href={f.linkedin || '#'}
                            target={f.linkedin ? '_blank' : '_self'}
                            rel="noreferrer"
                            className={`flex items-center text-sm ${f.linkedin ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400 pointer-events-none'}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                            </svg>
                            LinkedIn
                          </a>
                          <a
                            href={f.github || '#'}
                            target={f.github ? '_blank' : '_self'}
                            rel="noreferrer"
                            className={`flex items-center text-sm ${f.github ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400 pointer-events-none'}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                            </svg>
                            GitHub
                          </a>
                        </div>

                        <div className="flex space-x-3">
                          <Button variant="outline" size="sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            Favoritar
                          </Button>
                          <Button variant="outline" size="sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            Conversar
                          </Button>
                          <Button size="sm">Convidar para Vaga</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação */}
        {paginacao.totalPaginas > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina - 1 }))}
                disabled={paginacao.pagina === 1 || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg">
                {paginacao.pagina} de {paginacao.totalPaginas}
              </span>

              <button
                onClick={() => setPaginacao(prev => ({ ...prev, pagina: prev.pagina + 1 }))}
                disabled={paginacao.pagina === paginacao.totalPaginas || loading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Match_empresa;
