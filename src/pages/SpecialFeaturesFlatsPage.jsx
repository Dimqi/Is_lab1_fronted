import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Tag, Space, Typography, message, Modal } from 'antd';
import {
    DeleteOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import api from '../api/axios.js';

const { Title, Text } = Typography;

const VIEW_OPTIONS = [
    { label: 'YARD', value: 'YARD' },
    { label: 'PARK', value: 'PARK' },
    { label: 'BAD', value: 'BAD' },
    { label: 'NORMAL', value: 'NORMAL' },
];

const TRANSPORT_OPTIONS = [
    { label: 'LITTLE (Немного)', value: 'LITTLE' },
    { label: 'NORMAL (Нормально)', value: 'NORMAL' },
    { label: 'ENOUGH (Достаточно)', value: 'ENOUGH' },
];

export const SpecialFeaturesFlatsPage = () => {
    const [totalPrice, setTotalPrice] = useState(0);
    const [uniqueViews, setUniqueViews] = useState([]);
    const [selectedView, setSelectedView] = useState('YARD');
    const [countByView, setCountByView] = useState(0);

    const [loadingTotal, setLoadingTotal] = useState(true);
    const [loadingViews, setLoadingViews] = useState(true);
    const [loadingCount, setLoadingCount] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        fetchTotalPrice();
        fetchUniqueViews();
    }, []);

    useEffect(() => {
        if (!selectedView) return;
        fetchCountByView();
    }, [selectedView]);

    const fetchTotalPrice = async () => {
        try {
            setLoadingTotal(true);
            const response = await api.get('/flat/sumPrices');
            setTotalPrice(response.data);
        } catch (error) {
            message.error("Ошибка расчёта суммарной стоимости");
        } finally {
            setLoadingTotal(false);
        }
    };

    const fetchUniqueViews = async () => {
        try {
            setLoadingViews(true);
            const response = await api.get('/flat/distinctView');
            setUniqueViews(response.data);
        } catch (error) {
            message.error("Ошибка получения уникальных View");
        } finally {
            setLoadingViews(false);
        }
    };

    const fetchCountByView = async () => {
        try {
            setLoadingCount(true);
            const response = await api.get(`/flat/count/${selectedView}`);
            setCountByView(response.data);
        } catch (error) {
            message.error(`Ошибка получения количества для ${selectedView}`);
        } finally {
            setLoadingCount(false);
        }
    };

    const executeDeleteByTransport = async (transportValue) => {
        setLoadingDelete(true);
        try {
            const response = await api.delete(`/flat/byTransport/${transportValue}`);
            message.success(`Удалено объектов: ${response.data}`);
            fetchTotalPrice();
            fetchUniqueViews();
            fetchCountByView();
        } catch (error) {
            message.error("Ошибка при удалении квартир по транспорту");
        } finally {
            setLoadingDelete(false);
        }
    };

    // Открытие модального окна подтверждения с выбором транспорта
    const showDeleteConfirmModal = () => {
        let selectedModalTransport = 'LITTLE';

        Modal.confirm({
            title: 'Удаление объектов по транспорту',
            icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            content: (
                <div style={{ marginTop: 16 }}>
                    <p style={{ marginBottom: 8 }}>Выберите тип транспорта для удаления:</p>
                    <Select
                        defaultValue="LITTLE"
                        options={TRANSPORT_OPTIONS}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                            selectedModalTransport = value;
                        }}
                    />
                </div>
            ),
            okText: 'Удалить',
            okButtonProps: { danger: true },
            cancelText: 'Отмена',
            onOk() {
                executeDeleteByTransport(selectedModalTransport);
            },
        });
    };

    const dataSource = [
        {
            key: '1',
            feature: 'Суммарная стоимость всех квартир',
            result: (
                <Text strong style={{ color: '#3f8600', fontSize: 16 }}>
                    {loadingTotal ? 'Загрузка...' : `${totalPrice.toLocaleString()} ₽`}
                </Text>
            ),
            action: (
                <Text type="secondary">Оценка капитализации недвижимости</Text>
            ),
        },
        {
            key: '2',
            feature: 'Подсчет объектов по типу вида',
            result: (
                <Space>
                    <Select
                        value={selectedView}
                        onChange={setSelectedView}
                        options={VIEW_OPTIONS}
                        style={{ width: 120 }}
                    />
                    <Text strong style={{ color: '#1677ff', fontSize: 16 }}>
                        {loadingCount ? '...' : `${countByView} шт.`}
                    </Text>
                </Space>
            ),
            action: (
                <Text type="secondary">Фильтрация по параметру View</Text>
            ),
        },
        {
            key: '3',
            feature: "Уникальные значения полей 'View'",
            result: (
                <Space size={[4, 4]} wrap>
                    {loadingViews ? (
                        'Загрузка...'
                    ) : uniqueViews.length > 0 ? (
                        uniqueViews.map((view, index) => (
                            <Tag key={index} color="purple">{view}</Tag>
                        ))
                    ) : (
                        <Text type="secondary">Нет данных</Text>
                    )}
                </Space>
            ),
            action: (
                <Text type="secondary">Все варианты видов из окна</Text>
            ),
        },
        {
            key: '4',
            feature: 'Массовое удаление по транспорту',
            result: (
                <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    loading={loadingDelete}
                    onClick={showDeleteConfirmModal}
                >
                    Удалить объекты...
                </Button>
            ),
            action: (
                <Text type="danger">Очистка базы по признаку transport</Text>
            ),
        },
    ];

    const columns = [
        {
            title: 'Функция / Операция',
            dataIndex: 'feature',
            key: 'feature',
            render: (text) => <Text strong>{text}</Text>,
            width: '30%',
        },
        {
            title: 'Результат / Управление',
            dataIndex: 'result',
            key: 'result',
            width: '45%',
        },
        {
            title: 'Описание',
            dataIndex: 'action',
            key: 'action',
            width: '25%',
        },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Специальные операции</Title>
                <Text type="secondary">Инструменты аналитики, подсчета и массового управления объектами</Text>
            </div>

            <Table
                dataSource={dataSource}
                columns={columns}
                pagination={false}
                bordered
                size="middle"
            />
        </div>
    );
};