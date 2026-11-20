import React from 'react';
import { Layout, Button, Space } from 'antd';
import { UserOutlined, LogoutOutlined, HomeOutlined, CompassOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {AppMenu} from "./AppMenu.jsx";

const { Header } = Layout;

export const AppHeader = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Header
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: '#001529',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <HomeOutlined
                style={{ fontSize: 22, color: '#1890ff', cursor: 'pointer' }}
                onClick={() => navigate('/main')}
            />

            <span>
                    <AppMenu />
                </span>
        </div>

            <Space size="middle">

                <Button
                    type="text"
                    icon={<UserOutlined />}
                    onClick={() => navigate('/profile')}
                    style={{ color: '#fff' }}
                >
                    Профиль
                </Button>

                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                >
                    Выйти
                </Button>
            </Space>
        </Header>
    );
};