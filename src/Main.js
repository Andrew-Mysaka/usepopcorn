import {ListBox} from "./ListBox";
import {WatchBox} from "./WatchBox";

export function Main({movies}) {
    return (
        <main className="main">
            <ListBox movies={movies}/>
            <WatchBox/>
        </main>
    )
}