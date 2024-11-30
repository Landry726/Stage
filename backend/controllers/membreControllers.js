const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// GET all membres
exports.getMembres = async (req, res) => {
  try {
    const membres = await prisma.membre.findMany();
    res.json(membres);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching membres' });
  }
};

// GET membre by ID
exports.getMembreById = async (req, res) => {
  const { id } = req.params;
  try {
    const membre = await prisma.membre.findUnique({
      where: { id: Number(id) },
    });
    if (membre) {
      res.json(membre);
    } else {
      res.status(404).json({ error: 'Membre not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching membre' });
  }
};

// CREATE membre
exports.createMembre = async (req, res) => {
  const { nom, email , poste } = req.body;
  try {
    const newMembre = await prisma.membre.create({
      data: { nom, email , poste },
    });
    res.json(newMembre);
  } catch (error) {
    res.status(500).json({ error: 'Error creating membre' });
  }
};

// UPDATE membre
exports.updateMembre = async (req, res) => {
  const { id } = req.params;
  const { nom, email , poste } = req.body;
  try {
    const updatedMembre = await prisma.membre.update({
      where: { id: Number(id) },
      data: { nom, email , poste },
    });
    res.json(updatedMembre);
  } catch (error) {
    res.status(500).json({ error: 'Error updating membre' });
  }
};

// DELETE membre
exports.deleteMembre = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.membre.delete({
      where: { id: Number(id) },
    });
    res.json({ message: 'Membre deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting membre' });
  }
};

// COUNT membres
exports.countMembres = async (req, res) => {
  try {
    const count = await prisma.membre.count(); // Compter le nombre total de membres
    res.json({ totalMembres: count });
  } catch (error) {
    res.status(500).json({ error: 'Error counting membres' });
  }
};