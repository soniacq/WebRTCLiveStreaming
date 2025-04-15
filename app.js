const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startButton = document.getElementById('startButton');
const startButtonViewer = document.getElementById('startButtonViewer');

const peerConnection = new RTCPeerConnection({
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' } // Public STUN server
    ]
});

// const socket = new WebSocket('ws://52.54.32.164:8080');
const socket = new WebSocket('wss://webrtc.motionsync.io/ws');

// Queue to store messages until the WebSocket is open
const messageQueue = [];

// Handle WebSocket open event
socket.onopen = () => {
    console.log('WebSocket connection established');
    // Send any queued messages
    while (messageQueue.length > 0) {
        socket.send(messageQueue.shift());
    }
};

function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        console.warn('WebSocket not open. Queuing message:', message);
        messageQueue.push(message);
    }
}

socket.onmessage = async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'offer') {
        console.log('Received offer:', message.offer);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('Sending answer:', answer);
        // socket.send(JSON.stringify({ type: 'answer', answer }));
        const tempMessage = JSON.stringify({ type: 'answer', answer });
        sendMessage(tempMessage);
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
        // socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
        const tempMessage =JSON.stringify({ type: 'candidate', candidate: event.candidate });
        sendMessage(tempMessage);
    }
};

peerConnection.ontrack = (event) => {
    // console.log('ontrack VIDEO:', event);
    // console.log(event.streams[0].getTracks()); // Should show audio/video tracks
    // console.log(event.streams[0].getVideoTracks()); // Should show video tracks
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.muted = true; // Mute the video to allow autoplay

    /*Error: NotAllowedError: play() failed because the user didn't interact with the document first
    This error occurs when trying to play a video without user interaction. Modern browsers require user interaction (like a click) before allowing media playback. This is a security feature to prevent unwanted media from playing automatically.
    Fix:
    To resolve this issue, you can ensure the video is muted or wait for user interaction before attempting to play the video. You can also add a button to start the video playback after user interaction.
    */
   
    // Uncomment the following lines to add a play button for remote video playback
    // const playButton = document.createElement('button');
    // playButton.textContent = 'Play Remote Video';
    // playButton.addEventListener('click', () => {
    //     remoteVideo.play().catch((error) => {
    //         console.error('Error playing remote video:', error);
    //     });
    // });
    // document.body.appendChild(playButton);
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
        // socket.send(JSON.stringify({ type: 'offer', offer })); // Send offer to signaling server
        const tempMessage =JSON.stringify({ type: 'offer', offer });
        sendMessage(tempMessage);
    };

    document.body.appendChild(videoElement); // Append the video element to ensure it loads
});