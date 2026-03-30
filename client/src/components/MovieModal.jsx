import { useState, useEffect } from 'react';
import axios from '../axios';
import { addToFavorites, removeFromFavorites, getFavorites } from '../services/api';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieModal = ({ movie, onClose, trailerId }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [movieDetails, setMovieDetails] = useState(movie);
    const [trailerKey, setTrailerKey] = useState(trailerId);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        setMovieDetails(movie); // Reset when movie prop changes
        if (movie) {
            checkFavoriteStatus(movie.id);
            fetchRecommendations(movie); // Fetch recs based on initial movie


            // If overview is missing (from My List), fetch full details
            if (!movie.overview) {
                // Pass media_type as-is (undefined/null if missing) to trigger legacy heuristic
                fetchFullDetails(movie.id, movie.media_type);
            } else {
                // If full details are already present, just fetch the trailer
                // This handles cases where movie is passed with full details initially
                // or when it's from a list that already has overview.
                // We need to ensure trailer is fetched if not provided by trailerId
                if (!trailerId) {
                    // Try to guess type, but fallback to trying both
                    let type = movie.media_type;
                    if (!type && movie.title) type = 'movie';
                    if (!type && movie.name) type = 'tv';
                    if (!type) type = 'movie';
                    fetchTrailerRobust(type, movie.id);
                }
            }
        }
    }, [movie]);

    const fetchFullDetails = async (movieId, mediaType) => {
        try {
            let determinedType = mediaType;
            let bestData = null;

            // Helper to clean strings for comparison
            const clean = (str) => str ? str.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
            const savedTitle = clean(movie.title || movie.name);

            // If we have a type, try that first. If it fails or doesn't match well, we might reconsider.
            // But for now, if we have NO type (legacy), we MUST guess.

            if (!determinedType) {
                // Legacy Mode: Fetch BOTH and compare titles
                try {
                    const [movieRes, tvRes] = await Promise.allSettled([
                        axios.get(`/movie/${movieId}?api_key=${API_KEY}&language=en-US`),
                        axios.get(`/tv/${movieId}?api_key=${API_KEY}&language=en-US`)
                    ]);

                    let movieScore = 0;
                    let tvScore = 0;

                    if (movieRes.status === 'fulfilled') {
                        const t = clean(movieRes.value.data.title || movieRes.value.data.original_title);
                        if (t === savedTitle) movieScore = 100;
                        else if (t.includes(savedTitle) || savedTitle.includes(t)) movieScore = 50;
                    }

                    if (tvRes.status === 'fulfilled') {
                        const t = clean(tvRes.value.data.name || tvRes.value.data.original_name);
                        if (t === savedTitle) tvScore = 100;
                        else if (t.includes(savedTitle) || savedTitle.includes(t)) tvScore = 50;
                    }

                    // Decide winner
                    if (tvScore > movieScore) {
                        determinedType = 'tv';
                        bestData = tvRes.value.data;
                    } else if (movieScore > tvScore) {
                        determinedType = 'movie';
                        bestData = movieRes.value.data;
                    } else {
                        // Tie or no match? Default to movie if movie fetch succeeded
                        if (movieRes.status === 'fulfilled') {
                            determinedType = 'movie';
                            bestData = movieRes.value.data;
                        } else if (tvRes.status === 'fulfilled') {
                            determinedType = 'tv';
                            bestData = tvRes.value.data;
                        }
                    }
                } catch (err) {
                    console.error("Error in legacy resolution", err);
                }
            } else {
                // We have a type, just fetch it.
                try {
                    const res = await axios.get(`/${determinedType}/${movieId}?api_key=${API_KEY}&language=en-US`);
                    bestData = res.data;
                } catch (e) {
                    // If specific fetch fails, maybe fallback?
                    console.error(`Failed to fetch ${determinedType}`, e);
                }
            }

            if (bestData) {
                setMovieDetails(prev => ({ ...prev, ...bestData }));
                // Also fetch trailer with the CORRECT determined type
                fetchTrailerRobust(determinedType, movieId);
            }
        } catch (error) {
            console.error("Error fetching full details:", error);
        }
    };

    // Robust helper to fetch trailer (Try given type -> Retry other type)
    const fetchTrailerRobust = async (initialType, id) => {
        try {
            let type = initialType;
            if (!type && movie.title) type = 'movie';
            if (!type && movie.name) type = 'tv';
            if (!type) type = 'movie';

            // alert(`Debug: Fetching trailer for ID ${id} as ${type}`);

            let request;
            try {
                request = await axios.get(
                    `/${type}/${id}/videos?api_key=${API_KEY}&language=en-US`
                );
                if (request.data.results.length === 0) throw new Error("No videos");
            } catch (e) {
                // Retry with other type
                const otherType = type === 'movie' ? 'tv' : 'movie';
                // alert(`Debug: First try failed. Retrying as ${otherType}`);
                request = await axios.get(
                    `/${otherType}/${id}/videos?api_key=${API_KEY}&language=en-US`
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
            // alert(trailer ? `Debug: Found trailer key ${trailer.key}` : "Debug: No trailer found");
            setTrailerKey(trailer ? trailer.key : null);
        } catch (e) {
            console.error("Error fetching trailer robustly", e);
            // alert(`Debug: Error fetching trailer: ${e.message}`);
            setTrailerKey(null);
        }
    };

    const fetchRecommendations = async (currentMovie) => {
        try {
            let type = currentMovie.media_type;
            if (!type && currentMovie.title) type = 'movie';
            if (!type && currentMovie.name) type = 'tv';
            if (!type) type = 'movie';

            // Try Recommendations first
            let request = await axios.get(`/${type}/${currentMovie.id}/recommendations?api_key=${API_KEY}&language=en-US&page=1`);

            // Fallback to Similar if no recommendations are found
            if (!request.data.results || request.data.results.length === 0) {
                console.log(`No recommendations for ${currentMovie.id}, fetching similar instead.`);
                request = await axios.get(`/${type}/${currentMovie.id}/similar?api_key=${API_KEY}&language=en-US&page=1`);
            }

            setRecommendations(request.data.results || []);
        } catch (error) {
            console.error("Error fetching recommendations", error);
            setRecommendations([]);
        }
    };

    const checkFavoriteStatus = async (movieId) => {
        try {
            const favorites = await getFavorites();
            const exists = favorites.some(fav => fav.movie_id == movieId);
            setIsFavorite(exists);
        } catch (error) {
            console.error("Error checking favorite status", error);
        }
    };

    // Update Recommendations when movieDetails changes (e.g. clicking a recommendation)
    useEffect(() => {
        if (movieDetails && movieDetails.id !== movie?.id) {
            // If we switched movies INSIDE the modal
            checkFavoriteStatus(movieDetails.id);

            // Re-fetch trailer for new movie
            let type = movieDetails.media_type || (movieDetails.name ? 'tv' : 'movie');
            fetchTrailerRobust(type, movieDetails.id);

            // Re-fetch recommendations for new movie
            fetchRecommendations(movieDetails);
        }
    }, [movieDetails]);

    useEffect(() => {
        if (trailerId) {
            setTrailerKey(trailerId);
        } else if (movie) {
            // If from My List (missing details), wait for fetchFullDetails to call fetchTrailerExact
            if (!movie.overview && !movie.media_type) {
                return;
            }

            // Otherwise (from Home/Browse), regular fetch
            async function fetchTrailer() {
                try {
                    // Try to guess type, but fallback to trying both
                    let type = movie.media_type;
                    if (!type && movie.title) type = 'movie';
                    if (!type && movie.name) type = 'tv';
                    if (!type) type = 'movie';

                    fetchTrailerRobust(type, movie.id);

                } catch (error) {
                    console.error("Error fetching trailer:", error);
                    setTrailerKey(null);
                }
            }
            fetchTrailer();
        }
    }, [movie, trailerId]);

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
            if (isFavorite) {
                await removeFromFavorites(movie.id);
                setIsFavorite(false);
                alert("Removed from My List");
            } else {
                await addToFavorites({
                    movieId: movie.id,
                    title: movie.title || movie.name || movie.original_name,
                    posterPath: movie.poster_path || movie.backdrop_path,
                    mediaType: movie.media_type || (movie.name ? 'tv' : 'movie')
                });
                setIsFavorite(true);
                alert("Added to My List!");
            }
        } catch (error) {
            console.error("Error toggling favorite:", error);
            alert("Failed to update My List.");
        }
    };

    // Lock Body Scroll when Modal is Open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
            // Also ensure we cleanup any hanging styles if multiple modals conflict
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex justify-center items-center px-4">
            <div className="relative w-full max-w-3xl bg-[#181818] rounded-md overflow-y-auto overflow-x-hidden shadow-2xl text-white max-h-[90vh]">
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
                                src={`https://image.tmdb.org/t/p/original/${movieDetails?.backdrop_path || movieDetails?.poster_path}`}
                                alt={movieDetails?.title || movieDetails?.name}
                                className="w-full aspect-video object-cover rounded-t-md"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent"></div>

                            <div className="absolute bottom-6 left-6 z-10 text-white w-full pr-12">
                                <h2 className="text-4xl font-bold mb-3 drop-shadow-lg">
                                    {movieDetails?.title || movieDetails?.name}
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
                                        {isFavorite ? "✓ My List" : "+ My List"}
                                    </button>
                                </div>
                                <p className="max-w-xl text-lg text-gray-200 drop-shadow-md">
                                    {movieDetails?.overview}
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Recommendations Section */}
                <div className="px-6 py-8 bg-[#181818]">
                    <h3 className="text-xl font-bold mb-4 text-white">More Like This</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {recommendations.slice(0, 9).map((rec) => (
                            (rec.backdrop_path || rec.poster_path) && (
                                <div
                                    key={rec.id}
                                    className="bg-[#2f2f2f] rounded-md overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 relative group"
                                    onClick={() => setMovieDetails(rec)} // Quick switch to new movie
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${rec.backdrop_path || rec.poster_path}`}
                                        alt={rec.title || rec.name}
                                        className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="p-2 absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent">
                                        <p className="text-xs font-semibold text-gray-300 truncate">{rec.title || rec.name}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {rec.first_air_date ? rec.first_air_date.split('-')[0] : (rec.release_date ? rec.release_date.split('-')[0] : '')}
                                        </p>
                                    </div>
                                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-500 rounded-md transition-colors pointer-events-none"></div>
                                </div>
                            )
                        ))}
                        {recommendations.length === 0 && (
                            <p className="text-gray-500 text-sm">No recommendations available.</p>
                        )}
                    </div>
                </div>
            </div>
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={handleClose}></div>
        </div>
    );
};

export default MovieModal;

