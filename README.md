# 🛰️ SAT-LM: Satellite Tracking + Local LLM Assistant

A complete web application that tracks live satellites on an interactive world map and allows users to ask questions about them using a local LLM (Ollama).

## 🌟 Features

### 🛰️ **Real-time Satellite Tracking**
- Fetches live TLE (Two-Line Element) data from Celestrak
- Displays 1000+ active satellites on an interactive world map
- Real-time position calculation using orbital mechanics
- Automatic data refresh every 5 minutes

### 🗺️ **Interactive Map**
- Full-screen world map using React-Leaflet
- Clickable satellite markers with detailed information
- Smooth animations and zoom controls
- Dark theme optimized for space visualization
- Satellite search and filtering

### 🤖 **AI Assistant**
- Local LLM integration using Ollama
- Ask questions about satellites, orbits, and space
- Context-aware responses about satellite data
- Chat history and real-time responses

### 🎨 **Modern UI**
- Dark space-themed design
- Responsive sidebar with tabbed interface
- Loading states and error handling
- Smooth animations and transitions

## 🧩 Tech Stack

**Frontend:**
- React 18 + Vite
- TailwindCSS for styling
- React-Leaflet for maps
- Lucide React for icons
- Axios for API calls

**Backend:**
- Node.js + Express
- satellite.js for orbital calculations
- Axios for external API calls
- CORS for cross-origin requests

**AI/LLM:**
- Ollama (local LLM server)
- Supports multiple models (llama3, codellama, etc.)

**Data Sources:**
- Celestrak TLE feed for satellite data
- OpenStreetMap for base maps

## 📁 Project Structure

```
sat-lm/
├── backend/
│   ├── server.js          # Express server with satellite & chat APIs
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SatelliteMap.jsx    # Interactive map component
│   │   │   └── Sidebar.jsx         # Search, chat, and controls
│   │   ├── App.jsx        # Main application component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   ├── tailwind.config.js # TailwindCSS configuration
│   └── index.html         # HTML template
├── package.json           # Root package.json with scripts
├── .env                   # Environment configuration
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Ollama** installed and running locally
3. **Git** (for cloning)

### 1. Install Ollama

Download and install Ollama from [https://ollama.ai](https://ollama.ai)

Pull the required model:
```bash
ollama pull llama3
```

Start Ollama (if not running):
```bash
ollama serve
```

### 2. Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd sat-lm

# Install all dependencies
npm run install-all

# Or install manually:
# npm install              # Root dependencies
# npm run install-backend  # Backend dependencies  
# npm run install-frontend # Frontend dependencies
```

### 3. Start the Application

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
# npm run backend   # Starts backend on http://localhost:5000
# npm run frontend  # Starts frontend on http://localhost:3000
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## 🔧 Configuration

### Environment Variables

Create/modify `.env` file in the root directory:

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# Ollama Configuration  
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3

# Satellite Data Configuration
CELESTRAK_URL=https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle
CACHE_DURATION=300000

# Frontend Configuration
VITE_API_URL=http://localhost:5000/api
```

### Ollama Models

You can use different Ollama models by changing the model name in the chat request:

```bash
# Available models (pull before using)
ollama pull llama3         # Default
ollama pull codellama      # Code-focused
ollama pull mistral        # Alternative model
ollama pull dolphin-llama3 # Uncensored variant
```

## 📡 API Endpoints

### Satellite Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/satellites` | Get all satellites with current positions |
| GET | `/api/satellites?search=ISS` | Search satellites by name |
| GET | `/api/satellites?limit=100` | Limit number of results |
| GET | `/api/satellites/ISS` | Get specific satellite by name |

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message to Ollama LLM |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

### Example API Responses

**Satellites:**
```json
{
  "satellites": [
    {
      "name": "ISS (ZARYA)",
      "lat": 51.6461,
      "lon": -0.1276, 
      "alt": 408.12
    }
  ],
  "total": 1234,
  "filtered": 1,
  "lastUpdate": "2024-01-15T10:30:00.000Z"
}
```

