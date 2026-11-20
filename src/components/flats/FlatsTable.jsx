import React from 'react';
import { Table, Button, Space, Popconfirm, Input, Select, Upload, message } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, EditOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons';
import { FlatsPagination } from './FlatsPagination.jsx';
import api from '../../api/axios'; // Подключаем ваш настроенный axios

const FURNISH_OPTIONS = [
    { label: 'небольшой', value: 'LITTLE' },
    { label: 'хорошая', value: 'FINE' },
    { label: 'Черновая', value: 'BAD' }
];

const VIEW_OPTIONS = [
    { label: 'Парк', value: 'YARD' },
    { label: 'Во двор', value: 'PARK' },
    { label: 'Площадка', value: 'BAD' },
    { label: 'Хороший вид', value: 'NORMAL' }
];

const TRANSPORT_OPTIONS = [
    { label: 'Немного', value: 'LITTLE' },
    { label: 'Нормально', value: 'NORMAL' },
    { label: 'Достаточно', value: 'ENOUGH' }
];

const BALCONY_OPTIONS = [
    { label: 'Да', value: 'true' },
    { label: 'Нет', value: 'false' }
];

export const FlatsTable = ({
                               flats,
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
                // baseURL уже содержит '/api', поэтому отправляем просто '/flat/import'
                const response = await api.post('/flat/import', formData, {
                    transformRequest: [(data, headers) => {
                        // Удаляем глобальный application/json, чтобы браузер подставил multipart/form-data с boundary
                        headers.delete('Content-Type');
                        return data;
                    }]
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

    const renderNumberFilter = ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
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
                    <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
                        Найти
                    </Button>
                    <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
                        Сбросить
                    </Button>
                </Space>
            </div>
        );
    };

    const renderSelectFilter = (options, placeholder) => ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8, width: 180 }}>
            <Select
                style={{ width: '100%', marginBottom: 8 }}
                placeholder={placeholder}
                allowClear
                options={options}
                value={selectedKeys[0]}
                onChange={value => setSelectedKeys(value ? [value] : [])}
            />
            <Space>
                <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 80 }}>
                    Найти
                </Button>
                <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 80 }}>
                    Сбросить
                </Button>
            </Space>
        </div>
    );

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
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
                        <Button type="primary" onClick={() => confirm()} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
                            Найти
                        </Button>
                        <Button onClick={() => { clearFilters(); confirm(); }} size="small" style={{ width: 90 }}>
                            Сбросить
                        </Button>
                    </Space>
                </div>
            ),
            filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
            onFilter: () => true,
            render: (text, record) => (
                <Link to={`/flats/${record.id}`} target="_blank" style={{ fontWeight: 500 }}>
                    {text || '—'}
                </Link>
            ),
        },
        {
            title: 'Дата создания',
            dataIndex: 'creationDate',
            key: 'creationDate',
            sorter: true,
            sortOrder: getSortOrder('creationDate'),
            render: (date) => (date ? date : '—'),
        },
        {
            title: 'Площадь',
            dataIndex: 'area',
            key: 'area',
            sorter: true,
            sortOrder: getSortOrder('area'),
            filteredValue: tableParams.filters?.area || null,
            filterDropdown: renderNumberFilter,
            onFilter: () => true,
            render: (area) => (area ? `${area} м²` : '—'),
        },
        {
            title: 'Цена',
            dataIndex: 'price',
            key: 'price',
            sorter: true,
            sortOrder: getSortOrder('price'),
            filteredValue: tableParams.filters?.price || null,
            filterDropdown: renderNumberFilter,
            onFilter: () => true,
            render: (price) => (price ? `₽${price.toLocaleString()}` : '—'),
        },
        {
            title: 'Балкон',
            dataIndex: 'balcony',
            key: 'balcony',
            sorter: true,
            sortOrder: getSortOrder('balcony'),
            filteredValue: tableParams.filters?.balcony || null,
            filterDropdown: renderSelectFilter(BALCONY_OPTIONS, 'Выберите балкон'),
            onFilter: () => true,
            render: (balcony) => (balcony === null ? '—' : balcony ? 'Да' : 'Нет'),
        },
        {
            title: 'Время до метро',
            dataIndex: 'timeToMetroOnFoot',
            key: 'timeToMetroOnFoot',
            sorter: true,
            sortOrder: getSortOrder('timeToMetroOnFoot'),
            filteredValue: tableParams.filters?.timeToMetroOnFoot || null,
            filterDropdown: renderNumberFilter,
            onFilter: () => true,
            render: (time) => (time !== null ? `${time} мин` : '—'),
        },
        {
            title: 'Комнат',
            dataIndex: 'numberOfRooms',
            key: 'numberOfRooms',
            sorter: true,
            sortOrder: getSortOrder('numberOfRooms'),
            filteredValue: tableParams.filters?.numberOfRooms || null,
            filterDropdown: renderNumberFilter,
            onFilter: () => true,
            render: (rooms) => (rooms ? rooms : '—'),
        },
        {
            title: 'Отделка',
            dataIndex: 'furnish',
            key: 'furnish',
            sorter: true,
            sortOrder: getSortOrder('furnish'),
            filteredValue: tableParams.filters?.furnish || null,
            filterDropdown: renderSelectFilter(FURNISH_OPTIONS, 'Выберите отделку'),
            onFilter: () => true,
            render: (furnish) => {
                const found = FURNISH_OPTIONS.find(opt => opt.value === furnish);
                return found ? found.label : (furnish || '—');
            },
        },
        {
            title: 'Вид',
            dataIndex: 'view',
            key: 'view',
            sorter: true,
            sortOrder: getSortOrder('view'),
            filteredValue: tableParams.filters?.view || null,
            filterDropdown: renderSelectFilter(VIEW_OPTIONS, 'Выберите вид'),
            onFilter: () => true,
            render: (view) => {
                const found = VIEW_OPTIONS.find(opt => opt.value === view);
                return found ? found.label : (view || '—');
            },
        },
        {
            title: 'Транспорт',
            dataIndex: 'transport',
            key: 'transport',
            sorter: true,
            sortOrder: getSortOrder('transport'),
            filteredValue: tableParams.filters?.transport || null,
            filterDropdown: renderSelectFilter(TRANSPORT_OPTIONS, 'Выберите транспорт'),
            onFilter: () => true,
            render: (transport) => {
                const found = TRANSPORT_OPTIONS.find(opt => opt.value === transport);
                return found ? found.label : (transport || '—');
            },
        },
        {
            title: 'Действия',
            key: 'actions',
            width: 170,
            fixed: 'right',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record.id)}
                    >
                    </Button>

                    <Popconfirm
                        title="Удаление квартиры"
                        description="Вы уверены, что хотите удалить эту квартиру?"
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
                        Импортировать квартиры
                    </Button>
                </Upload>
            </div>

            <Table
                columns={columns}
                dataSource={flats}
                rowKey="id"
                loading={loading}
                pagination={false}
                onChange={onTableChange}
                scroll={{ x: 'max-content' }}
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