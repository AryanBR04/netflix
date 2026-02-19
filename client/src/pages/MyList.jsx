import { useState, useEffect } from 'react';
import backendAxios from '../backendAxios';
import Navbar from '../components/Navbar';
import MovieModal from '../components/MovieModal';

const MyList = () => {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);

    // Fetch Favorites
    useEffect(() => {
        async function fetchFavorites() {
            try {
                const request = await backendAxios.get('/favorites');
                // The backend returns an array of favorites. 
                // We need to map them to the structure our UI expects (e.g. movie_id -> id)
                // However, the DB schema has: user_id, movie_id, title, poster_path.
                // We might need to fetch full details or just use what we have.
                // For the grid, title and poster_path are enough.
                const formattedMovies = request.data.map(fav => ({
                    id: fav.movie_id,
                    title: fav.title,
                    poster_path: fav.poster_path, // Note: DB might store full URL or just path. We'll verify.
                    // If DB stores just path, we need to prepend base url.
                    // Based on favorites.js, it stores what we send.
                }));
                setMovies(formattedMovies);
            } catch (error) {
                console.error("Failed to fetch favorites", error);
            }
        }
        fetchFavorites();
    }, []);

    // Helper to extract path if it's a full URL or just path
    const getPosterUrl = (path) => {
        if (!path) return "";
        if (path.startsWith("http")) return path;
        return `https://image.tmdb.org/t/p/w500${path}`;
    };

    return (
        <div className="bg-black min-h-screen text-white">
            <Navbar />

            <div className="pt-28 px-4 md:px-12 pb-10">
                <header className="mb-6">
                    <h2 className="text-2xl font-semibold text-gray-200">My List</h2>
                </header>

                {movies.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                onClick={() => setSelectedMovie(movie)} // This might fail if modal needs full details
                                className="relative group cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-50 will-change-transform"
                            >
                                <img
                                    src={getPosterUrl(movie.poster_path)}
                                    alt={movie.title}
                                    className="rounded-sm w-full aspect-[2/3] object-cover shadow-md group-hover:shadow-xl"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm flex items-end p-2 border-2 border-transparent group-hover:border-gray-500">
                                    <p className="text-white text-[10px] md:text-xs font-bold drop-shadow-md truncate w-full">{movie.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-20">
                        <p className="text-xl">Your list is empty.</p>
                        <p className="text-sm mt-2">Add movies from the home page or browse section.</p>
                    </div>
                )}
            </div>

            {/* Movie Modal - Note: This might need full movie object to play trailer. 
                If 'movie' only has ID/Title, MovieModal might need to fetch details itself. 
                Let's check MovieModal props later or strict hope it handles ID. 
            */}
            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </div>
    );
};

export default MyList;
