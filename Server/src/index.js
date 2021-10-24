const Koa = require('koa');
const app = new Koa();
const server = require('http').createServer(app.callback());
const WebSocket = require('ws');
const wss = new WebSocket.Server({server});
const Router = require('koa-router');
const cors = require('koa-cors');
const bodyparser = require('koa-bodyparser');

app.use(bodyparser());
app.use(cors());
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} ${ctx.response.status} - ${ms}ms`);
});

app.use(async (ctx, next) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await next();
});

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.body = {issue: [{error: err.message || 'Unexpected error'}]};
        ctx.response.status = 500;
    }
});

class Genre {
    constructor({id, name,dateAdded}) {
        this.id = id;
        this.name = name;
        this.dateAdded = dateAdded;
    }
}

const genres = [];
for (let i = 0; i < 3; i++) {
    genres.push(new Genre({id: `${i}`, name: `genre ${i}`, dateAdded: new Date(Date.now() + i)}));
}
let lastUpdated = genres[genres.length - 1].date;
let lastId = genres[genres.length - 1].id;

const broadcast = data =>
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });

const router = new Router();

router.get('/genre', ctx => {
    const ifModifiedSince = ctx.request.get('If-Modified-Since');
    if (ifModifiedSince && new Date(ifModifiedSince).getTime() >= lastUpdated.getTime() - lastUpdated.getMilliseconds()) {
        ctx.response.status = 304; // NOT MODIFIED
        return;
    }
    ctx.response.set('Last-Modified', lastUpdated.toUTCString());
    ctx.response.body = genres;
    ctx.response.status = 200;
});

router.get('/genres/:id', async (ctx) => {
    const genreId = ctx.request.params.id;
    const genre = genres.find(genre => genreId === genre.id);
    if (genre) {
        ctx.response.body = genre;
        ctx.response.status = 200; // ok
    } else {
        ctx.response.body = {issue: [{warning: `genre with id ${genreId} not found`}]};
        ctx.response.status = 404; // NOT FOUND (if you know the resource was deleted, then return 410 GONE)
    }
});

const createGenre = async (ctx) => {
    const genre = ctx.request.body;
    if (!genre.name) { // validation
        ctx.response.body = {issue: [{error: 'Text is missing'}]};
        ctx.response.status = 400; //  BAD REQUEST
        return;
    }
    genre.id = `${parseInt(lastId) + 1}`;
    lastId = genre.id;
    genres.push(genre);
    ctx.response.body = genre;
    ctx.response.status = 201; // CREATED
    broadcast({event: 'created', payload: {genre: genre}});
};

router.post('/genre', async (ctx) => {
    await createGenre(ctx);
});

router.put('/genre/:id', async (ctx) => {
    const id = ctx.params.id;
    const genre = ctx.request.body;
    const genreId = genre.id;
    if (genreId && id !== genre.id) {
        ctx.response.body = {issue: [{error: `Param id and body id should be the same`}]};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    if (!genreId) {
        await createGenre(ctx);
        return;
    }
    const index = genres.findIndex(genre => genre.id === id);
    if (index === -1) {
        ctx.response.body = {issue: [{error: `genre with id ${id} not found`}]};
        ctx.response.status = 400; // BAD REQUEST
        return;
    }
    genres[index] = genre;
    lastUpdated = new Date();
    ctx.response.body = genre;
    ctx.response.status = 200; // OK
    broadcast({event: 'updated', payload: {genre: genre}});
});

setInterval(() => {
    lastUpdated = new Date();
    lastId = `${parseInt(lastId) + 1}`;
    const genre = new Genre({id: lastId, name: `genre ${lastId}`, dateAdded: lastUpdated});
    genres.push(genre);
    console.log(`${genre.name}`);
    broadcast({event: 'created', payload: {genre: genre}});
}, 3000);

app.use(router.routes());
app.use(router.allowedMethods());

server.listen(3000);