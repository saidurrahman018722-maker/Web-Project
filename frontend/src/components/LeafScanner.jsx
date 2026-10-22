import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function LeafScanner({ onDiagnosisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const sampleImages = [
    { name: 'Healthy Tomato', path: '/test_samples/sample_leaf.jpg', label: 'Healthy Control' },
    { name: 'Potato Early Blight', path: '/test_samples/potato_early_blight.jpg', label: 'Blight Spots' },
    { name: 'Corn Common Rust', path: '/test_samples/corn_common_rust.jpg', label: 'Rust Pustules' },
    { name: 'Apple Scab', path: '/test_samples/apple_scab.jpg', label: 'Scab Lesions' },
  ];

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, or WEBP).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError('File size exceeds the 15 MB limit.');
      return;
    }

    setError(null);
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = async (sample) => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch sample image from local server and convert to File object
      const res = await fetch(sample.path);
      const blob = await res.blob();
      const filename = sample.path.split('/').pop();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      handleFile(file);
    } catch (err) {
      setError('Failed to load sample image. Please try uploading your own.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiagnose = async () => {
    if (!selectedFile) {
      setError('Please upload or select a leaf photo first.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await api.diagnoseLeaf(selectedFile, notes);
      onDiagnosisComplete(result);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Diagnosis failed. Please verify that the Go backend and ML microservice are running.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setNotes('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          AI Plant Disease <span className="text-emerald-600">Diagnosis</span>
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
          Upload a high-resolution photo of a crop or plant leaf. Our PyTorch computer vision engine instantly analyzes symptoms and prescribes organic & chemical treatments.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
        </div>
      )}

      {/* Upload & Scanner Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Dropzone */}
        {!previewUrl ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-4 ${
              isDragging
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/80'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-base sm:text-lg">
                Drag and drop your leaf photo here
              </p>
              <p className="text-xs text-slate-500">
                Supports JPEG, PNG, WEBP up to 15 MB
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs sm:text-sm hover:bg-emerald-700 transition shadow-sm"
            >
              Browse Files
            </button>
          </div>
        ) : (
          /* Image Preview State */
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video max-h-[380px] flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Selected Leaf Preview"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Change Photo
                </button>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Optional Notes (Symptoms, Location, Crop Age)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Lower leaves turning yellow with brown spots on greenhouse tomato"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Action Button */}
        {previewUrl && (
          <button
            type="button"
            disabled={isLoading}
            onClick={handleDiagnose}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-base hover:from-emerald-700 hover:to-green-700 transition duration-150 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Running PyTorch MobileNetV2 Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Diagnose Plant Disease</span>
              </>
            )}
          </button>
        )}

        {/* Quick Demo Test Samples */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-emerald-600" />
            Quick Demo Samples (Click to test with 1-click):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {sampleImages.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSampleClick(sample)}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                  {sample.name}
                </p>
                <p className="text-[10px] text-slate-500">{sample.label}</p>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
