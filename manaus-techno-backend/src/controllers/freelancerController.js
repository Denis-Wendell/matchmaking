// freelancerController.js

const { Op, fn, col, where, literal } = require('sequelize');
const Freelancer = require('../models/Freelancer');
const PDFDocument = require('pdfkit');

/* Helpers para normalizar filtros */
const normalizarModalidade = (v) => {
  if (!v) return null;
  const s = String(v).toLowerCase().trim();
  const map = {
    remoto: 'remoto', remote: 'remoto',
    presencial: 'presencial', onsite: 'presencial', local: 'presencial',
    hibrido: 'hibrido', 'híbrido': 'hibrido', hybrid: 'hibrido', misto: 'hibrido'
  };
  return map[s] || null;
};

const normalizarNivel = (v) => {
  if (!v) return null;
  const s = String(v).toLowerCase().trim();
  const map = {
    junior: 'junior', 'júnior': 'junior',
    pleno: 'pleno',
    senior: 'senior', 'sênior': 'senior',
    especialista: 'especialista'
  };
  return map[s] || null;
};

/**
 * Listar freelancers com paginação e filtros.
 * Query params:
 * - pagina (1), limite (12, max 100), status ('ativo')
 * - area, modalidade (remoto|presencial|hibrido), nivel (junior|pleno|senior|especialista)
 * - busca (nome, email, area, cidade, estado, resumo, experiencia, certificacoes, principais_habilidades, skills_array, idiomas)
 * - ordenarPor (valor_hora|ultimo_login|created_at) default created_at
 * - ordem (ASC|DESC) default DESC
 */
