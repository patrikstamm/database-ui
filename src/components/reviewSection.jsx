// Modified ReviewSection.jsx with fixed profile image URLs
import { useState, useEffect } from "react";
import apiService from "./services/api";
import { Button } from "./button";
import { useAuth } from "./context/authContext";

// Use placehold.co for default avatar (working alternative to placeholder.com)
const DEFAULT_AVATAR = "https://placehold.co/200x200?text=User";

export default function ReviewSection({ contentId }) {
  // State for current user
  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "User",
    profilePicture: DEFAULT_AVATAR,
  });

  // State for reviews
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editing reviews
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Use the authentication context
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Set current user from the auth context
    if (isAuthenticated && user) {
      setCurrentUser({
        id: user.id || "user1",
        name: user.name || "User",
        profilePicture: user.profilePicture || DEFAULT_AVATAR,
      });
    }

    // Fetch reviews for this content
    const fetchReviews = async () => {
      if (!contentId) {
        setLoading(false);
        return;
      }

      try {
        // Attempt to fetch reviews from backend
        try {
          const response = await apiService.reviews.getContentReviews(
            contentId
          );

          if (response.data && Array.isArray(response.data)) {
            // Normalize review data
            const normalizedReviews = response.data.map((review) => ({
              id: review.review_id || review.ReviewID || Date.now().toString(),
              text: review.review_text || review.ReviewText || "",
              userId: review.user_id || review.UserID || "unknown",
              userName: review.user_name || review.UserName || "User",
              userProfilePicture:
                review.user_profile_picture &&
                !review.user_profile_picture.includes("/api/placeholder")
                  ? review.user_profile_picture
                  : DEFAULT_AVATAR,
              timestamp: review.review_date || review.ReviewDate || new Date(),
              rating: review.rating || review.Rating || 5,
              likes: 0, // Backend doesn't support likes yet
              likedBy: [], // Backend doesn't support likes yet
            }));

            // Sort by timestamp (newest first)
            normalizedReviews.sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
            setReviews(normalizedReviews);
          } else {
            // If no reviews in response, set empty array
            setReviews([]);
          }
        } catch (reviewError) {
          console.error("Error fetching reviews:", reviewError);

          // Try to get reviews from localStorage as fallback
          const savedReviews = localStorage.getItem(`reviews_${contentId}`);
          if (savedReviews) {
            try {
              setReviews(JSON.parse(savedReviews));
            } catch (e) {
              console.error("Error parsing saved reviews:", e);
              setReviews([]);
            }
          } else {
            setReviews([]);
          }
        }
      } catch (error) {
        console.error("Critical error:", error);
        setError("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [contentId, isAuthenticated, user]);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    if (reviews.length > 0) {
      localStorage.setItem(`reviews_${contentId}`, JSON.stringify(reviews));
    }
  }, [reviews, contentId]);

  const handlePost = async () => {
    if (!comment.trim() || !isAuthenticated) return;

    try {
      // Prepare review data
      const reviewData = {
        user_id: parseInt(currentUser.id, 10) || 1,
        content_id: parseInt(contentId, 10),
        rating: 5, // Default rating
        review_text: comment,
      };

      // Post review to backend
      const response = await apiService.reviews.addReview(reviewData);

      // Create a new review object
      const newReview = {
        id: response.data?.review_id || Date.now().toString(),
        text: comment,
        userId: currentUser.id,
        userName: currentUser.name,
        userProfilePicture: currentUser.profilePicture,
        timestamp: new Date(),
        rating: 5,
        likes: 0,
        likedBy: [],
      };

      // Add to reviews list
      setReviews([newReview, ...reviews]);

      // Clear comment input
      setComment("");
    } catch (error) {
      console.error("Error posting review:", error);

      // Even if backend fails, add review to local state
      const newReview = {
        id: Date.now().toString(),
        text: comment,
        userId: currentUser.id,
        userName: currentUser.name,
        userProfilePicture: currentUser.profilePicture,
        timestamp: new Date(),
        rating: 5,
        likes: 0,
        likedBy: [],
      };

      setReviews([newReview, ...reviews]);
      setComment("");

      // Show error but non-blocking
      console.warn("Review saved locally only due to API error");
    }
  };

  const handleCancel = () => {
    setComment("");
  };

  const handleLike = (reviewId) => {
    // Update likes locally (backend doesn't support this yet)
    setReviews(
      reviews.map((review) => {
        if (review.id === reviewId) {
          // Check if user already liked this review
          const alreadyLiked = review.likedBy.includes(currentUser.id);

          if (alreadyLiked) {
            // Unlike
            return {
              ...review,
              likes: review.likes - 1,
              likedBy: review.likedBy.filter((id) => id !== currentUser.id),
            };
          } else {
            // Like
            return {
              ...review,
              likes: review.likes + 1,
              likedBy: [...review.likedBy, currentUser.id],
            };
          }
        }
        return review;
      })
    );
  };

  const startEditing = (review) => {
    setEditingId(review.id);
    setEditText(review.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = async (reviewId) => {
    if (!editText.trim() || !isAuthenticated) return;

    // Update review locally
    setReviews(
      reviews.map((review) =>
        review.id === reviewId ? { ...review, text: editText } : review
      )
    );

    // Clear editing state
    setEditingId(null);
    setEditText("");

    // In a real implementation, you would also update the review on the backend
    // This would require an endpoint that doesn't exist yet
  };

  const deleteReview = async (reviewId) => {
    if (!isAuthenticated) return;

    // Delete review locally
    setReviews(reviews.filter((review) => review.id !== reviewId));

    // In a real implementation, you would also delete the review on the backend
    // This would require an endpoint that doesn't exist yet
  };

  // Format date to be more user-friendly
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Reviews</h3>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Reviews</h3>
        <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg text-white">
          <p>{error}</p>
          <Button
            className="mt-2 bg-red-600 hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If not authenticated, show message instead of reviews
  if (!isAuthenticated) {
    return (
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-4">Reviews</h3>
        <p className="text-gray-400">Please log in to see and post reviews.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Reviews</h3>

      {/* Add review section */}
      <div className="bg-gray-800 p-4 rounded-xl">
        <div className="flex gap-3 mb-3">
          <img
            src={currentUser.profilePicture}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          <div className="flex-1">
            <p className="text-white font-medium">{currentUser.name}</p>
          </div>
        </div>
        <textarea
          className="w-full bg-gray-900 text-white p-3 rounded-lg resize-none h-24 outline-none"
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {comment.trim() && (
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white text-sm"
            >
              Cancel
            </button>
            <Button
              onClick={handlePost}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-full text-sm"
            >
              Post
            </Button>
          </div>
        )}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <p className="text-gray-400 mt-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-800 p-4 rounded-lg text-white"
            >
              {/* User info with profile picture and timestamp */}
              <div className="flex items-start gap-3 mb-3">
                <img
                  src={review.userProfilePicture || DEFAULT_AVATAR}
                  alt={review.userName}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{review.userName}</p>
                    <p className="text-gray-400 text-sm">
                      {formatDate(review.timestamp)}
                    </p>
                  </div>

                  {/* Review content - either display or edit mode */}
                  {editingId === review.id ? (
                    <div className="mt-2">
                      <textarea
                        className="w-full bg-gray-900 text-white p-2 rounded-lg resize-none outline-none mb-2"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEditing}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(review.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-full text-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1">{review.text}</div>
                  )}
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center mt-3 ml-12">
                {/* Like button */}
                <button
                  onClick={() => handleLike(review.id)}
                  className={`flex items-center space-x-1 ${
                    review.likedBy.includes(currentUser.id)
                      ? "text-indigo-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path>
                    <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                  </svg>
                  <span>{review.likes}</span>
                </button>

                {/* Edit and delete buttons - only shown to review owner */}
                {review.userId === currentUser.id &&
                  editingId !== review.id && (
                    <div className="ml-auto space-x-2">
                      <button
                        onClick={() => startEditing(review)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
