import { useState, useEffect } from 'react';
import '../styles/PlayerSearch.css';

function PlayerSearch({ onSearch, onDirectImage, isLoading }) {
  const [inputMode, setInputMode] = useState('upload'); // 'search', 'upload', 'url', 'paste'
  const [playerName, setPlayerName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pasteReady, setPasteReady] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onSearch(playerName.trim());
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onDirectImage({
          url: event.target.result,
          title: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onDirectImage({
        url: imageUrl.trim(),
        title: 'User provided image'
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onload = (event) => {
              onDirectImage({
                url: event.target.result,
                title: 'Pasted image'
              });
              setPasteReady(false);
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }

      alert('No image found in clipboard. Please copy an image first.');
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      alert('Failed to access clipboard. Make sure you have copied an image and granted clipboard permissions.');
    }
  };

  // Listen for paste events when in paste mode
  useEffect(() => {
    if (inputMode !== 'paste') return;

    const handlePasteEvent = async (e) => {
      e.preventDefault();
      const items = e.clipboardData?.items;

      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              onDirectImage({
                url: event.target.result,
                title: 'Pasted image'
              });
            };
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
    };

    document.addEventListener('paste', handlePasteEvent);
    return () => document.removeEventListener('paste', handlePasteEvent);
  }, [inputMode, onDirectImage]);

  return (
    <div className="player-search">
      <h1>Wolverine Meme Maker</h1>
      <h2>Favorite player got traded or signed with another team?</h2>
      <h2>Express your feelings with a Wolverine meme.</h2>

      <br/>

      <div className="input-mode-tabs">
        {/* <button
          className={`tab-button ${inputMode === 'search' ? 'active' : ''}`}
          onClick={() => setInputMode('search')}
        >
          Search Player
        </button> */}
        <button
          className={`tab-button ${inputMode === 'upload' ? 'active' : ''}`}
          onClick={() => setInputMode('upload')}
        >
          Upload Image
        </button>
        <button
          className={`tab-button ${inputMode === 'paste' ? 'active' : ''}`}
          onClick={() => setInputMode('paste')}
        >
          Paste Image
        </button>
        <button
          className={`tab-button ${inputMode === 'url' ? 'active' : ''}`}
          onClick={() => setInputMode('url')}
        >
          Image URL
        </button>
      </div>

      {/* {inputMode === 'search' && (
        <form onSubmit={handleSearchSubmit}>
          <div className="search-box">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter player name (e.g., Mike Trout)"
              disabled={isLoading}
              className="search-input"
            />
            <button type="submit" disabled={isLoading || !playerName.trim()} className="search-button">
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      )} */}

      {inputMode === 'upload' && (
        <div className="upload-box">
          <label htmlFor="file-upload" className="upload-label">
            <span className="upload-icon">📁</span>
            <span>Click to upload an image</span>
            <span className="upload-hint">JPG, PNG, GIF up to 10MB</span>
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="file-input"
          />
        </div>
      )}

      {inputMode === 'paste' && (
        <div className="paste-box">
          <div className="paste-area">
            <span className="paste-icon">📋</span>
            <span className="paste-title">Paste from Clipboard</span>
            <span className="paste-hint">Press Ctrl+V (or Cmd+V on Mac) to paste</span>
            <button onClick={handlePasteFromClipboard} className="paste-button">
              Or Click to Paste
            </button>
          </div>
        </div>
      )}

      {inputMode === 'url' && (
        <form onSubmit={handleUrlSubmit}>
          <div className="search-box">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image URL (e.g., https://example.com/image.jpg)"
              className="search-input"
            />
            <button type="submit" disabled={!imageUrl.trim()} className="search-button">
              Load Image
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default PlayerSearch;
