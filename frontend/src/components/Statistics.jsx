import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Collapse,
  IconButton,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  KeyboardArrowDown as KeyboardArrowDownIcon, 
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Link as LinkIcon,
  AccessTime as AccessTimeIcon,
  Language as LanguageIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function Row({ row }) {
  const [open, setOpen] = useState(false);
  const [clicks, setClicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClicks = async () => {
    if (open && clicks.length === 0) {
      setLoading(true);
      try {
        const shortCode = row.shortUrl.split('/').pop();
        const response = await axios.get(`${API_BASE_URL}/shorturls/${shortCode}`);
        setClicks(response.data.clicks || []);
      } catch (err) {
        setError('Failed to load click details');
        console.error('Error fetching click details:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchClicks();
  }, [open]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ maxWidth: { xs: 150, sm: 300, md: 'none' }, overflow: 'hidden' }}>
          <Typography 
            component="a" 
            href={row.shortUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ 
              textDecoration: 'none', 
              color: 'primary.main',
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={row.shortUrl}
          >
            {row.shortUrl}
          </Typography>
        </TableCell>
        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
          {row.clicks.length}
        </TableCell>
        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
          <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
            {formatDate(row.expiry)}
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, p: 2 }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                component="div"
                sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}
              >
                Click Details
              </Typography>
              
              {loading ? (
                <Box display="flex" justifyContent="center" p={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : clicks.length === 0 ? (
                <Typography>No click data available</Typography>
              ) : (
                <Table size="small" aria-label="click details">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Box display="flex" alignItems="center">
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, display: { xs: 'none', sm: 'block' } }} />
                          <Box component="span" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>Time</Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, whiteSpace: 'nowrap' }}>
                        <Box display="flex" alignItems="center">
                          <LanguageIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Box component="span">Referrer</Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' }, whiteSpace: 'nowrap' }}>
                        <Box display="flex" alignItems="center">
                          <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                          <Box component="span">Location</Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>Device</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clicks.map((click, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {formatDate(click.timestamp)}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          {click.referrer === 'Direct' ? (
                            <Chip
                              size="small"
                              label="Direct"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ) : (
                            <a 
                              href={click.referrer} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ 
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                color: 'inherit',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              {new URL(click.referrer).hostname}
                            </a>
                          )}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {click.geo || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          {click.userAgent ? (
                            <Chip
                              size="small"
                              label={click.userAgent.includes('Mobi') ? 'Mobile' : 'Desktop'}
                              color={click.userAgent.includes('Mobi') ? 'primary' : 'secondary'}
                            />
                          ) : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function Statistics() {
  const [recentUrls, setRecentUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecentUrls = async () => {
      try {
        const localUrls = JSON.parse(localStorage.getItem('recentUrls') || '[]');
        
        const updatedUrls = await Promise.all(
          localUrls.map(async (url) => {
            try {
              const shortCode = url.shortUrl.split('/').pop();
              const response = await axios.get(`${API_BASE_URL}/shorturls/${shortCode}`);
              return {
                ...url,
                clicks: response.data.clicks || 0,
                expiry: response.data.expiry || url.expiry
              };
            } catch (err) {
              console.error('Error fetching URL stats:', err);
              return url;
            }
          })
        );
        
        setRecentUrls(updatedUrls);
      } catch (err) {
        setError('Failed to load recent URLs');
        console.error('Error fetching recent URLs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUrls();
  }, []);

  if (loading) {
    return (
      <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="200px"
    >
      <CircularProgress />
    </Box>
    );
  }

  if (error) {
    return (
      <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        maxWidth: 800, 
        mx: 'auto', 
        mt: { xs: 2, sm: 3, md: 4 }, 
        textAlign: 'center',
        bgcolor: 'background.paper'
      }}
    >
      <Typography color="error">{error}</Typography>
    </Paper>
    );
  }

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: { xs: 2, sm: 3 }, 
        maxWidth: 1200, 
        mx: 'auto', 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: 4,
        overflow: 'hidden'
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          fontSize: { xs: '1.4rem', sm: '1.5rem', md: '1.7rem' },
          mb: { xs: 2, sm: 3 }
        }}
      >
        URL Statistics
      </Typography>
      
      {recentUrls.length === 0 ? (
        <Typography>No URLs have been shortened yet.</Typography>
      ) : (
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table aria-label="URL statistics" size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 40 }} />
                <TableCell><strong>Short URL</strong></TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  <strong>Clicks</strong>
                </TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                  <strong>Expires</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentUrls.map((url, index) => (
                <Row key={index} row={url} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
