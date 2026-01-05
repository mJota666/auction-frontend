import React, { useState } from 'react';
import { X, Briefcase } from 'lucide-react';
import { authService } from '../services/auth';
import { toast } from 'react-toastify';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!reason.trim()) {
            toast.error('Please provide a reason for your request');
            return;
        }

        setLoading(true);
        try {
            await authService.requestSellerUpgrade(reason);
            toast.success('Upgrade request sent successfully! Admin will review shortly.');
            onClose();
            setReason('');
        } catch (error: any) {
             console.error("Upgrade request failed", error);
             if (error.response?.data?.code === 1006) {
                 toast.info('Bạn đã gửi yêu cầu rồi, vui lòng chờ Admin duyệt');
             } else {
                 toast.error(error.response?.data?.message || 'Failed to send request');
             }
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

                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-[#6C63FF] mb-4">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-[#3D4852] text-center">
                        Become a Seller
                    </h3>
                    <p className="text-sm text-gray-500 text-center mt-2 max-w-xs">
                        Start selling your own auctions on our platform. Tell us why you want to join!
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[#3D4852] mb-2">
                            Reason for Upgrade <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-4 py-3 neu-inset rounded-xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 min-h-[120px]"
                            placeholder="I have a collection of vintage items I'd like to auction..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-[#6C63FF] hover:bg-[#5a52d5] shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-1"
                    >
                        {loading ? 'Sending Request...' : 'Submit Agency Request'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpgradeModal;
