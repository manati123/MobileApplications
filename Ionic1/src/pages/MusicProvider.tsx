import React, {useCallback, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {createGenre, getGenres, newWebSocket, updateGenre} from "./MusicService";
import {initialState, GenreProps, GenreState, SaveGenreFunction} from "./MusicCommon";
import {GenreContext} from "./MusicCommon";

interface ActionProps {
    type: string,
    payload?: any,
}

const FETCH_GENRES_STARTED = 'FETCH_GENRES_STARTED';
const FETCH_GENRES_SUCCEEDED = 'FETCH_GENRES_SUCCEEDED';
const FETCH_GENRES_FAILED = 'FETCH_GENRES_FAILED';
const SAVE_GENRE_STARTED = 'SAVE_GENRES_STARTED';
const SAVE_GENRE_SUCCEEDED = 'SAVE_GENRES_SUCCEEDED';
const SAVE_GENRE_FAILED = 'SAVE_GENRES_FAILED';

const reducer: (state: GenreState, action: ActionProps) => GenreState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_GENRES_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_GENRES_SUCCEEDED:
                return { ...state, genres: payload.genres, fetching: false };
            case FETCH_GENRES_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_GENRE_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_GENRE_SUCCEEDED:
                const genres = [...(state.genres || [])];
                const genre = payload.genre;
                const index = genres.findIndex((it) => it.id === genre.id);
                if (index === -1) {
                    genres.splice(0, 0, genre);
                } else {
                    genres[index] = genre;
                }
                return { ...state, genres: genres, saving: false };
            case SAVE_GENRE_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

interface GenreProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const GenreProvider: React.FC<GenreProviderProps> = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { genres, fetching, fetchingError, saving, savingError } = state;
    useEffect(getGenresEffect, []);
    useEffect(webSocketsEffect, []);
    const saveGenre = useCallback<SaveGenreFunction>(saveGenreCallback, []);
    const value = { genres, fetching, fetchingError, saving, savingError, saveGenre: saveGenre };
    return (
        <GenreContext.Provider value={value}>
            {children}
        </GenreContext.Provider>
    );

    function getGenresEffect() {
        let canceled = false;
        fetchGenres().then(_ => {});
        return () => {
            canceled = true;
        }

        async function fetchGenres() {
            try {
                dispatch({ type: FETCH_GENRES_STARTED });
                const genres = await getGenres();
                console.log(genres);
                if (!canceled)
                    dispatch({ type: FETCH_GENRES_SUCCEEDED, payload: { genres: genres } });
            } catch (error) {
                dispatch({ type: FETCH_GENRES_FAILED, payload: { error } });
            }
        }
    }

    async function saveGenreCallback(genre: GenreProps) {
        try {
            dispatch({ type: SAVE_GENRE_STARTED });
            console.log(genre.id);
            const savedGenre = await (genre.id ? updateGenre(genre) : createGenre(genre));
            dispatch({ type: SAVE_GENRE_SUCCEEDED, payload: { genre: savedGenre } });
        } catch (error) {
            dispatch({ type: SAVE_GENRE_FAILED, payload: { error } });
        }
    }

    function webSocketsEffect() {
        let canceled = false;
        const closeWebSocket = newWebSocket(message => {
            if (canceled) {
                return;
            }
            const { event, payload: { genre }} = message;
            if (event === 'created' || event === 'updated') {
                dispatch({ type: SAVE_GENRE_SUCCEEDED, payload: { genre: genre } });
            }
        });
        return () => {
            canceled = true;
            closeWebSocket();
        }
    }
}