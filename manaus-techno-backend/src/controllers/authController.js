// authController.js

const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Freelancer = require('../models/Freelancer');
const Empresa = require('../models/Empresa');

// Funções auxiliares de formatação e normalização
const onlyDigits = (s = '') => String(s).replace(/\D+/g, '');

const formatCPF = (cpfRaw = '') => {
  const d = onlyDigits(cpfRaw).slice(0, 11);
  if (d.length !== 11) return null;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
};

const normalizeCEP = (cepRaw = '') => {
  const d = onlyDigits(cepRaw).slice(0, 8);
  if (d.length !== 8) return null;
  return `${d.slice(0,5)}-${d.slice(5)}`;
};

const toDecimalString = (v) => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(String(v).replace(',', '.'));
  if (Number.isNaN(n)) return null;
  return n.toFixed(2);
};

const trimOrNull = (s) => {
  if (s === undefined || s === null) return null;
  const v = String(s).trim();
  return v === '' ? null : v;
};

const toUF = (uf) => {
  const v = String(uf || '').trim().toUpperCase();
  return v.length === 2 ? v : null;
};

const toIdiomasArray = (val) => {
  if (!val && val !== 0) return [];
  if (Array.isArray(val)) return val.map(x => String(x).trim()).filter(Boolean);
  return String(val).split(',').map(x => x.trim()).filter(Boolean);
};

const sanitizeSkills = (skills_array) => {
  const arr = Array.isArray(skills_array) ? skills_array : (skills_array ? [skills_array] : []);
  return arr.map(s => String(s).trim()).filter(Boolean);
};


// Gerar token JWT (suporta tipo de usuário + payload extra)
const gerarToken = (userId, tipo = null, extraPayload = {}) => {
  const payload = {
    id: userId,
    ...(tipo ? { tipo } : {}),
    ...extraPayload, // ex.: { empresaId } ou { freelancerId }
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
};

// Função auxiliar para tratar erros do Sequelize
const tratarErrosSequelize = (error, res) => {
  console.error('Erro Sequelize:', error);

  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors,
    });
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0].path;
    const message = field === 'email' || field === 'email_corporativo' 
      ? 'Email já está cadastrado'
      : field === 'cnpj' 
      ? 'CNPJ já está cadastrado'
      : 'Dados já estão cadastrados';
    
    return res.status(400).json({
      success: false,
      message,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
  });
};

// Função auxiliar para sanitizar arrays
const sanitizarArray = (valor) => {
  if (Array.isArray(valor)) return valor;
  if (valor) return [valor].filter(Boolean);
  return [];
};

// Função auxiliar para normalizar modalidade de trabalho
const normalizarModalidadeTrabalho = (modalidade) => {
  if (!modalidade) return 'remoto'; // valor padrão
  
  const modalidadeLower = modalidade.toLowerCase().trim();
  const mapeamento = {
    'remoto': 'remoto',
    'remote': 'remoto',
    'presencial': 'presencial', 
    'onsite': 'presencial',
    'local': 'presencial',
    'hibrido': 'hibrido',
    'híbrido': 'hibrido',
    'hybrid': 'hibrido',
    'misto': 'hibrido'
  };
  return mapeamento[modalidadeLower] || 'remoto';
};

/* ============================================================
   COMPAT LAYER: entrada para Empresa (BD atual)
   - status salvo como 'ativa'/'inativa'/'pendente'/'bloqueada'
   - tamanho_empresa salvo capitalizado/acentuado
   ============================================================ */
const mapInEmpresaStatus = (v) => {
  if (!v) return 'ativa'; // default no BD atual
  const s = String(v).toLowerCase().trim();
  const map = {
    'ativo':'ativa', 'ativa':'ativa',
    'inativo':'inativa', 'inativa':'inativa',
    'pendente':'pendente',
    'bloqueado':'bloqueada', 'bloqueada':'bloqueada'
  };
  return map[s] || 'ativa';
};

