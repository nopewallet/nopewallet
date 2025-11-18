"use client";

import React, { useState, useCallback } from "react";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";

interface WalletQRScannerProps {
  onAddressDetected: (address: string) => void;
  onSuccess?: () => void;
  onClose?: () => void;
}

const WalletQRScanner: React.FC<WalletQRScannerProps> = ({
  onAddressDetected,
  onSuccess,
  onClose,
}) => {
  const devices = useDevices();
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle scan results
  const handleScan = useCallback(
    (codes: any[]) => {
      if (codes && codes.length > 0) {
        // Assume the first detected code is the address
        const address = codes[0].rawValue;
        if (address) {
          onAddressDetected(address);
          setIsPaused(true); // Pause after successful scan
          if (onSuccess) onSuccess();
        }
      }
    },
    [onAddressDetected, onSuccess]
  );

  // Handle errors
  const handleError = useCallback((err: any) => {
    setError(err?.message || "Unknown error");
  }, []);

  // Custom overlay for detected QR codes
  const highlightCodeOnCanvas = useCallback((detectedCodes: any[], ctx: CanvasRenderingContext2D) => {
    detectedCodes.forEach((detectedCode) => {
      const { boundingBox, cornerPoints } = detectedCode;
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        boundingBox.x,
        boundingBox.y,
        boundingBox.width,
        boundingBox.height
      );
      ctx.fillStyle = "#FF0000";
      cornerPoints.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  }, []);

  return (
    <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center p-0 rounded-lg overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-1000 overflow-hidden rounded-lg">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          paused={isPaused}
          constraints={{
            deviceId: selectedDevice,
            facingMode: "environment",
            aspectRatio: 1,
            width: { ideal: 720 },
            height: { ideal: 720 },
          }}
          components={{
            onOff: true,
            torch: true,
            zoom: true,
            finder: true,
            tracker: highlightCodeOnCanvas,
          }}
          sound={undefined}
          classNames={{ container: "w-full h-full object-cover" }}
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      {/* Top icons and controls */}
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-between px-4 z-1000">
        {/* Error and instructions */}
      <div className="flex flex-row items-center space-x-2">
        {error && (
          <div className="mb-2 text-red-500 text-sm">{error}</div>
        )}
        <div className="text-gray-300 text-xs text-center">
          Point your camera at a QR code to scan a crypto address.
        </div>
      </div>
      <div className="flex flex-row items-center space-x-2">
        <div className="flex flex-row items-center space-x-2">
          <select
            className="rounded px-2 py-1 bg-gray-800 text-white"
            value={selectedDevice || ""}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="">Select Camera</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId}`}
              </option>
            ))}
          </select>
          <button
            className="px-3 py-1 rounded bg-blue-600 text-white"
            onClick={() => setIsPaused((p) => !p)}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-black/60 px-3 py-1 text-white"
          >
            Close
          </button>
        )}
      </div>
    </div>
      
    </div>
  );
};

export default WalletQRScanner;