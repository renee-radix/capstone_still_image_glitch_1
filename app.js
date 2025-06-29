//listing necessary libraries: osc (reciving data), http, express (hosting the sketch) and sockets (communicating info to the sketch)
const osc = require("osc");
const http = require('http');
const express = require('express');
const socket = require('socket.io')

//Setting up where our sketch is going to be hosted
const PORT = 1312; //port for hosting sketch AND reciving OSC data 
const app = express();
app.use(express.static('public'));
app.set('port', PORT);

const server = http.createServer(app)
server.on('listening', () => {
 console.log('Listening on port '+PORT)
})

console.log("Server running!")

//Setting up UDP port
var udpPort = new osc.UDPPort({
	localPort: 1312, //port we're reciving on
	metadata: true
});

//Reciving osc messages
udpPort.open();
udpPort.on("message", function (oscMsg, timeTag, info) {
    console.log("An OSC message just arrived!", oscMsg);//lets you read raw osc message
    //we get a message something like:  { address: '/amp', args: [ { type: 'f', value: 93.71991729736328 } ] }

    let value = oscMsg.args[0].value; //parse osc. 
    let address = oscMsg.address;//parse osc. 
    if(address == "/sketch1" && value == 0){ //if the osc message has the right tag and the value is 0
	    io.sockets.emit(glitch); //send the socket message
    }else if(address == "/sketch1" && value == 1){ //if it's 1
    	io.sockets.emit(flash); //send message to glitch
    }
    if(address == "/sketch1"){
        console.log("Sending to P5 Sketch: " + value); 
    }
    }
});

//Web socket code
//Remember in order to make our public sketch a socket.io client we need to reference sockets.io in the html file (see that file) and the sketch itself (see that file too)

//Establishing a connection and printing to console when a new connection happens:
var io = socket(server);
io.sockets.on('connection', newConnection);

function newConnection(socket){ //This function runs every time there's a new socket connection, i.e. when we load our sketch on the computer. Anything to do with reciving code from socket connections needs to go here
    //The socket object has a ton of associated metadata, id being just one of those metadata points. It's unique for each connection. 
    console.log("A new client has connected! ID: " + socket.id); 
}

server.listen(PORT)

