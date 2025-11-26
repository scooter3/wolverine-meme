import '../styles/ImageResults.css';

function ImageResults({
  images,
  onSelectImage,
  selectedImage,
  currentPage,
  hasNextPage,
  totalResults,
  onNextPage,
  onPrevPage,
  isLoading
}) {
  if (!images || images.length === 0) {
    return null;
  }

  const resultsPerPage = 10;
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = startResult + images.length - 1;

  return (
    <div className="image-results">
      <div className="results-header">
        <h2>Select an image:</h2>
        {totalResults > 0 && (
          <p className="results-info">
            Showing {startResult}-{endResult} of {totalResults.toLocaleString()} results
          </p>
        )}
      </div>

      <div className="image-grid">
        {images.map((image, index) => (
          <div
            key={index}
            className={`image-item ${selectedImage === image ? 'selected' : ''}`}
            onClick={() => onSelectImage(image)}
          >
            <img
              src={image.url}
              alt={image.title}
              loading="lazy"
            />
            {selectedImage === image && <div className="selected-badge">Selected</div>}
          </div>
        ))}
      </div>

      {(currentPage > 1 || hasNextPage) && (
        <div className="pagination-controls">
          <button
            onClick={onPrevPage}
            disabled={currentPage === 1 || isLoading}
            className="pagination-button"
          >
            ← Previous
          </button>
          <span className="page-indicator">
            Page {currentPage}
          </span>
          <button
            onClick={onNextPage}
            disabled={!hasNextPage || isLoading}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageResults;
