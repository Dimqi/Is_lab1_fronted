import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Card, Descriptions, Button, Spin, message, Divider, Modal, Form, Input } from 'antd';
import { ClearOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FlatsTable } from '../components/flats/FlatsTable.jsx';
import { UpdateHouseModal } from '../components/houses/UpdateHouseModal.jsx'; // Путь к вашей модалке обновления дома
import { useEntityTable } from '../hooks/useEntityTable';
import { useWebSocket } from '../hooks/useWebSocket';
import api from "../api/axios.js";

const { Title } = Typography;

export const HouseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [house, setHouse] = useState(null);
    const [houseLoading, setHouseLoading] = useState(false);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [deleteForm] = Form.useForm();

    const flatMapper = useCallback(({
                                        id, name, creationDate, area, price, balcony,
                                        timeToMetroOnFoot, numberOfRooms, furnish, view, transport
                                    }) => ({
        id, name, creationDate, area, price, balcony,
        timeToMetroOnFoot, numberOfRooms, furnish, view, transport
    }), []);

    const {
        data: flats,
        loading: flatsLoading,
        currentPage,
        pageSize,
        totalElements,
        tableParams,
        handleTableChange,
        handlePageChange,
        handleResetFilters,
    } = useEntityTable({
        baseUrl: '/flat',
        listEndpoint: id ? `/flat/all?houseId=${id}` : null,
        mapper: flatMapper,
        entityName: 'flat'
    });

    const fetchHouseData = useCallback(async () => {
        try {
            setHouseLoading(true);
            const response = await api.get(`/house/${id}`);
            setHouse(response.data);
        } catch (error) {
            message.error("Не удалось загрузить данные дома");
        } finally {
            setHouseLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchHouseData();
    }, [fetchHouseData]);

    useWebSocket((event) => {
        const { entityType, action, id: eventId, payload } = event;

        if (entityType === 'HOUSE' && Number(eventId) === Number(id)) {
            if (action === 'UPDATE') {
                setHouse(payload);
                message.info('Информация о доме обновлена');
            } else if (action === 'DELETE') {
                message.error('Этот дом был удален');
                navigate('/houses');
            }
        }
    });

    const handleEditSubmit = async (values) => {
        try {
            setModalLoading(true);
            await api.patch(`/house/${id}`, values);
            message.success('Дом успешно обновлен');
            setIsEditModalOpen(false);
            fetchHouseData();
        } catch (error) {
            message.error('Ошибка при обновлении дома');
        } finally {
            setModalLoading(false);
        }
    };

    const handleConfirmDeleteWithReassign = async () => {
        try {
            const values = await deleteForm.validateFields();
            setActionLoading(true);

            const newHouseId = values.newHouseId ? Number(values.newHouseId) : null;

            const url = newHouseId ? `/house/${id}?newHouseId=${newHouseId}` : `/house/${id}`;

            await api.delete(url);
            message.success('Дом успешно удален');
            setIsDeleteModalOpen(false);
            deleteForm.resetFields();
            navigate('/houses');
        } catch (error) {
            if (error?.errorFields) return;
            message.error(error.response?.data?.message || 'Ошибка при удалении дома');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditFlat = (flatId) => {
        navigate(`/flats/${flatId}`);
    };

    const handleDeleteFlat = async (flatId) => {
        try {
            await api.delete(`/flat/${flatId}`);
            message.success('Квартира успешно удалена');
            handlePageChange(currentPage, pageSize);
        } catch (error) {
            message.error('Ошибка при удалении квартиры');
        }
    };

    if (houseLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!house) {
        return <div>Дом не найден</div>;
    }

    const cardTitle = (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Title level={3} style={{ margin: 0 }}>{house.name}</Title>
            <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditModalOpen(true)}
                >
                    Редактировать
                </Button>
                <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setIsDeleteModalOpen(true)}
                >
                    Удалить
                </Button>
            </div>
        </div>
    );

    return (
        <div>
            <Card title={cardTitle}>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="ID">{house.id}</Descriptions.Item>
                    <Descriptions.Item label="Название">{house.name}</Descriptions.Item>
                    <Descriptions.Item label="Год постройки">{house.year || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Этажей">{house.numberOfFlatsOnFloor || '—'}</Descriptions.Item>
                    <Descriptions.Item label="X">{house.coordinates?.x || '—'}</Descriptions.Item>
                    <Descriptions.Item label="Y">{house.coordinates?.y || '—'}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Divider />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>Квартиры в этом доме</Title>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        icon={<ClearOutlined />}
                        onClick={handleResetFilters}
                    >
                        Сбросить фильтры
                    </Button>
                </div>
            </div>

            <FlatsTable
                flats={flats}
                loading={flatsLoading || actionLoading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalElements={totalElements}
                onPageChange={handlePageChange}
                onTableChange={handleTableChange}
                onEdit={handleEditFlat}
                onDelete={handleDeleteFlat}
                tableParams={tableParams}
            />

            <UpdateHouseModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={house}
                onSubmit={handleEditSubmit}
                loading={modalLoading}
                title="Редактирование дома"
            />

            <Modal
                title="Удаление дома и перепривязка квартир"
                open={isDeleteModalOpen}
                onOk={handleConfirmDeleteWithReassign}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    deleteForm.resetFields();
                }}
                confirmLoading={actionLoading}
                okText="Удалить"
                okButtonProps={{ danger: true }}
                cancelText="Отмена"
            >
                <p>Вы действительно хотите удалить этот дом?</p>
                <p style={{ color: '#8c8c8c', fontSize: '13px', marginBottom: 16 }}>
                    Если вы хотите перепривязать связанные квартиры к другому дому, введите его ID ниже. Если оставить поле пустым, параметр перепривязки передан не будет.
                </p>
                <Form form={deleteForm} layout="vertical">
                    <Form.Item name="newHouseId" label="ID нового дома (необязательно)">
                        <Input placeholder="Введите ID дома для перепривязки" type="number" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};