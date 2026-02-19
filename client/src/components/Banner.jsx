import { useState, useEffect } from 'react';
import axios from '../axios';
import backendAxios from '../backendAxios';
import requests from '../requests';
import MovieModal from './MovieModal';

const Banner = () => {
    const [movie, setMovie] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const request = await axios.get(requests.fetchNetflixOriginals);
            const trendingRequest = await axios.get(requests.fetchTrending);

            const randomMovie = trendingRequest.data.results[
                Math.floor(Math.random() * trendingRequest.data.results.length)
            ];
            setMovie(randomMovie);

            // Check if favorite
            if (randomMovie) {
                checkFavoriteStatus(randomMovie.id);
            }
            return trendingRequest;
        }
        fetchData();
    }, []);

    const checkFavoriteStatus = async (movieId) => {
        try {
            const response = await backendAxios.get('/favorites');
            // Assuming response.data is an array of favorites
            const exists = response.data.some(fav => fav.movie_id == movieId);
            setIsFavorite(exists);
        } catch (error) {
            console.error("Error checking favorite status", error);
        }
    };

    const toggleFavorite = async () => {
        if (!movie) return;

        try {
            if (isFavorite) {
                // Remove
                await backendAxios.delete(`/favorites/${movie.id}`);
                setIsFavorite(false);
            } else {
                // Add
                await backendAxios.post('/favorites', {
                    movieId: String(movie.id),
                    title: movie.title || movie.name || movie.original_name,
                    posterPath: movie.poster_path || movie.backdrop_path,
                    mediaType: movie.media_type || (movie.name ? 'tv' : 'movie')
                });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error("Error toggling favorite", error);
            if (error.response && error.response.status === 401) {
                alert("Please login to use this feature.");
            } else if (error.response) {
                alert(`Error: ${error.response.data}`);
            } else {
                alert(`Failed to update list: ${error.message}`);
            }
        }
    };

    function truncate(str, n) {
        return str?.length > n ? str.substr(0, n - 1) + "..." : str;
    }

    const handlePlay = async () => {
        try {
            if (trailerKey) {
                setShowModal(true);
                return;
            }

            let request;
            let type = movie.media_type || (movie.name ? 'tv' : 'movie');

            try {
                request = await axios.get(
                    `/${type}/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
                );
                if (request.data.results.length === 0) throw new Error("No videos");
            } catch (e) {
                const otherType = type === 'movie' ? 'tv' : 'movie';
                request = await axios.get(
                    `/${otherType}/${movie.id}/videos?api_key=${import.meta.env.VITE_TMDB_API_KEY}&language=en-US`
                );
            }

            let trailer = request.data.results.find(
                (video) => video.type === "Trailer" && video.site === "YouTube"
            );
            if (!trailer) {
                trailer = request.data.results.find(
                    (video) => video.site === "YouTube"
                );
            }

            if (trailer) {
                setTrailerKey(trailer.key);
                setShowModal(true);
            } else {
                alert("Trailer not available");
            }
        } catch (error) {
            console.error("Error fetching trailer:", error);
            if (error.message === "Network Error" || error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
                alert("Network Error: Unable to connect to TMDB service. Please check your internet connection or VPN.");
            } else {
                alert("Trailer not available");
            }
        }
    };

    return (
        <header className="h-[448px] text-white object-contain relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center animate-banner z-0"
                style={{
                    backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
                }}
            />
            <div className="ml-8 pt-36 h-[190px] relative z-10">
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
                    <button
                        onClick={toggleFavorite}
                        className="cursor-pointer text-white outline-none border-none font-bold rounded px-8 py-2 mr-4 bg-[rgba(51,51,51,0.5)] hover:text-black hover:bg-[#e6e6e6] transition-all duration-200"
                    >
                        {isFavorite ? "✓ My List" : "+ My List"}
                    </button>
                </div>
                <h1 className="w-[45rem] leading-[1.3] pt-4 text-sm max-w-[360px] h-[80px]">
                    {truncate(movie?.overview, 150)}
                </h1>
            </div>
            <div className="h-[7.4rem] bg-gradient-to-t from-[#111] via-transparent to-transparent absolute bottom-0 w-full" />

            {showModal && (
                <MovieModal
                    movie={movie}
                    trailerId={trailerKey}
                    onClose={() => setShowModal(false)}
                />
            )}
        </header>
    );
};

export default Banner;
