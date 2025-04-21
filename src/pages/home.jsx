import { Button } from "../components/button";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleStartNow = () => {
    navigate("/movies");
  };

  return (
    <div className="h-[80vh] flex flex-col items-center justify-center text-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6">
      <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center gap-2">
        Welcome to Been Chillin <span>🎬</span>
      </h1>
      <p className="text-lg text-gray-400 mb-8">
        Stream your favorite movies anytime, anywhere.
      </p>
      <Button
        className="px-6 py-3 text-base bg-violet-600 hover:bg-violet-700 rounded-xl"
        onClick={handleStartNow}
      >
        Start Now
      </Button>
    </div>
  );
}
