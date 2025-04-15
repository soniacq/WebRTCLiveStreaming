const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080, host: '0.0.0.0' }); // Bind to all network interfaces

server.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('message', (message) => {
        try {
            const parsedMessage = JSON.parse(message);
            console.log('Received message from client:', parsedMessage);

            // Broadcast the message to all connected clients
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    console.log('Broadcasting message to client');
                    client.send(JSON.stringify(parsedMessage));
                }
            });
        } catch (error) {
            console.error('Failed to parse message as JSON:', message);
        }
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://0.0.0.0:8080');