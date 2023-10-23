import {useState} from "react";

export function NavBar({children}) {
    return (
        <nav className="nav-bar">
            <Logo/>
            {children}
        </nav>
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