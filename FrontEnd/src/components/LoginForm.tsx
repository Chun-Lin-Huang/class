import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest, RegisterRequest } from '../types/User';

const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState<LoginRequest>({
        userName: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const success = await login({
                userName: formData.userName,
                password: formData.password
            });

            if (!success) {
                setMessage('登入失敗');
            }
        } catch (error) {
            setMessage('發生錯誤');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>登入</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>使用者名稱:</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>密碼:</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? '登入中...' : '登入'}
                    </button>
                </form>

                {message && <div className="error-message">{message}</div>}
            </div>
        </div>
    );
};

export default LoginForm;
