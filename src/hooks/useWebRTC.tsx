"use client";

import { EventType, WsMessageHandler } from "@/lib/api/types";
import { useEffect, useRef, useState } from "react";

interface UseWebRTCArgs {
  send: (event: EventType, payload: unknown) => void;
  subscribe: <T>(event: EventType, handler: WsMessageHandler<T>) => void;
  enabled: boolean;
}

export function useWebRTC({ send, subscribe, enabled }: UseWebRTCArgs) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const pc = new RTCPeerConnection({ iceServers: buildIceServers() });

    pcRef.current = pc;

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0] ?? new MediaStream([event.track]));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) send("webrtc_candidate", event.candidate);
    };

    subscribe<RTCSessionDescriptionInit>("webrtc_offer", async (offer) => {
      if (!pcRef.current) return;

      try {
        await pcRef.current.setRemoteDescription(offer);

        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        send("webrtc_answer", answer);
      } catch (error) {
        console.error("Error handling webrtc_offer:", error);
      }
    });

    subscribe<RTCSessionDescriptionInit>("webrtc_answer", async (answer) => {
      if (!pcRef.current) return;

      try {
        await pcRef.current.setRemoteDescription(answer);
      } catch (error) {
        console.error("Error handling webrtc_answer:", error);
      }
    });

    subscribe<RTCIceCandidateInit>("webrtc_candidate", async (candidate) => {
      if (!pcRef.current) return;

      try {
        await pcRef.current.addIceCandidate(candidate);
      } catch {}
    });

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());

          return;
        }

        streamRef.current = stream;
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        send("webrtc_offer", offer);

        pc.onnegotiationneeded = async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            send("webrtc_offer", offer);
          } catch (err) {
            console.error("Negotiation error:", err);
          }
        };
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      pc.close();
      pcRef.current = null;
      setRemoteStream(null);
    };
  }, [enabled]);

  const toggleMute = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  };

  return { remoteStream, isMuted, toggleMute };
}

function buildIceServers(): RTCIceServer[] {
  const iceServers: RTCIceServer[] = [];
  const stunUrl = process.env.NEXT_PUBLIC_STUN_URL;
  if (stunUrl) iceServers.push({ urls: stunUrl });

  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnCredential = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

  if (
    process.env.NODE_ENV !== "development" &&
    turnUrl &&
    turnUsername &&
    turnCredential
  ) {
    iceServers.push(
      {
        urls: `turn:${turnUrl}:80?transport=tcp`,
        username: turnUsername,
        credential: turnCredential
      },
      {
        urls: `turns:${turnUrl}:443?transport=tcp`,
        username: turnUsername,
        credential: turnCredential
      }
    );
  }

  return iceServers;
}
