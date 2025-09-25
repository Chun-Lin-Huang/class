import React, { useState } from 'react';
import { api } from '../enum/api';
import { asyncPost } from '../utils/fetch';

interface ImportCSVModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName: string;
    onImportSuccess: () => void;
}

const ImportCSVModal: React.FC<ImportCSVModalProps> = ({
    isOpen,
    onClose,
    courseId,
    courseName,
    onImportSuccess
}) => {
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [importResult, setImportResult] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'text/csv') {
            setCsvFile(file);
            setMessage('');
            setImportResult(null);
        } else {
            setMessage('請選擇有效的CSV文件');
        }
    };

    const handleImport = async () => {
        if (!csvFile) {
            setMessage('請選擇CSV文件');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const csvText = await csvFile.text();
            
            const response = await asyncPost(api.importStudentsCSV, {
                courseId,
                csvData: csvText
            });

            if (response.code === 200) {
                setImportResult(response.body);
                setMessage('CSV匯入完成！');
                onImportSuccess();
            } else {
                setMessage(response.message || '匯入失敗');
            }
        } catch (error) {
            console.error('CSV匯入錯誤:', error);
            setMessage('匯入過程中發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCsvFile(null);
        setMessage('');
        setImportResult(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>CSV匯入學生 - {courseName}</h2>
                </div>
                
                <div className="modal-form">
                    <div className="form-group">
                        <label>選擇CSV文件:</label>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <small className="help-text">
                            支持的CSV格式：必須包含學號(student_id)和姓名字段(name)<br/>
                            建議格式：course_id, student_id, name, department, class<br/>
                            如果學生不存在，系統會自動創建新學生
                        </small>
                    </div>

                    {csvFile && (
                        <div className="file-info">
                            <p><strong>已選擇文件:</strong> {csvFile.name}</p>
                            <p><strong>文件大小:</strong> {(csvFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                    )}

                    {message && (
                        <div className={`message ${message.includes('完成') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    {importResult && (
                        <div className="import-result">
                            <h3>匯入結果</h3>
                            <div className="result-stats">
                                <div className="stat-item success">
                                    <span className="stat-number">{importResult.successCount}</span>
                                    <span className="stat-label">成功</span>
                                </div>
                                <div className="stat-item error">
                                    <span className="stat-number">{importResult.failureCount}</span>
                                    <span className="stat-label">失敗</span>
                                </div>
                            </div>
                            
                            {importResult.errors && importResult.errors.length > 0 && (
                                <div className="error-list">
                                    <h4>錯誤詳情:</h4>
                                    <ul>
                                        {importResult.errors.slice(0, 10).map((error: string, index: number) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                        {importResult.errors.length > 10 && (
                                            <li>...還有 {importResult.errors.length - 10} 個錯誤</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={!csvFile || loading}
                            className="modal-submit-btn"
                        >
                            {loading ? '匯入中...' : '開始匯入'}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="modal-cancel-btn"
                        >
                            關閉
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportCSVModal;
