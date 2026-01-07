import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data?: string) => Promise<void>;
    userName?: string;
}

export const ApproveModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-4">
                        <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3D4852] text-center">Approve Upgrade</h3>
                    <p className="text-sm text-gray-500 text-center mt-2">
                        Are you sure you want to upgrade <span className="font-bold text-[#3D4852]">{userName}</span> to Seller?
                    </p>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 neu-flat hover:bg-gray-50">
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200 transition-all"
                    >
                        {loading ? 'Processing...' : 'Yes, Approve'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RejectModal: React.FC<ModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setLoading(true);
        try {
            await onConfirm(reason);
            onClose();
            setReason('');
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                        <XCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3D4852] text-center">Reject Upgrade</h3>
                    <p className="text-sm text-gray-500 text-center mt-2">
                        You are rejecting the request from <span className="font-bold text-[#3D4852]">{userName}</span>.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[#3D4852] mb-2">
                            Rejection Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 neu-inset rounded-xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-red-500/30 min-h-[100px]"
                            placeholder="Why is this request being rejected?"
                            required
                        />
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-gray-500 neu-flat hover:bg-gray-50">
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all"
                        >
                            {loading ? 'Processing...' : 'Reject Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
