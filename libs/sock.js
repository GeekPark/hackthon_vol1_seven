let socks = {};
let screens = [];
let players = [];
const config = {row: 3, col: 3};
const points = [
    0,1,0,
    1,0,1,
    0,1,0
];

let syncScreenData = function(msg, data) {
    for (screen of screens) {
        screen.emit(msg, data);
    }
}

let syncPlayerData = function(msg, data) {
    for (player of players) {
        player.emit(msg, data);
    }
}

module.exports = {
    init (server) {
        let sio = require('socket.io')(server);
        let indexList = [...points].map((item, index) => index);
        let checkList = [...points].map(() => -1);

        function getIndex() {
            var ind = Math.floor(Math.random() * indexList.length);
            var result = indexList[ind];
            indexList.splice(ind, 1);
            return result;
        }

        function checkOver() {
            for (var i = 0, l = points.length; i < l; i++) {
                if (checkList[i] !== points[i]) {
                    return false;
                }
            }
            return true;
        }

        sio.on('connect', sock => {
            console.log('-- connect', sock.id);
            socks[sock.id] = {
                id: sock.id,
                index: -1,
                sock: sock,
                type: 'guest'
            };
            sock.on('disconnect', () => {
                console.log('-- disconnect', sock.id);
                let target = socks[sock.id];
                delete socks[sock.id];
                switch (target.type) {
                    case 'screen':{
                        let index = screens.indexOf(sock);
                        screens.splice(index, 1);
                        break;
                    }
                    case 'player': {
                        let index = players.indexOf(sock);
                        indexList.push(target.index);
                        players.splice(index, 1);
                        syncScreenData('players', {
                            playerCount: players.length
                        });
                        break;
                    }
                    default:
                    break;
                }
            });
            // messages
            sock.on('iamscreen', data => {
                console.log('-- screen in', sock.id);
                socks[sock.id].type = 'screen';
                screens.push(sock);
                sock.emit('map', { config, points });
                syncScreenData('players', {
                    playerCount: players.length
                });
            });
            sock.on('iamplayer', data => {
                if (players.length < points.length) {
                    console.log('-- player in', sock.id);
                    socks[sock.id].type = 'player';
                    socks[sock.id].index = getIndex();
                    players.push(sock);
                    sock.emit('msg', {
                        code: 0
                    })
                    syncScreenData('players', {
                        playerCount: players.length
                    });
                } else {
                    console.log('-- guest in', sock.id);
                    socks[sock.id].type = 'guest';
                    sock.emit('msg', {
                        code: 1,
                        message: 'Room is Full.'
                    });
                }
            });
            sock.on('switch', data => {
                var proxy = socks[sock.id];
                console.log('# switch', proxy.id, proxy.index, data.value);
                checkList[proxy.index] = data.value === 'on' ? 1 : 0;
                syncScreenData('switch', {
                    index: proxy.index,
                    value: data.value
                });
                if (checkOver()) {
                    syncScreenData('over');
                    syncPlayerData('over');
                }
            })
        });
    }
};
