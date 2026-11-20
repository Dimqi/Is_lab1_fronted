import React, { useState, useCallback } from 'react';
import { Button } from 'antd';
import { PlusOutlined, ClearOutlined } from '@ant-design/icons';
import { FlatsTable } from '../components/flats/FlatsTable.jsx';
import { UpdateFlatModal } from '../components/UpdateFlatModal';
import { useEntityTable } from '../hooks/useEntityTable';

export const DashboardPage = () => {
    const flatMapper = useCallback(({
                                        id, name, creationDate, area, price, balcony,
                                        timeToMetroOnFoot, numberOfRooms, furnish, view, transport, houseId
                                    }) => ({
        id, name, creationDate, area, price, balcony,
        timeToMetroOnFoot, numberOfRooms, furnish, view, transport
    }), []);

    const {
        data: flats,
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
        handleTableChange,
        handlePageChange,
        handleCreateClick,
        handleEditClick,
        handleDeleteClick,
        handleFormSubmit,
        handleCloseModal,
        changeEndpoint,
        handleResetFilters,
    } = useEntityTable({
        baseUrl: '/flat',
        mapper: flatMapper,
        entityName: 'flat'
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2>Список квартир</h2>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        icon={<ClearOutlined />}
                        onClick={handleResetFilters}
                    >
                        Сбросить фильтры
                    </Button>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleCreateClick}
                    >
                        Добавить квартиру
                    </Button>
                </div>
            </div>

            <FlatsTable
                flats={flats}
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

            <UpdateFlatModal
                open={isModalOpen}
                onClose={handleCloseModal}
                initialData={selectedFullData}
                onSubmit={handleFormSubmit}
                loading={modalLoading}
                title={isCreateMode ? "Добавление квартиры" : "Редактирование квартиры"}
            />
        </div>
    );
};