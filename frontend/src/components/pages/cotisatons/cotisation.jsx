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
    const [cotisationsPerPage] = useState(5);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [cotisationToEdit, setCotisationToEdit] = useState(null);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('success');
    const [showAlert, setShowAlert] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredCotisations = cotisations.filter((cotisation) =>
        membres.find((membre) => membre.id === cotisation.membreId)?.nom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Paper sx={{ padding: '12px', marginTop: '10px', maxHeight: '100vh', overflowY: 'auto', marginLeft: '-220px' }}>
            <Typography  variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#003399' }}>
                Cotisation
            </Typography>
            <Link to="/ajoutCotisation">
                <Button variant="contained" color="primary" sx={{ marginBottom: '16px' }} startIcon={<AddIcon />}>
                    Ajouter un Paiement
                </Button>
            </Link>

            <TextField
                label="Rechercher par membre"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ marginBottom: '16px' }}
            />

            <TableContainer sx={{ maxHeight: 500, overflowY: 'auto', overflowX: 'auto' }}>
                <Table sx={{ minWidth: 850 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>ID</TableCell>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Membre</TableCell>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Date de Paiement</TableCell>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Montant</TableCell>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Mois</TableCell>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Status</TableCell>
                            <TableCell sx={{ color: 'white' , backgroundColor: '#003399' }}>Actions</TableCell>
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
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredCotisations.length}
                rowsPerPage={cotisationsPerPage}
                page={currentPage - 1}
                onPageChange={handleChangePage}
            />

            {/* Modal de confirmation de suppression */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <p>Êtes-vous sûr de vouloir supprimer cette cotisation ?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={() => handleDelete(cotisationToEdit?.id)} color="error" variant="contained">
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de mise à jour */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Modifier la cotisation</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Membre"
                                select
                                fullWidth
                                value={cotisationToEdit?.membreId || ''}
                                onChange={(e) => setCotisationToEdit({ ...cotisationToEdit, membreId: e.target.value })}
                                autoFocus
                            >
                                {membres.map((membre) => (
                                    <MenuItem key={membre.id} value={membre.id}>
                                        {membre.nom}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Montant"
                                fullWidth
                                type="number"
                                value={cotisationToEdit?.montant || ''}
                                onChange={(e) => setCotisationToEdit({ ...cotisationToEdit, montant: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Mois"
                                fullWidth
                                value={cotisationToEdit?.mois || ''}
                                onChange={(e) => setCotisationToEdit({ ...cotisationToEdit, mois: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)} color="primary">
                        Annuler
                    </Button>
                    <Button onClick={() => fetchCotisations()} color="primary" variant="contained">
                        Mettre à jour
                    </Button>
                </DialogActions>
            </Dialog>

            {showAlert && (
                <Alert
                    severity={alertSeverity}
                    onClose={() => setShowAlert(false)}
                    sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1 }}
                >
                    {alertMessage}
                </Alert>
            )}
        </Paper>
    );
};

export default CotisationTable;
