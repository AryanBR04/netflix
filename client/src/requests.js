const requests = {
    fetchTrending: `/trending/all/week?language=en-US`,
    fetchNetflixOriginals: `/discover/tv?with_network=213`,
    fetchTopRated: `/movie/top_rated?language=en-US`,
    fetchActionMovies: `/discover/movie?with_genres=28`,
    fetchComedyMovies: `/discover/movie?with_genres=35`,
    fetchHorrorMovies: `/discover/movie?with_genres=27`,
    fetchRomanceMovies: `/discover/movie?with_genres=10749`,
    fetchDocumentaries: `/discover/movie?with_genres=99`,
    searchMovies: `/search/multi?language=en-US&include_adult=false&query=`,
    fetchGenres: `/genre/movie/list?language=en-US`,
    fetchTVGenres: `/genre/tv/list?language=en-US`,
    discoverMovies: `/discover/movie?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`,
    discoverTV: `/discover/tv?language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`,

    // TV Specific
    fetchTVTrending: `/trending/tv/week?language=en-US`,
    fetchTVTopRated: `/tv/top_rated?language=en-US`,
    fetchTVActionAdventure: `/discover/tv?with_genres=10759`,
    fetchTVComedy: `/discover/tv?with_genres=35`,
    fetchTVSciFi: `/discover/tv?with_genres=10765`,
};

export default requests;
