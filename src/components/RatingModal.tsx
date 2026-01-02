import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetUserId: number;
    targetUserName: string;
    orderId?: number;
    onSuccess?: () => void;
    isCancellation?: boolean; // If true, this is a cancellation penalty (-1 auto)
}

const RatingModal: React.FC<RatingModalProps> = ({ 
    isOpen, onClose, targetUserId, targetUserName, orderId, onSuccess, isCancellation = false 
}) => {
    const [score, setScore] = useState<number>(isCancellation ? -1 : 0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (score === 0 && !isCancellation) {
            toast.error('Please select Thumbs Up or Thumbs Down');
            return;
        }

        if (!comment.trim()) {
            toast.error('Please provide a comment');
            return;
        }

        setLoading(true);
        try {
            await authService.rateUser(targetUserId, score, comment, orderId);
            toast.success(isCancellation ? 'Order cancelled and penalty applied' : 'Rating submitted successfully');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
             console.error("Rating failed", error);
             toast.error(error.response?.data?.message || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-200">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-bold text-[#3D4852] mb-2">
                    {isCancellation ? 'Cancel & Penalize' : 'Rate User'}
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    {isCancellation 
                        ? `You are cancelling order #${orderId}. This will automatically give a -1 rating to ${targetUserName}.` 
                        : `Share your experience with ${targetUserName}`}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isCancellation && (
                        <div className="flex justify-center gap-8">
                            <button
                                type="button"
                                onClick={() => setScore(1)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                                    score === 1 
                                        ? 'bg-green-100 ring-2 ring-green-500 text-green-700 transform scale-110' 
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                }`}
                            >
                                <ThumbsUp className={`w-8 h-8 ${score === 1 ? 'fill-current' : ''}`} />
                                <span className="font-bold text-sm">Valid (+1)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setScore(-1)}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                                    score === -1 
                                        ? 'bg-red-100 ring-2 ring-red-500 text-red-700 transform scale-110' 
                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                }`}
                            >
                                <ThumbsDown className={`w-8 h-8 ${score === -1 ? 'fill-current' : ''}`} />
                                <span className="font-bold text-sm">Invalid (-1)</span>
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-[#3D4852] mb-2">
                            Comment <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full px-4 py-3 neu-inset rounded-xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 min-h-[100px]"
                            placeholder={isCancellation ? "Reason for cancellation (e.g., Buyer did not pay)" : "Describe your experience..."}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all transform hover:-translate-y-1 ${
                            isCancellation 
                                ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                                : 'bg-[#6C63FF] hover:bg-[#5a52d5] shadow-indigo-200'
                        }`}
                    >
                        {loading ? 'Processing...' : (isCancellation ? 'Confirm Cancellation' : 'Submit Rating')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RatingModal;
