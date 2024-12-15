import { Socket } from 'socket.io-client';

interface PeerConnection {
  connection: RTCPeerConnection;
  stream: MediaStream;
}

export class WebRTCManager {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket: Socket;
  private onTrackCallback: (userId: string, stream: MediaStream) => void;

  constructor(
    socket: Socket,
    onTrack: (userId: string, stream: MediaStream) => void
  ) {
    this.socket = socket;
    this.onTrackCallback = onTrack;
    this.setupSocketListeners();
  }

  private setupSocketListeners() {
    this.socket.on('user-connected', (userId: string) => {
      console.log('User connected:', userId);
      this.createPeerConnection(userId);
    });

    this.socket.on('user-disconnected', (userId: string) => {
      console.log('User disconnected:', userId);
      this.removePeerConnection(userId);
    });

    this.socket.on('signal', async ({ userId, signal }) => {
      try {
        if (signal.type === 'offer') {
          const pc = await this.createPeerConnection(userId);
          await pc.connection.setRemoteDescription(new RTCSessionDescription(signal));
          const answer = await pc.connection.createAnswer();
          await pc.connection.setLocalDescription(answer);
          this.socket.emit('signal', {
            userId: this.socket.id,
            to: userId,
            signal: answer,
          });
        } else if (signal.type === 'answer') {
          const pc = this.peerConnections.get(userId);
          if (pc) {
            await pc.connection.setRemoteDescription(new RTCSessionDescription(signal));
          }
        } else if (signal.candidate) {
          const pc = this.peerConnections.get(userId);
          if (pc) {
            await pc.connection.addIceCandidate(new RTCIceCandidate(signal));
          }
        }
      } catch (error) {
        console.error('Error handling signal:', error);
      }
    });
  }

  private async createPeerConnection(userId: string): Promise<PeerConnection> {
    if (this.peerConnections.has(userId)) {
      return this.peerConnections.get(userId)!;
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('signal', {
          userId: this.socket.id,
          to: userId,
          signal: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      this.onTrackCallback(userId, event.streams[0]);
    };

    const peerConnection: PeerConnection = {
      connection: pc,
      stream: new MediaStream(),
    };

    this.peerConnections.set(userId, peerConnection);

    // Create and send offer if we're the initiator
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('signal', {
        userId: this.socket.id,
        to: userId,
        signal: offer,
      });
    } catch (error) {
      console.error('Error creating offer:', error);
    }

    return peerConnection;
  }

  private removePeerConnection(userId: string) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.connection.close();
      this.peerConnections.delete(userId);
    }
  }

  async startLocalStream() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }

  stopLocalStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }

  cleanup() {
    this.stopLocalStream();
    this.peerConnections.forEach((pc) => {
      pc.connection.close();
    });
    this.peerConnections.clear();
  }
}