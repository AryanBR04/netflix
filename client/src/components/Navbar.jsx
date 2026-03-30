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

    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    // Close menu on navigation
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

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
        <nav className={`fixed w-full z-[100] top-0 transition-all duration-300 ${isScrolled || isMenuOpen ? "bg-black/90 backdrop-blur-md shadow-lg" : "bg-gradient-to-b from-black/90 to-transparent"} px-4 md:px-12 py-3 flex justify-between items-center`}>
            {/* Left Section: Logo & Links */}
            <div className="flex items-center gap-4 md:gap-8">
                {/* Logo */}
                <h1
                    className="text-red-600 text-3xl md:text-5xl font-bold cursor-pointer drop-shadow-md hover:scale-105 transition-transform tracking-tighter"
                    onClick={() => navigate('/home')}
                >
                    RED
                </h1>

                {/* Desktop Links */}
                <ul className="hidden md:flex gap-6 text-sm text-gray-300">
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
            </div>

            {/* Right Section: Search & Logout & Mobile Menu Icon */}
            <div className="flex items-center gap-3 md:gap-6">

                {/* Search Bar Container */}
                <div className="relative group">
                    <div className="flex items-center bg-black/40 border border-white/20 rounded-full px-2 md:px-3 py-1 transition-all focus-within:bg-black/80 focus-within:border-white focus-within:w-48 md:focus-within:w-64 w-28 sm:w-40 md:w-64">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mr-1 md:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Titles..."
                            className="bg-transparent border-none text-white text-[12px] md:text-sm focus:outline-none w-full placeholder-gray-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <button onClick={() => { setQuery(""); setResults([]); }} className="text-gray-400 hover:text-white ml-1">
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    {/* Search Results Dropdown */}
                    {results.length > 0 && (
                        <div className="absolute top-full right-0 mt-3 w-72 md:w-80 bg-[#181818] border border-gray-700 rounded-md shadow-2xl max-h-[60vh] md:max-h-96 overflow-y-auto z-50 scrollbar-hide">
                            <div className="p-2 sticky top-0 bg-[#181818] border-b border-gray-800 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                                Top Results for "{query}"
                            </div>
                            {results.map((movie) => (
                                (movie.poster_path || movie.backdrop_path) && (
                                    <div
                                        key={movie.id}
                                        onClick={() => handleSelectMovie(movie)}
                                        className="flex items-center gap-3 p-2 md:p-3 hover:bg-[#282828] cursor-pointer transition-colors border-b border-gray-800 last:border-none group/item"
                                    >
                                        <img
                                            src={`https://image.tmdb.org/t/p/w92${movie.poster_path || movie.backdrop_path}`}
                                            alt={movie.name}
                                            className="w-8 h-12 md:w-10 md:h-14 object-cover rounded shadow-sm group-hover/item:scale-105 transition-transform"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white text-xs md:text-sm font-medium truncate group-hover/item:text-red-500 transition-colors">
                                                {movie.title || movie.name || movie.original_name}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
                                                <span className="border border-gray-600 px-1 rounded text-[8px] md:text-[10px]">
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

                {/* Desktop Logout Toggle Button */}
                <button
                    onClick={handleLogout}
                    className="hidden md:block bg-red-600 text-white px-4 py-1.5 text-sm font-bold rounded hover:bg-red-700 transition shadow-md"
                >
                    Logout
                </button>

                {/* Mobile Menu Icon */}
                <button
                    className="md:hidden text-white focus:outline-none p-1"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-t border-white/10 py-6 px-8 md:hidden animate-in slide-in-from-top duration-300">
                    <ul className="flex flex-col gap-6 text-lg font-medium">
                        <li
                            className={`${location.pathname === '/home' ? 'text-white' : 'text-gray-400'} active:scale-95 transition-transform`}
                            onClick={() => navigate('/home')}
                        >
                            Home
                        </li>
                        <li
                            className={`${location.pathname === '/browse' ? 'text-white' : 'text-gray-400'} active:scale-95 transition-transform`}
                            onClick={() => navigate('/browse')}
                        >
                            Browse
                        </li>
                        <li
                            className={`${location.pathname === '/my-list' ? 'text-white' : 'text-gray-400'} active:scale-95 transition-transform`}
                            onClick={() => navigate('/my-list')}
                        >
                            My List
                        </li>
                        <hr className="border-white/10" />
                        <li
                            className="text-red-500 font-bold active:scale-95 transition-transform"
                            onClick={handleLogout}
                        >
                            Logout
                        </li>
                    </ul>
                </div>
            )}

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