**Chat:**
```json
{
  "response": "The International Space Station (ISS) is currently orbiting at approximately 408 km altitude...",
  "model": "llama3",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🎮 Usage Guide

### 1. **Satellite Tracking**
- View all active satellites on the world map
- Use the search box to find specific satellites (e.g., "ISS", "Starlink")
- Click on any satellite marker to see detailed information
- Use "Refresh Satellites" to get the latest positions

### 2. **AI Chat Assistant**
- Switch to the "AI Chat" tab in the sidebar
- Ask questions about satellites, orbits, or space
- Examples:
  - "What is the ISS?"
  - "How do satellites stay in orbit?"
  - "Tell me about geostationary satellites"
  - "What's the altitude of low Earth orbit?"

### 3. **Map Navigation**
- Zoom in/out using mouse wheel or controls
- Click and drag to pan around the world
- Click satellite markers to select and view details
- Selected satellites appear larger and in blue

## 🛠️ Development

### Project Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run backend          # Start only backend server
npm run frontend         # Start only frontend dev server

# Installation
npm run install-all      # Install all dependencies
npm run install-backend  # Install backend dependencies
npm run install-frontend # Install frontend dependencies

# Production
npm run build           # Build frontend for production
```

### Adding Features

1. **Backend:** Add new routes in `backend/server.js`
2. **Frontend:** Add new components in `frontend/src/components/`
3. **Styling:** Modify `frontend/tailwind.config.js` or add CSS to `frontend/src/index.css`

### Debugging

1. **Backend Issues:**
   - Check console logs for server errors
   - Verify Ollama is running: `curl http://localhost:11434/api/version`
   - Test API endpoints: `curl http://localhost:5000/api/health`

2. **Frontend Issues:**
   - Open browser dev tools (F12)
   - Check console for JavaScript errors
   - Verify API calls in Network tab

3. **Satellite Data Issues:**
   - Check internet connection
   - Verify Celestrak URL is accessible
   - Check backend logs for TLE parsing errors

## 📦 Dependencies

### Backend Dependencies
- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **axios**: HTTP client for API calls
- **satellite.js**: Satellite position calculations
- **dotenv**: Environment variable management

### Frontend Dependencies
- **react**: UI library
- **react-leaflet**: Map component library
- **leaflet**: Map visualization library
- **axios**: HTTP client
- **lucide-react**: Icon library
- **tailwindcss**: Utility-first CSS framework

## 🚨 Troubleshooting

### Common Issues

**1. "Ollama service unavailable"**
- Ensure Ollama is installed and running
- Check if the service is accessible: `curl http://localhost:11434/api/version`
- Restart Ollama: `ollama serve`

**2. "Failed to fetch satellite data"**
- Check internet connection
- Verify Celestrak URL is accessible
- Backend logs will show specific errors

**3. "CORS errors in browser"**
- Ensure backend is running on port 5000
- Check that CORS is properly configured in `backend/server.js`

**4. "Map not displaying"**
- Check that Leaflet CSS is properly loaded
- Verify React-Leaflet components are imported correctly
- Check browser console for JavaScript errors

**5. "No satellites visible"**
- Wait for initial data fetch (may take 10-30 seconds)
- Check backend logs for TLE parsing errors
- Try refreshing the satellite data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -am 'Add new feature'`
6. Push: `git push origin feature-name`
7. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- **Celestrak** for providing free TLE data
- **Ollama** for local LLM capabilities
- **OpenStreetMap** contributors for map data
- **satellite.js** for orbital mechanics calculations
- **React-Leaflet** for map integration

## 🔗 Links

- [Celestrak](https://celestrak.org/) - Satellite data source
- [Ollama](https://ollama.ai/) - Local LLM platform
- [React-Leaflet](https://react-leaflet.js.org/) - React map components
- [satellite.js](https://github.com/shashwatak/satellite-js) - Satellite calculations

---

**Happy satellite tracking! 🛰️✨**