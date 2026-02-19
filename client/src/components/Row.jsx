import { useState, useEffect, useRef } from 'react';
import axios from '../axios';
import MovieModal from './MovieModal';

const base_url = "https://image.tmdb.org/t/p/w500/";

const Row = ({ title, fetchUrl, isLargeRow }) => {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const rowRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            const request = await axios.get(fetchUrl);
            setMovies(request.data.results);
            return request;
        }
        fetchData();
    }, [fetchUrl]);

    const slide = (offset) => {
        if (rowRef.current) {
            rowRef.current.scrollLeft += offset;
        }
    };

    return (
        <div className="ml-5 text-white">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>

            <div className="relative group">
                <button
                    onClick={() => slide(-500)}
                    className="absolute left-0 z-40 m-auto h-full w-12 opacity-0 group-hover:opacity-100 cursor-pointer bg-black/30 hover:bg-black/60 transition-all duration-300 flex items-center justify-center rounded-r-md hidden md:flex"
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div
                    ref={rowRef}
                    className="flex overflow-x-scroll scroll-smooth no-scrollbar p-5 pl-2 whitespace-nowrap"
                >
                    {movies.map(movie => (
                        ((isLargeRow && movie.poster_path) ||
                            (!isLargeRow && movie.backdrop_path)) && (
                            <div
                                key={movie.id}
                                onClick={() => setSelectedMovie(movie)}
                                className={`group flex-none relative transition-all duration-300 cursor-pointer mr-4 hover:scale-105 hover:z-50 hover:shadow-2xl hover:shadow-red-600/20 will-change-transform ${isLargeRow ? "w-40" : "w-40"}`}
                            >
                                <img
                                    className={`w-full object-cover rounded-md ${isLargeRow ? "h-60" : "h-28"}`}
                                    src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                                    alt={movie.name}
                                    loading="lazy"
                                />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/80 to-transparent rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-xs font-bold text-center text-white w-full truncate">
                                        {movie?.title || movie?.name || movie?.original_name}
                                    </p>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                <button
                    onClick={() => slide(500)}
                    className="absolute right-0 top-0 bottom-0 z-40 m-auto h-full w-12 opacity-0 group-hover:opacity-100 cursor-pointer bg-black/30 hover:bg-black/60 transition-all duration-300 flex items-center justify-center rounded-l-md hidden md:flex"
                >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {
                selectedMovie && (
                    <MovieModal
                        movie={selectedMovie}
                        onClose={() => setSelectedMovie(null)}
                    />
                )
            }
        </div >
    );
};

export default Row;
