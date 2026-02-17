"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MicIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

interface RecordButtonProps {
  onTranscript: (text: string) => void;
  /** Called only when recording stops (user clicks Stop or recognition ends). Use for toasts. */
  onRecordingStop?: (finalText: string) => void;
  /** Optional: live interim text for a separate preview (main transcript stays final-only). */
  onInterim?: (text: string) => void;
  /** Existing transcription to preserve when starting a new recording. New speech is appended. */
  currentTranscript?: string;
  disabled?: boolean;
  className?: string;
}

const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? (window.SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition)
    : undefined;

export function RecordButton({
  onTranscript,
  onRecordingStop,
  onInterim,
  currentTranscript = "",
  disabled = false,
  className,
}: RecordButtonProps) {
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  /** Full transcript including any current interim (so we don't lose last phrase on stop). */
  const lastFullTranscriptRef = useRef("");
  const recordingRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const onRecordingStopRef = useRef(onRecordingStop);
  const onInterimRef = useRef(onInterim);
  const currentTranscriptRef = useRef(currentTranscript);
  currentTranscriptRef.current = currentTranscript;
  onTranscriptRef.current = onTranscript;
  onRecordingStopRef.current = onRecordingStop;
  onInterimRef.current = onInterim;
  recordingRef.current = recording;

  const startRecording = () => {
    if (!SpeechRecognitionAPI) {
      toast.error("Live transcription is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (recognitionRef.current || recordingRef.current) {
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI() as SpeechRecognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      // Keep existing text so multiple recording sessions append instead of replace
      const existing = (currentTranscriptRef.current ?? "").trim();
      transcriptRef.current = existing;
      lastFullTranscriptRef.current = existing;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let fullTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            fullTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        if (fullTranscript) {
          const trimmed = fullTranscript.trim();
          transcriptRef.current += (transcriptRef.current && trimmed ? " " : "") + trimmed;
        }

        // Always keep full = committed + current interim (so stop doesn't lose last phrase)
        const fullWithInterim =
          transcriptRef.current + (interimTranscript ? (transcriptRef.current ? " " : "") + interimTranscript : "");
        lastFullTranscriptRef.current = fullWithInterim;

        // Main transcript: only final results (stable, no bouncing)
        onTranscriptRef.current(transcriptRef.current);
        // Live preview: interim only (optional, for "Listening..." UI)
        if (onInterimRef.current) onInterimRef.current(interimTranscript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error === "not-allowed") {
          toast.error("Microphone access denied");
        } else if (event.error !== "aborted" && event.error !== "no-speech") {
          console.error("Speech recognition error:", event.error);
        }
      };

      recognition.onend = () => {
        if (recordingRef.current) {
          recordingRef.current = false;
          setRecording(false);
          recognitionRef.current = null;
          const final = lastFullTranscriptRef.current;
          transcriptRef.current = final;
          onTranscriptRef.current(final);
          onRecordingStopRef.current?.(final);
        }
      };

      recognitionRef.current = recognition;
      recordingRef.current = true;
      recognition.start();
      setRecording(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not start speech recognition");
    }
  };

  const stopRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition || !recordingRef.current) return;
    recordingRef.current = false;
    recognitionRef.current = null;
    try {
      recognition.abort();
    } catch {
      // ignore if already stopped
    }
    const final = lastFullTranscriptRef.current;
    transcriptRef.current = final;
    onTranscriptRef.current(final);
    onRecordingStopRef.current?.(final);
    setRecording(false);
  };

  return (
    <Button
      size="lg"
      variant={recording ? "destructive" : "default"}
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled}
      className={className}
    >
      {recording ? (
        <>
          <SquareIcon className="mr-2 size-5 fill-current" />
          Stop
        </>
      ) : (
        <>
          <MicIcon className="mr-2 size-5" />
          Record
        </>
      )}
    </Button>
  );
}
