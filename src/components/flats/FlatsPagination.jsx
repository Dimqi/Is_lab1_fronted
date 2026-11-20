import React from 'react';
import { Pagination, Flex } from 'antd';

export const FlatsPagination = ({
                                    currentPage = 1,
                                    pageSize = 10,
                                    totalElements = 0,
                                    onChange,
                                    disabled = false,
                                }) => {
    return (
        <Flex justify="end" style={{ marginTop: 16 }}>
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalElements}
                onChange={onChange}
                disabled={disabled}
                showSizeChanger={false}
                showTotal={(total, range) =>
                    `${range[0]}-${range[1]} из ${total} объектов`
                }
            />
        </Flex>
    );
};