import React, { useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Checkbox,
    Select,
    Button,
    Card,
    Space,
    Divider,
    Row,
    Col
} from 'antd';

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

export const UpdateFlatForm = ({ initialData, onSubmit, loading = false }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                balcony: Boolean(initialData.balcony),
            });
        }
    }, [initialData, form]);

    const handleFinish = (values) => {
        const payload = {
            name: values.name,
            area: values.area,
            price: values.price,
            balcony: values.balcony ?? false,
            timeToMetroOnFoot: values.timeToMetroOnFoot ?? null,
            numberOfRooms: values.numberOfRooms ?? null,
            furnish: values.furnish ?? null,
            view: values.view ?? null,
            transport: values.transport ?? null,
            houseId: values.houseId ?? null,
        };

        if (onSubmit) {
            onSubmit(payload);
        }
    };

    return (
        <Card title="Редактирование квартиры" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{ balcony: false }}
            >
                <Form.Item
                    label="Название"
                    name="name"
                    rules={[
                        { required: true, message: 'Имя не может быть null' },
                        { whitespace: true, message: 'Строка не может быть пустой' }
                    ]}
                >
                    <Input placeholder="Например: Двушка на Ленина" />
                </Form.Item>



                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Площадь (м²)"
                            name="area"
                            rules={[
                                { required: true, message: 'Укажите площадь' },
                                { type: 'number', min: 1, message: 'Площадь должна быть больше 0' },
                                { type: 'number', max: 763, message: 'Максимальная площадь 763' }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="1 - 763" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Цена"
                            name="price"
                            rules={[
                                { required: true, message: 'Укажите цену' },
                                { type: 'number', min: 1, message: 'Цена должна быть больше 0' }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="Больше 0" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Время до метро пешком (мин)"
                            name="timeToMetroOnFoot"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value !== undefined && value !== null && value <= 0) {
                                            return Promise.reject(new Error('Время до метро должно быть больше 0'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} step={0.5} placeholder="Опционально" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Количество комнат"
                            name="numberOfRooms"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value !== undefined && value !== null && value <= 0) {
                                            return Promise.reject(new Error('Количество комнат должно быть больше 0'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} precision={0} placeholder="Опционально" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Отделка" name="furnish">
                            <Select placeholder="Выберите..." options={FURNISH_OPTIONS} allowClear />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Вид из окна" name="view">
                            <Select placeholder="Выберите..." options={VIEW_OPTIONS} allowClear />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label="Транспортная доступность" name="transport">
                            <Select placeholder="Выберите..." options={TRANSPORT_OPTIONS} allowClear />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16} align="middle">
                    <Col span={16}>
                        <Form.Item label="ID Дома (House)" name="houseId">
                            <InputNumber style={{ width: '100%' }} precision={0} placeholder="Идентификатор дома" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="balcony" valuePropName="checked" style={{ marginTop: 30 }}>
                            <Checkbox>Наличие балкона</Checkbox>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                    <Space>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Сохранить
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </Card>
    );
};