import React from "react";
import dateFormat from "dateformat";

export const GenreDateFormat = "yyyy-mm-dd HH:mm";
export const IonDateTimeDateFormat = "YYYY-MM-DD HH:mm";


export interface GenreProps {
    id?: string;
    name: string;
    dateAdded: Date;
}

export interface GenreState {
    genres?: GenreProps[],
    fetching: boolean;
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveGenre?: SaveGenreFunction,
}

export type SaveGenreFunction = (genre: GenreProps) => Promise<any>;

export const initialState: GenreState = {
    fetching: false,
    saving: false,
}

export const GenreContext = React.createContext<GenreState>(initialState);

export function dateToString(date: Date): string {
    return dateFormat(date, GenreDateFormat);
}

export function stringToDate(string: string | undefined | null): Date {
    return new Date(string || new Date());
}