const mapInTamanhoEmpresa = (v) => {
  if (!v) return 'Pequena';
  const t = String(v).toLowerCase().trim();
  const map = {
    'startup':'Startup',
    'pequena':'Pequena','pequeno':'Pequena','small':'Pequena',
    'media':'Média','média':'Média','medio':'Média','médio':'Média','medium':'Média',
    'grande':'Grande','big':'Grande','large':'Grande',
    'multinacional':'Multinacional','multinational':'Multinacional'
  };
  return map[t] || 'Pequena';
};

// (Mantidos) normalizadores genéricos em minúsculo — úteis para outras partes
const normalizarStatusEmpresa = (status) => {
  if (!status) return 'ativo';
  const statusLower = status.toLowerCase().trim();
  const mapeamento = {
    'ativo': 'ativo',
    'ativa': 'ativo',
    'active': 'ativo',
    'inativo': 'inativo',
    'inativa': 'inativo',
    'inactive': 'inativo',
    'pausado': 'pausado',
    'pausada': 'pausado',
    'paused': 'pausado',
    'pendente': 'pendente',
    'pending': 'pendente'
  };
  return mapeamento[statusLower] || 'ativo';
};

const normalizarTamanhoEmpresa = (tamanho) => {
  if (!tamanho) return 'pequena';
  const tamanhoLower = tamanho.toLowerCase().trim();
  const mapeamento = {
    'startup': 'startup',
    'pequena': 'pequena',
    'pequeno': 'pequena',
    'small': 'pequena',
    'media': 'media',
    'média': 'media',
    'medio': 'media',
    'médio': 'media',
    'medium': 'media',
    'grande': 'grande',
    'big': 'grande',
    'large': 'grande',
    'multinacional': 'multinacional',
    'multinational': 'multinacional'
  };
  return mapeamento[tamanhoLower] || 'pequena';
};

