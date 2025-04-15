const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');

const peerConnection = new RTCPeerConnection({
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Public STUN server
    ]
});

const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'offer') {
        console.log('Received offer:', message.offer);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('Sending answer:', answer);
        socket.send(JSON.stringify({ type: 'answer', answer }));
    } else if (message.type === 'answer') {
        console.log('Received answer:', message.answer);
        if (peerConnection.signalingState === 'have-local-offer') {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
        } else {
            console.warn('Ignoring answer: Invalid signaling state', peerConnection.signalingState);
        }
    } else if (message.type === 'candidate') {
        console.log('Received ICE candidate:', message.candidate);
        await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
    }
};

peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        console.log('Sending ICE candidate:', event.candidate);
        socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
    }
};

peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
};

startButton.addEventListener('click', async () => {
    const videoElement = document.createElement('video');
    videoElement.src = 'sample3.mp4';
    videoElement.autoplay = true;
    videoElement.muted = true; // Ensure autoplay works by muting the video
    videoElement.playsInline = true; // For mobile compatibility
    videoElement.title = 'Sample Video'; // Add a title to the video element

    videoElement.onloadeddata = async () => {
        const stream = videoElement.captureStream();
        localVideo.srcObject = stream;

        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        console.log('Created offer:', offer);
        socket.send(JSON.stringify({ type: 'offer', offer })); // Send offer to signaling server
    };

    document.body.appendChild(videoElement); // Append the video element to ensure it loads
});