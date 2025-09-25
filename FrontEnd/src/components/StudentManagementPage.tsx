import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { asyncGet, asyncPost, asyncDelete } from '../utils/fetch';
import { api } from '../enum/api';
import { CourseStudentWithDetails, Student } from '../types/CourseStudent';
import { Course } from '../types/Attendance';
import ImportStudentsModal from './ImportStudentsModal';
import ImportCSVModal from './ImportCSVModal';
import AddStudentModal from './AddStudentModal';
import Toast from './Toast';

const StudentManagementPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [course, setCourse] = useState<Course | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<CourseStudentWithDetails[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCSVModal, setShowCSVModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('');
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
        if (courseId) {
            loadCourseInfo();
            loadCourseStudents();
            loadAllStudents();
        }
    }, [courseId]);

    const loadCourses = async () => {
        try {
            const response = await asyncGet(api.courses);
            if (response.code === 200) {
                setCourses(response.body || []);
            } else {
                showToast('載入課程列表失敗', 'error');
            }
        } catch (error) {
            console.error('Failed to load courses:', error);
            showToast('載入課程列表失敗', 'error');
        }
    };

    const loadCourseInfo = async () => {
        try {
            const currentCourse = courses.find((c: Course) => c._id === courseId);
            if (currentCourse) {
                setCourse(currentCourse);
            } else {
                showToast('課程不存在', 'error');
                navigate('/student-management');
            }
        } catch (error) {
            console.error('Failed to load course info:', error);
            showToast('載入課程信息失敗', 'error');
            navigate('/student-management');
        }
    };

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

    const loadCourseStudents = async () => {
        setLoading(true);
        try {
            const response = await asyncGet(`${api.getCourseStudents}/${courseId}`);
            if (response.code === 200) {
                setStudents(response.body || []);
            } else {
                showToast(response.message || '載入學生列表失敗', 'error');
            }
        } catch (error) {
            console.error('Failed to load course students:', error);
            showToast('載入學生列表失敗', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAllStudents = async () => {
        try {
            const response = await asyncGet(api.getAllStudents);
            if (response.code === 200) {
                setAllStudents(response.body || []);
            }
        } catch (error) {
            console.error('Failed to load all students:', error);
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
                showToast('學生已從課程中移除', 'success');
                loadCourseStudents();
            } else {
                showToast(response.message || '移除失敗', 'error');
            }
        } catch (error) {
            console.error('Failed to remove student:', error);
            showToast('移除失敗，伺服器錯誤', 'error');
        }
    };

    const handleImportSuccess = () => {
        loadCourseStudents();
        showToast('學生匯入成功', 'success');
    };

    const handleBack = () => {
        navigate('/');
    };

    // 過濾學生
    const filteredStudents = students.filter(student => {
        const studentInfo = student.studentInfo; // Now directly access studentInfo
        if (!studentInfo) return false;
        
        const matchesSearch = studentInfo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            studentInfo.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = !filterClass || studentInfo.class === filterClass;
        
        return matchesSearch && matchesClass;
    });

    // 獲取所有班級的選項
    const classes = [...new Set(students.map(s => s.studentInfo?.class).filter(Boolean))].sort();

    if (loading) {
        return (
            <div className="student-management-page">
                <div className="loading">載入中...</div>
            </div>
        );
    }

    // 如果沒有選擇課程，顯示課程選擇界面
    if (!courseId) {
        return (
            <div className="student-management-page">
                <div className="page-header">
                    <button className="back-btn" onClick={handleBack}>
                        ← 返回
                    </button>
                    <h1>學生管理</h1>
                </div>

                <div className="course-selection">
                    <h2>請選擇課程</h2>
                    <div className="courses-grid">
                        {courses.map((course) => (
                            <div 
                                key={course._id} 
                                className="course-card"
                                onClick={() => navigate(`/student-management/${course._id}`)}
                            >
                                <h3>{course.courseName}</h3>
                                <p>課程代碼: {course.courseCode}</p>
                                <p>教師: {course.teacher || '未指定'}</p>
                                <p>學期: {course.semester || '當前學期'}</p>
                            </div>
                        ))}
                    </div>
                    {courses.length === 0 && (
                        <div className="no-courses">
                            <p>目前沒有可用的課程</p>
                            <button 
                                className="create-course-btn"
                                onClick={() => navigate('/course-management')}
                            >
                                創建課程
                            </button>
                        </div>
                    )}
                </div>

                <Toast
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={hideToast}
                />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="student-management-page">
                <div className="error-message">課程不存在</div>
            </div>
        );
    }

    return (
        <div className="student-management-page">
            <div className="page-header">
                <button className="back-btn" onClick={handleBack}>
                    ← 返回
                </button>
                <h2>學生管理 - {course.courseName}</h2>
            </div>

            <div className="management-tools">
                        <div className="search-filters">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="搜尋學生姓名或學號..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="filter-controls">
                                <select
                                    value={filterClass}
                                    onChange={(e) => setFilterClass(e.target.value)}
                                >
                                    <option value="">所有班級</option>
                                    {classes.map(className => (
                                        <option key={className} value={className}>{className}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                <div className="action-buttons">
                    <button 
                        className="add-student-btn"
                        onClick={() => setShowAddModal(true)}
                    >
                        新增學生
                    </button>
                    <button 
                        className="csv-import-btn"
                        onClick={() => setShowCSVModal(true)}
                    >
                        CSV匯入
                    </button>
                    <button 
                        className="refresh-btn"
                        onClick={loadCourseStudents}
                    >
                        重新整理
                    </button>
                </div>
            </div>

            <div className="students-summary">
                <div className="summary-card">
                    <h3>總學生數</h3>
                    <span className="count">{students.length}</span>
                </div>
                <div className="summary-card">
                    <h3>顯示中</h3>
                    <span className="count">{filteredStudents.length}</span>
                </div>
            </div>

            <div className="students-list">
                {filteredStudents.length === 0 ? (
                    <div className="no-students">
                        {students.length === 0 ? (
                            <p>此課程尚未有學生註冊</p>
                        ) : (
                            <p>沒有符合條件的學生</p>
                        )}
                    </div>
                ) : (
                    <div className="students-table">
                        <div className="table-header">
                            <div className="col-id">學號</div>
                            <div className="col-name">姓名</div>
                            <div className="col-department">院系</div>
                            <div className="col-class">班級</div>
                            <div className="col-actions">操作</div>
                        </div>
                        
                        {filteredStudents.map(student => (
                            <div key={student._id} className="table-row">
                                <div className="col-id">
                                    {student.studentInfo?.studentId}
                                </div>
                                <div className="col-name">
                                    {student.studentInfo?.name}
                                </div>
                                <div className="col-department">
                                    {student.studentInfo?.department || '-'}
                                </div>
                                <div className="col-class">
                                    {student.studentInfo?.class}
                                </div>
                                <div className="col-actions">
                                    <button 
                                        className="remove-btn"
                                        onClick={() => handleRemoveStudent(
                                            student.studentId, 
                                            student.studentInfo?.name || '未知學生'
                                        )}
                                    >
                                        移除
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ImportStudentsModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                courseId={courseId || ''}
                courseName={course.courseName}
                onImportSuccess={handleImportSuccess}
            />

            <ImportCSVModal
                isOpen={showCSVModal}
                onClose={() => setShowCSVModal(false)}
                courseId={courseId || ''}
                courseName={course?.courseName || ''}
                onImportSuccess={handleImportSuccess}
            />

            <AddStudentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                courseId={courseId || ''}
                courseName={course?.courseName || ''}
                onAddSuccess={handleImportSuccess}
            />

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={hideToast}
                duration={3000}
            />
        </div>
    );
};

export default StudentManagementPage;
