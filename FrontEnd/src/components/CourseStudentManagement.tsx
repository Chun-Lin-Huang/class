import React, { useState, useEffect } from 'react';
import { asyncGet, asyncPost, asyncDelete } from '../utils/fetch';
import { api } from '../enum/api';
import { CourseStudentWithDetails, Student } from '../types/CourseStudent';
import ImportStudentsModal from './ImportStudentsModal';

interface CourseStudentManagementProps {
    courseId: string;
    courseName: string;
}

const CourseStudentManagement: React.FC<CourseStudentManagementProps> = ({
    courseId,
    courseName
}) => {
    const [students, setStudents] = useState<CourseStudentWithDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        if (courseId) {
            loadCourseStudents();
        }
    }, [courseId]);

    const loadCourseStudents = async () => {
        setLoading(true);
        try {
            const response = await asyncGet(`${api.getCourseStudents}/${courseId}`);
            if (response.code === 200) {
                setStudents(response.body || []);
            } else {
                setMessage(response.message || '載入學生列表失敗');
            }
        } catch (error) {
            console.error('Failed to load course students:', error);
            setMessage('載入學生列表失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveStudent = async (studentId: string, studentName: string) => {
        if (!window.confirm(`確定要將 ${studentName} 從課程中移除嗎？`)) {
            return;
        }

        try {
            const response = await asyncDelete(
                `${api.removeStudentFromCourse}/${courseId}/student/${studentId}`,
            );
            
            if (response.code === 200) {
                setMessage('學生已從課程中移除');
                loadCourseStudents();
            } else {
                setMessage(response.message || '移除失敗');
            }
        } catch (error) {
            console.error('Failed to remove student:', error);
            setMessage('移除失敗，伺服器錯誤');
        }
    };

    const handleImportSuccess = () => {
        loadCourseStudents();
    };

    if (loading) {
        return <div className="loading">載入中...</div>;
    }

    return (
        <div className="course-student-management">
            <div className="management-header">
                <h3>課程學生管理 - {courseName}</h3>
            </div>

            {message && (
                <div className={`message ${message.includes('成功') || message.includes('已') ? 'success' : 'error'}`}>
                    {message}
                </div>
            )}

            <div className="students-list">
                {students.length === 0 ? (
                    <div className="no-students">
                        <p>此課程尚未有學生註冊</p>
                        <button 
                            className="import-btn"
                            onClick={() => setShowImportModal(true)}
                        >
                            匯入學生
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="students-actions">
                            <button 
                                className="import-btn"
                                onClick={() => setShowImportModal(true)}
                            >
                                匯入更多學生
                            </button>
                        </div>
                        <div className="students-grid">
                            {students.map(student => (
                            <div key={student._id} className="student-card">
                                <div className="student-info">
                                    <div className="student-name">
                                        {student.studentInfo.studentInfo.name}
                                    </div>
                                    <div className="student-id">
                                        學號：{student.studentInfo.studentInfo.sid}
                                    </div>
                                    <div className="student-details">
                                        {student.studentInfo.studentInfo.department} - {student.studentInfo.studentInfo.grade} - {student.studentInfo.studentInfo.class}
                                    </div>
                                    <div className="enrollment-date">
                                        註冊時間：{new Date(student.enrolledAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <button 
                                    className="remove-btn"
                                    onClick={() => handleRemoveStudent(
                                        student.studentId, 
                                        student.studentInfo.studentInfo.name
                                    )}
                                >
                                    移除
                                </button>
                            </div>
                        ))}
                        </div>
                    </div>
                )}
            </div>

            <ImportStudentsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                courseId={courseId}
                courseName={courseName}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default CourseStudentManagement;
