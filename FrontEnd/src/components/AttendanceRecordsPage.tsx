import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, AttendanceSession } from '../types/Attendance';
import { api } from '../enum/api';
import { asyncGet, asyncPatch } from '../utils/fetch';
import Toast from './Toast';

const AttendanceRecordsPage: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedSession, setExpandedSession] = useState<string | null>(null);
    const [courseStudents, setCourseStudents] = useState<any[]>([]);
    const [toast, setToast] = useState({
        message: '',
        type: 'success' as 'success' | 'error' | 'info',
        isVisible: false
    });

    useEffect(() => {
        loadCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            loadAttendanceRecords();
            loadCourseStudents();
        }
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

    const loadCourses = async () => {
        try {
            const response = await asyncGet(api.COURSES);
            if (response.code === 200) {
                setCourses(response.body || []);
            } else {
                showToast(response.message || '載入課程失敗', 'error');
            }
        } catch (error) {
            console.error('載入課程失敗:', error);
            showToast('載入課程失敗', 'error');
        }
    };

    const loadAttendanceRecords = async () => {
        if (!selectedCourse) return;
        
        try {
            setLoading(true);
            // 使用allSessions API來獲取所有點名紀錄（包括已結束的）
            const response = await asyncGet(api.allSessions);
            if (response.code === 200) {
                // 過濾出選定課程的紀錄
                const courseRecords = (response.body || []).filter((session: AttendanceSession) => 
                    session.courseId === selectedCourse
                );
                setAttendanceRecords(courseRecords);
            } else {
                showToast(response.message || '載入點名紀錄失敗', 'error');
            }
        } catch (error) {
            console.error('載入點名紀錄失敗:', error);
            showToast('載入點名紀錄失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadCourseStudents = async () => {
        if (!selectedCourse) return;
        
        try {
            const response = await asyncGet(`${api.courseStudents}/${selectedCourse}`);
            if (response.code === 200) {
                setCourseStudents(response.body || []);
            } else {
                showToast(response.message || '載入課程學生失敗', 'error');
            }
        } catch (error) {
            console.error('載入課程學生失敗:', error);
            showToast('載入課程學生失敗', 'error');
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAttendanceRate = (session: AttendanceSession) => {
        if (!session.attendedStudents || session.attendedStudents.length === 0) {
            return '0%';
        }
        const totalStudents = session.attendedStudents.length + (session.absentStudents?.length || 0) + (session.excusedStudents?.length || 0);
        if (totalStudents === 0) return '0%';
        const presentStudents = session.attendedStudents.length;
        return `${Math.round((presentStudents / totalStudents) * 100)}%`;
    };

    const getStatistics = () => {
        if (!attendanceRecords.length) {
            return {
                totalSessions: 0,
                averageRate: 0,
                totalPresent: 0,
                totalAbsent: 0
            };
        }

        const totalSessions = attendanceRecords.length;
        let totalPresent = 0;
        let totalAbsent = 0;

        attendanceRecords.forEach(session => {
            totalPresent += session.attendedStudents?.length || 0;
            totalAbsent += session.absentStudents?.length || 0;
            // 請假學生不計入缺席統計
        });

        const averageRate = totalSessions > 0 ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100) : 0;

        return {
            totalSessions,
            averageRate,
            totalPresent,
            totalAbsent
        };
    };

    const filteredRecords = attendanceRecords.filter(session => {
        if (statusFilter === 'active' && session.status !== 'active') return false;
        if (statusFilter === 'ended' && session.status !== 'ended') return false;
        if (dateFilter) {
            const sessionDate = new Date(session.startTime).toDateString();
            const filterDate = new Date(dateFilter).toDateString();
            return sessionDate === filterDate;
        }
        return true;
    });

    const toggleSessionDetails = (sessionId: string) => {
        setExpandedSession(expandedSession === sessionId ? null : sessionId);
    };

    const handleStatusChange = async (sessionId: string, studentId: string, studentName: string, newStatus: 'present' | 'absent' | 'excused') => {
        try {
            const response = await asyncPatch(api.updateAttendanceStatus, {
                sessionId,
                studentId,
                newStatus
            });

            if (response.code === 200) {
                // 更新本地狀態
                setAttendanceRecords(prevRecords => 
                    prevRecords.map(session => {
                        if (session._id === sessionId) {
                            const updatedSession = { ...session };
                            
                            // 確保數組存在
                            if (!updatedSession.attendedStudents) updatedSession.attendedStudents = [];
                            if (!updatedSession.absentStudents) updatedSession.absentStudents = [];
                            if (!updatedSession.excusedStudents) updatedSession.excusedStudents = [];
                            
                            // 從所有列表中移除學生
                            updatedSession.attendedStudents = updatedSession.attendedStudents.filter(s => s.studentId !== studentId);
                            updatedSession.absentStudents = updatedSession.absentStudents.filter(s => s.studentId !== studentId);
                            updatedSession.excusedStudents = updatedSession.excusedStudents.filter(s => s.studentId !== studentId);
                            
                            // 根據新狀態添加到對應列表
                            if (newStatus === 'present') {
                                updatedSession.attendedStudents.push({
                                    studentId,
                                    userName: studentName,
                                    checkInTime: new Date().toISOString()
                                });
                            } else if (newStatus === 'absent') {
                                updatedSession.absentStudents.push({
                                    studentId,
                                    userName: studentName
                                });
                            } else if (newStatus === 'excused') {
                                updatedSession.excusedStudents.push({
                                    studentId,
                                    userName: studentName
                                });
                            }
                            
                            return updatedSession;
                        }
                        return session;
                    })
                );
                
                showToast('學生狀態已更新', 'success');
            } else {
                showToast(response.message || '更新失敗', 'error');
            }
        } catch (error) {
            console.error('更新出席狀態失敗:', error);
            showToast('更新失敗', 'error');
        }
    };

    const getStudentCurrentStatus = (session: AttendanceSession, studentId: string) => {
        const isPresent = session.attendedStudents?.some(s => s.studentId === studentId);
        const isAbsent = session.absentStudents?.some(s => s.studentId === studentId);
        const isExcused = session.excusedStudents?.some(s => s.studentId === studentId);
        
        if (isPresent) return 'present';
        if (isAbsent) return 'absent';
        if (isExcused) return 'excused';
        return 'unmarked';
    };

    const stats = getStatistics();

    return (
        <div className="attendance-records-page">
            <div className="page-header">
                <button className="back-btn" onClick={handleBack}>
                    ← 返回主頁
                </button>
                <h1>點名紀錄</h1>
            </div>

            {/* 過濾器區域 */}
            <div className="filters-section">
                <div className="filter-group">
                    <label>選擇課程:</label>
                    <select 
                        value={selectedCourse} 
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="filter-select"
                    >
                        <option value="">請選擇課程</option>
                        {courses.map(course => (
                            <option key={course._id} value={course._id}>
                                {course.courseName} ({course.courseCode})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedCourse && (
                    <>
                        <div className="filter-group">
                            <label>狀態過濾:</label>
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="all">全部</option>
                                <option value="active">進行中</option>
                                <option value="ended">已結束</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>日期過濾:</label>
                            <input 
                                type="date" 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="filter-input"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* 統計概覽 */}
            {selectedCourse && attendanceRecords.length > 0 && (
                <div className="statistics-section">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h3>總點名次數</h3>
                            <div className="stat-number">{stats.totalSessions}</div>
                        </div>
                        <div className="stat-card">
                            <h3>平均出席率</h3>
                            <div className="stat-number">{stats.averageRate}%</div>
                        </div>
                        <div className="stat-card">
                            <h3>總出席人次</h3>
                            <div className="stat-number">{stats.totalPresent}</div>
                        </div>
                        <div className="stat-card">
                            <h3>總缺席人次</h3>
                            <div className="stat-number">{stats.totalAbsent}</div>
                        </div>
                    </div>
                </div>
            )}

            {selectedCourse && (
                <div className="records-section">
                    {loading ? (
                        <div className="loading">載入中...</div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="no-records">
                            <p>{attendanceRecords.length === 0 ? '此課程尚無點名紀錄' : '沒有符合條件的點名紀錄'}</p>
                        </div>
                    ) : (
                        <div className="records-list">
                            <div className="records-header">
                                <h3>點名紀錄列表 ({filteredRecords.length} 筆)</h3>
                                <button className="export-btn">
                                    匯出Excel
                                </button>
                            </div>
                            {filteredRecords.map((session) => (
                                <div key={session._id} className="record-card">
                                    <div className="record-header">
                                        <div className="record-title">
                                            <h4>點名會話 - {formatDate(session.startTime)}</h4>
                                            <div className="record-meta">
                                                <span className={`status ${session.status}`}>
                                                    {session.status === 'active' ? '進行中' : '已結束'}
                                                </span>
                                                <span className="attendance-rate">
                                                    出席率: {getAttendanceRate(session)}
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            className="toggle-details-btn"
                                            onClick={() => toggleSessionDetails(session._id)}
                                        >
                                            {expandedSession === session._id ? '收起詳情' : '查看詳情'}
                                        </button>
                                    </div>
                                    
                                    <div className="record-info">
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <strong>課程:</strong> {session.courseName}
                                            </div>
                                            <div className="info-item">
                                                <strong>點名方式:</strong> 
                                                {session.sessionCode.startsWith('MANUAL_') ? (
                                                    <span className="manual-mode">手動點名</span>
                                                ) : (
                                                    <span className="session-code">{session.sessionCode}</span>
                                                )}
                                            </div>
                                            <div className="info-item">
                                                <strong>開始時間:</strong> {formatDate(session.startTime)}
                                            </div>
                                            {session.endTime && (
                                                <div className="info-item">
                                                    <strong>結束時間:</strong> {formatDate(session.endTime)}
                                                </div>
                                            )}
                                            <div className="info-item">
                                                <strong>出席人數:</strong> {session.attendedStudents?.length || 0} 人
                                            </div>
                                            <div className="info-item">
                                                <strong>缺席人數:</strong> {session.absentStudents?.length || 0} 人
                                            </div>
                                            <div className="info-item">
                                                <strong>請假人數:</strong> {session.excusedStudents?.length || 0} 人
                                            </div>
                                        </div>
                                    </div>

                                    {expandedSession === session._id && (
                                        <div className="attendance-details">
                                            <div className="details-section">
                                                <h5>學生出席狀態</h5>
                                                <div className="students-list">
                                                    {courseStudents.length > 0 ? (
                                                        courseStudents.map((enrollment, index) => {
                                                            const student = enrollment.studentInfo;
                                                            if (!student) return null;
                                                            
                                                            const currentStatus = getStudentCurrentStatus(session, student.studentId);
                                                            const attendedStudent = session.attendedStudents?.find(s => s.studentId === student.studentId);
                                                            
                                                            return (
                                                                <div key={index} className={`student-record ${currentStatus}`}>
                                                                    <span className="student-name">{student.name}</span>
                                                                    <span className="student-id">{student.studentId}</span>
                                                                    <span className="student-department">
                                                                        {student.department || '-'} / {student.class || '-'}
                                                                    </span>
                                                                    <select 
                                                                        className="status-select"
                                                                        value={currentStatus}
                                                                        onChange={(e) => handleStatusChange(session._id, student._id, student.name, e.target.value as any)}
                                                                    >
                                                                        <option value="unmarked">未點名</option>
                                                                        <option value="present">出席</option>
                                                                        <option value="absent">缺席</option>
                                                                        <option value="excused">請假</option>
                                                                    </select>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="no-data">此課程暫無學生</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!selectedCourse && (
                <div className="no-course-selected">
                    <p>請先選擇一個課程來查看點名紀錄</p>
                </div>
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
            />

        </div>
    );
};

export default AttendanceRecordsPage;
