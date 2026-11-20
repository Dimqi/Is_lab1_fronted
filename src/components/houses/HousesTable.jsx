import React from 'react';
import { Table, Button, Space, Popconfirm, Input, Upload, message } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { FlatsPagination } from '../flats/FlatsPagination.jsx';
import api from '../../api/axios'; // Подключаем ваш настроенный axios

export const HousesTable = ({
                                houses,
                                loading,
                                currentPage,
                                pageSize,
                                totalElements,
                                onPageChange,
                                onTableChange,
                                onEdit,
                                onDelete,
                                onImportSuccess, // Колбэк для обновления данных после успешного импорта (опционально)
                                tableParams = {}
                            }) => {

    const getSortOrder = (columnKey) => {
        const sorter = tableParams.sorter;
        if (sorter && sorter.field === columnKey) {
            return sorter.order || null;
        }
        return null;
    };

    const uploadProps = {
        name: 'file',
        showUploadList: false,
        customRequest: async ({ file, onSuccess, onError }) => {
            const formData = new FormData();
            formData.append('file', file);


            try {
                const response = await api.post('/house/import', formData, {
                    headers: {
                        'Content-Type': undefined
                    }
                });


                message.success(`Файл "${file.name}" успешно импортирован`);
                onSuccess(response.data);
                if (onImportSuccess) {
                    onImportSuccess();
                }
            } catch (error) {
                const data = error.response?.data;
                const details = typeof data === 'string' ? data : data?.message;

                message.error(`Ошибка при импорте файла: ${details || error.message}`);
                onError(error);
            }
        },
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: false,
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            sortOrder: getSortOrder('name'),
            filteredValue: tableParams.filters?.name || null,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Поиск по названию"
                        value={selectedKeys[0] || ''}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            icon={<SearchOutlined />}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Найти
                        </Button>
                        <Button
                            onClick={() => { clearFilters(); confirm(); }}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Сбросить
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: () => true,
            render: (text, record) => (
                <Link to={`/houses/${record.id}`} target="_blank" style={{ fontWeight: 500 }}>
                    {text || '—'}
                </Link>
            ),
        },
        {
            title: 'Год постройки',
            dataIndex: 'year',
            key: 'year',
            sorter: true,
            sortOrder: getSortOrder('year'),
            filteredValue: tableParams.filters?.year || null,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const [min = '', max = ''] = selectedKeys[0] || [];
                return (
                    <div style={{ padding: 8, width: 200 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <Input
                                placeholder="Мин"
                                type="number"
                                value={min}
                                onChange={e => setSelectedKeys([[e.target.value, max]])}
                            />
                            <Input
                                placeholder="Макс"
                                type="number"
                                value={max}
                                onChange={e => setSelectedKeys([[min, e.target.value]])}
                            />
                        </div>
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => confirm()}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Найти
                            </Button>
                            <Button
                                onClick={() => { clearFilters(); confirm(); }}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Сбросить
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true,
            render: (year) => (year ? year : '—'),
        },
        {
            title: 'Квартир на этаже',
            dataIndex: 'numberOfFlatsOnFloor',
            key: 'numberOfFlatsOnFloor',
            sorter: true,
            sortOrder: getSortOrder('numberOfFlatsOnFloor'),
            filteredValue: tableParams.filters?.numberOfFlatsOnFloor || null,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const [min = '', max = ''] = selectedKeys[0] || [];
                return (
                    <div style={{ padding: 8, width: 200 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <Input
                                placeholder="Мин"
                                type="number"
                                value={min}
                                onChange={e => setSelectedKeys([[e.target.value, max]])}
                            />
                            <Input
                                placeholder="Макс"
                                type="number"
                                value={max}
                                onChange={e => setSelectedKeys([[min, e.target.value]])}
                            />
                        </div>
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => confirm()}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Найти
                            </Button>
                            <Button
                                onClick={() => { clearFilters(); confirm(); }}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Сбросить
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true,
            render: (number) => (number ? number : '—'),
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record.id)}
                    >
                        Изменить
                    </Button>

                    <Popconfirm
                        title="Удаление дома"
                        description="Вы уверены, что хотите удалить этот дом?"
                        onConfirm={() => onDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                        okButtonProps={{ danger: true }}
                    >
                        <Button
                            type="default"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Удалить
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {/* Кнопка импорта файла */}
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <Upload {...uploadProps}>
                    <Button type="primary" icon={<UploadOutlined />}>
                        Импортировать дома
                    </Button>
                </Upload>
            </div>

            <Table
                columns={columns}
                dataSource={houses}
                rowKey="id"
                loading={loading}
                pagination={false}
                onChange={onTableChange}
            />

            <FlatsPagination
                currentPage={currentPage}
                pageSize={pageSize}
                totalElements={totalElements}
                onChange={onPageChange}
                disabled={loading}
            />
        </div>
    );
};