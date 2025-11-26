import { useState } from 'react';
import PlayerSearch from './components/PlayerSearch';
import ImageResults from './components/ImageResults';
import ImageCombiner from './components/ImageCombiner';
import { searchMLBPlayerImages } from './services/imageSearch';
import './App.css';

function App() {
  const MAX_PAGES = 3;

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPlayerName, setCurrentPlayerName] = useState('');

  const handleSearch = async (playerName, page = 1) => {
    setIsLoading(true);
    setError(null);
    if (page === 1) {
      setImages([]);
      setSelectedImage(null);
      setCurrentPlayerName(playerName);
    }
    setCurrentPage(page);

    try {
      const results = await searchMLBPlayerImages(playerName, page);
      setImages(results.images);
      // Cap at 3 pages: only allow next page if API has more results AND we're not at page 3
      setHasNextPage(results.hasNextPage && page < MAX_PAGES);
      setTotalResults(results.totalResults);
      if (results.images.length === 0) {
        setError('No images found. Try a different player name.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectImage = (image) => {
    setSelectedImage(image);
  };

  const handleDirectImage = (image) => {
    // Clear search results and directly set the selected image
    setImages([]);
    setSelectedImage(image);
    setError(null);
    setCurrentPage(1);
    setHasNextPage(false);
    setTotalResults(0);
  };

  const handleNextPage = () => {
    if (hasNextPage && !isLoading && currentPage < MAX_PAGES) {
      handleSearch(currentPlayerName, currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1 && !isLoading) {
      handleSearch(currentPlayerName, currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="app">
      <PlayerSearch
        onSearch={handleSearch}
        onDirectImage={handleDirectImage}
        isLoading={isLoading}
      />

      {error && <div className="error-message">{error}</div>}

      <ImageResults
        images={images}
        onSelectImage={handleSelectImage}
        selectedImage={selectedImage}
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        totalResults={totalResults}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
        isLoading={isLoading}
      />

      <ImageCombiner playerImage={selectedImage} />
    </div>
  );
}

export default App;
