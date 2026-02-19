import { useState, useEffect } from 'react';
import axios from '../axios';
import requests from '../requests';
import Navbar from '../components/Navbar';
import MovieModal from '../components/MovieModal';

const Browse = () => {
    const [movies, setMovies] = useState([]);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [contentType, setContentType] = useState("movie"); // 'movie' or 'tv'

    // Hardcoded languages
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'ko', name: 'Korean' },
        { code: 'ja', name: 'Japanese' },
    ];

    // Fetch Genres when Content Type Changes
    useEffect(() => {
        async function fetchGenres() {
            try {
                const url = contentType === 'movie' ? requests.fetchGenres : requests.fetchTVGenres;
                const request = await axios.get(url);
                setGenres(request.data.genres);
                // Reset genre selection when type changes to prevent invalid genre IDs
                setSelectedGenre("");
            } catch (error) {
                console.error("Failed to fetch genres", error);
            }
        }
        fetchGenres();
    }, [contentType]);

    // Fetch Movies/TV when Filters Change
    useEffect(() => {
        async function fetchFilteredMovies() {
            let base_url = contentType === 'movie' ? requests.discoverMovies : requests.discoverTV;
            let url = base_url;

            if (selectedGenre) url += `&with_genres=${selectedGenre}`;
            if (selectedLanguage) url += `&with_original_language=${selectedLanguage}`;

            try {
                const request = await axios.get(url);
                setMovies(request.data.results);
            } catch (error) {
                console.error("Failed to fetch content", error);
            }
        }
        fetchFilteredMovies();
    }, [selectedGenre, selectedLanguage, contentType]);

    const handleDocumentaryClick = () => {
        setContentType('movie');
        setSelectedGenre('99'); // 99 is Documentary genre ID for Movies
    };

    return (
        <div className="bg-black min-h-screen text-white">
            <Navbar />

            <div className="pt-28 px-4 md:px-12 pb-10">
                <header className="flex flex-col xl:flex-row justify-between items-center mb-6 gap-6">
                    <h2 className="text-2xl font-semibold text-gray-200">
                        Browse {contentType === 'tv' ? 'TV Shows' : 'Movies'}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 justify-center">
                        {/* Content Type Toggles */}
                        <div className="flex bg-[#222] rounded-md p-1 gap-1">
                            <button
                                onClick={() => setContentType('movie')}
                                className={`px-4 py-1 text-sm rounded font-medium transition-colors ${contentType === 'movie' && selectedGenre !== '99' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                Movies
                            </button>
                            <button
                                onClick={() => setContentType('tv')}
                                className={`px-4 py-1 text-sm rounded font-medium transition-colors ${contentType === 'tv' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                TV Shows
                            </button>
                            <button
                                onClick={handleDocumentaryClick}
                                className={`px-4 py-1 text-sm rounded font-medium transition-colors ${selectedGenre === '99' ? 'bg-red-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
                            >
                                Documentaries
                            </button>
                        </div>

                        <div className="h-6 w-[1px] bg-gray-700 hidden md:block"></div>

                        {/* Genre Filter */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-[#222] border border-gray-700 text-white py-1.5 pl-4 pr-10 rounded-sm text-sm hover:bg-[#333] focus:outline-none focus:border-gray-500 transition cursor-pointer"
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                            >
                                <option value="">All Genres</option>
                                {genres.map((genre) => (
                                    <option key={genre.id} value={genre.id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>

                        {/* Language Filter */}
                        <div className="relative">
                            <select
                                className="appearance-none bg-[#222] border border-gray-700 text-white py-1.5 pl-4 pr-10 rounded-sm text-sm hover:bg-[#333] focus:outline-none focus:border-gray-500 transition cursor-pointer"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                            >
                                <option value="">All Languages</option>
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Movie Grid */}
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                    {movies.map((movie) => (
                        (movie.poster_path) && (
                            <div
                                key={movie.id}
                                onClick={() => setSelectedMovie(movie)}
                                className="relative group cursor-pointer transition-transform duration-300 hover:scale-110 hover:z-50 will-change-transform"
                            >
                                <img
                                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                    alt={movie.title}
                                    className="rounded-sm w-full h-auto object-cover shadow-md group-hover:shadow-xl"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm flex items-end p-2 border-2 border-transparent group-hover:border-gray-500">
                                    <p className="text-white text-[10px] md:text-xs font-bold drop-shadow-md truncate w-full">{movie.title}</p>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                {movies.length === 0 && (
                    <div className="text-center text-gray-500 mt-20 text-sm">
                        No movies found for these filters.
                    </div>
                )}
            </div>

            {/* Movie Modal */}
            {selectedMovie && (
                <MovieModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                />
            )}
        </div>
    );
};

export default Browse;
