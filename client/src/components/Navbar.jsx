import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../axios';
import requests from '../requests';
import MovieModal from './MovieModal';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);

    // Initial Navbar background transition on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Search Logic with Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 0) {
                try {
                    // API request to search movies/tv
                    const request = await axios.get(`${requests.searchMovies}${query}`);
                    setResults(request.data.results || []);
                } catch (error) {
                    console.error("Search error:", error);
                }
            } else {
                setResults([]);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleSelectMovie = (movie) => {
        setSelectedMovie(movie);
        setQuery(""); // Clear search
        setResults([]); // Close dropdown
    };

    return (
        <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${isScrolled ? "bg-black/70 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/90 to-transparent"} px-6 py-4 flex justify-between items-center`}>
            {/* Logo */}
            <h1
                className="text-red-600 text-5xl font-bold cursor-pointer drop-shadow-md hover:scale-105 transition-transform tracking-tighter"
                onClick={() => navigate('/home')}
            >
                RED
            </h1>

            <ul className="flex gap-4 ml-6 text-sm text-gray-300">
                <li
                    className={`hover:text-white cursor-pointer transition ${location.pathname === '/home' ? 'font-bold text-white' : ''}`}
                    onClick={() => navigate('/home')}
                >
                    Home
                </li>
                <li
                    className={`hover:text-white cursor-pointer transition ${location.pathname === '/browse' ? 'font-bold text-white' : ''}`}
                    onClick={() => navigate('/browse')}
                >
                    Browse
                </li>
                <li
                    className={`hover:text-white cursor-pointer transition ${location.pathname === '/my-list' ? 'font-bold text-white' : ''}`}
                    onClick={() => navigate('/my-list')}
                >
                    My List
                </li>
            </ul>

            {/* Right Section: Search & Logout */}
            <div className="flex items-center gap-6">

                {/* Search Bar Container */}
                <div className="relative group">
                    <div className="flex items-center bg-black/40 border border-white/30 rounded-full px-3 py-1 transition-all focus-within:bg-black/80 focus-within:border-white focus-within:w-64 w-40 sm:w-64">
                        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Titles, people, genres"
                            className="bg-transparent border-none text-white text-sm focus:outline-none w-full placeholder-gray-400"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button onClick={() => { setQuery(""); setResults([]); }} className="text-gray-400 hover:text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {results.length > 0 && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-[#181818] border border-gray-700 rounded-md shadow-2xl max-h-96 overflow-y-auto z-50 scrollbar-hide">
                            <div className="p-2 sticky top-0 bg-[#181818] border-b border-gray-800 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                                Top Results for "{query}"
                            </div>
                            {results.map((movie) => (
                                (movie.poster_path || movie.backdrop_path) && (
                                    <div
                                        key={movie.id}
                                        onClick={() => handleSelectMovie(movie)}
                                        className="flex items-center gap-3 p-3 hover:bg-[#282828] cursor-pointer transition-colors border-b border-gray-800 last:border-none group/item"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path || movie.backdrop_path}`}
                                            alt={movie.name}
                                            className="w-10 h-14 object-cover rounded shadow-sm group-hover/item:scale-105 transition-transform"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-sm font-medium truncate group-hover/item:text-red-500 transition-colors">
                                                {movie.title || movie.name || movie.original_name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                                <span className="border border-gray-600 px-1 rounded text-[10px]">
                                                    {movie.media_type === 'tv' ? 'TV' : 'MOVIE'}
                                                </span>
                                                <span>{movie.first_air_date ? movie.first_air_date.split('-')[0] : (movie.release_date ? movie.release_date.split('-')[0] : 'N/A')}</span>
                                                <span className="flex items-center text-yellow-500">
                                                    ★ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded hover:bg-red-700 transition shadow-md"
                >
                    Logout
                </button>
            </div>

            {/* Movie Details Modal */}
            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </nav>
    );
};

export default Navbar;
