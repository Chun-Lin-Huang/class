import React, { useState } from 'react';
import { api } from '../enum/api';
import { asyncPatch } from '../utils/fetch';

interface AttendanceStatusEditorProps {
    sessionId: string;
    studentId: string;
    studentName: string;
    currentStatus: 'present' | 'absent' | 'excused' | 'unmarked';
    onStatusChange: (newStatus: 'present' | 'absent' | 'excused') => void;
    onClose: () => void;
}

const AttendanceStatusEditor: React.FC<AttendanceStatusEditorProps> = ({
    sessionId,
    studentId,
    studentName,
    currentStatus,
    onStatusChange,
    onClose
}) => {
    const [selectedStatus, setSelectedStatus] = useState<'present' | 'absent' | 'excused'>(currentStatus as any || 'absent');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (selectedStatus === currentStatus) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            const response = await asyncPatch(api.updateAttendanceStatus, {
                sessionId,
                studentId,
                newStatus: selectedStatus
            });

            if (response.code === 200) {
                onStatusChange(selectedStatus);
                onClose();
            } else {
                alert(response.message || '更新失敗');
            }
        } catch (error) {
            console.error('更新出席狀態失敗:', error);
            alert('更新失敗');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: 'present', label: '出席', color: '#28a745' },
        { value: 'absent', label: '缺席', color: '#dc3545' },
        { value: 'excused', label: '請假', color: '#ffc107' }
    ];

    const getCurrentStatusDisplay = () => {
        switch (currentStatus) {
            case 'present':
                return { text: '出席', class: 'present' };
            case 'absent':
                return { text: '缺席', class: 'absent' };
            case 'excused':
                return { text: '請假', class: 'excused' };
            default:
                return { text: '未點名', class: 'unmarked' };
        }
    };

    const currentStatusDisplay = getCurrentStatusDisplay();

    return (
        <div className="status-editor-modal">
            <div className="modal-overlay" onClick={onClose}></div>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>編輯學生出席狀態</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="modal-body">
                    <div className="student-info">
                        <div className="info-row">
                            <span className="info-label">學生姓名:</span>
                            <span className="info-value">{studentName}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">學號:</span>
                            <span className="info-value">{studentId}</span>
                        </div>
                    </div>
                    
                    <div className="current-status-display">
                        <div className="status-header">
                            <strong>目前狀態</strong>
                        </div>
                        <div className={`status-badge ${currentStatusDisplay.class}`}>
                            {currentStatusDisplay.text}
                        </div>
                    </div>
                    
                    <div className="status-selection">
                        <div className="selection-header">
                            <strong>調整狀態</strong>
                        </div>
                        <select 
                            className="status-dropdown"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as any)}
                        >
                            {statusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="modal-footer">
                    <button 
                        className="cancel-btn" 
                        onClick={onClose}
                        disabled={loading}
                    >
                        取消
                    </button>
                    <button 
                        className="save-btn" 
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? '更新中...' : '確認更新'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceStatusEditor;
