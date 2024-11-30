import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    MenuItem,
    TablePagination,
    Alert,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CotisationTable = () => {
    const [cotisations, setCotisations] = useState([]);
    const [membres, setMembres] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [cotisationsPerPage] = useState(4);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [cotisationToEdit, setCotisationToEdit] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [showAlert, setShowAlert] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        fetchCotisations();
        fetchMembres();
    }, []);

    const fetchCotisations = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/cotisations');
            const data = await response.json();
            setCotisations(data);
        } catch (error) {
            setAlertMessage('Erreur lors de la récupération des cotisations');
            setAlertSeverity('error');
            setShowAlert(true);
        }
    };

    const fetchMembres = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/membres');
            const data = await response.json();
            setMembres(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des membres:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/cotisations/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Cotisation supprimée avec succès.');
                fetchCotisations();
            } else {
                throw new Error('Erreur lors de la suppression de la cotisation.');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleUpdate = async () => {
        if (!cotisationToEdit) return;

        try {
            const response = await fetch(`http://localhost:3000/api/cotisations/${cotisationToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    membreId: cotisationToEdit.membreId,
                    montant: cotisationToEdit.montant,
                    mois: cotisationToEdit.mois,
                    datePaiement: cotisationToEdit.datePaiement || new Date().toISOString().split('T')[0],
                }),
            });

            if (response.ok) {
                toast.success('Cotisation mise à jour avec succès.');
                fetchCotisations(); // Rafraîchir la liste des cotisations
                setEditDialogOpen(false); // Fermer la modal
            } else {
                throw new Error('Erreur lors de la mise à jour de la cotisation.');
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleEditDialogOpen = (cotisation) => {
        setCotisationToEdit(cotisation);
        setEditDialogOpen(true);
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value); // Gérer le changement de mois
    };

    // Filtrage des cotisations : recherche et mois
    const filteredCotisations = cotisations.filter((cotisation) => {
        const isMatchingMembre = membres.find((membre) => membre.id === cotisation.membreId)?.nom.toLowerCase().includes(searchTerm.toLowerCase());
        const isMatchingMonth = selectedMonth ? cotisation.mois === selectedMonth || selectedMonth === 'Tous' : true; // Filtrer par mois ou "Tous"
        return isMatchingMembre && isMatchingMonth;
    });

    return (
        <Paper sx={{ padding: '15px', marginTop: '10px', maxHeight: '100vh', overflowY: 'auto', marginLeft: '-220px' }}>
            <Link to="/ajoutCotisation">
                <Button variant="contained" color="primary" sx={{ marginBottom: '16px' }} startIcon={<AddIcon />}>
                    Ajouter un Paiement
                </Button>
            </Link>

            {/* Diviser la recherche en deux colonnes */}
            <Grid container spacing={2} sx={{ marginBottom: '16px' }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Rechercher par membre"
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    {/* Filtre par mois */}
                    <TextField
                        label="Filtrer par mois"
                        select
                        fullWidth
                        value={selectedMonth}
                        onChange={handleMonthChange}
                    >
                        <MenuItem value="Tous">Tous</MenuItem> {/* Option Tous */}
                        {['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'].map((mois) => (
                            <MenuItem key={mois} value={mois}>
                                {mois}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            <TableContainer sx={{ maxHeight: 500, overflowY: 'auto', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 850 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>ID</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Membre</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Date de Paiement</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Montant</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Mois</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white', backgroundColor: '#003399' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredCotisations.slice((currentPage - 1) * cotisationsPerPage, currentPage * cotisationsPerPage).map((cotisation) => (
                            <TableRow key={cotisation.id}>
                                <TableCell>{cotisation.id}</TableCell>
                                <TableCell>{membres.find((membre) => membre.id === cotisation.membreId)?.nom}</TableCell>
                                <TableCell>{cotisation.datePaiement}</TableCell>
                                <TableCell>{cotisation.montant}</TableCell>
                                <TableCell>{cotisation.mois}</TableCell>
                                <TableCell>{cotisation.status}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEditDialogOpen(cotisation)} sx={{ color: 'orange' }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'red' }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[4, 10, 25]}
                component="div"
                count={filteredCotisations.length}
                rowsPerPage={cotisationsPerPage}
                page={currentPage - 1}
                onPageChange={handleChangePage}
            />

            {/* Dialog de suppression */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <Typography>Voulez-vous vraiment supprimer cette cotisation ?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
                    <Button onClick={() => handleDelete(cotisationToEdit.id)} color="error">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de modification */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Modifier la Cotisation</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Membre"
                        select
                        fullWidth
                        value={cotisationToEdit?.membreId || ''}
                        onChange={(e) =>
                            setCotisationToEdit((prev) => ({ ...prev, membreId: e.target.value }))
                        }
                    >
                        {membres.map((membre) => (
                            <MenuItem key={membre.id} value={membre.id}>
                                {membre.nom}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Montant"
                        type="number"
                        fullWidth
                        value={cotisationToEdit?.montant || ''}
                        onChange={(e) =>
                            setCotisationToEdit((prev) => ({ ...prev, montant: e.target.value }))
                        }
                    />
                    <TextField
                        label="Mois"
                        select
                        fullWidth
                        value={cotisationToEdit?.mois || ''}
                        onChange={(e) =>
                            setCotisationToEdit((prev) => ({ ...prev, mois: e.target.value }))
                        }
                    >
                        {['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'].map((mois) => (
                            <MenuItem key={mois} value={mois}>
                                {mois}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        label="Date de Paiement"
                        type="date"
                        fullWidth
                        value={cotisationToEdit?.datePaiement || ''}
                        onChange={(e) =>
                            setCotisationToEdit((prev) => ({ ...prev, datePaiement: e.target.value }))
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleUpdate} color="primary">
                        Mettre à jour
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Alert */}
            {showAlert && (
                <Alert severity={alertSeverity} onClose={() => setShowAlert(false)}>
                    {alertMessage}
                </Alert>
            )}
        </Paper>
    );
};

export default CotisationTable;
