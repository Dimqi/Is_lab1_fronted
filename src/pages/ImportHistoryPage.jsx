import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, message } from 'antd';
import { importHistoryService } from '../api/importHistoryService';

const { Title } = Typography;

export const ImportHistoryPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchHistory = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const response = await importHistoryService.getImportHistory(page - 1, pageSize);
            setData(response.content || response);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: response.totalElements || (response.content ? response.content.length : 0),
            }));
        } catch (error) {
            message.error('Не удалось загрузить историю импортов');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (newPagination) => {
        fetchHistory(newPagination.current, newPagination.pageSize);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <span style={{ color: status === 'SUCCESS' ? 'green' : 'red' }}>
{status === 'SUCCESS' ? 'Успешно' : 'Ошибка'}
</span>
            ),
        },
        {
            title: 'Тип импорта',
            dataIndex: 'importType',
            key: 'importType',
            render: (type) => (type === 'HOUSE' ? 'Дома' : type),
        },
        {
            title: 'Пользователь',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Добавлено объектов',
            dataIndex: 'recordsCount',
            key: 'recordsCount',
            render: (count) => count ?? '—',
        },
        {
            title: 'Дата импорта',
            dataIndex: 'startedAt',
            key: 'startedAt',
            render: (date) => (
                date ? new Date(date).toLocaleString('ru-RU') : '—'
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Title level={3} style={{ marginBottom: 24 }}>История импортов</Title>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true,
                    }}
                    onChange={handleTableChange}
                />
            </Card>
        </div>
    );
};