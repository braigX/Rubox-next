"use client";

import { useScanRefresh } from "@/lib/use-scan-refresh";
import React, { useEffect, useRef, useState } from "react";
import { useGetScannedColors } from "../../../../lib/use-get-scanned-colors";
import { useAppStore } from "@/lib/store/store";
import { motion } from "framer-motion";
import ScanCard from "./card";

const ScanCubeStage = () => {
  const [video, setVideo] = useState<HTMLVideoElement>();
  const [canvas, setCanvas] = useState<HTMLCanvasElement>();
  const [streamStared, setStreamStarted] = useState(false);

  const { scanReversed, previewReversed, scanSize, deviceId, updateCubeScan, updateStore } = useAppStore();

  const getScannedColors = useGetScannedColors({ video, canvas });
  useScanRefresh({ getScannedColors });

  const inited = useRef(false);

  useEffect(() => {
    if (inited.current) return;
    inited.current = true;
    const videoEl = document.querySelector("video") as HTMLVideoElement;
    const canvasEl = document.querySelector("#canvas-scan") as HTMLCanvasElement;

    setVideo(videoEl);
    setCanvas(canvasEl);

    const fn = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { ideal: deviceId },
            aspectRatio: 9 / 16,
            height: 1280,
          },
        });

        videoEl.srcObject = stream;
        videoEl.play();
      } catch (error) {
        if (error instanceof OverconstrainedError) {
          console.error("Constraints cannot be satisfied by available devices:", error);
        }
      }
    };

    fn();
  }, []);

  const onVideoCanPlay = () => {
    setStreamStarted(true);
    if (!streamStared) {
      updateStore({ isScanRefreshing: true });
      updateCubeScan([]);
    }
  };

  const handleGoBack = () => {
    window.location.reload(); // Reloads the page to go back to InitPage
  };

  return (
    <div>
      <motion.div
        className="flex w-screen h-screen relative items-center justify-center"
        initial={{ opacity: 0 }}
        animate={streamStared ? { opacity: 1, transition: { delay: 0.5 } } : { opacity: 0 }}
        exit={{ opacity: 0 }}
      >
        <motion.video
          autoPlay
          className={scanReversed || previewReversed ? "-scale-x-100" : undefined}
          onCanPlay={onVideoCanPlay}
          playsInline
        />
        <ScanCard />
        {streamStared && (
          <div
            className="absolute grid grid-cols-3 grid-rows-3 [&_div]:border-2 [&_div]:border-zinc-900 rounded-lg border-2 border-zinc-900 border-collapse overflow-hidden opacity-70"
            style={{ width: `${scanSize}px`, height: `${scanSize}px` }}
          >
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        )}
      </motion.div>

      <canvas id="canvas-scan" className={`hidden ${scanReversed ? "-scale-x-100" : ""}`} />

      {/* Go Back Button */}
      <button
        onClick={handleGoBack}
        className="absolute top-4 left-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Go Back
      </button>
    </div>
  );
};

ScanCubeStage.displayName = "ScanCubeStage";

export default ScanCubeStage;
