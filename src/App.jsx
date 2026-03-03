import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const KEY = import.meta.env.VITE_MY_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectedId, setIsSelectedId] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    const storedWishlist = localStorage.getItem("wishlist");
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  });
  const [showWishlist, setShowWishlist] = useState(false);

  function handleSelectedMovie(id) {
    setIsSelectedId((isSelectedId) => (isSelectedId === id ? null : id));
    console.log(isSelectedId);
  }
  function handleCloseMovieDetails() {
    setIsSelectedId(null);
  }
  function handleAddToWishList(movie) {
    setWishlist((wishlist) => [...wishlist, movie]);
    console.log(wishlist);
  }
  function handleShowWishList() {
    setShowWishlist(!showWishlist);
  }
  function handleDeleteToWishList(id) {
    setWishlist(wishlist.filter((item) => item.id !== id));
  }
  useEffect(() => {
    if (wishlist) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);
  useEffect(
    function () {
      async function getMovies() {
        try {
          setIsLoading(true);
          const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${KEY}&query=${query}`,
          );
          if (!response.ok) {
            throw new Error("something went worng.....");
          }
          const data = await response.json();
          if (data.Response === "False") throw new Error("movie not found");
          // console.log(data);

          setMovies(data.results);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
        }
      }
      getMovies();
    },
    [query],
  );
  return (
    <div>
      <Header>
        <Logo />
        <SearchBar query={query} setQuery={setQuery} />
        <WishlistButton
          count={wishlist?.length}
          onShowWishList={handleShowWishList}
        />
      </Header>
      <MovieSection movies={movies} onSelectMovie={handleSelectedMovie} />
      {isLoading && <Loader />}
      {isSelectedId && (
        <MovieDetails
          onCloseMovieDetail={handleCloseMovieDetails}
          selectedId={isSelectedId}
          onAddWishList={handleAddToWishList}
          wishlist={wishlist}
        />
      )}

      {showWishlist && (
        <WishlistModal
          onClose={handleShowWishList}
          wishlist={wishlist}
          onDeleteWishListMovie={handleDeleteToWishList}
        />
      )}
      <Footer />
    </div>
  );
}
function WishlistButton({ count, onShowWishList }) {
  return (
    <button className="wishlist-btn" onClick={onShowWishList}>
      ❤️ Wishlist
      <span className="wishlist-count">{count}</span>
    </button>
  );
}
function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <p className="loader-text">{text}</p>
    </div>
  );
}
function Header({ children }) {
  return <div className="header-container">{children}</div>;
}
function Logo() {
  return <div className="logo">🎬 MovieHub</div>;
}
function SearchBar({ query, setQuery }) {
  const inputEl = useRef(null);
  useEffect(function () {
    inputEl.current.focus();
  }, []);
  return (
    <input
      type="text"
      className="search-bar"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function MovieSection({ movies, onSelectMovie }) {
  return (
    <ul className="movie-grid">
      {movies.map((movie) => (
        <Movies movie={movie} key={movie.id} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

function Movies({ movie, onSelectMovie }) {
  const baseUrl = "https://image.tmdb.org/t/p/w500";

  return (
    <li className="movie-card" onClick={() => onSelectMovie(movie.id)}>
      <div className="movie-poster">
        <img src={baseUrl + movie.poster_path} alt={movie.title} />
        <span className="movie-badge">⭐ {movie.vote_average?.toFixed(1)}</span>
      </div>

      <div className="movie-body">
        <h2 className="movie-title">{movie.title}</h2>

        <p className="movie-overview">{movie.overview}</p>

        <div className="movie-meta">
          <span>📅 {movie.release_date}</span>
          <span>👥 {movie.vote_count}</span>
        </div>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedId,
  onCloseMovieDetail,
  onAddWishList,
  wishlist,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isWatched = wishlist.map((movie) => movie.id).includes(selectedId);
  console.log(isWatched);
  const {
    title,
    released_date,
    vote_average,
    vote_count,
    overview,
    poster_path,
  } = movie;

  useEffect(
    function () {
      document.title = `Movie : ${title}`;
      return () => {
        document.title = "Movie App";
      };
    },
    [title],
  );
  useEffect(
    function () {
      async function getMovieDetails() {
        setIsLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${selectedId}?api_key=${KEY}`,
        );
        const data = await response.json();
        console.log(data);
        setMovie(data);
        setIsLoading(false);
      }
      getMovieDetails();
    },
    [selectedId],
  );

  // console.log(movie);
  function handleAdd() {
    const movieData = {
      id: selectedId,
      title,
      released_date,
      vote_average,
      vote_count,
      overview,
      poster_path,
    };
    onAddWishList(movieData);
    // console.log(movieData);
    onCloseMovieDetail();
  }
  const imgBase = "https://image.tmdb.org/t/p/w780";
  const posterBase = "https://image.tmdb.org/t/p/w500";

  return (
    <div className="details-modal-overlay">
      {isLoading ? (
        <Loader />
      ) : (
        <section
          className="details-modal"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Movie Details"
        >
          {/* Close Button */}
          <button
            className="details-close"
            onClick={() => onCloseMovieDetail()}
            aria-label="Close"
          >
            ✕
          </button>

          {/* Hero */}
          <div className="details-hero">
            <img
              className="details-backdrop"
              src={imgBase + movie.backdrop_path}
              alt={movie.title}
            />
            <div className="details-overlay" />
          </div>

          {/* Content */}
          <div className="details-wrap">
            <div className="details-grid">
              {/* Poster */}
              <div className="details-poster">
                <img
                  src={posterBase + movie.poster_path}
                  alt={movie.title}
                  className="details-poster-img"
                />
                <button className="btn-primary">▶ Watch Trailer</button>
                {isWatched ? (
                  <p className="exist">Already in WatchList</p>
                ) : (
                  <button className="btn-secondary" onClick={handleAdd}>
                    ＋ Add to Watchlist
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="details-content">
                <h1 className="details-title">{movie.title}</h1>
                <p className="details-tagline">{movie.tagline}</p>

                {/* <div className="details-chips">
                {movie.genres.map((g) => (
                  <span key={g} className="chip">
                    {g}
                  </span>
                ))}
              </div> */}

                <div className="details-stats">
                  <div className="stat">
                    <span className="stat-label">Rating</span>
                    <span className="stat-value">⭐ {movie.vote_average}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Votes</span>
                    <span className="stat-value">👥 {movie.vote_count}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Runtime</span>
                    <span className="stat-value">⏱ {movie.runtime} min</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Release</span>
                    <span className="stat-value">📅 {movie.release_date}</span>
                  </div>
                </div>

                <h3 className="section-title">Overview</h3>
                <p className="details-overview">{movie.overview}</p>

                <h3 className="section-title">Top Cast</h3>
                {/* <ul className="cast-list">
                {movie.cast.map((c) => (
                  <li key={c.name} className="cast-item">
                    <span className="cast-name">{c.name}</span>
                    <span className="cast-role">{c.role}</span>
                  </li>
                ))}
              </ul> */}

                <div className="details-actions">
                  <button className="btn-primary">Rent</button>
                  <button className="btn-secondary">Share</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function WishlistModal({ onClose, wishlist, onDeleteWishListMovie }) {
  console.log(wishlist);
  const posterBase = "https://image.tmdb.org/t/p/w342";

  return (
    <div className="wish-overlay">
      <section className="wish-modal" onClick={(e) => e.stopPropagation()}>
        <button className="wish-close" onClick={onClose}>
          ✕
        </button>

        <div className="wish-header">
          <h2 className="wish-title">Your Wishlist</h2>
          <p className="wish-subtitle">{wishlist?.length} movies saved</p>
        </div>

        <div className="wish-body">
          {wishlist?.length === 0 ? (
            <div className="wish-empty">
              <p>No movies in wishlist</p>
            </div>
          ) : (
            <ul className="wish-grid">
              {wishlist?.map((movie) => (
                <li key={movie.id} className="wish-card">
                  <div className="wish-poster">
                    <img
                      src={posterBase + movie.poster_path}
                      alt={movie.title}
                    />
                    <span className="wish-badge">⭐ {movie.vote_average}</span>
                  </div>

                  <div className="wish-info">
                    <h3 className="wish-movie-title">{movie.title}</h3>

                    <p className="wish-meta">
                      📅 {movie.release_date} • 👥 {movie.vote_count}
                    </p>

                    <p className="wish-overview">{movie.overview}</p>

                    <div className="wish-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => onDeleteWishListMovie(movie.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Side - Logo or Brand Name */}
        <div className="footer-logo">
          <h3>🎬 MovieHub</h3>
        </div>

        {/* Middle - Useful Links */}
        <div className="footer-links">
          <a href="/about">About</a>
          <a href="/terms">Terms of Service</a>
          <a href="/privacy">Privacy Policy</a>
        </div>

        {/* Right Side - Social Media Links */}
        <div className="footer-social">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="footer-copyright">
        <p>© 2026 MovieHub. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
export default App;
