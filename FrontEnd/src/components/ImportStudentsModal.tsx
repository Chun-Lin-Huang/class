import React, { useState, useEffect } from 'react';
import { asyncGet, asyncPost } from '../utils/fetch';
import { api } from '../enum/api';
import { Student, CourseStudentWithDetails, ImportStudentsRequest } from '../types/CourseStudent';

interface ImportStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName: string;
    onImportSuccess: () => void;
}

const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
    isOpen,
    onClose,
    courseId,
    courseName,
    onImportSuccess
}) => {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadAllStudents();
        }
    }, [isOpen]);

    const loadAllStudents = async () => {
        setLoading(true);
        try {
            const response = await asyncGet(api.getAllStudents);
            if (response.code === 200) {
                setAllStudents(response.body || []);
            } else {
                setMessage('載入學生列表失敗');
            }
        } catch (error) {
            console.error('Failed to load students:', error);
            setMessage('載入學生列表失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleStudentToggle = (studentId: string) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === allStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(allStudents.map(student => student._id));
        }
    };

    const handleImport = async () => {
        if (selectedStudents.length === 0) {
            setMessage('請選擇要匯入的學生');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const request: ImportStudentsRequest = {
                courseId,
                studentIds: selectedStudents
            };

            const response = await asyncPost(api.importStudents, request);
            if (response.code === 200) {
                setMessage(response.body.message);
                onImportSuccess();
                setTimeout(() => {
                    onClose();
                    setSelectedStudents([]);
                    setMessage('');
                }, 2000);
            } else {
                setMessage(response.message || '匯入失敗');
            }
        } catch (error) {
            console.error('Import failed:', error);
            setMessage('匯入失敗，伺服器錯誤');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>匯入學生到課程：{courseName}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="import-controls">
                        <button 
                            className="select-all-btn"
                            onClick={handleSelectAll}
                        >
                            {selectedStudents.length === allStudents.length ? '取消全選' : '全選'}
                        </button>
                        <span className="selected-count">
                            已選擇 {selectedStudents.length} 名學生
                        </span>
                    </div>

                    <div className="students-list">
                        {loading ? (
                            <div className="loading">載入中...</div>
                        ) : (
                            allStudents.map(student => (
                                <div 
                                    key={student._id} 
                                    className={`student-item ${selectedStudents.includes(student._id) ? 'selected' : ''}`}
                                    onClick={() => handleStudentToggle(student._id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(student._id)}
                                        onChange={() => handleStudentToggle(student._id)}
                                    />
                                    <div className="student-info">
                                        <div className="student-name">
                                            {student.studentInfo.name} ({student.studentInfo.sid})
                                        </div>
                                        <div className="student-details">
                                            {student.studentInfo.department} - {student.studentInfo.grade} - {student.studentInfo.class}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    {message && (
                        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <div className="modal-actions">
                        <button className="cancel-btn" onClick={onClose}>
                            取消
                        </button>
                        <button 
                            className="import-btn" 
                            onClick={handleImport}
                            disabled={loading || selectedStudents.length === 0}
                        >
                            {loading ? '匯入中...' : '匯入學生'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportStudentsModal;
