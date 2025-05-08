// components/contentHelp.js - Updated with working placeholder URLs

/**
 * Normalizes content data from the API response
 * @param {Object} rawContent - The raw content object from API
 * @returns {Object} - Normalized content object
 */
export const normalizeContent = (rawContent) => {
  if (!rawContent) return null;

  // Use placeholder images from a service that works reliably
  const fallbackPoster = "https://placehold.co/400x600?text=No+Image";

  return {
    id: rawContent.ContentID,
    title: rawContent.Title || "Untitled",
    description: rawContent.Description || "No description available",
    // Use CORS-friendly placeholder if ThumbnailURL is missing or uses /api/placeholder
    poster:
      rawContent.ThumbnailURL &&
      !rawContent.ThumbnailURL.includes("/api/placeholder")
        ? rawContent.ThumbnailURL
        : fallbackPoster,
    videoUrl: rawContent.VideoURL || "", // MovieUrl/VideoURL with fallback
    genres: rawContent.Categories || [], // Categories array with fallback
    year: rawContent.ReleaseYear || "Unknown",
    director: rawContent.Director, // Backend doesn't have director info yet
    duration: formatDuration(rawContent.Duration),
    rating: rawContent.Rating || 0,
    languages: rawContent.Languages || [],
    subtitles: rawContent.Subtitles || [],
  };
};

/**
 * Formats a duration in minutes to a readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration (e.g., "1h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes) return "Unknown";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

/**
 * Formats categories/genres into a string
 * @param {Array} categories - Array of category strings
 * @param {number} limit - Maximum number of categories to include
 * @returns {string} - Formatted category string (e.g., "Action, Adventure, Drama")
 */
export const formatCategories = (categories, limit = 3) => {
  if (!categories || categories.length === 0) return "Uncategorized";

  // Limit the number of categories to show
  const limitedCategories = categories.slice(0, limit);

  // Join with commas
  return limitedCategories.join(", ");
};

/**
 * Gets a YouTube embed URL from a regular YouTube URL
 * @param {string} url - Regular YouTube URL
 * @returns {string} - YouTube embed URL
 */
export const getYouTubeEmbedUrl = (url) => {
  if (!url) return "";

  // Try to extract video ID
  let videoId = "";

  // Handle youtube.com/watch?v=VIDEO_ID
  if (url.includes("youtube.com/watch")) {
    const urlObj = new URL(url);
    videoId = urlObj.searchParams.get("v");
  }
  // Handle youtu.be/VIDEO_ID
  else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1];
    // Remove any query parameters
    videoId = videoId.split("?")[0];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // If we couldn't parse it, return the original URL
  return url;
};
