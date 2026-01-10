import React, { useRef, useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadService } from '../../services/upload';
import { toast } from 'react-toastify';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    placeholder?: string;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
    value, 
    onChange, 
    placeholder = "Click or drag to upload",
    className = ""
}) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const url = await uploadService.uploadImage(file);
            onChange(url);
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) await handleUpload(file);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering click on parent
        onChange('');
    };

    return (
        <div 
            className={`relative group cursor-pointer transition-all ${className}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
            />

            {value ? (
                // Preview State
                <div className="relative w-full h-full min-h-[200px] rounded-xl overflow-hidden neu-inset border-2 border-transparent hover:border-[#6C63FF]/50 transition-colors">
                    <img 
                        src={value} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button 
                            type="button"
                            onClick={handleRemove}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove Image"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                // Empty State
                <div className="w-full h-full min-h-[200px] rounded-xl neu-inset border-2 border-dashed border-gray-300 hover:border-[#6C63FF] transition-colors flex flex-col items-center justify-center p-6 text-gray-400 hover:text-[#6C63FF]">
                    {uploading ? (
                        <div className="flex flex-col items-center animate-pulse">
                            <Loader2 className="w-10 h-10 animate-spin mb-2" />
                            <span className="text-sm font-bold">Uploading...</span>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-10 h-10 mb-2" />
                            <p className="text-sm font-bold text-center">{placeholder}</p>
                            <p className="text-xs mt-1 text-gray-400/70">JPG, PNG (Max 5MB)</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
