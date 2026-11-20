import React from 'react';
import { Modal } from 'antd';
import { UpdateHouseForm } from './UpdateHouseForm';

export const UpdateHouseModal = ({
                                     open,
                                     onClose,
                                     initialData,
                                     onSubmit,
                                     loading = false,
                                    title
                                 }) => {
    return (
        <Modal
            title={title || "Редактирование данных о доме"}
            open={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            width={800}
            centered
        >
            <UpdateHouseForm
                initialData={initialData}
                onSubmit={(data) => {
                    onSubmit(data);
                }}
                loading={loading}
            />
        </Modal>
    );
};