import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';

export default function Navigation() {
  return (
    <AppBar position="static" sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
          }}
        >
          URL Shortener
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1, md: 2 } }}>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            startIcon={<LinkIcon />}
            sx={{ 
              '& .MuiButton-startIcon': { 
                margin: { xs: 0, sm: '0 4px 0 -4px' },
                '& > *:first-of-type': {
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Shorten URL
            </Box>
          </Button>
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/stats"
            startIcon={<BarChartIcon />}
            sx={{ 
              '& .MuiButton-startIcon': { 
                margin: { xs: 0, sm: '0 4px 0 -4px' },
                '& > *:first-of-type': {
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }
              }
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Stats
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
