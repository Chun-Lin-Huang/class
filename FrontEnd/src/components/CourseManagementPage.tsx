import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Course } from '../types/Attendance';
import { api } from '../enum/api';
import { asyncGet, asyncPost, asyncPatch, asyncDelete } from '../utils/fetch';
import Toast from './Toast';

const CourseManagementPage: React.FC = () => {
    const { } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error' | 'info', isVisible: false });

    const [formData, setFormData] = useState({
        courseName: '',
        courseCode: '',
        teacher: '',
        semester: '',
        description: '',
        schedule: {
            dayOfWeek: '',
            startTime: '',
            endTime: ''
        }
    });

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const response = await asyncGet(api.COURSES);
            if (response.code === 200) {
                setCourses(response.body || []);
            } else {
                showToast(response.message || '載入課程失敗', 'error');
            }
        } catch (error) {
            console.error('載入課程失敗:', error);
            showToast('載入課程失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message: string, type: 'success' | 'error' | 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const hideToast = () => {
        setToast({ ...toast, isVisible: false });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('schedule.')) {
            const scheduleField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                schedule: {
                    ...prev.schedule,
                    [scheduleField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // 轉換dayOfWeek為數字
            const submitData = {
                ...formData,
                schedule: {
                    ...formData.schedule,
                    dayOfWeek: getDayOfWeekNumber(formData.schedule.dayOfWeek)
                }
            };

            if (editingCourse) {
                // 更新課程
                const response = await asyncPatch(`${api.COURSES}/${editingCourse._id}`, submitData);
                if (response.code === 200) {
                    showToast('課程更新成功', 'success');
                    loadCourses();
                    setShowAddModal(false);
                    setEditingCourse(null);
                    resetForm();
                } else {
                    showToast(response.message || '更新失敗', 'error');
                }
            } else {
                // 新增課程
                const response = await asyncPost(api.COURSES, submitData);
                if (response.code === 200) {
                    showToast('課程新增成功', 'success');
                    loadCourses();
                    setShowAddModal(false);
                    resetForm();
                } else {
                    showToast(response.message || '新增失敗', 'error');
                }
            }
        } catch (error) {
            console.error('操作失敗:', error);
            showToast('操作失敗', 'error');
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            courseName: course.courseName,
            courseCode: course.courseCode,
            teacher: course.teacher || '',
            semester: course.semester || '',
            schedule: {
                dayOfWeek: getDayOfWeekString(course.schedule?.dayOfWeek || 0),
                startTime: course.schedule?.startTime || '',
                endTime: course.schedule?.endTime || ''
            }
        });
        setShowAddModal(true);
    };

    const handleDelete = async (courseId: string) => {
        if (window.confirm('確定要刪除這個課程嗎？')) {
            try {
                const response = await asyncDelete(`${api.COURSES}/${courseId}`);
                if (response.code === 200) {
                    showToast('課程刪除成功', 'success');
                    loadCourses();
                } else {
                    showToast(response.message || '刪除失敗', 'error');
                }
            } catch (error) {
                console.error('刪除失敗:', error);
                showToast('刪除失敗', 'error');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            courseName: '',
            courseCode: '',
            teacher: '',
            semester: '',
            description: '',
            schedule: {
                dayOfWeek: '',
                startTime: '',
                endTime: ''
            }
        });
        setEditingCourse(null);
    };

    const handleBack = () => {
        navigate('/');
    };

    const getDayOfWeekNumber = (dayString: string): number => {
        const dayMap: { [key: string]: number } = {
            'Sunday': 0,
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6
        };
        return dayMap[dayString] || 0;
    };

    const getDayOfWeekString = (dayNumber: number): string => {
        const dayMap: { [key: number]: string } = {
            0: 'Sunday',
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday'
        };
        return dayMap[dayNumber] || 'Monday';
    };

    if (loading) {
        return (
            <div className="course-management-page">
                <div className="loading">載入中...</div>
            </div>
        );
    }

    return (
        <div className="course-management-page">
            <div className="page-header">
                <h1>課程管理</h1>
            </div>

            <div className="management-tools">
                <button 
                    className="add-btn"
                    onClick={() => {
                        resetForm();
                        setShowAddModal(true);
                    }}
                >
                    + 新增課程
                </button>
            </div>

            <div className="courses-list">
                {courses.length === 0 ? (
                    <div className="no-courses">
                        <p>目前沒有課程</p>
                    </div>
                ) : (
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <div key={course._id} className="course-card">
                                <div className="course-header">
                                    <h3>{course.courseName}</h3>
                                    <span className="course-code">{course.courseCode}</span>
                                </div>
                                <div className="course-info">
                                    <p><strong>課程代碼:</strong> {course.courseCode}</p>
                                    {course.schedule && (
                                        <p><strong>上課時間:</strong> {course.schedule.dayOfWeek} {course.schedule.startTime}-{course.schedule.endTime}</p>
                                    )}
                                </div>
                                <div className="course-actions">
                                    <button 
                                        className="edit-btn"
                                        onClick={() => handleEdit(course)}
                                    >
                                        編輯
                                    </button>
                                    <button 
                                        className="delete-btn"
                                        onClick={() => handleDelete(course._id)}
                                    >
                                        刪除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="page-footer">
                <button className="back-btn" onClick={handleBack}>
                    ← 返回
                </button>
            </div>

            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingCourse ? '編輯課程' : '新增課程'}</h2>
                            <button 
                                className="close-btn"
                                onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label>課程名稱 *</label>
                                <input
                                    type="text"
                                    name="courseName"
                                    value={formData.courseName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>課程代碼 *</label>
                                <input
                                    type="text"
                                    name="courseCode"
                                    value={formData.courseCode}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>教師 *</label>
                                <input
                                    type="text"
                                    name="teacher"
                                    value={formData.teacher}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>學期 *</label>
                                <input
                                    type="text"
                                    name="semester"
                                    value={formData.semester}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>課程描述</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                />
                            </div>
                            <div className="form-group">
                                <label>上課星期</label>
                                <select
                                    name="schedule.dayOfWeek"
                                    value={formData.schedule.dayOfWeek}
                                    onChange={handleInputChange}
                                >
                                    <option value="">請選擇</option>
                                    <option value="Monday">星期一</option>
                                    <option value="Tuesday">星期二</option>
                                    <option value="Wednesday">星期三</option>
                                    <option value="Thursday">星期四</option>
                                    <option value="Friday">星期五</option>
                                    <option value="Saturday">星期六</option>
                                    <option value="Sunday">星期日</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>開始時間</label>
                                    <input
                                        type="time"
                                        name="schedule.startTime"
                                        value={formData.schedule.startTime}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>結束時間</label>
                                    <input
                                        type="time"
                                        name="schedule.endTime"
                                        value={formData.schedule.endTime}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => {
                                    setShowAddModal(false);
                                    resetForm();
                                }}>
                                    取消
                                </button>
                                <button type="submit">
                                    {editingCourse ? '更新' : '新增'}
                                </button>
                            </div>
                        </form>
                    </div>
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

export default CourseManagementPage;
