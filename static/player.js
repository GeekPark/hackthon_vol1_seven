(function () {
    const sock = io();
    const btn = $('#switch');
    let type= 'guest';
    let myValue = true;
    btn.on('click', evt => {
        myValue = !myValue;
        sock.emit('switch', {
            value: myValue ? 'on' : 'off'
        });
    });
    sock.on('connect', () => {
        console.log('connect');
        sock.emit('iamplayer');
    });
    sock.on('recheckin', () => {
        if (type === 'guest') {
            sock.emit('iamplayer');
        } else {
            btn.val('Toggle');
            btn.attr('disabled', false);
        }
    });
    sock.on('msg', data => {
        console.log(data);
        if (data.code === 0) {
            type = 'player';
            btn.val('Toggle');
            btn.attr('disabled', false);
        } else {
            type = 'guest';
            btn.val(data.message);
            btn.attr('disabled', true);
        }
    });
    sock.on('over', () => {
        btn.val('SUCCESS');
        btn.attr('disabled', true);
    });
})();
