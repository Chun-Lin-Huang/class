import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RandomSelectionModal from './RandomSelectionModal';

const MainPage: React.FC = () => {
    const navigate = useNavigate();
    const [showRandomModal, setShowRandomModal] = useState(false);

    const menuItems = [
        {
            id: 'attendance',
            title: '點名管理',
            description: '開始點名、查看進行中的點名會話',
            icon: '📝',
            path: '/attendance',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            id: 'student-management',
            title: '學生管理',
            description: '管理課程學生資料、匯入學生',
            icon: '👥',
            path: '/student-management',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        },
        {
            id: 'course-management',
            title: '課程管理',
            description: '管理課程資料、課程設定',
            icon: '📚',
            path: '/course-management',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        },
        {
            id: 'attendance-records',
            title: '點名紀錄',
            description: '查看歷史點名紀錄、統計資料',
            icon: '📊',
            path: '/attendance-records',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        },
        {
            id: 'random-selection',
            title: '隨機抽點',
            description: '從今天出席的學生中隨機抽取',
            icon: '🎲',
            path: null,
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        }
    ];

    const handleMenuClick = (item: any) => {
        if (item.id === 'random-selection') {
            setShowRandomModal(true);
        } else if (item.path) {
            navigate(item.path);
        }
    };

    return (
        <div className="main-page">
            <div className="menu-grid">
                {menuItems.map((item) => (
                    <div
                        key={item.id}
                        className="menu-card"
                        onClick={() => handleMenuClick(item)}
                        style={{ background: item.color }}
                    >
                        <div className="menu-icon">{item.icon}</div>
                        <h3 className="menu-title">{item.title}</h3>
                        <p className="menu-description">{item.description}</p>
                        <div className="menu-arrow">→</div>
                    </div>
                ))}
            </div>

            <RandomSelectionModal
                isOpen={showRandomModal}
                onClose={() => setShowRandomModal(false)}
            />
        </div>
    );
};

export default MainPage;
