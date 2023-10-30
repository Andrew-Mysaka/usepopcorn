import {NavBar} from "./NavBar";
import {Main} from "./Main";
import {useEffect, useRef, useState} from "react";
import {Box} from "./Box";
import StarRating from "./StarRating";

const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
const KEY = '979514d0';

export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    // const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [watched, setWatched] = useState(function (){
        return JSON.parse(localStorage.getItem("watched"));
    });

    function handleSelectMovie(id){
        setSelectedId(selectedId => id === selectedId ? null : id);
    }

    function handleCloseMovie(){
        setSelectedId(null);
    }

    function handleAddWatched(movie) {
        setWatched(watched => [...watched, movie]);
        // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter(movie => movie.imdbID !== id));
    }

    useEffect(function (){
        localStorage.setItem("watched", JSON.stringify(watched));
    }, [watched])

    useEffect(function () {
        const controller = new AbortController();

        async function fetchMovies() {
            try {
                setIsLoading(true);
                setError('');
                const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
                    {signal: controller.signal});

                if (!res.ok) throw new Error("Something went wrong with fetching movies!");

                const data = await res.json();

                if (data.Response === 'False') throw new Error("Movie not found!");

                setMovies(data.Search);
                setError('');
            } catch (err) {
                if(err.name !== 'AbortError'){
                    setError(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        }

        if(query.length < 3){
            setMovies([]);
            setError('');
            return;
        }

        handleCloseMovie();
        fetchMovies();

        return function () {
            controller.abort();
        };
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
                            <MovieDetails
                                selectedId={selectedId}
                                watched={watched}
                                onCloseMovie={handleCloseMovie}
                                onAddWatched={handleAddWatched}
                            />
                        ) : (
                            <>
                                <WatchedSummary watched={watched}/>
                                <WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched}/>
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

function MovieDetails({selectedId, onCloseMovie, onAddWatched, watched}) {
    const [movie, setMovie] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [userRating, setUserRating] = useState('');

    const watchedUserRating = watched.find(movie=>movie.imdbID === selectedId)?.userRating;

    const {
        Title: title,
        Year: year,
        Poster: poster,
        Runtime: runtime,
        imdbRating,
        Plot: plot,
        Released: released,
        Actors: actors,
        Director: director,
        Genre: genre
    } = movie;

    useEffect(function () {
        function callback(e) {
            if (e.code === 'Escape') {
                onCloseMovie();
            }
        }

        document.addEventListener('keydown', callback)

        return function () {
            document.removeEventListener('keydown', callback);
        }
    }, [onCloseMovie])

    useEffect(function (){
        async function getMovieDetails(){
            setIsLoading(true);
            const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`);
            const data = await res.json();
            setMovie(data);
            setIsLoading(false);
        }
        getMovieDetails();
    }, [selectedId]);

    useEffect(function (){
        if(!title) return;
        document.title = `Movie: ${title}`;

        return function (){
            document.title = 'usePopcorn'
        };
    }, [title])

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            title,
            year,
            poster,
            imdbRating: Number(imdbRating),
            runtime: Number(runtime.split(' ').at(0)),
            userRating,
        };

        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    return (
        <div className={'details'}>
            {isLoading ? <Loader/> :
                <>
                    <header>
                        <button className={'btn-back'} onClick={onCloseMovie}>&larr;</button>
                        <img src={poster} alt={`Poster of ${movie}`}/>
                        <div className={'details-overview'}>
                            <h2>{title}</h2>
                            <p>
                                {released} &bull; {runtime}
                            </p>
                            <p>{genre}</p>
                            <p><span>⭐</span>{imdbRating} IMDb rating</p>
                        </div>
                    </header>

                    <section>
                        <div className={'rating'}>
                        {
                            !watched.find(movie=>movie.imdbID === selectedId) ?
                            <>

                                <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>

                                {
                                    userRating > 0 &&
                                    <button className={'btn-add'} onClick={handleAdd}>+ Add to list</button>
                                }

                            </>
                            :
                            <p>You rated with movie ${watchedUserRating} <span>⭐</span></p>
                        }
                        </div>

                        <p><em>{plot}</em></p>
                        <p>Starring {actors}</p>
                        <p>Directed by {director}</p>
                    </section>
                </>
            }
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
                    <span>{avgImdbRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>🌟</span>
                    <span>{avgUserRating.toFixed(2)}</span>
                </p>
                <p>
                    <span>⏳</span>
                    <span>{avgRuntime} min</span>
                </p>
            </div>
        </div>
    )
}

function WatchedMoviesList({watched, onDeleteWatched}){
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie movie={movie} key={movie.imdbID} onDeleteWatched={onDeleteWatched}/>
            ))}
        </ul>
    )
}

function WatchedMovie({movie, onDeleteWatched}){
    return (
        <li>
            <img src={movie.poster} alt={`${movie.title} poster`}/>
            <h3>{movie.title}</h3>
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

                <button className={'btn-delete'} onClick={() => onDeleteWatched(movie.imdbID)}>X</button>
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
    const inputEl = useRef(null);

    useEffect(function (){
        function callback(e){
            if(document.activeElement === inputEl.current) return;

            if(e.code === "Enter"){
                inputEl.current.focus();
                setQuery("");
            }
        }

        document.addEventListener("keydown", callback);

        return () => document.addEventListener("keydown", callback);
    }, [setQuery])

    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            ref={inputEl}
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