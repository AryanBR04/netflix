import { useState, useEffect } from 'react';
import axios from '../axios';
import { addToFavorites } from '../services/api';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieModal = ({ movie, onClose }) => {
    const [trailerKey, setTrailerKey] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (movie) {
            async function fetchTrailer() {
                try {
                    const mediaType = movie.media_type === 'tv' || movie.name ? 'tv' : 'movie';
                    const request = await axios.get(
                        `/${mediaType}/${movie.id}/videos?api_key=${API_KEY}&language=en-US`
                    );
                    let trailer = request.data.results.find(
                        (video) => video.type === "Trailer" && video.site === "YouTube"
                    );
                    if (!trailer) {
                        trailer = request.data.results.find(
                            (video) => video.site === "YouTube"
                        );
                    }
                    setTrailerKey(trailer ? trailer.key : null);
                } catch (error) {
                    console.error("Error fetching trailer:", error);
                }
            }
            fetchTrailer();
        }
    }, [movie]);

    const handlePlay = () => {
        if (trailerKey) {
            setIsPlaying(true);
        } else {
            alert("Trailer not available");
        }
    };

    const handleClose = () => {
        setIsPlaying(false);
        onClose();
    };

    const handleMyList = async () => {
        try {
            await addToFavorites({
                movieId: movie.id,
                title: movie.title || movie.name || movie.original_name,
                posterPath: movie.poster_path
            });
            alert("Added to My List!");
        } catch (error) {
            console.error("Error adding to favorites:", error);
            alert("Failed to add to My List (or already added).");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="relative w-full max-w-3xl bg-[#181818] rounded-md overflow-hidden shadow-2xl text-white m-4">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-80 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="relative">
                    {isPlaying && trailerKey ? (
                        <div className="relative pt-[56.25%]">
                            <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <>
                            <img
                                src={`https://image.tmdb.org/t/p/original/${movie?.backdrop_path || movie?.poster_path}`}
                                alt={movie?.title || movie?.name}
                                className="w-full object-cover rounded-t-md"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>

                            <div className="absolute bottom-6 left-6 z-10 text-white">
                                <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">
                                    {movie?.title || movie?.name}
                                </h2>
                                <div className="mt-4 flex space-x-4 mb-4">
                                    <button
                                        onClick={handlePlay}
                                        className="bg-white text-black px-8 py-2 rounded font-bold hover:bg-opacity-90 transition flex items-center"
                                    >
                                        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" /></svg>
                                        Play
                                    </button>
                                    <button
                                        onClick={handleMyList}
                                        className="bg-gray-500 bg-opacity-50 text-white px-8 py-2 rounded font-bold hover:bg-opacity-40 transition"
                                    >
                                        My List
                                    </button>
                                </div>
                                <p className="max-w-xl text-lg text-gray-200 drop-shadow-md">
                                    {movie?.overview}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={handleClose}></div>
        </div>
    );
};

export default MovieModal;
