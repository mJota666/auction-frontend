import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'warning';
    isLoading?: boolean;
    autoClose?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false,
    autoClose = true
}) => {
    if (!isOpen) return null;

    const getVariantColors = () => {
        switch (variant) {
            case 'danger': return { icon: 'text-red-500', button: 'neu-btn hover:text-red-500', confirmBtn: 'bg-red-500 text-white' };
            case 'warning': return { icon: 'text-yellow-500', button: 'neu-btn hover:text-yellow-500', confirmBtn: 'bg-yellow-500 text-white' };
            default: return { icon: 'text-[#6C63FF]', button: 'neu-btn hover:text-[#6C63FF]', confirmBtn: 'neu-btn-primary text-white' };
        }
    };

    const colors = getVariantColors();

    const handleConfirm = () => {
        onConfirm();
        if (autoClose) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#E0E5EC] rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative animate-scaleIn">
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full neu-flat flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-full neu-inset flex items-center justify-center mb-6`}>
                        <AlertTriangle className={`w-10 h-10 ${colors.icon}`} />
                    </div>

                    <h3 className="text-2xl font-bold text-[#3D4852] mb-2">{title}</h3>
                    <p className="text-gray-500 mb-8">{message}</p>

                    <div className="flex gap-4 w-full">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 py-3 rounded-xl neu-flat font-bold text-gray-500 hover:text-[#3D4852] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={`flex-1 py-3 rounded-xl font-bold transition-transform hover:scale-[0.98] flex items-center justify-center ${
                                variant === 'primary' ? 'neu-btn-primary' : 'shadow-lg ' + colors.confirmBtn
                            } ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
