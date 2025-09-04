import React, { useState, useRef, useEffect } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import Input from "../ui/Input";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  title?: string;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = "اسکن بارکد",
}) => {
  const [manualInput, setManualInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [scanResult, setScanResult] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  const startCamera = async () => {
    try {
      setError("");
      setScanResult("");
      setIsScanning(true);

      // Initialize the barcode reader
      if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Back camera for mobile
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Start scanning
        try {
          codeReaderRef.current.decodeFromVideoDevice(
            null, // Use default video device
            videoRef.current,
            (result, error) => {
              if (result) {
                const scannedText = result.getText();
                setScanResult(scannedText);
                onScan(scannedText);
                stopCamera();
                onClose();
              }
              if (error && !(error instanceof NotFoundException)) {
                console.warn("Barcode scan error:", error);
              }
            }
          );
        } catch (scanError) {
          console.warn("Failed to start barcode scanning:", scanError);
        }
      }
    } catch (err) {
      setError("دسترسی به دوربین امکان‌پذیر نیست");
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput("");
      onClose();
    }
  };

  const handleModalClose = () => {
    stopCamera();
    setManualInput("");
    setScanResult("");
    setError("");
    onClose();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} title={title} size="md">
      <div className="space-y-6">
        {/* Camera Scanner */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            اسکن با دوربین
          </h3>

          {!isScanning ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Icon
                name="camera"
                size={48}
                className="mx-auto text-gray-400 mb-4"
              />
              <p className="text-gray-600 mb-4">
                برای اسکن بارکد، دوربین را روشن کنید
              </p>
              <Button
                onClick={startCamera}
                className="flex items-center mx-auto"
              >
                <Icon name="camera" size={16} className="ml-2" />
                روشن کردن دوربین
              </Button>
            </div>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 bg-gray-900 rounded-lg object-cover"
                autoPlay
                playsInline
                muted
              />

              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-32 border-2 border-primary-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500"></div>

                  {/* Scanning line animation */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 opacity-80 animate-pulse"></div>
                </div>
              </div>

              {/* Scanning status */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                <Icon name="camera" size={14} className="inline ml-1" />
                در حال اسکن...
              </div>

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <Button variant="outline" onClick={stopCamera}>
                  توقف
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center text-red-600 text-sm">
              <Icon name="alert-circle" size={16} className="ml-2" />
              {error}
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ورود دستی بارکد
          </h3>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <Input
              label="کد بارکد"
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="بارکد یا کد محصول را وارد کنید"
              className="font-mono"
            />

            <div className="flex justify-end space-x-3 space-x-reverse">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={!manualInput.trim()}>
                تأیید
              </Button>
            </div>
          </form>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">راهنمای استفاده:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• بارکد را در مرکز کادر قرار دهید</li>
            <li>• از فاصله مناسب (10-30 سانتی‌متر) نگه دارید</li>
            <li>• محیط نور کافی داشته باشد</li>
            <li>• دوربین را ثابت نگه دارید</li>
            <li>
              • انواع بارکد: QR Code، Code128، Code39، EAN13 پشتیبانی می‌شود
            </li>
            <li>• در صورت مشکل، از ورود دستی استفاده کنید</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeScanner;
