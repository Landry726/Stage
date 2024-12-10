import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    MenuItem,
    Typography,
    Container,
    Grid,
    InputAdornment,
    Paper,
    IconButton,
    Box,
    Snackbar,
    Alert
} from '@mui/material';
import {
    AccountCircle,
    MonetizationOn,
    CalendarToday,
    ArrowBack
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function CotisationForm() {
    const [membreId, setMembreId] = useState('');
    const [montant, setMontant] = useState('');
    const [mois, setMois] = useState('');
    const [datePaiement, setDatePaiement] = useState('');
    const [status, setStatus] = useState('');
    const [membres, setMembres] = useState([]);
    const [errors, setErrors] = useState({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const navigate = useNavigate();

    // Récupérer la liste des membres
    useEffect(() => {
        const fetchMembres = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/membres');
                const data = await response.json();
                setMembres(data);
            } catch (error) {
                showSnackbar('Erreur lors de la récupération des membres', 'error');
            }
        };
        fetchMembres();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        if (!membreId) newErrors.membreId = 'Membre est requis';
        if (!montant) newErrors.montant = 'Montant est requis';
        if (!mois) newErrors.mois = 'Mois est requis';
        if (!datePaiement) newErrors.datePaiement = 'Date de paiement est requise';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const data = {
            membreId: parseInt(membreId),
            montant: parseFloat(montant),
            mois,
            datePaiement,
            status,
        };

        try {
            const response = await fetch('http://localhost:3000/api/cotisations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l’ajout de la cotisation');
            }

            showSnackbar('Cotisation ajoutée avec succès !', 'success');
            setMembreId('');
            setMontant('');
            setMois('');
            setDatePaiement('');
            setStatus('');

            setTimeout(() => {
                navigate('/cotisation');
            }, 2000);
        } catch (error) {
            showSnackbar(error.message, 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="md" sx={{ paddingTop: 4 }}>
            <Paper
                elevation={3}
                sx={{
                    maxWidth: 800,
                    margin: '-25px',
                    padding: 5,
                    boxShadow: 5,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                }}
            >
                <Box display="flex" alignItems="center" mb={3}>
                    <IconButton onClick={() => navigate('/cotisation')} sx={{ mr: 1, color: 'primary.main' }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h5" component="h1">
                        Paiement Cotisation
                    </Typography>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Membre"
                                value={membreId}
                                onChange={(e) => setMembreId(e.target.value)}
                                fullWidth
                                required
                                error={!!errors.membreId}
                                helperText={errors.membreId}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AccountCircle />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                }}
                            >
                                <MenuItem value="">
                                    <em>Sélectionnez un membre</em>
                                </MenuItem>
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
                                type="number"
                                value={montant}
                                onChange={(e) => setMontant(e.target.value)}
                                fullWidth
                                required
                                error={!!errors.montant}
                                helperText={errors.montant}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MonetizationOn />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                select
                                label="Mois"
                                value={mois}
                                onChange={(e) => setMois(e.target.value)}
                                fullWidth
                                required
                                error={!!errors.mois}
                                helperText={errors.mois}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                }}
                            >
                                <MenuItem value="">
                                    <em>Sélectionnez un mois</em>
                                </MenuItem>
                                {Array.from({ length: 12 }, (_, i) => {
                                    const moisTexte = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(0, i));
                                    return (
                                        <MenuItem key={i + 1} value={moisTexte}>
                                            {moisTexte.charAt(0).toUpperCase() + moisTexte.slice(1)}
                                        </MenuItem>
                                    );
                                })}
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Date de Paiement"
                                type="date"
                                value={datePaiement}
                                onChange={(e) => setDatePaiement(e.target.value)}
                                fullWidth
                                required
                                error={!!errors.datePaiement}
                                helperText={errors.datePaiement}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <CalendarToday />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                fullWidth
                                sx={{
                                    padding: '12px',
                                    background: 'linear-gradient(to right, #007bff, #0056b3)',
                                    color: 'white',
                                    borderRadius: '8px',
                                }}
                            >
                                Ajouter
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}variant='filled'>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default CotisationForm;
