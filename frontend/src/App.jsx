import React, { useState, useEffect } from 'react';
import SatelliteMap from './components/SatelliteMap';
import Sidebar from './components/Sidebar';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [satellites, setSatellites] = useState([]);
  const [filteredSatellites, setFilteredSatellites] = useState([]);
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch satellites from backend
  const fetchSatellites = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/satellites`);
      setSatellites(response.data.satellites);
      setFilteredSatellites(response.data.satellites);
    } catch (err) {
      setError('Failed to fetch satellite data. Please ensure the backend is running.');
      console.error('Error fetching satellites:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter satellites based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSatellites(satellites);
    } else {
      const filtered = satellites.filter(satellite =>
        satellite.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSatellites(filtered);
    }
  }, [searchTerm, satellites]);

  // Send chat message to Ollama
  const sendChatMessage = async (message) => {
    setChatLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: message,
        model: 'llama3'
      });
      
      const newMessage = {
        id: Date.now(),
        type: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: 'Failed to get response from AI assistant. Please ensure Ollama is running.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      console.error('Error sending chat message:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchSatellites();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchSatellites, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-space-dark text-white">
      {/* Sidebar */}
      <Sidebar
        satellites={filteredSatellites}
        selectedSatellite={selectedSatellite}
        onSatelliteSelect={setSelectedSatellite}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onRefresh={fetchSatellites}
        loading={loading}
        error={error}
        chatMessages={chatMessages}
        onSendMessage={sendChatMessage}
        chatLoading={chatLoading}
        totalSatellites={satellites.length}
      />
      
      {/* Map */}
      <div className="flex-1">
        <SatelliteMap
          satellites={filteredSatellites}
          selectedSatellite={selectedSatellite}
          onSatelliteSelect={setSelectedSatellite}
        />
      </div>
    </div>
  );
}

export default App;