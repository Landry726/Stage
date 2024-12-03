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
} from '@mui/material';
import { AccountCircle, MonetizationOn, CalendarToday } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CotisationForm() {
    const [membreId, setMembreId] = useState('');
    const [montant, setMontant] = useState('');
    const [mois, setMois] = useState('');
    const [datePaiement, setDatePaiement] = useState('');
    const [status, setStatus] = useState('');
    const [membres, setMembres] = useState([]);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    // Récupérer la liste des membres
    useEffect(() => {
        const fetchMembres = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/membres');
                const data = await response.json();
                setMembres(data);
            } catch (error) {
                toast.error('Erreur lors de la récupération des membres');
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

            // Vérifiez si la réponse n'est pas OK
                if (!response.ok) {
                    const errorData = await response.json(); // Analysez le message d'erreur
                    throw new Error(errorData.message || 'Erreur lors de l’ajout de la cotisation');
                }

            toast.success('Cotisation ajoutée avec succès !');
            setMembreId('');
            setMontant('');
            setMois('');
            setDatePaiement('');
            setStatus('');

            setTimeout(() => {
                navigate('/cotisation');
            }, 2000);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleCancel = () => {
        navigate('/cotisation'); // Retourner à la liste des cotisations
    };

    return (
        <Container maxWidth="lg" sx={{ paddingTop: 4  }}>
            <Paper
                elevation={3}
                sx={{
                    padding: 4,
                    borderRadius: 3,
                    boxShadow: 3,
                    mr : 5,
                    marginLeft : -15,
                }}
            >
                <Typography variant="h5" gutterBottom align="center" sx={{ marginBottom: 3 }}>
                    Ajouter un paiement
                </Typography>
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
                                    '& .MuiInputBase-root': {
                                        fontSize: '1rem',
                                        padding: '8px 14px',
                                    },
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
                                    '& .MuiInputBase-root': {
                                        fontSize: '1rem',
                                        padding: '8px 14px',
                                    },
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
                                        '& .MuiInputBase-root': {
                                            fontSize: '1rem',
                                            padding: '8px 14px',
                                        },
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
                                    '& .MuiInputBase-root': {
                                        fontSize: '1rem',
                                        padding: '8px 14px',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                fullWidth
                                sx={{
                                    padding: '12px',
                                    backgroundColor: '#ff4d4d',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    border: '1px solid #cc0000',
                                    '&:hover': {
                                        backgroundColor: '#cc0000',
                                    },
                                }}
                            >
                                Annuler
                            </Button>
                        </Grid>
                        <Grid item xs={12} sm={6}>
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
                                    fontSize: '1rem',
                                    border: '1px solid #0056b3',
                                    '&:hover': {
                                        background: 'linear-gradient(to right, #0056b3, #004494)',
                                    },
                                }}
                            >
                                Ajouter
                            </Button>
                        </Grid>
                       
                    </Grid>
                </form>
                <ToastContainer />
            </Paper>
        </Container>
    );
}

export default CotisationForm;
