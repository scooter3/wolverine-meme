import { useEffect, useRef, useState, useCallback } from 'react';
import '../styles/ImageCombiner.css';

function ImageCombiner({ playerImage, frameImagePath = '/wolverine.png' }) {
  const canvasRef = useRef(null);
  const playerImgRef = useRef(null);
  const frameImgRef = useRef(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Player image transform state
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [playerScale, setPlayerScale] = useState(1);
  const [playerRotation, setPlayerRotation] = useState(0);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load images
  useEffect(() => {
    if (!playerImage) return;

    // Small delay to ensure component is mounted
    const loadImages = async () => {
      // Wait a tick for canvas to mount
      await new Promise(resolve => setTimeout(resolve, 10));

      setIsProcessing(true);
      setError(null);
      setImagesLoaded(false);

      try {
        // Check if canvas exists
        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas not ready. Please try selecting the image again.');
        }

        // Load frame image first
        const frameImg = new Image();
        await new Promise((resolve, reject) => {
          frameImg.onload = resolve;
          frameImg.onerror = () => reject(new Error('Failed to load frame image. Make sure wolverine.png is in the public folder.'));
          frameImg.src = frameImagePath;
        });

        // Set canvas dimensions from frame
        canvas.width = frameImg.width;
        canvas.height = frameImg.height;
        frameImgRef.current = frameImg;

        // Load player image - try with CORS first, fallback without
        const playerImg = new Image();

        // Try loading with CORS support
        try {
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Image load timeout'));
            }, 10000); // 10 second timeout

            playerImg.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            playerImg.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('CORS_ERROR'));
            };
            playerImg.crossOrigin = 'anonymous';
            playerImg.src = playerImage.url;
          });
        } catch (corsErr) {
          // If CORS fails, try without crossOrigin
          console.log('CORS failed, trying without crossOrigin...');
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Failed to load player image. The image may be blocked by the server.'));
            }, 10000);

            playerImg.onload = () => {
              clearTimeout(timeout);
              resolve();
            };
            playerImg.onerror = () => {
              clearTimeout(timeout);
              reject(new Error('Failed to load player image. Try selecting a different image.'));
            };
            playerImg.crossOrigin = null;
            playerImg.src = playerImage.url;
          });
        }

        playerImgRef.current = playerImg;

        // Position player image in bottom half by default
        setPlayerPosition({
          x: canvas.width / 2,
          y: canvas.height * 0.65 // 65% down (bottom half)
        });
        setPlayerScale(1);
        setPlayerRotation(0);

        setImagesLoaded(true);
        setIsProcessing(false);
      } catch (err) {
        console.error('Error loading images:', err);
        setError(err.message || 'Failed to load images');
        setIsProcessing(false);
      }
    };

    loadImages();
  }, [playerImage, frameImagePath]);

  // Draw canvas whenever transform changes
  const drawCanvas = useCallback(() => {
    if (!imagesLoaded || !playerImgRef.current || !frameImgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const playerImg = playerImgRef.current;
    const frameImg = frameImgRef.current;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate player image dimensions (fit to canvas width)
    const scale = (canvas.width / playerImg.width) * playerScale;
    const scaledWidth = playerImg.width * scale;
    const scaledHeight = playerImg.height * scale;

    // Save context state
    ctx.save();

    // Move to player position
    ctx.translate(playerPosition.x, playerPosition.y);

    // Rotate
    ctx.rotate((playerRotation * Math.PI) / 180);

    // Draw player image centered at position
    ctx.drawImage(
      playerImg,
      -scaledWidth / 2,
      -scaledHeight / 2,
      scaledWidth,
      scaledHeight
    );

    // Restore context
    ctx.restore();

    // Draw frame on top
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
  }, [imagesLoaded, playerPosition, playerScale, playerRotation]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setIsDragging(true);
    setDragStart({
      x: mouseX - playerPosition.x,
      y: mouseY - playerPosition.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setPlayerPosition({
      x: mouseX - dragStart.x,
      y: mouseY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'wolverine-mlb-meme.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setPlayerPosition({
      x: canvas.width / 2,
      y: canvas.height * 0.65
    });
    setPlayerScale(1);
    setPlayerRotation(0);
  };

  if (!playerImage) {
    return null;
  }

  return (
    <div className="image-combiner">
      <h2>Adjust Your Image:</h2>
      {isProcessing && <p className="loading-message">Loading images...</p>}
      {error && (
        <div className="error">
          <p>{error}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Try selecting a different image from the results above.
          </p>
        </div>
      )}

      {imagesLoaded && (
        <div className="controls">
          <div className="control-group">
            <label>
              Rotation: {playerRotation}°
              <input
                type="range"
                min="-180"
                max="180"
                value={playerRotation}
                onChange={(e) => setPlayerRotation(parseInt(e.target.value))}
                className="slider"
              />
            </label>
          </div>
          <div className="control-group">
            <label>
              Scale: {(playerScale * 100).toFixed(0)}%
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.01"
                value={playerScale}
                onChange={(e) => setPlayerScale(parseFloat(e.target.value))}
                className="slider"
              />
            </label>
          </div>
          <button onClick={handleReset} className="reset-button">
            Reset Position
          </button>
        </div>
      )}

      {imagesLoaded && <p className="instructions">Drag the player image to reposition</p>}

      {/* Canvas always rendered so it's available for loading */}
      <div
        className="canvas-container"
        style={{
          cursor: imagesLoaded ? (isDragging ? 'grabbing' : 'grab') : 'default',
          display: isProcessing && !imagesLoaded ? 'none' : 'flex'
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={imagesLoaded ? handleMouseDown : undefined}
          onMouseMove={imagesLoaded ? handleMouseMove : undefined}
          onMouseUp={imagesLoaded ? handleMouseUp : undefined}
          onMouseLeave={imagesLoaded ? handleMouseUp : undefined}
        />
      </div>

      {imagesLoaded && !error && (
        <button onClick={handleDownload} className="download-button">
          Download Image
        </button>
      )}
    </div>
  );
}

export default ImageCombiner;
