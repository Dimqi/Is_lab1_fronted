import React, { useState, useCallback } from 'react';
import { Button, Modal, Form, InputNumber } from 'antd';
import { ClearOutlined, PlusOutlined } from '@ant-design/icons';
import { HousesTable } from '../components/houses/HousesTable.jsx';
import { UpdateHouseModal } from '../components/houses/UpdateHouseModal.jsx';
import { useEntityTable } from '../hooks/useEntityTable';

export const HousesPage = () => {
    const [deleteForm] = Form.useForm();

    const houseMapper = useCallback(({ id, name, year, numberOfFlatsOnFloor }) => ({
        id, name, year, numberOfFlatsOnFloor
    }), []);

    const {
        data: houses,
        loading,
        actionLoading,
        currentPage,
        pageSize,
        totalElements,
        isModalOpen,
        isCreateMode,
        modalLoading,
        selectedFullData,
        tableParams,
        isDeleteModalOpen,
        setIsDeleteModalOpen,
        houseToDeleteId,
        executeDelete,
        handleTableChange,
        handlePageChange,
        handleCreateClick,
        handleEditClick,
        handleDeleteClick,
        handleFormSubmit,
        handleCloseModal,
        handleResetFilters,
    } = useEntityTable({
        baseUrl: '/house',
        mapper: houseMapper,
        entityName: 'house'
    });

    const handleConfirmDeleteWithReassign = async () => {
        try {
            const values = await deleteForm.validateFields();
            await executeDelete(houseToDeleteId, values.newHouseId);
            deleteForm.resetFields();
        } catch (error) {
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Список домов</h2>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                        Сбросить фильтры
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClick}>
                        Добавить дом
                    </Button>
                </div>
            </div>

            <HousesTable
                houses={houses}
                loading={loading || actionLoading}
                currentPage={currentPage}
                pageSize={pageSize}
                totalElements={totalElements}
                onPageChange={handlePageChange}
                onTableChange={handleTableChange}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                tableParams={tableParams}
            />

            <UpdateHouseModal
                open={isModalOpen}
                onClose={handleCloseModal}
                initialData={selectedFullData}
                onSubmit={handleFormSubmit}
                loading={modalLoading}
                title={isCreateMode ? "Добавление дома" : "Редактирование дома"}
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
                <p style={{ color: '#8c8c8c', fontSize: '13px' }}>
                    Если вы хотите перепривязать связанные квартиры к другому дому, введите его ID ниже. Если оставить поле пустым, параметр перепривязки передан не будет.
                </p>

                <Form form={deleteForm} layout="vertical">
                    <Form.Item
                        name="newHouseId"
                        label="ID нового дома (необязательно)"
                        rules={[{ type: 'number', message: 'ID должен быть числом' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Например: 42"
                            min={1}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};