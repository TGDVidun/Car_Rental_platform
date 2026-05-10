import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploadZoneProps {
    onUploadSuccess: (url: string) => void;
    onRemove: () => void;
    currentImage?: string;
}

export default function ImageUploadZone({ onUploadSuccess, onRemove, currentImage }: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/upload-image', {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                onUploadSuccess(data.url);
            } else {
                const err = await response.json().catch(() => ({}));
                console.error("Upload failed:", response.status, err);
                alert(err.detail || 'Upload failed. Please try again.');
            }
        } catch (error) {
            console.error("Upload connection error:", error);
            alert('Could not connect to the server. Please ensure the backend is running.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {currentImage ? (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative group rounded-2xl overflow-hidden border border-[#E9ECEF] aspect-video bg-[#F8F9FA]"
                    >
                        <img
                            src={currentImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all"
                            >
                                <Upload className="w-5 h-5" />
                            </button>
                            <button
                                type="button"
                                onClick={onRemove}
                                className="p-3 rounded-full bg-red-500/80 hover:bg-red-500 text-white backdrop-blur-md transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-green-600 shadow-sm border border-green-100">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Image Uploaded Successfully
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`relative rounded-3xl border-2 border-dashed transition-all cursor-pointer ${isDragging
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-[#E9ECEF] bg-[#F8F9FA] hover:border-primary/40 hover:bg-white"
                            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            className="hidden"
                            accept="image/*"
                        />

                        <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                            <div className={`p-5 rounded-2xl mb-4 transition-colors ${isDragging ? "bg-primary text-white" : "bg-white text-primary shadow-sm"}`}>
                                {uploading ? (
                                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                ) : (
                                    <ImageIcon className="w-6 h-6" />
                                )}
                            </div>

                            <h4 className="text-sm font-bold text-[#212529] mb-1">
                                {uploading ? "Uploading your photo..." : "Drag and drop vehicle image"}
                            </h4>
                            <p className="text-xs text-muted-foreground font-medium">
                                Supports: JPG, PNG, WEBP (Max 5MB)
                            </p>

                            {!uploading && (
                                <div className="mt-6 px-4 py-2 rounded-xl bg-white border border-[#E9ECEF] text-[10px] font-bold text-[#495057] shadow-sm uppercase tracking-wider group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                    Browse Files
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
