import { useState, useEffect } from "react";

export default function ReviewSection() {
  // We'll use localStorage to get the current user's profile info
  const [currentUser, setCurrentUser] = useState({
    id: "user1",
    name: "Current User",
    profilePicture: "/api/placeholder/200/200", // Default avatar
  });

  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Load current user data from localStorage on component mount
  useEffect(() => {
    const savedProfileData = localStorage.getItem("profileData");
    if (savedProfileData) {
      try {
        const profileData = JSON.parse(savedProfileData);
        setCurrentUser((prev) => ({
          ...prev,
          name: profileData.name || prev.name,
          profilePicture: profileData.profilePicture || prev.profilePicture,
        }));
      } catch (e) {
        console.error("Error parsing profile data from localStorage", e);
      }
    }

    // Load any saved reviews
    const savedReviews = localStorage.getItem("movieReviews");
    if (savedReviews) {
      try {
        setReviews(JSON.parse(savedReviews));
      } catch (e) {
        console.error("Error parsing reviews from localStorage", e);
      }
    }
  }, []);

  // Save reviews to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("movieReviews", JSON.stringify(reviews));
  }, [reviews]);

  const handlePost = () => {
    if (comment.trim()) {
      const newReview = {
        id: Date.now().toString(),
        text: comment,
        userId: currentUser.id,
        userName: currentUser.name,
        userProfilePicture: currentUser.profilePicture,
        timestamp: new Date(),
        likes: 0,
        likedBy: [],
      };

      setReviews([newReview, ...reviews]);
      setComment("");
    }
  };

  const handleCancel = () => {
    setComment("");
  };

  const handleLike = (reviewId) => {
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

  const saveEdit = (reviewId) => {
    if (editText.trim()) {
      setReviews(
        reviews.map((review) =>
          review.id === reviewId ? { ...review, text: editText } : review
        )
      );
      setEditingId(null);
    }
  };

  const deleteReview = (reviewId) => {
    setReviews(reviews.filter((review) => review.id !== reviewId));
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
            <button
              onClick={handlePost}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded-full text-sm"
            >
              Post
            </button>
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
                  src={review.userProfilePicture || "/api/placeholder/200/200"}
                  alt={review.userName}
                  className="w-10 h-10 rounded-full object-cover"
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
