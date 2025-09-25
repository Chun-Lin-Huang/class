import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
    message, 
    type, 
    isVisible, 
    onClose, 
    duration = 3000 
}) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible) return null;

    const getToastStyles = () => {
        switch (type) {
            case 'success':
                return {
                    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                    color: '#155724',
                    borderColor: '#c3e6cb',
                    icon: '✓'
                };
            case 'error':
                return {
                    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                    color: '#721c24',
                    borderColor: '#f5c6cb',
                    icon: '✕'
                };
            case 'info':
                return {
                    background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
                    color: '#0c5460',
                    borderColor: '#bee5eb',
                    icon: 'ℹ'
                };
            default:
                return {
                    background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
                    color: '#0c5460',
                    borderColor: '#bee5eb',
                    icon: 'ℹ'
                };
        }
    };

    const styles = getToastStyles();

    return (
        <div className="toast-container">
            <div 
                className="toast"
                style={{
                    background: styles.background,
                    color: styles.color,
                    borderColor: styles.borderColor
                }}
            >
                <div className="toast-content">
                    <span className="toast-icon">{styles.icon}</span>
                    <span className="toast-message">{message}</span>
                </div>
                <button 
                    className="toast-close"
                    onClick={onClose}
                    aria-label="關閉通知"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;
