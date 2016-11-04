const sock = io(),
    btn = $('#switch');
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
sock.on('msg', data => {
    console.log(data);
    if (data.code === 0) {
        btn.val('Toggle');
        btn.attr('disabled', false);
    } else {
        btn.val(data.message);
        btn.attr('disabled', true);
    }
});
sock.on('over', () => {
    btn.val('SUCCESS');
    btn.attr('disabled', true);
});
