// src/components/NavBar.js
import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { NavLink } from 'react-router-dom';
import { Box, styled } from '@mui/material';

const NavLinks = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
}));

const LinkItem = styled(NavLink)(({ theme }) => ({
  textDecoration: 'none',
  color: '#ffffff',
  '&.active': {
    borderBottom: '2px solid #ffffff',
  },
}));

const NavBar = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleMenu}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Streaming Stock Market Data Visualization Dashboard
        </Typography>
        <NavLinks>
          <LinkItem to="/">Home</LinkItem>
          <LinkItem to="/candlestick-chart">Candlestick Chart</LinkItem>
          <LinkItem to="/line-chart">Line Chart</LinkItem>
          <LinkItem to="/bar-chart">Bar Chart</LinkItem>
          <LinkItem to="/settings">Settings</LinkItem>
        </NavLinks>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>
            <LinkItem to="/">Home</LinkItem>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <LinkItem to="/candlestick-chart">Candlestick Chart</LinkItem>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <LinkItem to="/line-chart">Line Chart</LinkItem>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <LinkItem to="/bar-chart">Bar Chart</LinkItem>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <LinkItem to="/settings">Settings</LinkItem>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