// Registrar freelancer
const registrarFreelancer = async (req, res) => {
  try {
    console.log('📝 Dados recebidos no registro do freelancer:', req.body);

    const {
      // básicos/obrigatórios
      nome,
      email,
      senha,
      telefone,

      // endereço
      endereco_completo,
      cidade,
      estado,
      cep,

      // profissionais
      profissao,
      area_atuacao,
      nivel_experiencia,
      valor_hora,
      idiomas,
      disponibilidade,
      modalidade_trabalho,
      resumo_profissional,
      experiencia_profissional,
      objetivos_profissionais,

      // formação
      formacao_academica,
      instituicao,
      ano_conclusao,
      certificacoes,

      // docs/ids
      cpf,
      data_nascimento,

      // links
      url_portfolio,
      linkedin,
      github,

      // skills
      principais_habilidades,
      skills_array,
    } = req.body || {};

    // Verificar existência por email
    const freelancerExistente = await Freelancer.findOne({ where: { email } });
    if (freelancerExistente) {
      return res.status(400).json({ success: false, message: 'Email já está cadastrado' });
    }

    // ===== Normalizações pedidas =====
    const cpfFmt  = cpf ? formatCPF(cpf) : null;
    const cepFmt  = cep ? normalizeCEP(cep) : null;
    const uf      = toUF(estado);
    const vHora   = toDecimalString(valor_hora);
    const idiomasArr = toIdiomasArray(idiomas);
    const skillsArr  = sanitizeSkills(skills_array);

    // Garante coerência com o modelo (ambos obrigatórios)
    let principaisHab = trimOrNull(principais_habilidades);
    if (!principaisHab && skillsArr.length) {
      principaisHab = skillsArr.join(', ');
    }

    if (!skillsArr.length) {
      return res.status(400).json({ success: false, message: 'Selecione ao menos uma skill.' });
    }
    if (!principaisHab) {
      return res.status(400).json({ success: false, message: 'Principais habilidades são obrigatórias.' });
    }

    // Monta payload compatível com o Sequelize
    const novoFreelancer = await Freelancer.create({
      // obrigatórios
      nome: trimOrNull(nome),
      email: trimOrNull(email),
      senha_hash: trimOrNull(senha), // hook faz hash
      area_atuacao: trimOrNull(area_atuacao),
      nivel_experiencia: trimOrNull(nivel_experiencia),

      // contato & endereço
      telefone: trimOrNull(telefone),
      cpf: cpfFmt,
      data_nascimento: trimOrNull(data_nascimento),
      endereco_completo: trimOrNull(endereco_completo),
      cidade: trimOrNull(cidade),
      estado: uf,
      cep: cepFmt,

      // profissionais
      profissao: trimOrNull(profissao),
      valor_hora: vHora,
      idiomas: idiomasArr,
      disponibilidade: trimOrNull(disponibilidade),
      modalidade_trabalho: normalizarModalidadeTrabalho(modalidade_trabalho),
      resumo_profissional: trimOrNull(resumo_profissional),
      experiencia_profissional: trimOrNull(experiencia_profissional),
      objetivos_profissionais: trimOrNull(objetivos_profissionais),

      // formação
      formacao_academica: trimOrNull(formacao_academica),
      instituicao: trimOrNull(instituicao),
      ano_conclusao: String(ano_conclusao || '').trim() ? parseInt(ano_conclusao, 10) : null,
      certificacoes: trimOrNull(certificacoes),

      // links
      url_portfolio: trimOrNull(url_portfolio),
      linkedin: trimOrNull(linkedin),
      github: trimOrNull(github),

      // skills
      skills_array: skillsArr,
      principais_habilidades: principaisHab,

      // status padrão
      status: 'ativo',
    });

    const token = gerarToken(novoFreelancer.id, 'freelancer', { freelancerId: novoFreelancer.id });

    return res.status(201).json({
      success: true,
      message: 'Freelancer cadastrado com sucesso',
      data: {
        freelancer: novoFreelancer,
        token,
        tipo: 'freelancer',
        freelancerId: novoFreelancer.id,
      },
    });
  } catch (error) {
    console.error('Erro no registro do freelancer:', error);
    return tratarErrosSequelize(error, res);
  }
};

// Registrar empresa
const registrarEmpresa = async (req, res) => {
  try {
    console.log('📝 Dados recebidos no registro da empresa:', req.body);
    
    const {
      nome,
      cnpj,
      email_corporativo,
      senha,
      telefone,
      endereco_completo,
      cidade,
      estado,
      cep,
      setor_atuacao,
      tamanho_empresa,
      site_empresa,
      descricao_empresa,
      principais_beneficios,
      cultura_empresa,
      responsavel_nome,
      responsavel_cargo,
      responsavel_email,
      responsavel_telefone,
      areas_atuacao,
      beneficios_array,
      tecnologias_usadas,
    } = req.body;

    // Verificar se empresa já existe (por email ou CNPJ)
    const empresaExistente = await Empresa.findOne({ 
      where: {
        [Op.or]: [
          { email_corporativo },
          { cnpj }
        ]
      }
    });
    
    if (empresaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Email ou CNPJ já está cadastrado',
      });
    }

    // Criar empresa (compat: salva no formato que o BD atual aceita)
    const novaEmpresa = await Empresa.create({
      nome,
      cnpj,
      email_corporativo,
      senha_hash: senha, // Será criptografada pelo hook
      telefone,
      endereco_completo,
      cidade,
      estado,
      cep,
      setor_atuacao,
      tamanho_empresa: normalizarTamanhoEmpresa(tamanho_empresa),
      site_empresa,
      descricao_empresa,
      principais_beneficios,
      cultura_empresa,
      responsavel_nome,
      responsavel_cargo,
      responsavel_email,
      responsavel_telefone,
      areas_atuacao: sanitizarArray(areas_atuacao),
      beneficios_array: sanitizarArray(beneficios_array),
      tecnologias_usadas: sanitizarArray(tecnologias_usadas),
      status:'ativo', // -> 'ativa' (BD atual)
      verificada: false,
    });

    // Gerar token (inclui empresaId no payload)
    const token = gerarToken(novaEmpresa.id, 'empresa', { empresaId: novaEmpresa.id });

    res.status(201).json({
      success: true,
      message: 'Empresa cadastrada com sucesso',
      data: {
        empresa: novaEmpresa,
        token,
        tipo: 'empresa',
        empresaId: novaEmpresa.id, // conveniência no front
      },
    });

  } catch (error) {
    console.error('Erro no registro da empresa:', error);
    return tratarErrosSequelize(error, res);
  }
};

