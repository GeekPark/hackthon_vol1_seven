(function() {
    const playground = $('#playground');
    const infoBox = $('#info');
    const msgBox = $('#msg');
    let sock = io();
    let state = 'open';
    let playerCount = 0;
    sock.on('connect', () => {
        console.log('connect');
        sock.emit('iamscreen');
    });
    sock.on('map', data => {
        console.log('map', data);
        playground.html('');
        infoBox.html('');
        msgBox.html('');
        state = 'open';
        playerCount = data.config.row * data.config.col;
        playground.css('width', data.config.col * 80);
        for(let i = 0, clas = ['box'], l = data.points.length; i < l; i++, clas = ['box']) {
            if (data.points[i] === 0) {
                clas.push('base_off');
            } else {
                clas.push('base_on');
            }
            if (data.checkList[i] === 0) {
                clas.push('off');
            } else if (data.checkList[i] === 1) {
                clas.push('on');
            }
            playground.append(`<li id="box${i}" class="${clas.join(' ')}"></li>`);
        }
    });
    sock.on('players', data => {
        console.log('players', data);
        infoBox.html(`${data.playerCount} / ${playerCount}`);
    });
    sock.on('switch', data => {
        if (state === 'over') {
            console.log('Game Over.');
        } else {
            console.log('switch', data);
            $(`#box${data.index}`)
            .removeClass('on off')
            .addClass(data.value);
        }
    });
    sock.on('over', () => {
        state = 'over';
        console.log('SUCCESS!!!');
        msgBox.html('Success!!');
    });
})();
