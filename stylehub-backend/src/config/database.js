const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stylehub';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`📊 MongoDB conectado: ${conn.connection.host}`);
    
    // Eventos de conexión
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose conectado a MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.log('❌ Error de Mongoose:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ Mongoose desconectado');
    });

    // Graceful close
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 Conexión MongoDB cerrada debido a terminación de la app');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
