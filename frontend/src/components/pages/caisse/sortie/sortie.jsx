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
  createTheme,
  Snackbar,
  Alert
} from "@mui/material";
import { frFR } from "@mui/material/locale";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ThemeProvider } from "@mui/material/styles";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const SortieList = () => {
  const [sorties, setSorties] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedSortie, setSelectedSortie] = useState(null);
  
  const [openSnackbar, setOpenSnackbar] = useState(false); // État pour la Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message de la Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Sévérité de la Snackbar

  // Charger les sorties depuis l'API
  const fetchSorties = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/sortie");
      setSorties(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSorties();
  }, []);

  // Gestion de la suppression d'une sortie
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/sortie/${selectedSortie.id}`);
      setSnackbarMessage("Sortie supprimée avec succès");
      setSnackbarSeverity("success");
      setSorties(sorties.filter((sortie) => sortie.id !== selectedSortie.id));
      setOpenDeleteDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage("Erreur lors de la suppression de la sortie");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
      console.error(error);
    }
  };

  // Gestion de la modification d'une sortie
  const handleEdit = async () => {
    try {
      await axios.put(`http://localhost:3000/api/sortie/${selectedSortie.id}`, selectedSortie);
      setSnackbarMessage("Sortie modifiée avec succès");
      setSnackbarSeverity("success");
      setSorties(
        sorties.map((sortie) =>
          sortie.id === selectedSortie.id ? selectedSortie : sortie
        )
      );
      setOpenEditDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      setSnackbarMessage("Erreur lors de la modification de la sortie");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
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

  // Création d'un thème personnalisé en français
  const theme = createTheme(
    {
      palette: {
        primary: {
          main: "#003399",
        },
      },
    },
    frFR // Localisation en français
  );

  return (
    <ThemeProvider theme={theme}>
      <Paper elevation={3}
        sx={{
          padding: "10px",
          marginLeft: '-220px',
          maxHeight: '100vh',
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          overflowY: 'auto'
        }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#003399',
            margin: '20px 0',
          }}
        >
          Solde Sortie
        </Typography>
        <Link to="/AjoutSortie">
          <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ mb: 2 }}>
            Ajouter une sortie
          </Button>
        </Link>

        <TextField
          label="Rechercher"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'white', backgroundColor: '#003399' }} align="center">Date</TableCell>
                <TableCell sx={{ color: 'white', backgroundColor: '#003399' }} align="center">Motif</TableCell>
                <TableCell sx={{ color: 'white', backgroundColor: '#003399' }} align="center">Montant</TableCell>
                <TableCell sx={{ color: 'white', backgroundColor: '#003399' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSorties
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((sortie) => (
                  <TableRow key={sortie.id}>
                    <TableCell align="center">{new Date(sortie.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{sortie.motif}</TableCell>
                    <TableCell align="center">{sortie.montant} Ar</TableCell>
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

        <TablePagination
          component="div"
          count={filteredSorties.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Ligne par page"
        />

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }} variant="filled">
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Dialog de confirmation pour suppression */}
        <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
          <DialogTitle>
          <WarningAmberIcon sx={{ color: 'red', marginRight: 2 }} />
          Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Êtes-vous sûr de vouloir supprimer cette sortie ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDeleteDialog(false)}  variant='contained' color='primary'>
              Annuler
            </Button>
            <Button onClick={handleDelete}variant='contained' color="error">
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de modification */}
        <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
          <DialogTitle>Modifier la Sortie</DialogTitle>
          <DialogContent>
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
            <Button onClick={() => setOpenEditDialog(false)} variant='contained' color='error'>
              Annuler
            </Button>
            <Button onClick={handleEdit} variant='contained' color='primary'>
              Enregistrer
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </ThemeProvider>
  );
};

export default SortieList;
