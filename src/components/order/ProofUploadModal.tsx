import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { uploadService } from '../../services/upload';
import { toast } from 'react-toastify';

interface ProofUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (url: string) => Promise<void>;
    customTitle?: string;
    customMessage?: string;
}

export const ProofUploadModal: React.FC<ProofUploadModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm,
    customTitle = "Upload Proof",
    customMessage = "Please upload an image of your receipt/invoice."
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setUrlInput('');
        }
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrlInput(e.target.value);
        setPreviewUrl(e.target.value);
        setFile(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFile = e.dataTransfer.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setUrlInput('');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleSubmit = async () => {
        if (!file && !urlInput) {
            toast.error("Please select a file or enter a URL");
            return;
        }

        setUploading(true);
        try {
            let finalUrl = urlInput;
            
            if (file) {
                // Upload to Cloudinary
                finalUrl = await uploadService.uploadImage(file);
            }

            // Send to Backend
            await onConfirm(finalUrl);
            toast.success("Proof uploaded successfully!");
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const reset = () => {
        setFile(null);
        setPreviewUrl(null);
        setUrlInput('');
        setUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#E0E5EC] w-full max-w-md rounded-3xl p-8 neu-extruded shadow-2xl relative">
                <button 
                    onClick={reset}
                    className="absolute top-4 right-4 p-2 rounded-full neu-flat text-gray-500 hover:text-red-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-2xl font-bold text-[#3D4852] mb-2">{customTitle}</h3>
                <p className="text-sm text-gray-500 mb-6">{customMessage}</p>

                {/* Preview Area */}
                <div 
                    className={`w-full h-48 rounded-2xl neu-inset mb-6 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer border-2 border-dashed ${file || urlInput ? 'border-green-400' : 'border-gray-300 hover:border-[#6C63FF]'}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => !previewUrl && fileInputRef.current?.click()}
                >
                    {previewUrl ? (
                        <>
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-sm">Click to Change</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm font-bold text-gray-500">Click or Drop image here</p>
                            <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                </div>

                {/* OR divider */}
                <div className="relative flex py-2 items-center mb-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* URL Input */}
                <div className="mb-8">
                     <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text"
                            value={urlInput}
                            onChange={handleUrlChange}
                            placeholder="Paste image URL directly..."
                            className="w-full pl-10 pr-4 py-3 rounded-xl neu-inset text-sm font-medium text-[#3D4852] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
                        />
                     </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button 
                        onClick={reset}
                        disabled={uploading}
                        className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={uploading || (!file && !urlInput)}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-[#6C63FF] shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Confirm
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
