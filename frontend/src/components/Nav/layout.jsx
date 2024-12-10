import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import userLogo from '../../assets/images/logoFID.png';
import DashboardIcon from '@mui/icons-material/Dashboard';

const drawerWidthOpen = 270; // Increased width for more space
const drawerWidthClosed = 70;

const Layout = ({ children }) => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    window.location.href = '/'; // Redirection après déconnexion
  };

  const menuItems = [
    { text: 'Tableaux de bord', icon: <DashboardIcon />, route: '/dashboard' },
    { text: 'Utilisateur', icon: <PersonIcon />, route: '/users' },
    { text: 'Membres', icon: <GroupIcon />, route: '/membres' },
    { text: 'Mission', icon: <FlightTakeoffIcon />, route: '/mission' },
    { text: 'Cotisation', icon: <AccountBalanceIcon />, route: '/cotisation' },
    { text: 'Solde Entrée', icon: <MonetizationOnIcon />, route: '/Entree' },
    { text: 'Solde Sortie', icon: <AttachMoneyIcon />, route: '/Sortie' },
    { text: 'Caisse Sociale', icon: <LocalAtmIcon />, route: '/Caisse' },
  ];

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f4f6f9' }}>
      <CssBaseline />
      <AppBar
        style={{ 
          background: '#FFD700', // Jaune vif
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
        position="fixed"
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          '& .MuiToolbar-root': {
            color: '#000' // Texte en noir pour contraster avec le jaune
          }
        }}
      >
        <Toolbar>
          <IconButton 
            edge="start" 
            color="inherit" 
            aria-label="menu" 
            onClick={handleDrawerToggle}
            sx={{
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, ml: 4 }}>
            <img 
              src={userLogo} 
              alt="User Logo" 
              style={{ 
                width: 150, 
                marginRight: 50, 
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
              }} 
            />
          </Box>
          <IconButton 
            color="inherit" 
            aria-label="profile" 
            onClick={handleProfileMenuOpen}
            sx={{
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.1)'
              }
            }}
          >
            <Avatar 
              sx={{ 
                backgroundColor: 'transparent', 
                // border: '2px solid rgba(0,0,0,0.2)' 
              }}
            >
              <PersonIcon />
            </Avatar>
          </IconButton>
          <Menu 
            anchorEl={anchorEl} 
            open={Boolean(anchorEl)} 
            onClose={handleProfileMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                mt: 1
              }
            }}
          >
            <MenuItem onClick={handleProfileMenuClose}>Profil</MenuItem>
            <MenuItem onClick={handleLogoutClick}>
              <ExitToAppIcon sx={{ mr: 1 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: open ? drawerWidthOpen : drawerWidthClosed,
          flexShrink:50,
          '& .MuiDrawer-paper': {
            width: open ? drawerWidthOpen : drawerWidthClosed,
            boxSizing: 'border-box',
            backgroundColor: '#1a237e',
            color: 'white',
            transition: 'width 0.3s ease',
            borderRight: 'none',
            boxShadow: '3px 0 10px rgba(0,0,0,0.1)'
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar />
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
        <List>
          {menuItems.map((item, index) => (
            <Tooltip title={open ? '' : item.text} placement="right" key={index}>
              <ListItem
                component={Link}
                to={item.route}
                sx={{
                  borderRadius: 2,
                  margin: '0px -3px', // Augmenté l'espace vertical
                  transition: 'background-color 0.3s, transform 0.2s',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.02)',
                  },
                  padding: open ? '15px 20px' : '0px', // Plus d'espace de padding
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                    marginRight: open ? 1 : 0, // Plus d'espace entre l'icône et le texte
                    transition: 'transform 0.2s'
                  },
                  '&:hover .MuiSvgIcon-root': {
                    transform: 'rotate(5deg)'
                  },
                  '& .MuiListItemText-primary': {
                    display: open ? 'block' : 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: 'white',
                    fontFamily: "'Inter', Arial, sans-serif",
                    letterSpacing: '0.5px',
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.3s',
                    paddingLeft: 1 // Espace supplémentaire à gauche du texte
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 2,
                    padding: 1,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  {item.icon}
                </Box>
                <ListItemText primary={item.text} />
              </ListItem>
            </Tooltip>
          ))}
        </List>
        <Divider />
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: '#f4f6f9',
          p: 3,
          marginLeft: open ? `${drawerWidthOpen}px` : `${drawerWidthClosed}px`,
          transition: 'margin 0.3s ease',
        }}
      >
        <Toolbar />
        {children}
      </Box>

      <Dialog
        open={logoutDialogOpen}
        onClose={closeLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle 
          id="logout-dialog-title" 
          sx={{ 
            backgroundColor: '#f4f6f9', 
            color: '#1a237e',
            fontWeight: 600 
          }}
        >
          Confirmation
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: '#f4f6f9' }}>
          <DialogContentText 
            id="logout-dialog-description"
            sx={{ color: '#37474f' }}
          >
            Voulez-vous vraiment vous déconnecter ?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#f4f6f9', padding: 2 }}>
          <Button 
            onClick={closeLogoutDialog} 
            color="primary"
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Annuler
          </Button>
          <Button 
            onClick={confirmLogout} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}
            autoFocus
          >
            Déconnexion
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;