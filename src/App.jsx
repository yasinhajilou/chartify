import { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL
const API_KEY = import.meta.env.VITE_API_KEY

function formatStreams(num) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B'
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M'
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K'
  }
  return num.toString()
}

function formatFullNumber(num) {
  return num.toLocaleString()
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function App() {
  const [songs, setSongs] = useState([])
  const [chartDate, setChartDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(API_URL, {
          headers: {
            'api-key': API_KEY
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setSongs(data.chart.songs)
          setChartDate(data.chart.chartDate)
        } else {
          throw new Error('API returned unsuccessful response')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  const filteredSongs = songs.filter(song => {
    const query = searchQuery.toLowerCase()
    const titleMatch = song.title.toLowerCase().includes(query)
    const artistMatch = song.artists.some(artist => 
      artist.toLowerCase().includes(query)
    )
    return titleMatch || artistMatch
  })

  if (loading) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading Top 200 Songs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <svg className="spotify-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            <div className="title-section">
              <h1>Top 200 Most Streamed Songs</h1>
              <p className="subtitle">All Time Chart • Updated {formatDate(chartDate)}</p>
            </div>
          </div>
          
          <div className="search-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search by song or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="table-container">
          <table className="songs-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th className="col-cover"></th>
                <th className="col-title">Title</th>
                <th className="col-artist">Artist(s)</th>
                <th className="col-album">Album</th>
                <th className="col-streams">Streams</th>
              </tr>
            </thead>
            <tbody>
              {filteredSongs.map((song) => (
                <tr key={song.rank} className="song-row">
                  <td className="col-rank">
                    <span className="rank">{song.rank}</span>
                  </td>
                  <td className="col-cover">
                    <img 
                      src={song.coverArt} 
                      alt={`${song.title} cover`}
                      className="cover-art"
                      loading="lazy"
                    />
                  </td>
                  <td className="col-title">
                    <span className="song-title">{song.title}</span>
                  </td>
                  <td className="col-artist">
                    <span className="artists">{song.artists.join(', ')}</span>
                  </td>
                  <td className="col-album">
                    <span className="album">{song.albumName}</span>
                  </td>
                  <td className="col-streams">
                    <span 
                      className="streams" 
                      title={formatFullNumber(song.playCount)}
                    >
                      {formatStreams(song.playCount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredSongs.length === 0 && (
            <div className="no-results">
              <p>No songs found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Data sourced from Spotify • {songs.length} songs loaded</p>
      </footer>
    </div>
  )
}

export default App
