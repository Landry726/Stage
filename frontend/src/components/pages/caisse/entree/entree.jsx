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

const EntreList = () => {
  const [entree, setEntree] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedEntree, setselectedEntree] = useState(null);
  
  const [openSnackbar, setOpenSnackbar] = useState(false); // État pour la Snackbar
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Message de la Snackbar
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Sévérité de la Snackbar

  // Charger les sorties depuis l'API
  const fecthEntree = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/entree/");
      setEntree(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fecthEntree();
  }, []);

  // Gestion de la suppression d'une sortie
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/entree/${selectedEntree.id}`);
      setSnackbarMessage("Sortie supprimée avec succès");
      setSnackbarSeverity("success");
      setEntree(entree.filter((entree) => entree.id !== selectedEntree.id));
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
      await axios.put(`http://localhost:3000/api/entree/${selectedEntree.id}`, selectedEntree);
      setSnackbarMessage("Sortie modifiée avec succès");
      setSnackbarSeverity("success");
      setEntree(
        entree.map((entree) =>
          entree.id === selectedEntree.id ? selectedEntree : entree
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
  const filteredEntree = entree.filter(
    (entree) =>
      entree.motif.toLowerCase().includes(search.toLowerCase()) ||
      entree.date.includes(search)
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
          Solde Entree
        </Typography>
        <Link to="/AjoutEntree">
          <Button variant="contained" color="primary" startIcon={<AddIcon />} sx={{ mb: 2 }}>
            Ajouter une Entree
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
              {filteredEntree
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((entree) => (
                  <TableRow key={entree.id}>
                    <TableCell align="center">{new Date(entree.date).toLocaleDateString()}</TableCell>
                    <TableCell align="center">{entree.motif}</TableCell>
                    <TableCell align="center">{entree.montant} Ar</TableCell>
                    <TableCell align="center">
                      <IconButton
                        sx={{ color: 'orange' }}
                        onClick={() => {
                          setselectedEntree(entree);
                          setOpenEditDialog(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => {
                          setselectedEntree(entree);
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
          count={filteredEntree.length}
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
              value={selectedEntree?.motif || ""}
              onChange={(e) =>
                setselectedEntree({ ...selectedEntree, motif: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              label="Montant"
              variant="outlined"
              fullWidth
              type="number"
              value={selectedEntree?.montant || ""}
              onChange={(e) =>
                setselectedEntree({
                  ...selectedEntree,
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

export default EntreList;
