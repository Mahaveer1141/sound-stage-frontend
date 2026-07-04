import { useEffect, useRef } from "react";

export default function RemoteAudio({
  stream
}: {
  stream: MediaStream | null;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.srcObject = stream;
  }, [stream]);

  if (!stream) return;

  return <audio ref={audioRef} autoPlay controls={false} muted={false} />;
}
