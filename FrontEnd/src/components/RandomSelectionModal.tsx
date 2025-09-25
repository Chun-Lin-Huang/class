import React, { useState, useEffect } from 'react';
import { api } from '../enum/api';

interface SelectedStudent {
    studentId: string;
    userName: string;
    department: string;
    class: string;
    sessionCode: string;
    checkInTime: string;
    notes: string;
    email: string;
}

interface RandomSelectionResult {
    selectedStudents: SelectedStudent[];
    totalPresentStudents: number;
    totalSessions: number;
    selectionDate: string;
    courseName: string;
}

interface Course {
    _id: string;
    courseName: string;
    courseCode: string;
}

interface RandomSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RandomSelectionModal: React.FC<RandomSelectionModalProps> = ({
    isOpen,
    onClose
}) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<RandomSelectionResult | null>(null);
    const [error, setError] = useState<string>('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            loadCourses();
            // 設定預設日期為今天
            const today = new Date().toISOString().split('T')[0];
            setSelectedDate(today);
        }
    }, [isOpen]);

    const loadCourses = async () => {
        try {
            const response = await fetch(api.courses, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.code === 200 && data.body) {
                setCourses(data.body);
                if (data.body.length > 0) {
                    setSelectedCourse(data.body[0]._id);
                }
            }
        } catch (error) {
            console.error('載入課程失敗:', error);
            setError('載入課程失敗，請稍後再試');
        }
    };

    const handleRandomSelection = async () => {
        if (!selectedCourse) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const url = selectedDate ? 
                `${api.randomSelection}/${selectedCourse}?date=${selectedDate}` :
                `${api.randomSelection}/${selectedCourse}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok && data.code === 200) {
                setResult(data.body);
            } else {
                setError(data.message || '隨機抽點失敗');
            }
        } catch (error) {
            console.error('隨機抽點錯誤:', error);
            setError('隨機抽點失敗，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content random-selection-modal">
                <div className="modal-header">
                    <h2>隨機抽點</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {!result ? (
                        <div className="selection-info">
                            <div className="course-info">
                                <h3>隨機抽點設定</h3>
                                
                                <div className="form-group">
                                    <label htmlFor="course-select">選擇課程：</label>
                                    <select 
                                        id="course-select"
                                        value={selectedCourse} 
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="form-select"
                                    >
                                        <option value="">請選擇課程</option>
                                        {courses.map(course => (
                                            <option key={course._id} value={course._id}>
                                                {course.courseName} ({course.courseCode})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="date-select">選擇日期：</label>
                                    <input 
                                        id="date-select"
                                        type="date" 
                                        value={selectedDate} 
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="form-input"
                                    />
                                </div>

                                <p className="description">
                                    將從指定日期已結束的點名會話中，隨機抽取最多3位有出席的學生。
                                </p>
                            </div>

                            {error && (
                                <div className="error-message">
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="action-buttons">
                                <button 
                                    className="primary-btn" 
                                    onClick={handleRandomSelection}
                                    disabled={loading || !selectedCourse || !selectedDate}
                                >
                                    {loading ? '抽點中...' : '開始隨機抽點'}
                                </button>
                                <button className="secondary-btn" onClick={onClose}>
                                    取消
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="selection-result">
                            <div className="result-header">
                                <h3>抽點結果</h3>
                                <div className="result-info">
                                    <p><strong>課程：</strong>{result.courseName}</p>
                                    <p><strong>抽點日期：</strong>{result.selectionDate}</p>
                                    <p><strong>今天會話數：</strong>{result.totalSessions}</p>
                                    <p><strong>出席學生總數：</strong>{result.totalPresentStudents}</p>
                                </div>
                            </div>

                            <div className="selected-students">
                                <h4>抽中的學生 ({result.selectedStudents.length} 位)</h4>
                                <div className="students-list">
                                    {result.selectedStudents.map((student, index) => (
                                        <div key={student.studentId} className="student-card">
                                            <div className="student-number">{index + 1}</div>
                                            <div className="student-info">
                                                <h5>{student.userName}</h5>
                                                <p><strong>學號：</strong>{student.studentId}</p>
                                                <p><strong>系別班級：</strong>{student.department} / {student.class}</p>
                                                <p><strong>會話代碼：</strong>{student.sessionCode}</p>
                                                <p><strong>簽到時間：</strong>{new Date(student.checkInTime).toLocaleString('zh-TW')}</p>
                                                {student.notes && (
                                                    <p><strong>備註：</strong>{student.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="result-actions">
                                <button className="primary-btn" onClick={handleRandomSelection} disabled={loading}>
                                    {loading ? '重新抽點中...' : '重新抽點'}
                                </button>
                                <button className="secondary-btn" onClick={onClose}>
                                    關閉
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RandomSelectionModal;
