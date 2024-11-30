const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');


// Inscription
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifiez si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
};

// Connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Cherchez l'utilisateur par email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifiez le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }
  
    res.status(200).json({ message: 'Connexion réussie', user });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};
