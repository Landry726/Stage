const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/AuthRoutes');
const userRoutes = require('./routes/routesUser');
const membreRoutes = require('./routes/membreRoutes');
const missionRoutes = require('./routes/routesMission');
const paiementMissionRoutes = require('./routes/paiementMissionRoutes');
const cotisationRoutes = require('./routes/cotisationRoutes');
const caisseRoutes = require ('./routes/caisseRoutes.js');
const entreeRoutes = require ('./routes/entreeRoutes.js');
const sortieRoutes = require('./routes/sortieRoutes.js');
const rapportRoutes = require('./routes/rapportRoutes.js');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

require('dotenv').config(); // Pour gérer les variables d'environnement

const app = express();
const PORT = process.env.PORT || 3000;

const testDatabaseConnection = async () => {
    try {
      await prisma.$connect();
      console.log('Connecté à la base de données avec succès.');
    } catch (error) {
      console.error('Erreur lors de la connexion à la base de données :', error);
    }
  };
  
  // Appeler la fonction pour vérifier la connexion à la base de données
  testDatabaseConnection();
// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user/' ,userRoutes );
app.use('/api/membres', membreRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/cotisations', cotisationRoutes);
app.use('/api/paiementMission' , paiementMissionRoutes);
app.use('/api/caisse' , caisseRoutes);
app.use('/api/entree' , entreeRoutes);
app.use('/api/sortie' , sortieRoutes);
app.use('/api/rapport' , rapportRoutes);


// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Le serveur est lancé sur  http://localhost:${PORT}`);
});
