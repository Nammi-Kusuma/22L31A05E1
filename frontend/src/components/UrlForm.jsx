import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  Paper, 
  Snackbar, 
  Alert,
  InputAdornment
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export default function UrlForm() {
  const [formData, setFormData] = useState({
    url: '',
    validity: 30,
    shortcode: ''
  });
  const [shortUrl, setShortUrl] = useState('');
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'validity' ? parseInt(value) || '' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/shorturls`, {
        url: formData.url,
        validity: formData.validity,
        shortcode: formData.shortcode || undefined
      });
      
      const { shortLink, expiry } = response.data;
      setShortUrl(shortLink);
      setExpiry(expiry);
      
      // Add to recent URLs in localStorage
      const recentUrls = JSON.parse(localStorage.getItem('recentUrls') || '[]');
      localStorage.setItem('recentUrls', JSON.stringify([
        { url: formData.url, shortUrl: shortLink, expiry, clicks: 0 },
        ...recentUrls
      ].slice(0, 10))); // Keep only last 10
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create short URL');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setOpenSnackbar(true);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3, md: 4 }, 
        maxWidth: 600, 
        mx: 'auto',
        mt: { xs: 2, sm: 3, md: 4 },
        mb: 4
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.7rem' } }}
      >
        URL Shortener
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Long URL"
          name="url"
          value={formData.url}
          onChange={handleChange}
          required
          margin="normal"
          placeholder="https://example.com"
        />
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          mt: 2,
          '& > *': { 
            flex: 1,
            minWidth: { xs: '100%', sm: 'auto' }
          }
        }}>
          <TextField
            label="Validity (minutes)"
            name="validity"
            type="number"
            value={formData.validity}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">min</InputAdornment>,
            }}
          />
          
          <TextField
            label="Custom Shortcode (optional)"
            name="shortcode"
            value={formData.shortcode}
            onChange={handleChange}
            margin="normal"
          />
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          sx={{ mt: 3, py: 1.5 }}
        >
          Generate Short URL
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {shortUrl && (
          <Box sx={{ 
            mt: 3, 
            p: { xs: 1.5, sm: 2 }, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              Your Short URL:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1,
              '& > *': {
                flex: { xs: '0 0 auto', sm: 1 }
              }
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  flexGrow: 1, 
                  wordBreak: 'break-all',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  py: { xs: 1, sm: 0.5 },
                  px: { xs: 1, sm: 1.5 },
                  bgcolor: 'background.default',
                  borderRadius: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                <a 
                  href={shortUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {shortUrl}
                </a>
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
                sx={{
                  whiteSpace: 'nowrap',
                  minWidth: 'fit-content',
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0.5, sm: 1 }
                  }
                }}
              >
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Copy</Box>
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  <ContentCopyIcon fontSize="small" />
                </Box>
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Expires: {new Date(expiry).toLocaleString()}
            </Typography>
          </Box>
        )}
      </Box>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="URL copied to clipboard"
      />
    </Paper>
  );
}
