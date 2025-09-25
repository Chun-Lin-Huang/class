import React, { useState } from 'react';
import { api } from '../enum/api';
import { asyncPost } from '../utils/fetch';

interface AddStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName: string;
    onAddSuccess: () => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
    isOpen,
    onClose,
    courseId,
    courseName,
    onAddSuccess
}) => {
    const [formData, setFormData] = useState({
        courseCode: '',
        userName: '',
        studentId: '',
        department: '',
        className: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.courseCode || !formData.userName || !formData.studentId || !formData.className) {
            setMessage('請填寫所有必填欄位');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // 創建學生資料
            const studentResponse = await asyncPost(api.createStudent, {
                studentId: formData.studentId,
                name: formData.userName,
                department: formData.department,
                grade: '',
                class: formData.className,
                email: `${formData.studentId}@student.edu`
            });

            if (studentResponse.code === 200) {
                // 然後將學生加入課程
                const enrollResponse = await asyncPost(api.enrollStudent, {
                    courseId: courseId,
                    studentId: studentResponse.body._id
                });

                if (enrollResponse.code === 200) {
                    setMessage('學生新增成功！');
                    setFormData({
                        courseCode: '',
                        userName: '',
                        studentId: '',
                        department: '',
                        className: ''
                    });
                    onAddSuccess();
                    setTimeout(() => {
                        onClose();
                    }, 1500);
                } else {
                    setMessage(enrollResponse.message || '將學生加入課程失敗');
                    console.error('加入課程失敗:', enrollResponse);
                }
            } else {
                setMessage(studentResponse.message || '創建學生資料失敗');
                console.error('創建學生資料失敗:', studentResponse);
            }
        } catch (error) {
            console.error('新增學生錯誤:', error);
            setMessage('新增學生過程中發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            courseCode: '',
            userName: '',
            studentId: '',
            department: '',
            className: ''
        });
        setMessage('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h2>新增學生 - {courseName}</h2>
                </div>
                
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="courseCode">課程代碼 *</label>
                        <input
                            type="text"
                            id="courseCode"
                            name="courseCode"
                            value={formData.courseCode}
                            onChange={handleInputChange}
                            placeholder="請輸入課程代碼"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="userName">姓名 *</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            placeholder="請輸入學生姓名"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="studentId">學號 *</label>
                        <input
                            type="text"
                            id="studentId"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleInputChange}
                            placeholder="請輸入學號"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="department">院系</label>
                            <input
                                type="text"
                                id="department"
                                name="department"
                                value={formData.department}
                                onChange={handleInputChange}
                                placeholder="請輸入院系"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="className">班級 *</label>
                            <input
                                type="text"
                                id="className"
                                name="className"
                                value={formData.className}
                                onChange={handleInputChange}
                                placeholder="請輸入班級"
                                required
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`message ${message.includes('成功') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="button" onClick={handleClose} className="modal-cancel-btn">
                            取消
                        </button>
                        <button type="submit" disabled={loading} className="modal-submit-btn">
                            {loading ? '新增中...' : '新增學生'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudentModal;
