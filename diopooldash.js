let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let ready = false;

//const serverAddress = 'ws://76.166.174.231:5000/';
const serverAddress = 'ws://ec2-3-101-36-83.us-west-1.compute.amazonaws.com:5000/'

const ws = new WebSocket(serverAddress);

if (document.cookie == '') {
    document.cookie = Math.random();
}

function writecircle(x, y, r, c) {
    ctx.beginPath();
    ctx.fillStyle = c;
    ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
    ctx.fill();
}
function outlinecircle(x, y, r, w) {
    ctx.lineWidth = w;
    ctx.strokeStyle = '#000000';

    ctx.beginPath();
    ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
    ctx.stroke();
}

let player = {x: 500, y: 500};
let id = document.cookie;

ws.onmessage = function(msg) {
    msg = JSON.parse(msg.data);

    if (id == undefined) {
        id = msg.id
        player = msg.player
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    writecircle(500, 500, 500, '#000000')
    writecircle(500, 500, 400 - ((msg.count + 1) % 200) * 2, msg.battle ? '#aa0000' : msg.allr ? '#00aa00' : '#aaaaaa')

    if (msg.set != undefined) ready = msg.set

    player = msg.players[sha256(id)];
    
    for (let [key, value] of Object.entries(msg.players)) {
        writecircle(value.x, value.y, value.radius, value.color);
        if (value == player) {
            writecircle(player.x, player.y, player.radius * 0.5, value.ready ? '#00aaaa' : '#aaaaaa');
        }
            
        outlinecircle(value.x, value.y, value.radius * (1 - value.cd / 500), 10)
        outlinecircle(value.x, value.y, value.radius, 5)

        if (value.ready) {
            //writecircle(value.x, value.y, value.radius * 0.5, '#00aaaa');
        }
    }
    
    for (let col of msg.cols) {
        writecircle(col[0], col[1], 50, 'rgba(200, 200, 0, ' + (col[2] / 5).toString() + ')');
    }

    if (msg.battle) {
        for (let sidecol of msg.sidecols) {
            writecircle(sidecol[0], sidecol[1], 75, 'rgba(' + parseInt(sidecol[3].substring(1, 3), 16).toString() + ', ' + parseInt(sidecol[3].substring(3, 5), 16).toString() + ', ' + parseInt(sidecol[3].substring(5, 7), 16).toString() + ', ' + (sidecol[2] / 5).toString() + ')');
        }
    }
}

function send(info) {
    if (ws.readyState == 1) {
        ws.send(JSON.stringify(info));
    }
}

let moveinfo = {}
canvas.onmouseup = function(e) {
    send({x: e.clientX - canvas.offsetLeft - player.x, y: e.clientY - canvas.offsetTop - player.y, cookie: id, ready: ready});
}

function start() {
    ready = true;
}

setInterval(function() {
    send({x: 0, y: 0, cookie: id, ready: ready});
}, 1000)