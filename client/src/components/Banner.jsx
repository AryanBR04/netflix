import { useState, useEffect } from 'react';
import axios from '../axios';
import requests from '../requests';
import MovieModal from './MovieModal';

const Banner = () => {
    const [movie, setMovie] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const request = await axios.get(requests.fetchNetflixOriginals); // Or fetchTrending if originals fails 
            // Fallback for demo if fetchNetflixOriginals (TV) is empty or specific logic needed
            // Actually requests.fetchNetflixOriginals is set to /discover/tv...
            // Let's use fetchTrending for better variety if desired, but user asked for "Random trending movie" in Prompt?
            // User prompt: "Banner component: Random trending movie"

            // I'll stick to fetchTrending as requested in prompt description for Banner
            const trendingRequest = await axios.get(requests.fetchTrending);

            const randomMovie = trendingRequest.data.results[
                Math.floor(Math.random() * trendingRequest.data.results.length - 1)
            ];
            // Ensure media_type is present or infer from properties is not reliable enough for mixed array, 
            // but trending/all returns it.
            // If missing, we might default to movie, but trending usually has it.
            setMovie(randomMovie);
            return trendingRequest;
        }
        fetchData();
    }, []);

    function truncate(str, n) {
        return str?.length > n ? str.substr(0, n - 1) + "..." : str;
    }

    const handlePlay = async () => {
        try {
            const mediaType = movie.media_type === 'tv' || movie.name ? 'tv' : 'movie';
            const request = await axios.get(
                `/${mediaType}/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
            );
            let trailer = request.data.results.find(
                (video) => video.type === "Trailer" && video.site === "YouTube"
            );
            if (!trailer) {
                trailer = request.data.results.find(
                    (video) => video.site === "YouTube"
                );
            }

            if (trailer) {
                setShowModal(true);
            } else {
                alert("Trailer not available");
            }
        } catch (error) {
            console.error("Error fetching trailer:", error);
            alert("Trailer not available");
        }
    };

    return (
        <header className="h-[448px] text-white object-contain relative"
            style={{
                backgroundSize: "cover",
                backgroundImage: `url(
                    "https://image.tmdb.org/t/p/original/${movie?.backdrop_path}"
                )`,
                backgroundPosition: "center center",
            }}
        >
            <div className="ml-8 pt-36 h-[190px]">
                <h1 className="text-5xl font-bold pb-1.5">
                    {movie?.title || movie?.name || movie?.original_name}
                </h1>
                <div className="pt-5">
                    <button
                        onClick={handlePlay}
                        className="cursor-pointer text-white outline-none border-none font-bold rounded px-8 py-2 mr-4 bg-[rgba(51,51,51,0.5)] hover:text-black hover:bg-[#e6e6e6] transition-all duration-200"
                    >
                        Play
                    </button>
                    <button className="cursor-pointer text-white outline-none border-none font-bold rounded px-8 py-2 mr-4 bg-[rgba(51,51,51,0.5)] hover:text-black hover:bg-[#e6e6e6] transition-all duration-200">My List</button>
                </div>
                <h1 className="w-[45rem] leading-[1.3] pt-4 text-sm max-w-[360px] h-[80px]">
                    {truncate(movie?.overview, 150)}
                </h1>
            </div>
            <div className="h-[7.4rem] bg-gradient-to-t from-[#111] via-transparent to-transparent absolute bottom-0 w-full" />

            {showModal && (
                <MovieModal
                    movie={movie}
                    onClose={() => setShowModal(false)}
                />
            )}
        </header>
    );
};

export default Banner;
