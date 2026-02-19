const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const requests = {
    fetchTrending: `/trending/all/week?api_key=${API_KEY}&language=en-US`,
    fetchNetflixOriginals: `/discover/tv?api_key=${API_KEY}&with_network=213`,
    fetchTopRated: `/movie/top_rated?api_key=${API_KEY}&language=en-US`,
    fetchActionMovies: `/discover/movie?api_key=${API_KEY}&with_genres=28`,
    fetchComedyMovies: `/discover/movie?api_key=${API_KEY}&with_genres=35`,
    fetchHorrorMovies: `/discover/movie?api_key=${API_KEY}&with_genres=27`,
    fetchRomanceMovies: `/discover/movie?api_key=${API_KEY}&with_genres=10749`,
    fetchDocumentaries: `/discover/movie?api_key=${API_KEY}&with_genres=99`,
    searchMovies: `/search/multi?api_key=${API_KEY}&language=en-US&include_adult=false&query=`,
    fetchGenres: `/genre/movie/list?api_key=${API_KEY}&language=en-US`,
    fetchTVGenres: `/genre/tv/list?api_key=${API_KEY}&language=en-US`,
    discoverMovies: `/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`,
    discoverTV: `/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`,

    // TV Specific
    fetchTVTrending: `/trending/tv/week?api_key=${API_KEY}&language=en-US`,
    fetchTVTopRated: `/tv/top_rated?api_key=${API_KEY}&language=en-US`,
    fetchTVActionAdventure: `/discover/tv?api_key=${API_KEY}&with_genres=10759`,
    fetchTVComedy: `/discover/tv?api_key=${API_KEY}&with_genres=35`,
    fetchTVSciFi: `/discover/tv?api_key=${API_KEY}&with_genres=10765`,
};

export default requests;
