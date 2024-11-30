const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Récupérer les informations du profil utilisateur
exports.getUserProfile = async (req, res) => {
    try {
        const user = await prisma.user.findMany({
            select: {
                email: true,
                username: true,
            },
        });

        if (!user || user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
      
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong: ' + error });
    }
};

// Mettre à jour le profil utilisateur



exports.updateUser = async (req, res) => {
    const { id } = req.params; // Récupérer l'ID de l'utilisateur depuis les paramètres de la requête
    const { username, email } = req.body; // Récupérer les champs à mettre à jour depuis le corps de la requête

    // Validation des données reçues
    if (username || email) {
        return res.status(400).json({ message: "Nom d'utilisateur et email sont requis." });
    }

    // Convertir l'ID en entier
    const userId = Number(id);

    // Vérifiez si l'ID est un nombre valide
    if (isNaN(userId)) {
        return res.status(400).json({ message: "ID invalide." });
    }

    try {
        // Utilisez `prisma.user.update` pour effectuer la mise à jour
        const updatedUser = await prisma.user.update({
            where: { id: userId }, // Utiliser l'ID converti
            data: {
                username, // Nouveau nom d'utilisateur
                email,    // Nouvel email
            },
        });

        res.status(200).json({
            message: "Utilisateur mis à jour avec succès",
            user: updatedUser,
        });
    } catch (error) {
        if (error.code === 'P2025') {
            // Erreur de non-existence de l'utilisateur
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }
        
        console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
        res.status(500).json({ message: "Erreur de serveur lors de la mise à jour de l'utilisateur", error: error.message });
    }
};




  
  // Supprimer un utilisateur
  exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
      await prisma.user.delete({ where: { id: parseInt(id) } });
      res.status(204).json();
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression de l’utilisateur' });
    }
  };