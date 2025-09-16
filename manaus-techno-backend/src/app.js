const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { setupAssociations } = require('./models/associations'); 
setupAssociations();

// Importações dos módulos internos
const { sequelize, testConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const freelancerRoutes = require('./routes/freelancerRoutes');
const empresaRoutes = require('./routes/empresaRoutes');
const vagasRoutes = require('./routes/vagasRoutes');


// Importar modelo para sincronização
const Freelancer = require('./models/Freelancer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware de segurança e logging
app.use(helmet());
app.use(morgan('combined'));

// Middleware para CORS
app.use(cors({
  origin: [
    'http://localhost:3000',    // Create React App
    'http://localhost:5173',    // Vite
    'http://127.0.0.1:5173',    // Vite alternativo
  ],
  credentials: true,
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Manaus Techno funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/vagas', vagasRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message }),
  });
});

// Função para inicializar o servidor
const iniciarServidor = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Testar conexão com banco
    await testConnection();
    
    // Sincronizar modelos com banco de dados (não alterar tabela existente)
    if (process.env.NODE_ENV === 'development') {
      // Não usar alter: true para não modificar tabela freelancer existente
      await sequelize.sync({ force: false });
      console.log('📊 Modelos sincronizados com o banco de dados');
    } else {
      await sequelize.sync();
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
      console.log(`📊 Database: ${process.env.DB_NAME}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Inicializar o servidor
iniciarServidor();

module.exports = app;