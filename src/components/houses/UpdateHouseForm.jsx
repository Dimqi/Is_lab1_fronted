import React, { useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Button,
    Card,
    Space,
    Divider,
    Row,
    Col
} from 'antd';

export const UpdateHouseForm = ({ initialData, onSubmit, loading = false }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                name: initialData.name,
                year: initialData.year,
                numberOfFlatsOnFloor: initialData.numberOfFlatsOnFloor,
                x: initialData.coordinates?.x,
                y: initialData.coordinates?.y,
            });
        }
    }, [initialData, form]);

    const handleFinish = (values) => {
        const payload = {
            name: values.name,
            year: values.year ?? null,
            numberOfFlatsOnFloor: values.numberOfFlatsOnFloor ?? null,
            coordinates: {
                x: values.x ?? 0,
                y: values.y ?? 0
            }
        };

        if (onSubmit) {
            onSubmit(payload);
        }
    };

    return (
        <Card title="Редактирование данных о доме" style={{ maxWidth: 800, margin: '0 auto' }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
            >
                <Form.Item
                    label="Название"
                    name="name"
                    rules={[
                        { required: true, message: 'Имя не может быть null' },
                        { whitespace: true, message: 'Строка не может быть пустой' }
                    ]}
                >
                    <Input placeholder="Например: ЖК Возрождение" />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Год постройки"
                            name="year"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value !== undefined && value !== null) {
                                            if (value <= 0) {
                                                return Promise.reject(new Error('Год должен быть больше 0'));
                                            }
                                            if (value > 292) {
                                                return Promise.reject(new Error('Год должен быть не более 292'));
                                            }
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} precision={0} placeholder="Опционально (до 292)" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Количество квартир на этаже"
                            name="numberOfFlatsOnFloor"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (value !== undefined && value !== null && value <= 0) {
                                            return Promise.reject(new Error('Должно быть больше 0'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <InputNumber style={{ width: '100%' }} precision={0} placeholder="Опционально (> 0)" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Координата X"
                            name="x"
                            rules={[{ required: true, message: 'Укажите координату X' }]}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="X" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Координата Y"
                            name="y"
                            rules={[{ required: true, message: 'Укажите координату Y' }]}
                        >
                            <InputNumber style={{ width: '100%' }} placeholder="Y" />
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