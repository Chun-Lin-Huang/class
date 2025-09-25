import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AttendanceSession, Course } from '../types/Attendance';
import { api } from '../enum/api';
import { asyncPost, asyncGet } from '../utils/fetch';
import Toast from './Toast';

const AdminDashboard: React.FC = () => {
    const { } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{
        message: string;
        type: 'success' | 'error' | 'info';
        isVisible: boolean;
    }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        loadActiveSessions();
    }, [selectedCourse]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({
            message,
            type,
            isVisible: true
        });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, isVisible: false }));
    };

    const handleManageStudents = () => {
        if (!selectedCourse) {
            showToast('請先選擇課程', 'error');
            return;
        }
        navigate(`/student-management/${selectedCourse}`);
    };

    const loadCourses = async () => {
        try {
            const response = await asyncGet(api.courses);
            if (response.code === 200) {
                setCourses(response.body || []);
            } else {
                console.error('Failed to load courses:', response.message);
            }
        } catch (error) {
            console.error('Failed to load courses:', error);
        }
    };

    const loadActiveSessions = async () => {
        try {
            const response = await asyncGet(api.activeSessions);
            if (response.code === 200) {
                const allSessions = response.body || [];
                // 只顯示選擇的課程的活躍會話
                if (selectedCourse) {
                    const filteredSessions = allSessions.filter((session: any) => 
                        session.courseId === selectedCourse
                    );
                    setActiveSessions(filteredSessions);
                } else {
                    setActiveSessions([]);
                }
            } else {
                console.error('Failed to load active sessions:', response.message);
                setActiveSessions([]);
            }
        } catch (error) {
            console.error('Failed to load active sessions:', error);
            setActiveSessions([]);
        }
    };

    const startAttendanceSession = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCourse) {
            setMessage('請選擇課程');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const response = await asyncPost(
                api.startSession,
                {
                    courseId: selectedCourse,
                    sessionDate: new Date(sessionDate).toISOString()
                },
            );

            if (response.code === 200) {
                showToast(`點名已開始！點名碼: ${response.body?.sessionCode}`, 'success');
                loadActiveSessions();
            } else {
                showToast(response.message || '開始點名失敗', 'error');
            }
        } catch (error) {
            showToast('開始點名失敗，請重試', 'error');
        } finally {
            setLoading(false);
        }
    };

    const endAttendanceSession = async (sessionId: string) => {
        setLoading(true);
        setMessage('');

        try {
            const response = await asyncPost(
                `${api.endSession}/${sessionId}`,
                {},
            );

            if (response.code === 200) {
                showToast('點名已結束', 'success');
                loadActiveSessions();
            } else {
                showToast(response.message || '結束點名失敗', 'error');
            }
        } catch (error) {
            showToast('結束點名失敗，請重試', 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('zh-TW');
    };

    return (
        <div className="admin-dashboard">
            <div className="top-controls">
                <div className="start-attendance-section">
                    <h3>開始點名</h3>
                    <form onSubmit={startAttendanceSession}>
                        <div className="form-group">
                            <label>選擇課程:</label>
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                required
                            >
                                <option value="">請選擇課程</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseName} ({course.courseCode})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>點名日期:</label>
                            <input
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading}>
                            {loading ? '處理中...' : '開始點名'}
                        </button>
                    </form>
                </div>

                <div className="student-management-section">
                    <h3>學生管理</h3>
                    <div className="management-content">
                        <p>管理課程學生資料</p>
                        <div className="management-actions">
                            <select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                className="course-selector"
                            >
                                <option value="">請選擇課程</option>
                                {courses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseName} ({course.courseCode})
                                    </option>
                                ))}
                            </select>
                            <button 
                                className="manage-students-btn"
                                onClick={handleManageStudents}
                                disabled={!selectedCourse}
                            >
                                管理學生
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="active-sessions-section">
                <h3>進行中的點名</h3>
                
                {activeSessions.length > 0 ? (
                    <div className="sessions-list">
                        {activeSessions.map((session) => (
                            <div key={session._id} className="session-item">
                                <div className="session-info">
                                    <div>課程: {session.courseName}</div>
                                    <div>開始時間: {formatDate(session.startTime)}</div>
                                    <div className="attendance-code">
                                        點名碼: <strong>{session.sessionCode}</strong>
                                    </div>
                                    <div>已點名人數: {session.attendedStudents?.length || 0}</div>
                                </div>
                                <button
                                    onClick={() => endAttendanceSession(session._id)}
                                    className="end-session-btn"
                                >
                                    結束點名
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>目前沒有進行中的點名</p>
                )}
            </div>



            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={4000}
            />
        </div>
    );
};

export default AdminDashboard;
