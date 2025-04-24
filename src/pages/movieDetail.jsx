// pages/MovieDetail.jsx
import { useParams } from "react-router-dom";
import moviesData from "../exampleData/movieData.json";
import { Button } from "../components/button";
import ReviewSection from "../components/reviewSection";
export default function MovieDetail() {
  const { id } = useParams();
  const movie = moviesData.find((m) => m.id.toString() === id);

  if (!movie) return <div className="text-center mt-10">Movie not found.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 text-white">
      <img src={movie.poster} alt={movie.title} className="w-full rounded-xl mb-6" />
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>
      <p className="text-gray-300 mb-6">{movie.description}</p>
      <Button>Start Watching</Button>
      <ReviewSection />
    </div>
  );
}
