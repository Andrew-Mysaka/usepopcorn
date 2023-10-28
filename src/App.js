import {NavBar} from "./NavBar";
import {Main} from "./Main";
import {useEffect, useState} from "react";
import {Box} from "./Box";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = '979514d0';

export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectMovie(id){
        setSelectedId(selectedId => id === selectedId ? null : id);
    }

    function handleCloseMovie(){
        setSelectedId(null);
    }

    useEffect(function () {
        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError('');
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`);

                if (!res.ok) throw new Error("Something went wrong with fetching movies!");

                const data = await res.json();

                if (data.Response === 'False') throw new Error("Movie not found!");

                setMovies(data.Search);
            } catch (err) {
                console.log(err.message);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        if(query.length < 3){
            setMovies([]);
            setError('');
            return;
        }

        fetchMovies();
    }, [query]);

    return (
        <>
            <NavBar>
                <Search query={query} setQuery={setQuery}/>
                <Numresults movies={movies}/>
            </NavBar>

            <Main>
                <Box>
                    <MovieList movies={movies} onSelectMovie={handleSelectMovie}/>
                    {/*{isLoading ? <Loader/> : <MovieList movies={movies} />}*/}
                    {isLoading && <Loader/>}
                    {isLoading && !error && <MovieList movies={movies} />}
                    {error && <ErrorMessage message={error}/>}
                </Box>
                <Box>
                    {
                        selectedId ? (
                            <MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie}/>
                        ) : (
                            <>
                                <WatchedSummary watched={watched}/>
                                <WatchedMoviesList watched={watched}/>
                            </>
                        )
                    }
                </Box>

                {/*<Box element={*/}
                {/*    <MovieList movies={movies}/>*/}
                {/*}/>*/}
                {/*<Box element={*/}
                {/*    <>*/}
                {/*        <WatchedSummary watched={watched}/>*/}
                {/*        <WatchedMoviesList watched={watched}/>*/}
                {/*    </>*/}
                {/*}/>*/}
            </Main>
        </>
    );
}

function Loader() {
    return (
        <p className={'loader'}>Loading...</p>
    );
}

function ErrorMessage({message}) {
    return (
        <p className={'error'}>
            <span>⛔</span> {message}
        </p>
    );
}

function MovieDetails({selectedId, onCloseMovie}) {
    return (
        <div className={'details'}>
            <button className={'btn-back'} onClick={onCloseMovie}>&larr;</button>
            {selectedId}
        </div>
    );
}

function WatchedSummary({watched}){
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <p>
                    <span>⭐️</span>
                    <span>{avgImdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    )
}

function WatchedMoviesList({watched}){
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie movie={movie} key={movie.imdbID}/>
            ))}
        </ul>
    )
}

function WatchedMovie({movie}){
    return (
        <li>
            <img src={movie.Poster} alt={`${movie.Title} poster`}/>
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>⭐️</span>
                    <span>{movie.imdbRating}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{movie.userRating}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{movie.runtime} min</span>
                </p>
            </div>
        </li>
    )
}

function Numresults({movies}) {
    return (
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    )
}

function Search({query, setQuery}) {
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    )
}

function MovieList({movies, onSelectMovie}){
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
            ))}
        </ul>
    )
}

function Movie({movie, onSelectMovie}) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`}/>
            <h3>{movie.Title}</h3>
            <div>
                <p>
                    <span>📅</span>
                    <span>{movie.Year}</span>
                </p>
            </div>
        </li>
    )
}