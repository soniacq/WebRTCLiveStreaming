# WebRTCLiveStreaming

This guide explains how to run a simple WebRTC application using a WebSocket signaling server and a static file server.

## 1. Install Dependencies

Navigate to the project directory and install the required packages:

```bash
npm install
```

## 2. Start the WebSocket Server

Run the following command to start the WebSocket server.  
This will start the signaling server on `ws://<server-ip>:8080`:

```bash
npm start
```

## 3. Serve the Application

Use a simple HTTP server to serve the `index.html` file.  
This will start a local HTTP server. Note the URL it provides (e.g., `http://<server-ip>:8081`):

```bash
npx http-server .
```

## 4. Open the Application in Two Browsers

Open the provided URL (e.g., `http://<server-ip>:8081`) in your browsers.

- In the **first browser** (Broadcaster), click **"Start Streaming"** to start the stream.  
  The `sample.mp4` video should start streaming, and the local video will be displayed in the `localVideo` element.

- In the **second browser** (Viewer), click **"Start Streaming"** to start the stream.  
  The `sample.mp4` video should also start streaming, and the local video will be displayed in the `localVideo` element.  
  Additionally, the `remoteVideo` element should automatically display the local video stream from the broadcaster (on the viewer side).  
  If you look at the broadcaster's side, the `remoteVideo` element will also display the local video stream from the viewer.

## Troubleshooting

If the video does not play:

- Ensure that the `sample.mp4` file is located in the same directory as the application.
