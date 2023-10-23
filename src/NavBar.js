import {useState} from "react";

export function NavBar({movies}) {
    return (
        <nav className="nav-bar">
            <Logo/>
            <Search/>
            <Numresults movies={movies}/>
        </nav>
    )
}

function Numresults({movies}) {
    return (
        <p className="num-results">
            Found <strong>{movies.length}</strong> results
        </p>
    )
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    )
}

function Search() {
    const [query, setQuery] = useState("");

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