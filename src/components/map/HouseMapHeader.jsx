import React from 'react';
import { Button, Space, Typography, Tooltip } from 'antd';
import { ArrowLeftOutlined, ZoomInOutlined, ZoomOutOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const HouseMapHeader = ({ onBack, onZoomIn, onZoomOut, onReset }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                Назад к списку
            </Button>
            <Title level={3} style={{ margin: 0 }}>Карта домов (Координатные оси)</Title>
        </Space>

        <Space>
            <Tooltip title="Приблизить">
                <Button icon={<ZoomInOutlined />} onClick={onZoomIn} />
            </Tooltip>
            <Tooltip title="Отдалить">
                <Button icon={<ZoomOutOutlined />} onClick={onZoomOut} />
            </Tooltip>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
                Сбросить вид
            </Button>
        </Space>
    </div>
);