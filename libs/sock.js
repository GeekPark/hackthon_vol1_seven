let socks = {};
let screens = [];
let playerCount = 0;
const game = require('../config/game.json');

let syncScreenData = function(msg, data) {
    for (screen of screens) {
        screen.emit(msg, data);
    }
}

let syncPlayerData = function(msg, data) {
    for (id in socks) {
        if (socks[id].type !== 'screen') {
            socks[id].sock.emit(msg, data);
        }
    }
}

let syncAllData = function(msg, data) {
    for (id in socks) {
        socks[id].sock.emit(msg, data);
    }
}

module.exports = server => {
    let sio = require('socket.io')(server);
    let indexList = [...game.points].map((item, index) => index);
    let checkList = [...game.points].map(() => -1);

    function getIndex() {
        var ind = Math.floor(Math.random() * indexList.length);
        var result = indexList[ind];
        indexList.splice(ind, 1);
        return result;
    }

    function checkOver() {
        for (var i = 0, l = game.points.length; i < l; i++) {
            if (checkList[i] !== game.points[i]) {
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
                    playerCount--;
                    indexList.push(target.index);
                    checkList[target.index] = -1;
                    syncScreenData('map', Object.assign(game, {checkList}));
                    syncScreenData('players', { playerCount });
                    syncPlayerData('recheckin');
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
            sock.emit('map', Object.assign(game, {checkList}));
            syncScreenData('players', { playerCount });
        });
        sock.on('iamplayer', data => {
            if (playerCount < game.points.length) {
                console.log('-- player in', sock.id);
                playerCount++;
                socks[sock.id].type = 'player';
                socks[sock.id].index = getIndex();
                syncScreenData('players', { playerCount });
                sock.emit('msg', { code: 0 })
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
                syncAllData('over');
            }
        })
    });
};
