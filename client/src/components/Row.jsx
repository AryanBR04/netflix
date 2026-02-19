import { useState, useEffect } from 'react';
import axios from '../axios';
import MovieModal from './MovieModal';

const base_url = "https://image.tmdb.org/t/p/original/";

const Row = ({ title, fetchUrl, isLargeRow }) => {
    const [movies, setMovies] = useState([]);
    const [selectedMovie, setSelectedMovie] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const request = await axios.get(fetchUrl);
            setMovies(request.data.results);
            return request;
        }
        fetchData();
    }, [fetchUrl]);

    return (
        <div className="ml-5 text-white">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <div className="flex overflow-x-scroll scroll-smooth no-scrollbar p-5 whitespace-nowrap">
                {movies.map(movie => (
                    ((isLargeRow && movie.poster_path) ||
                        (!isLargeRow && movie.backdrop_path)) && (
                        <div
                            key={movie.id}
                            onClick={() => setSelectedMovie(movie)}
                            className={`group flex-none relative transition-all duration-300 cursor-pointer mr-4 hover:scale-110 hover:shadow-lg hover:z-50 ${isLargeRow ? "w-40" : "w-40"}`}
                        >
                            <img
                                className={`w-full object-cover rounded-md ${isLargeRow ? "h-60" : "h-28"}`}
                                src={`${base_url}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                                alt={movie.name}
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black via-black/60 to-transparent rounded-b-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-xs font-bold text-center text-white w-full truncate">
                                    {movie?.title || movie?.name || movie?.original_name}
                                </p>
                            </div>
                        </div>
                    )
                ))}
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