const listarFreelancers = async (req, res) => {
  try {
    const pagina = Math.max(parseInt(req.query.pagina || '1', 10), 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite || '12', 10), 1), 100);
    const offset = (pagina - 1) * limite;

    const {
      status = 'ativo',
      area,
      modalidade,
      nivel,
      busca,
      ordenarPor,
      ordem,
    } = req.query;

    const whereBase = {};
    if (status) whereBase.status = String(status).toLowerCase().trim();

    if (area && area !== 'todas') {
      // pode criar índice trgm para área se necessário
      whereBase.area_atuacao = { [Op.iLike]: `%${area}%` };
    }

    const mod = normalizarModalidade(modalidade);
    if (mod) whereBase.modalidade_trabalho = mod;

    const niv = normalizarNivel(nivel);
    if (niv) whereBase.nivel_experiencia = niv;

    // -------- BUSCA sem acento usando wrapper unaccent_immutable --------
    const filtrosBusca = [];
    if (busca && String(busca).trim()) {
      const q = String(busca).trim();
      const esc = q.replace(/'/g, "''"); // escape simples para literal SQL

      const iLikeUnaccent = (campo) =>
        where(
          fn('public.unaccent_immutable', col(campo)),
          { [Op.iLike]: literal(`public.unaccent_immutable('%${esc}%')`) }
        );

      filtrosBusca.push({
        [Op.or]: [
          iLikeUnaccent('nome'),
          iLikeUnaccent('email'),
          iLikeUnaccent('profissao'),
          iLikeUnaccent('area_atuacao'),
          iLikeUnaccent('cidade'),
          iLikeUnaccent('estado'),
          iLikeUnaccent('resumo_profissional'),
          iLikeUnaccent('experiencia_profissional'),
          iLikeUnaccent('certificacoes'),
          iLikeUnaccent('principais_habilidades'),

          // Arrays
          // 1) skills_array: contém elemento igual ao termo (match exato do item)
          { skills_array: { [Op.contains]: [q] } },

          // 2) idiomas/skills como texto (sem acento) — útil quando não é match exato
          where(
            fn('public.unaccent_immutable', fn('array_to_string', col('skills_array'), ',')),
            { [Op.iLike]: literal(`public.unaccent_immutable('%${esc}%')`) }
          ),
          where(
            fn('public.unaccent_immutable', fn('array_to_string', col('idiomas'), ',')),
            { [Op.iLike]: literal(`public.unaccent_immutable('%${esc}%')`) }
          ),
        ],
      });
    }
    // -------------------------------------------------------------------

    const ordemCol = ['valor_hora', 'ultimo_login', 'created_at'].includes(ordenarPor)
      ? ordenarPor
      : 'created_at';
    const ordemDir = (ordem || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const { rows, count } = await Freelancer.findAndCountAll({
      where: filtrosBusca.length ? { [Op.and]: [whereBase, ...filtrosBusca] } : whereBase,
      order: [[ordemCol, ordemDir]],
      limit: limite,
      offset,
      attributes: { exclude: ['senha_hash'] },
    });

    return res.json({
      success: true,
      message: 'Freelancers listados com sucesso',
      data: {
        freelancers: rows,
        total: count,
        totalPaginas: Math.max(Math.ceil(count / limite), 1),
        pagina,
        limite,
      },
    });
  } catch (error) {
    console.error('Erro ao listar freelancers:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar freelancer por ID
const buscarFreelancerPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const freelancer = await Freelancer.findByPk(id, {
      attributes: { exclude: ['senha_hash'] }
    });

    if (!freelancer) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer não encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Freelancer encontrado',
      data: freelancer,
    });

  } catch (error) {
    console.error('Erro ao buscar freelancer:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Atualizar perfil do freelancer
const atualizarPerfil = async (req, res) => {
  try {
    const freelancerId = req.freelancer.id;
    const dadosParaAtualizar = { ...req.body };

    // Remover campos que não devem ser atualizados diretamente
    delete dadosParaAtualizar.id;
    delete dadosParaAtualizar.senha_hash;
    delete dadosParaAtualizar.email; // Email só via endpoint específico
    delete dadosParaAtualizar.created_at;
    delete dadosParaAtualizar.updated_at;

    const [numLinhasAfetadas, freelancersAtualizados] = await Freelancer.update(
      dadosParaAtualizar,
      {
        where: { id: freelancerId },
        returning: true,
      }
    );

    if (numLinhasAfetadas === 0) {
      return res.status(404).json({
        success: false,
        message: 'Freelancer não encontrado',
      });
    }

    const freelancerAtualizado = freelancersAtualizados[0];

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: freelancerAtualizado,
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// Buscar meu perfil
const meuPerfil = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Perfil do freelancer',
      data: req.freelancer,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

// === Função de escrita do PDF (mantida) ===
function escreverCurriculoPdf(doc, f) {
  const C = {
    text: '#111827', sub:  '#374151', mute: '#6B7280',
    line: '#E5E7EB', chip: '#F3F4F6', acc:  '#2563EB', card: '#F9FAFB',
  };

  const MARGIN = 56;
  const PAGE = {
    left: MARGIN,
    right: doc.page.width - MARGIN,
    width: doc.page.width - MARGIN * 2,
    top: MARGIN,
    bottom: doc.page.height - MARGIN,
  };

  const H = { h1: 22, h2: 13.5, body: 11, small: 10 };

  const safe = (v, d='') => (v == null ? d : String(v));
  const arr  = (v) => Array.isArray(v) ? v.filter(Boolean) : [];
  const money = (v) => (v == null || v === '' ? null : `R$ ${Number(v).toFixed(2).replace('.', ',')}`);

  let y = PAGE.top;

  const ensure = (need=60) => { if (y + need > PAGE.bottom) { doc.addPage(); y = PAGE.top; } };
  const hr = (pad=12) => { ensure(20); doc.save().moveTo(PAGE.left, y).lineTo(PAGE.right, y).lineWidth(1).strokeColor(C.line).stroke().restore(); y += pad; };
  const h1 = (t) => { ensure(40); doc.fillColor(C.text).fontSize(H.h1).text(t, PAGE.left, y, { width: PAGE.width }); y = doc.y + 8; };
  const section = (title) => { ensure(34); doc.save().rect(PAGE.left, y + 2, 3.5, 14).fill(C.acc).restore(); doc.fillColor(C.text).fontSize(H.h2).text(title, PAGE.left + 10, y, { width: PAGE.width - 10 }); y = doc.y + 8; };

  const labelRow = (pairs, gap = 18) => {
    const colW = (PAGE.width - gap) / 2;
    ensure(36);
    const L = pairs[0], R = pairs[1];
    const drawKV = (kv, x) => {
      if (!kv || !kv.value) return;
      doc.fontSize(H.small).fillColor(C.mute).text(kv.label, x, y, { width: colW });
      doc.fontSize(H.body).fillColor(C.text).text(kv.value, x, doc.y + 2, { width: colW });
    };
    const yStart = y;
    drawKV(L, PAGE.left);
    const yAfterL = doc.y;
    drawKV(R, PAGE.left + colW + gap);
    const yAfterR = doc.y;
    y = Math.max(yStart, yAfterL, yAfterR) + 10;
  };

  const paragraph = (text) => { if (!text || !String(text).trim()) return; ensure(24); doc.fontSize(H.body).fillColor(C.sub).text(String(text), PAGE.left, y, { width: PAGE.width, align: 'left', lineGap: 2 }); y = doc.y + 10; };

  const chips = (items) => {
    const list = arr(items);
    if (!list.length) return;
    ensure(28);
    let x = PAGE.left, lineH = 0;
    const padX = 8, padY = 5, r = 8, gap = 8;
    doc.fontSize(10);
    list.forEach((txt) => {
      const label = String(txt);
      const w = doc.widthOfString(label) + padX * 2;
      const h = doc.currentLineHeight() + padY * 2;
      if (x + w > PAGE.right) { y += lineH + 6; ensure(24); x = PAGE.left; lineH = 0; }
      doc.save().roundedRect(x, y, w, h, r).fill(C.chip).restore();
      doc.fillColor(C.text).text(label, x + padX, y + padY, { width: w - padX*2, align: 'center' });
      x += w + gap; lineH = Math.max(lineH, h);
    });
    y += lineH + 10;
  };

  const bullet = (lines) => {
    const arrLines = arr(lines);
    if (!arrLines.length) return;
    ensure(18);
    arrLines.forEach(line => {
      ensure(18);
      doc.save().circle(PAGE.left + 3, y + 6, 2).fill(C.acc).restore();
      doc.fillColor(C.sub).fontSize(H.body).text(String(line), PAGE.left + 12, y, { width: PAGE.width - 12, lineGap: 2 });
      y = doc.y + 6;
    });
  };

  const card = (drawContent) => {
    const topY = y;
    const pad = 12;
    ensure(60);
    doc.save().roundedRect(PAGE.left, topY, PAGE.width, 9999, 10).clip();
    doc.save().roundedRect(PAGE.left, topY, PAGE.width, 9999, 10).fill(C.card).restore();
    y = topY + pad;
    drawContent();
    const endY = y + pad;
    doc.save().roundedRect(PAGE.left, topY, PAGE.width, endY - topY, 10).lineWidth(1).strokeColor(C.line).stroke().restore();
    y = endY + 12;
  };

  const nome = safe(f?.nome, 'Nome não informado');
  const titulo = safe(f?.profissao || f?.area_atuacao, 'Profissão/Área não informada');

  h1(nome);
  doc.fillColor(C.mute).fontSize(H.h2).text(titulo, PAGE.left, y, { width: PAGE.width });
  y = doc.y + 10;
  hr(12);

  card(() => {
    section('Contato');
    labelRow([{ label: 'E-mail', value: safe(f?.email) }, { label: 'Telefone', value: safe(f?.telefone) }]);
    labelRow([{ label: 'Localização', value: (f?.cidade || f?.estado) ? `${safe(f?.cidade)}${f?.estado ? ` - ${safe(f?.estado)}` : ''}` : '' }, { label: 'CEP', value: safe(f?.cep) }]);

    section('Preferências');
    labelRow([{ label: 'Área de atuação', value: safe(f?.area_atuacao) }, { label: 'Nível', value: safe(f?.nivel_experiencia) }]);
    labelRow([{ label: 'Modalidade', value: safe(f?.modalidade_trabalho) }, { label: 'Disponibilidade', value: safe(f?.disponibilidade) }]);
    const vHora = money(f?.valor_hora);
    if (vHora) labelRow([{ label: 'Valor/Hora', value: vHora }]);
  });

  if (f?.resumo_profissional) { section('Resumo profissional'); paragraph(f.resumo_profissional); hr(); }
  if (f?.objetivos_profissionais) { section('Objetivos'); paragraph(f.objetivos_profissionais); hr(); }
  if (Array.isArray(f?.skills_array) && f.skills_array.length) { section('Skills técnicas'); chips(f.skills_array); hr(); }
  if (f?.principais_habilidades) { section('Principais habilidades'); paragraph(f.principais_habilidades); hr(); }
  if (Array.isArray(f?.idiomas) && f.idiomas.length) { section('Idiomas'); chips(f.idiomas); hr(); }
  if (f?.experiencia_profissional) { section('Experiência profissional'); paragraph(f.experiencia_profissional); hr(); }

  if (f?.formacao_academica || f?.instituicao || f?.ano_conclusao) {
    section('Formação acadêmica');
    const linhas = [safe(f?.formacao_academica), safe(f?.instituicao), f?.ano_conclusao ? `Conclusão: ${f.ano_conclusao}` : ''].filter(Boolean);
    bullet(linhas);
    hr();
  }

  if (f?.certificacoes) { section('Certificações'); paragraph(f.certificacoes); hr(); }

  if (Array.isArray(f?.areas_interesse) && f.areas_interesse.length) { section('Áreas de interesse'); chips(f.areas_interesse); hr(); }

  if (Array.isArray(f?.portfolio_projetos) && f.portfolio_projetos.length) {
    section('Projetos de portfólio');
    f.portfolio_projetos.slice(0, 8).forEach((p) => {
      const linha = [p?.titulo, p?.descricao, p?.link].filter(Boolean).join(' — ');
      bullet([linha]);
    });
    hr();
  }

  const meta = [];
  if (f?.status) meta.push(`Status do perfil: ${f.status}`);
  if (f?.ultimo_login) { try { meta.push(`Último login: ${new Date(f.ultimo_login).toLocaleString('pt-BR')}`); } catch {} }
  if (meta.length) { section('Informações adicionais'); bullet(meta); }
}

// ===== empresa baixa cv de um candidato =====
const gerarCurriculoPdf = async (req, res) => {
  try {
    const { id } = req.params; // id do freelancer
    const f = await Freelancer.findByPk(id);
    if (!f) return res.status(404).json({ success: false, message: 'Freelancer não encontrado' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="curriculo-${(f.nome || 'freelancer').replace(/\s+/g, '-')}.pdf"`
    );
    doc.pipe(res);
    escreverCurriculoPdf(doc, f);
    doc.end();
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    res.status(500).json({ success: false, message: 'Erro ao gerar PDF' });
  }
};

// ===== freelancer baixa o próprio cv =====
const gerarMeuCurriculoPdf = async (req, res) => {
  try {
    const f = await Freelancer.findByPk(req.freelancer.id);
    if (!f) return res.status(404).json({ success: false, message: 'Perfil não encontrado' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="meu-curriculo-${(f.nome || 'freelancer').replace(/\s+/g, '-')}.pdf"`
    );
    doc.pipe(res);
    escreverCurriculoPdf(doc, f);
    doc.end();
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    res.status(500).json({ success: false, message: 'Erro ao gerar PDF' });
  }
};

module.exports = {
  listarFreelancers,
  buscarFreelancerPorId,
  atualizarPerfil,
  meuPerfil,
  gerarCurriculoPdf,
  gerarMeuCurriculoPdf
};
