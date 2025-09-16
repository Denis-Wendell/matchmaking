import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Perfil_empresa() {
  const navigate = useNavigate();
  const [empresaData, setEmpresaData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      'pequena': 'Pequena',
      'media': 'Média',
      'grande': 'Grande',
      'multinacional': 'Multinacional'
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

  if (error || !empresaData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 p-8 rounded-lg">
          <p className="text-center text-red-700">
            {error || 'Erro ao carregar dados da empresa'}
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
        <h1 className="text-3xl font-bold text-gray-900">Perfil da Empresa</h1>
        <div className="flex gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(empresaData.status)}`}>
            {getStatusLabel(empresaData.status)}
          </span>
          {empresaData.verificada && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              ✓ Verificada
            </span>
          )}
        </div>
      </div>

      {/* Informações Básicas */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Informações Básicas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
            <p className="text-gray-900 font-medium">{empresaData.nome || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <p className="text-gray-900">{formatarCNPJ(empresaData.cnpj)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Corporativo</label>
            <p className="text-gray-900">{empresaData.email_corporativo || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <p className="text-gray-900">{formatarTelefone(empresaData.telefone)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Setor de Atuação</label>
            <p className="text-gray-900">{empresaData.setor_atuacao || 'Não informado'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamanho da Empresa</label>
            <p className="text-gray-900">{getTamanhoEmpresaLabel(empresaData.tamanho_empresa)}</p>
          </div>
        </div>

        {empresaData.site_empresa && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Site da Empresa</label>
            <a 
              href={empresaData.site_empresa} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {empresaData.site_empresa}
            </a>
          </div>
        )}
      </div>

      {/* Endereço */}
      {(empresaData.endereco_completo || empresaData.cidade || empresaData.estado || empresaData.cep) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
              <p className="text-gray-900">{empresaData.endereco_completo || 'Não informado'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <p className="text-gray-900">{empresaData.cidade || 'Não informado'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <p className="text-gray-900">{empresaData.estado || 'Não informado'}</p>
            </div>
            
            {empresaData.cep && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <p className="text-gray-900">{empresaData.cep}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Descrição da Empresa */}
      {empresaData.descricao_empresa && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Sobre a Empresa</h2>
          <p className="text-gray-700 leading-relaxed">{empresaData.descricao_empresa}</p>
        </div>
      )}

      {/* Responsável */}
      {(empresaData.responsavel_nome || empresaData.responsavel_cargo) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Responsável</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Responsável</label>
              <p className="text-gray-900">{empresaData.responsavel_nome || 'Não informado'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
              <p className="text-gray-900">{empresaData.responsavel_cargo || 'Não informado'}</p>
            </div>
            
            {empresaData.responsavel_email && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email do Responsável</label>
                <p className="text-gray-900">{empresaData.responsavel_email}</p>
              </div>
            )}
            
            {empresaData.responsavel_telefone && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone do Responsável</label>
                <p className="text-gray-900">{formatarTelefone(empresaData.responsavel_telefone)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Áreas de Atuação */}
      {empresaData.areas_atuacao && empresaData.areas_atuacao.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Áreas de Atuação</h2>
          <div className="flex flex-wrap gap-2">
            {empresaData.areas_atuacao.map((area, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Benefícios */}
      {empresaData.beneficios_array && empresaData.beneficios_array.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Benefícios Oferecidos</h2>
          <div className="flex flex-wrap gap-2">
            {empresaData.beneficios_array.map((beneficio, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {beneficio}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tecnologias Usadas */}
      {empresaData.tecnologias_usadas && empresaData.tecnologias_usadas.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Tecnologias Utilizadas</h2>
          <div className="flex flex-wrap gap-2">
            {empresaData.tecnologias_usadas.map((tech, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cultura da Empresa */}
      {empresaData.cultura_empresa && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Cultura da Empresa</h2>
          <p className="text-gray-700 leading-relaxed">{empresaData.cultura_empresa}</p>
        </div>
      )}

      {/* Benefícios Principais */}
      {empresaData.principais_beneficios && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Principais Benefícios</h2>
          <p className="text-gray-700 leading-relaxed">{empresaData.principais_beneficios}</p>
        </div>
      )}

      {/* Informações da Conta */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Informações da Conta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Cadastro</label>
            <p className="text-gray-900">{formatarData(empresaData.created_at)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Última Atualização</label>
            <p className="text-gray-900">{formatarData(empresaData.updated_at)}</p>
          </div>
          
          {empresaData.ultimo_login && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Último Login</label>
              <p className="text-gray-900">{formatarData(empresaData.ultimo_login)}</p>
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
            localStorage.removeItem('empresaData');
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

export default Perfil_empresa;