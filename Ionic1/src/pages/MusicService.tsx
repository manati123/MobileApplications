import axios from 'axios';
import {getLogger} from '../core';
import {GenreProps} from "./MusicCommon";

const log = getLogger('itemApi');

const baseUrl = 'localhost:3000';
// noinspection HttpUrlsUsage
const genreUrl = `http://${baseUrl}/genre`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, functionName: string): Promise<T> {
    log(`${functionName} - started`);
    return promise
        .then(res => {
            log(`${functionName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${functionName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getGenres: () => Promise<GenreProps[]> = () => {
    return withLogs(axios.get(genreUrl, config), 'getGenres');
}

export const createGenre: (genre: GenreProps) => Promise<GenreProps[]> = genre => {
    return withLogs(axios.post(genreUrl, genre, config), 'createGenre');
}

export const updateGenre: (genre: GenreProps) => Promise<GenreProps[]> = genre => {
    return withLogs(axios.put(`${genreUrl}/${genre.id}`, genre, config), 'updateGenre');
}

interface MessageData {
    event: string;
    payload: {
        genre: GenreProps;
    };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const webSocket = new WebSocket(`ws://${baseUrl}`)
    webSocket.onopen = () => {
        log('web socket onopen');
    };
    webSocket.onclose = () => {
        log('web socket onclose');
    };
    webSocket.onerror = error => {
        log('web socket onerror', error);
    };
    webSocket.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        webSocket.close();
    }
}