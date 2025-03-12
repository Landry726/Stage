import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    TablePagination,
    Alert,
    Typography,
    Snackbar,
    CircularProgress,
    Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';  // Import useNavigate
const CotisationTable = () => {
    const [membres, setMembres] = useState([]); // Assurez-vous qu'il s'agit d'un tableau vide par défaut
    const [currentPage, setCurrentPage] = useState(0);
    const [cotisationsPerPage, setCotisationsPerPage] = useState(5);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        fetchMembresSansCotisation();
    }, []);

    const fetchMembresSansCotisation = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/cotisations/membres/sans-cotisation');
            const data = await response.json();
            console.log("Données récupérées :", data); // Vérifiez ici le format
            setMembres(data);
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Erreur lors de la récupération des membres.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setCotisationsPerPage(parseInt(event.target.value, 10));
        setCurrentPage(0);
    };

    const handleBack = () => {
        navigate('/cotisation');
    };

    // Protégez contre les données non valides
    const membresArray = Array.isArray(membres) ? membres : [];

    return (
        <Paper sx={{ padding: '10px', marginTop: '10px', maxHeight: '100vh', overflowY: 'auto', marginLeft: '-220px' }}>
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 'bold',
                    color: '#003399',
                    marginBottom: 3,
                }}
            >
                Membres n'ayant pas effectué leurs cotisations
            </Typography>
            <IconButton onClick={handleBack} sx={{ marginBottom: '20px', color: '#003399' }}>
                <ArrowBackIcon />
            </IconButton>

            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '60vh' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table sx={{ minWidth: 850 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', backgroundColor: '#003399', fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ color: 'white', backgroundColor: '#003399', fontWeight: 'bold' }}>Nom</TableCell>
                                    <TableCell sx={{ color: 'white', backgroundColor: '#003399', fontWeight: 'bold' }}>Poste</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {membresArray
                                    .slice(currentPage * cotisationsPerPage, (currentPage + 1) * cotisationsPerPage)
                                    .map((membre) => (
                                        <TableRow key={membre.id} >
                                            <TableCell>{membre.id}</TableCell>
                                            <TableCell>{membre.nom}</TableCell>
                                            <TableCell>{membre.poste}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={membresArray.length}
                        rowsPerPage={cotisationsPerPage}
                        page={currentPage}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: "100%" }} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default CotisationTable;
