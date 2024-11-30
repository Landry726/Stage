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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  DialogContentText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom"; // Pour les liens de navigation
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const SortieList = () => {
  const [sorties, setSorties] = useState([]); // Liste des sorties
  const [search, setSearch] = useState(""); // Terme de recherche
  const [page, setPage] = useState(0); // Page actuelle
  const [rowsPerPage, setRowsPerPage] = useState(5); // Nombre de lignes par page
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // État de la boîte de dialogue de suppression
  const [openEditDialog, setOpenEditDialog] = useState(false); // État de la boîte de dialogue d'édition
  const [selectedSortie, setSelectedSortie] = useState(null); // Sorte sélectionnée pour modification

  // Charger les sorties depuis l'API
  const fetchSorties = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/sortie"); // Remplacez par votre URL API
      setSorties(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des sorties");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSorties();
  }, []);

  // Gestion de la suppression d'une sortie
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/sorties/${selectedSortie.id}`); // Remplacez par votre URL API
      toast.success("Sortie supprimée avec succès");
      setSorties(sorties.filter((sortie) => sortie.id !== selectedSortie.id)); // Mise à jour de la liste
      setOpenDeleteDialog(false); // Fermer la boîte de dialogue
    } catch (error) {
      toast.error("Erreur lors de la suppression de la sortie");
      console.error(error);
    }
  };

  // Gestion de la modification d'une sortie
  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:3000/api/sorties/${selectedSortie.id}`, selectedSortie); // Remplacez par votre URL API
      toast.success("Sortie modifiée avec succès");
      setSorties(
        sorties.map((sortie) =>
          sortie.id === selectedSortie.id ? selectedSortie : sortie
        )
      ); // Mise à jour de la liste
      setOpenEditDialog(false); // Fermer la boîte de dialogue
    } catch (error) {
      toast.error("Erreur lors de la modification de la sortie");
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

  // Filtrer les sorties par recherche
  const filteredSorties = sorties.filter(
    (sortie) =>
      sortie.motif.toLowerCase().includes(search.toLowerCase()) ||
      sortie.date.includes(search)
  );

  return (
    <Box  sx={{ padding: '-10px', marginTop: '5px', maxHeight: '120vh', overflowY: 'auto', marginLeft: '-230px' }}>
      <Typography  variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#003399' }}>
        Liste des Sorties
      </Typography>
      <Link to="/AjoutSortie">
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
        
      {/* Table des sorties */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Date</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Motif</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}  align="center">Montant</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Caisse</TableCell>
              <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSorties
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((sortie) => (
                <TableRow key={sortie.id}>
                  <TableCell align="center">   {new Date(sortie.date).toLocaleDateString()} </TableCell>
                  <TableCell align="center">{sortie.motif}</TableCell>
                  <TableCell align="center">{sortie.montant}</TableCell>
                  <TableCell align="center">Caisse {sortie.caisseId}</TableCell>
                  <TableCell align="center">
                    <IconButton
                     sx={{ color: 'orange' }}
                      onClick={() => {
                        setSelectedSortie(sortie);
                        setOpenEditDialog(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setSelectedSortie(sortie);
                        setOpenDeleteDialog(true);
                      }}
                    >
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
        count={filteredSorties.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Container pour les notifications */}
      <ToastContainer />

      {/* Dialog de confirmation pour suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette sortie ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDelete} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Modifier la Sortie</DialogTitle>
        <DialogContent>
          {/* Formulaire de modification */}
          <TextField
            label="Motif"
            variant="outlined"
            fullWidth
            value={selectedSortie?.motif || ""}
            onChange={(e) =>
              setSelectedSortie({ ...selectedSortie, motif: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            label="Montant"
            variant="outlined"
            fullWidth
            type="number"
            value={selectedSortie?.montant || ""}
            onChange={(e) =>
              setSelectedSortie({
                ...selectedSortie,
                montant: parseFloat(e.target.value),
              })
            }
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleEdit} color="primary">
            Sauvegarder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SortieList;
