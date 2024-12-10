import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Skeleton, 
  Grid, 
  CircularProgress, 
  Paper,
  useTheme
} from '@mui/material';
import { 
  AccountBalance as AccountBalanceIcon, 
  TrendingDown as TrendingDownIcon, 
  TrendingUp as TrendingUpIcon, 
  Group as GroupIcon 
} from '@mui/icons-material';
import axios from 'axios';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart,
  Bar,
  ResponsiveContainer 
} from 'recharts';

const DashboardCard = ({ icon, title, value, color, loading = false }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(2),
        borderRadius: theme.spacing(2),
        background: `linear-gradient(145deg, ${color}CC, ${color}DD)`,
        color: theme.palette.common.white,
        transition: 'transform 0.3s ease',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: theme.shadows[6]
        }
      }}
    >
      <Box
        sx={{
          marginRight: theme.spacing(2),
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: theme.spacing(1.5),
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : icon}
      </Box>
      <Box>
        <Typography 
          variant="body2" 
          sx={{ 
            opacity: 0.7, 
            marginBottom: theme.spacing(0.5),
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            color: theme.palette.common.white 
          }}
        >
          {loading ? '...' : value}
        </Typography>
      </Box>
    </Paper>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const [totalCaisses, setTotalCaisses] = useState(0);
  const [totalSorties, setTotalSorties] = useState(0);
  const [totalEntrees, setTotalEntrees] = useState(0);
  const [totalMembres, setTotalMembres] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);
  const [cotisationsByMonth, setCotisationsByMonth] = useState([]);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        setLoading(true);

        const caissesResponse = await axios.get('http://localhost:3000/api/caisse/total');
        setTotalCaisses(caissesResponse.data.totalCaisses || 0);

        const sortiesResponse = await axios.get('http://localhost:3000/api/sortie/total');
        setTotalSorties(sortiesResponse.data.totalSortie || 0);

        const entreesResponse = await axios.get('http://localhost:3000/api/entree/total');
        setTotalEntrees(entreesResponse.data.totalEntree || 0);

        const membresResponse = await axios.get('http://localhost:3000/api/membres/count');
        setTotalMembres(membresResponse.data.totalMembres || 0);

        const trendsResponse = await axios.get('http://localhost:3000/api/caisse/trends');
        const trends = Array.isArray(trendsResponse.data) ? trendsResponse.data : [];
        setTrendData(trends);

        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données :', error);
        setLoading(false);
      }
    };

    fetchTotals();
    const fetchCotisationsByYear = async () => {
      try {
        setLoading(true);
        const year = new Date().getFullYear();
        const response = await axios.get(`http://localhost:3000/api/cotisations/cotisations/year/${year}`);
        const { cotisationsByMonth } = response.data;

        const formattedData = cotisationsByMonth.map((count, index) => ({
          month: new Date(0, index).toLocaleString('default', { month: 'short' }),
          cotisations: count,
        }));

        setCotisationsByMonth(formattedData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des cotisations par mois :', error);
        setLoading(false);
      }
    };

    fetchCotisationsByYear();
  }, []);

  const chartData = trendData.map((item) => ({
    mois: item.mois,
    entrees: item.entrees || 0,
    sorties: item.sorties || 0,
  }));

  return (
    <Box sx={{ 
      padding: theme.spacing(3), 
      backgroundColor: theme.palette.background.default 
    }}>
      <Grid 
        container 
        spacing={3} 
        sx={{ 
          marginBottom: theme.spacing(3), 
          justifyContent: 'space-between' 
        }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<AccountBalanceIcon />}
            title="Total Caisse"
            value={`${totalCaisses} Ar`}
            color="#1976d2"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<TrendingUpIcon />}
            title="Revenus"
            value={`${totalEntrees} Ar`}
            color="#4caf50"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<TrendingDownIcon />}
            title="Depense"
            value={`${totalSorties} Ar`}
            color="#f44336"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardCard
            icon={<GroupIcon />}
            title=" Membres"
            value={totalMembres}
            color="#ff9800"
            loading={loading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Graphique 1 : Statistique des Entrées et Sorties */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: theme.spacing(2),
              overflow: 'hidden',
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  marginBottom: theme.spacing(3),
                }}
              >
                Statistique des Entrées et Sorties par Mois
              </Typography>
              {loading ? (
                <Skeleton
                  variant="rectangular"
                  height={300}
                  sx={{ borderRadius: theme.spacing(1) }}
                />
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="mois"
                      tick={{
                        fontSize: 12,
                        fill: theme.palette.text.secondary,
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: theme.palette.text.secondary,
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: theme.spacing(1),
                        backgroundColor: theme.palette.background.paper,
                      }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="entrees"
                      stroke="#4caf50"
                      fillOpacity={0.5}
                      fill="#4caf50"
                    />
                    <Area
                      type="monotone"
                      dataKey="sorties"
                      stroke="#f44336"
                      fillOpacity={0.5}
                      fill="#f44336"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Paper>
        </Grid>

        {/* Graphique 2 : Rapport des Cotisations */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: theme.spacing(2),
              padding: theme.spacing(3),
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                marginBottom: theme.spacing(3),
              }}
            >
              Rapport des Cotisations par Mois
            </Typography>
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={300}
                sx={{ borderRadius: theme.spacing(1) }}
              />
            ) : (
              <ResponsiveContainer width="80%" height={350}>
                <BarChart
                  data={cotisationsByMonth}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme.palette.divider}
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: theme.palette.text.secondary,
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: theme.palette.text.secondary,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: theme.spacing(1),
                      backgroundColor: theme.palette.background.paper,
                    }}
                  />
                  <Bar dataKey="cotisations" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
