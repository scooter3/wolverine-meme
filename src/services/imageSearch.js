// Google Custom Search API Service
// You'll need to get your API credentials from:
// 1. Google Custom Search API Key: https://developers.google.com/custom-search/v1/introduction
// 2. Custom Search Engine ID: https://programmablesearchengine.google.com/

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

export const searchMLBPlayerImages = async (playerName, page = 1) => {
  if (!API_KEY || !SEARCH_ENGINE_ID) {
    throw new Error('API credentials not configured. Please set VITE_GOOGLE_API_KEY and VITE_GOOGLE_SEARCH_ENGINE_ID in .env file');
  }

  console.log('API Key (first 10 chars):', API_KEY?.substring(0, 10) + '...');
  console.log('Search Engine ID:', SEARCH_ENGINE_ID);

  const searchQuery = `${playerName} MLB player`;
  const resultsPerPage = 10; // Google Custom Search API max is 10
  const startIndex = (page - 1) * resultsPerPage + 1; // API uses 1-based indexing

  const url = `https://www.googleapis.com/customsearch/v1?key=${API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=${resultsPerPage}&start=${startIndex}`;

  try {
    console.log('Fetching page', page, ':', url);
    const response = await fetch(url);

    if (!response.ok) {
      // Parse the error response from Google API
      const errorData = await response.json();
      console.error('Google API Error:', errorData);

      if (errorData.error) {
        const errorMessage = errorData.error.message || response.statusText;
        const errorCode = errorData.error.code;

        // Provide helpful error messages based on common issues
        if (errorCode === 400) {
          throw new Error(`Invalid request: ${errorMessage}. Check that your Search Engine ID is correct.`);
        } else if (errorCode === 403) {
          throw new Error(`API key issue: ${errorMessage}. Make sure your API key is valid and the Custom Search API is enabled in Google Cloud Console.`);
        } else if (errorCode === 429) {
          throw new Error('Daily quota exceeded. The free tier allows 100 searches per day.');
        } else {
          throw new Error(`Search failed (${errorCode}): ${errorMessage}`);
        }
      }

      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Search results:', data);

    if (!data.items || data.items.length === 0) {
      return {
        images: [],
        totalResults: 0,
        hasNextPage: false
      };
    }

    // Google API provides search information
    const totalResults = parseInt(data.searchInformation?.totalResults) || 0;
    const hasNextPage = data.queries?.nextPage !== undefined;

    return {
      images: data.items.map(item => ({
        url: item.link,
        thumbnail: item.image.thumbnailLink,
        title: item.title,
        width: item.image.width,
        height: item.image.height
      })),
      totalResults,
      hasNextPage
    };
  } catch (error) {
    console.error('Error searching images:', error);
    throw error;
  }
};
