import { useState } from "react";

export default function ReviewSection() {
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);

  const handlePost = () => {
    if (comment.trim()) {
      setReviews([...reviews, comment]);
      setComment("");
    }
  };

  const handleCancel = () => {
    setComment("");
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4">Reviews</h3>

      <div className="bg-gray-800 p-4 rounded-xl">
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

      {reviews.length === 0 ? (
        <p className="text-gray-400 mt-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="mt-4 space-y-4">
          {reviews.map((r, index) => (
            <div key={index} className="bg-gray-800 p-3 rounded-lg text-white">
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

