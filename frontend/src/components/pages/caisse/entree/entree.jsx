import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { Link } from "react-router-dom"; // Pour les liens de navigation
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const SoldeEntreeList = () => {
  const [soldeEntrees, setSoldeEntrees] = useState([]); // Liste des entrées
  const [search, setSearch] = useState(""); // Terme de recherche
  const [page, setPage] = useState(0); // Page actuelle
  const [rowsPerPage, setRowsPerPage] = useState(5); // Nombre de lignes par page
  const [deleteId, setDeleteId] = useState(null); // ID de l'entrée à supprimer
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // Modal de confirmation de suppression
  const [openUpdateModal, setOpenUpdateModal] = useState(false); // Modal de mise à jour
  const [updateData, setUpdateData] = useState({}); // Données de l'entrée à mettre à jour

  // Charger les entrées depuis l'API
  const fetchSoldeEntrees = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/entree");
      setSoldeEntrees(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des entrées");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSoldeEntrees();
  }, []);

  // Gestion de la suppression d'une entrée
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/entree/${deleteId}`);
      toast.success("Entrée supprimée avec succès");
      setSoldeEntrees(soldeEntrees.filter((entree) => entree._id !== deleteId));
      setOpenDeleteConfirm(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression de l'entrée");
      console.error(error);
    }
  };

  // Gestion du changement de page
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Gestion du changement du nombre de lignes par page
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filtrer les entrées par recherche
  const filteredSoldeEntrees = soldeEntrees.filter(
    (entree) =>
      entree.motif.toLowerCase().includes(search.toLowerCase()) ||
      entree.date.includes(search)
  );

  // Gérer la mise à jour de l'entrée
  const handleUpdate = (entree) => {
    setUpdateData(entree);
    setOpenUpdateModal(true);
  };

  const handleUpdateSubmit = async () => {
    try {
      await axios.put(`http://localhost:3000/api/entree/${updateData._id}`, updateData);
      toast.success("Entrée mise à jour avec succès");
      setSoldeEntrees(
        soldeEntrees.map((entree) =>
          entree._id === updateData._id ? updateData : entree
        )
      );
      setOpenUpdateModal(false);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'entrée");
      console.error(error);
    }
  };

  // Gérer la suppression de l'entrée
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setOpenDeleteConfirm(true);
  };

  return (
    <Box  sx={{ padding: '-10px', marginTop: '5px', maxHeight: '120vh', overflowY: 'auto', marginLeft: '-230px' }}>
      <Typography  variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#003399' }}>
        Liste des Entrées
      </Typography>

     {/* Lien de type bouton pour ajouter une entrée */}
     <Link to="/AjoutEntree">
        <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ mb: 2 }}>
          Ajouter une entrée
        </Button>
      </Link>
      
      {/* Champ de recherche */}
      <TextField
        label="Rechercher"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

     

      {/* Table des entrées */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Date</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Motif</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Montant</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Caisse</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSoldeEntrees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((entree) => (
                <TableRow key={entree._id}>
                  <TableCell align="center">{new Date(entree.date).toLocaleDateString()}</TableCell>
                  <TableCell align="center">{entree.motif}</TableCell>
                  <TableCell align="center">{entree.montant}</TableCell>
                  <TableCell align="center">Caisse {entree.caisseId}</TableCell>
                  <TableCell align="center">
                    <IconButton sx={{ color: 'orange' }} onClick={() => handleUpdate(entree)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(entree._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredSoldeEntrees.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal de confirmation pour suppression */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette entrée ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)} color="primary">Annuler</Button>
          <Button onClick={handleDelete} color="error">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de mise à jour de l'entrée */}
      <Dialog open={openUpdateModal} onClose={() => setOpenUpdateModal(false)}>
        <DialogTitle>Modifier l'entrée</DialogTitle>
        <DialogContent>
          <TextField
            label="Motif"
            variant="outlined"
            fullWidth
            value={updateData.motif || ""}
            onChange={(e) => setUpdateData({ ...updateData, motif: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Montant"
            variant="outlined"
            fullWidth
            value={updateData.montant || ""}
            onChange={(e) => setUpdateData({ ...updateData, montant: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Caisse"
            variant="outlined"
            fullWidth
            value={updateData.caisseId || ""}
            onChange={(e) => setUpdateData({ ...updateData, caisseId: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpdateModal(false)} color="primary">Annuler</Button>
          <Button onClick={handleUpdateSubmit} color="primary">Sauvegarder</Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
};

export default SoldeEntreeList;
