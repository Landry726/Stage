import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import axios from 'axios';

const Dashboard = () => {
  const [totalCaisses, setTotalCaisses] = useState(0);
  const [totalSorties, setTotalSorties] = useState(0);
  const [totalEntrees, setTotalEntrees] = useState(0);

  // Charger les données depuis le backend
  useEffect(() => {
    const fetchTotals = async () => {
      try {
        // Récupérer le total des caisses
        const caissesResponse = await axios.get('http://localhost:3000/api/caisse/total');
        setTotalCaisses(caissesResponse.data.totalCaisses);

        // Récupérer le total des sorties
        const sortiesResponse = await axios.get('http://localhost:3000/api/sortie/total');
        setTotalSorties(sortiesResponse.data.totalSortie);

        // Récupérer le total des entrées
        const entreesResponse = await axios.get('http://localhost:3000/api/entree/total');
        setTotalEntrees(entreesResponse.data.totalEntree);
      } catch (error) {
        console.error('Erreur lors du chargement des totaux :', error);
      }
    };

    fetchTotals();
  }, []);

  return (
    <Box sx={{ padding: '10px', backgroundColor: 'white' }}>
  
      <Grid container spacing={3}>
        {/* Carte pour le total des caisses */}
        <Grid item xs={2} sm={6} md={4}>
          <Card sx={{ display: 'flex', alignItems: 'center', padding: '14px', backgroundColor: 'white' }}>
            <Box sx={{ marginRight: '15px', color: '#1976d2' }}>
              <AccountBalanceIcon sx={{ fontSize: 40 }} />
            </Box>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Caisse
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalCaisses} Ar
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte pour le total des entrées */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ display: 'flex', alignItems: 'center', padding: '14px', backgroundColor: 'white' }}>
            <Box sx={{ marginRight: '16px', color: '#4caf50' }}>
              <TrendingUpIcon sx={{ fontSize: 40 }} />
            </Box>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Entrées
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalEntrees} Ar
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Carte pour le total des sorties */}
        <Grid item xs={12} sm={10} md={4}>
          <Card sx={{ display: 'flex', alignItems: 'center', padding: '14px', backgroundColor: 'white'}}>
            <Box sx={{ marginRight: '16px', color: '#f44336' }}>
              <TrendingDownIcon sx={{ fontSize: 40 }} />
            </Box>
            <CardContent>
              <Typography variant="h6" color="textSecondary">
                Total Sorties
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {totalSorties} Ar
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
