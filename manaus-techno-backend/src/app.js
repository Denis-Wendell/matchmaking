require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { sequelize, testConnection } = require('./config/database');

// Importa rotas primeiro (apenas as referências, sem usar app ainda)
const authRoutes = require('./routes/authRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const vagasRoutes = require('./routes/vagasRoutes');
const candidaturasRoutes = require('./routes/candidaturasRoutes');
const iaRoutes = require('./routes/iaRoutes');
const matchRoutes = require('./routes/matchRoutes');

// (Opcional) importa modelos para garantir que o Sequelize os registre
require('./models/Freelancer');
require('./models/Empresa');
require('./models/Vaga');
require('./models/Candidatura'); // seu modelo de candidaturas

// Configura associações DEPOIS de todos os models terem sido carregados
const { setupAssociations } = require('./models/associations');
setupAssociations();

// Agora pode criar o app
const app = express();
const PORT = process.env.PORT || 3001;

/* ===== Middlewares ===== */
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: ['http://localhost:3000','http://localhost:5173','http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

/* ===== Healthcheck ===== */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Manaus Techno funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

/* ===== Rotas ===== */
app.use('/api', matchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/vagas', vagasRoutes);
app.use('/api/candidaturas', candidaturasRoutes);
app.use('/api/ia', iaRoutes);

/* ===== 404 ===== */
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

/* ===== Erros ===== */
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
});

/* ===== Start ===== */
const iniciarServidor = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    await testConnection();

    // Evite alterar tabelas existentes em produção
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      console.log('📊 Modelos sincronizados');
    } else {
      await sequelize.sync();
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};
iniciarServidor();

module.exports = app;
