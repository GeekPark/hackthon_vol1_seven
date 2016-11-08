const express = require('express'),
sock = require('./libs/sock'),
path = require('path'),
app = express(),
server = require('http').createServer(app),
port = 9999;

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'pug');

app.use(express.static('static', {
    index: false,
    maxAge: '7 days'
}));

app.use((req, res, next) => {
    console.log(`[${req.method}] - ${req.path}`);
    next();
});

app.use('/', require('./routers/game'));

server.listen(port, () => {
    console.log(`SocketGame ON ${port}`);
    sock(server);
});
