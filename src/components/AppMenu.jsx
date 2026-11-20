import React from 'react';
import { Dropdown, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuOutlined, HomeOutlined, EnvironmentOutlined, StarOutlined, HistoryOutlined } from '@ant-design/icons';

export const AppMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/main',
            icon: <HomeOutlined />,
            label: 'Главная',
        },
        {
            key: '/map',
            icon: <EnvironmentOutlined />,
            label: 'Карта домов',
        },
        {
            key: '/specialFeatures',
            icon: <StarOutlined />,
            label: 'Специальные возможности',
        },
        {
            key: '/houses',
            icon: <HomeOutlined/>,
            label: 'Страница домов',
        },
        {
            key: '/import-history',
            icon: <HistoryOutlined />,
            label: 'История импортов',
        },
    ];

    const menuProps = {
        items: menuItems,
        selectedKeys: [location.pathname],
        onClick: (e) => {
            navigate(e.key);
        },
    };

    return (
        <Dropdown menu={menuProps} trigger={['click']} placement="bottomRight">
            <Button type="primary" icon={<MenuOutlined />}>
                Меню
            </Button>
        </Dropdown>
    );
};