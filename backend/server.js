const express = require('express');
const cors = require('cors');
const axios = require('axios');
const satellite = require('satellite.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store satellite data cache
let satelliteCache = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Parse TLE data and calculate current position
function parseTLEData(tleData) {
  const lines = tleData.trim().split('\n');
  const satellites = [];
  
  for (let i = 0; i < lines.length; i += 3) {
    if (i + 2 < lines.length) {
      const name = lines[i].trim();
      const tleLine1 = lines[i + 1];
      const tleLine2 = lines[i + 2];
      
      try {
        // Create satellite record from TLE
        const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
        
        // Get current time
        const now = new Date();
        
        // Calculate position
        const positionAndVelocity = satellite.propagate(satrec, now);
        
        if (positionAndVelocity.position) {
          // Convert ECI to geodetic coordinates
          const gmst = satellite.gstime(now);
          const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
          
          // Convert to degrees and km
          const lat = satellite.degreesLat(position.latitude);
          const lon = satellite.degreesLong(position.longitude);
          const alt = position.height; // Already in km
          
          // Only include if coordinates are valid
          if (!isNaN(lat) && !isNaN(lon) && !isNaN(alt)) {
            satellites.push({
              name: name.replace(/^0\s+/, ''), // Remove leading "0 " if present
              lat: parseFloat(lat.toFixed(4)),
              lon: parseFloat(lon.toFixed(4)),
              alt: parseFloat(alt.toFixed(2))
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to parse satellite ${name}:`, error.message);
      }
    }
  }
  
  return satellites;
}

// Fetch satellite data from Celestrak
async function fetchSatelliteData() {
  try {
    console.log('Fetching satellite data from Celestrak...');
    const response = await axios.get(
      'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle',
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'SAT-LM/1.0'
        }
      }
    );
    
    const satellites = parseTLEData(response.data);
    console.log(`Successfully parsed ${satellites.length} satellites`);
    
    satelliteCache = satellites;
    lastFetchTime = Date.now();
    
    return satellites;
  } catch (error) {
    console.error('Error fetching satellite data:', error.message);
    throw error;
  }
}

// API Routes

// Get all satellites
app.get('/api/satellites', async (req, res) => {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (satelliteCache.length === 0 || (now - lastFetchTime) > CACHE_DURATION) {
      await fetchSatelliteData();
    }
    
    // Apply filters if provided
    let filtered = satelliteCache;
    
    const { search, limit } = req.query;
    
    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(sat => 
        sat.name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum) && limitNum > 0) {
        filtered = filtered.slice(0, limitNum);
      }
    }
    
    res.json({
      satellites: filtered,
      total: satelliteCache.length,
      filtered: filtered.length,
      lastUpdate: new Date(lastFetchTime).toISOString()
    });
  } catch (error) {
    console.error('Error in /api/satellites:', error);
    res.status(500).json({ 
      error: 'Failed to fetch satellite data',
      message: error.message 
    });
  }
});

// Chat with Ollama LLM
app.post('/api/chat', async (req, res) => {
  try {
    const { message, model = 'llama3' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`Sending chat request to Ollama with model: ${model}`);
    
    // Enhance the prompt with satellite context
    const contextPrompt = `You are an expert assistant for satellite tracking. The user is using a satellite tracking application that shows real-time positions of satellites around Earth. You have access to current satellite data including names, coordinates, and altitudes. Please provide helpful, accurate information about satellites, space, and orbital mechanics. User question: ${message}`;
    
    const ollamaResponse = await axios.post(
      'http://localhost:11434/api/generate',
      {
        model: model,
        prompt: contextPrompt,
        stream: false
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const response = ollamaResponse.data.response;
    
    res.json({
      response: response,
      model: model,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in /api/chat:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({ 
        error: 'Ollama service unavailable',
        message: 'Please ensure Ollama is running on http://localhost:11434'
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({
        error: 'Model not found',
        message: 'Please ensure the specified model is available in Ollama'
      });
    } else {
      res.status(500).json({ 
        error: 'Chat service error',
        message: error.message 
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    cache: {
      satellites: satelliteCache.length,
      lastUpdate: lastFetchTime ? new Date(lastFetchTime).toISOString() : null
    }
  });
});

// Get specific satellite by name
app.get('/api/satellites/:name', (req, res) => {
  const satelliteName = req.params.name.toLowerCase();
  const satellite = satelliteCache.find(sat => 
    sat.name.toLowerCase().includes(satelliteName)
  );
  
  if (satellite) {
    res.json(satellite);
  } else {
    res.status(404).json({ error: 'Satellite not found' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SAT-LM Backend server running on port ${PORT}`);
  console.log(`📡 Satellite API: http://localhost:${PORT}/api/satellites`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  
  // Initialize satellite data on startup
  fetchSatelliteData().catch(err => {
    console.warn('Initial satellite data fetch failed:', err.message);
  });
});