// Login unificado (freelancer ou empresa)
const login = async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;

    // Validações básicas
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios',
      });
    }

    if (!tipo || !['freelancer', 'empresa'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo deve ser "freelancer" ou "empresa"',
      });
    }

    let usuario = null;
    const emailField = tipo === 'freelancer' ? 'email' : 'email_corporativo';

    // Buscar usuário baseado no tipo
    if (tipo === 'freelancer') {
      usuario = await Freelancer.scope('withPassword').findOne({ 
        where: { [emailField]: email },
      });
    } else {
      usuario = await Empresa.scope('withPassword').findOne({ 
        where: { [emailField]: email },
      });
    }

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Verificar se está ativo (status)
    let ativoOk = false;
    if (tipo === 'freelancer') {
      ativoOk = (usuario.status === 'ativo');
    } else {
      // Compat: aceita 'ativa' (BD atual) e 'ativo' (caso exista)
      ativoOk = ['ativa', 'ativo'].includes(usuario.status);
    }
    if (!ativoOk) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada ou pendente',
      });
    }

    // Verificar senha
    const senhaValida = await usuario.verificarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas',
      });
    }

    // Atualizar último login
    await usuario.atualizarUltimoLogin();

    // Gerar token com payload específico por tipo
    const extra = (tipo === 'empresa')
      ? { empresaId: usuario.id }
      : { freelancerId: usuario.id };

    const token = gerarToken(usuario.id, tipo, extra);

    // Remover senha da resposta
    const usuarioSemSenha = usuario.toJSON();

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        [tipo]: usuarioSemSenha,
        token,
        tipo,
        ...(tipo === 'empresa' ? { empresaId: usuario.id } : { freelancerId: usuario.id })
      },
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Verificar token (compatível com seu middleware existente)
const verificarAuth = async (req, res) => {
  try {
    const tipoUsuario = req.tipoUsuario;
    const usuario = req.freelancer || req.empresa;
    
    if (!usuario || !tipoUsuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }
    
    res.json({
      success: true,
      message: 'Token válido',
      data: {
        [tipoUsuario]: usuario,
        tipo: tipoUsuario,
      },
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Logout (compatível com seu middleware)
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout realizado com sucesso',
      data: {
        tipo: req.tipoUsuario
      }
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Refresh token (compatível com seu middleware)
const refreshToken = async (req, res) => {
  try {
    const tipoUsuario = req.tipoUsuario;
    const usuario = req.freelancer || req.empresa;
    
    if (!usuario || !tipoUsuario) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
      });
    }

    // Gerar novo token com o mesmo payload extra
    const extra = (tipoUsuario === 'empresa')
      ? { empresaId: usuario.id }
      : { freelancerId: usuario.id };

    const novoToken = gerarToken(usuario.id, tipoUsuario, extra);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token: novoToken,
        tipo: tipoUsuario,
        ...(tipoUsuario === 'empresa' ? { empresaId: usuario.id } : { freelancerId: usuario.id })
      },
    });

  } catch (error) {
    console.error('Erro no refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

module.exports = {
  registrarFreelancer,
  registrarEmpresa,
  login,
  verificarAuth,
  logout,
  refreshToken,
};
