import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import api from "../api/axios";
import { useWebSocket } from "./useWebSocket.js";

export const useEntityTable = ({ listEndpoint, baseUrl, mapper, entityName = "объекта" }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const [filters, setFilters] = useState({});
    const [sorter, setSorter] = useState(null);

    const [tableParams, setTableParams] = useState({
        filters: {},
        sorter: {},
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedFullData, setSelectedFullData] = useState(null);

    const [houseToDeleteId, setHouseToDeleteId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const currentEndpointRef = useRef(listEndpoint || `${baseUrl}/all`);
    const currentPageRef = useRef(currentPage);
    const pageSizeRef = useRef(pageSize);
    const filtersRef = useRef(filters);
    const sorterRef = useRef(sorter);

    currentPageRef.current = currentPage;
    pageSizeRef.current = pageSize;
    filtersRef.current = filters;
    sorterRef.current = sorter;

    const fetchData = useCallback(async (
        page = currentPageRef.current,
        size = pageSizeRef.current,
        currentFilters = filtersRef.current,
        currentSorter = sorterRef.current,
        customEndpoint = null
    ) => {
        setLoading(true);
        try {
            const endpoint = customEndpoint || currentEndpointRef.current;

            const params = {
                page: page - 1,
                size: size,
                ...currentFilters
            };

            if (currentSorter && currentSorter.field && currentSorter.order) {
                const direction = currentSorter.order === 'ascend' ? 'asc' : 'desc';
                params.sort = `${currentSorter.field},${direction}`;
            }

            const response = await api.get(endpoint, { params });
            const { content = [], totalElements: total = 0 } = response.data;
            setData(content.map(mapper));
            setTotalElements(total);
        } catch (error) {
            message.error(`Ошибка при загрузке списка (${entityName})`);
        } finally {
            setLoading(false);
        }
    }, [mapper, entityName]);

    const handleTableChange = (pagination, tableFilters, tableSorter) => {
        const flattenedFilters = {};
        const rangeFields = ['year', 'numberOfFlatsOnFloor', 'area', 'price', 'numberOfRooms', 'timeToMetroOnFoot'];

        Object.keys(tableFilters).forEach(key => {
            const val = tableFilters[key];
            if (val && Array.isArray(val) && val.length > 0) {
                if (rangeFields.includes(key)) {
                    const range = val[0];
                    if (Array.isArray(range)) {
                        const [min, max] = range;
                        if (min !== undefined && min !== '') flattenedFilters[`${key}Min`] = min;
                        if (max !== undefined && max !== '') flattenedFilters[`${key}Max`] = max;
                    }
                } else {
                    if (val[0] !== undefined && val[0] !== '') {
                        flattenedFilters[key] = val[0];
                    }
                }
            }
        });

        setTableParams({ filters: tableFilters, sorter: tableSorter });
        setCurrentPage(currentPageRef.current);
        setPageSize(pageSizeRef.current);
        setFilters(flattenedFilters);
        setSorter(tableSorter);
    };

    const changeEndpoint = useCallback((newEndpoint) => {
        currentEndpointRef.current = newEndpoint || `${baseUrl}/all`;
        setCurrentPage(1);
        fetchData(1, pageSizeRef.current, filtersRef.current, sorterRef.current, currentEndpointRef.current);
    }, [baseUrl, fetchData]);

    useEffect(() => {
        fetchData(currentPage, pageSize, filters, sorter);
    }, [currentPage, pageSize, filters, sorter, fetchData]);

    const handlePageChange = (newPage, newSize) => {
        setCurrentPage(newPage);
        setPageSize(newSize);
    };

    const handleCreateClick = () => {
        setIsCreateMode(true);
        setSelectedFullData(null);
        setIsModalOpen(true);
    };

    const handleEditClick = async (id) => {
        setIsCreateMode(false);
        setIsModalOpen(true);
        setModalLoading(true);

        try {
            const response = await api.get(`${baseUrl}/${id}`);
            setSelectedFullData(response.data);
        } catch (error) {
            message.error(`Ошибка получения данных (${entityName})`);
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleDeleteClick = async (id) => {
        if (entityName === 'house') {
            setHouseToDeleteId(id);
            setIsDeleteModalOpen(true);
            return;
        }

        executeDelete(id, null);
    };

    const executeDelete = async (id, newHouseId) => {
        setActionLoading(true);
        try {
            const config = {};
            if (newHouseId !== undefined && newHouseId !== null && newHouseId !== '') {
                config.params = { newHouseId };
            }

            const response = await api.delete(`${baseUrl}/${id}`, config);
            if (response.status === 204 || response.status === 200) {
                message.success(`${entityName} успешно удален(а)`);
                setIsDeleteModalOpen(false);
                setHouseToDeleteId(null);
                fetchData();
            }
        } catch (error) {
            message.error(error.response?.data?.message || `Ошибка при удалении (${entityName})`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleFormSubmit = async (payload) => {
        setModalLoading(true);
        try {
            if (isCreateMode) {
                await api.post(`${baseUrl}/create`, payload);
                message.success(`${entityName} успешно создан!`);
            } else {
                if (!selectedFullData?.id) return;
                await api.patch(`${baseUrl}/${selectedFullData.id}`, payload);
                message.success(`${entityName} успешно обновлен!`);
            }

            setIsModalOpen(false);
            setSelectedFullData(null);
            fetchData();
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                (isCreateMode ? `Ошибка при создании` : `Ошибка при обновлении`);
            message.error(errorMessage);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedFullData(null);
    };

    useWebSocket((event) => {
        const { entityType } = event;
        if (entityType && entityType.toLowerCase() === entityName.toLowerCase()) {
            fetchData();
        }
    });

    const handleResetFilters = () => {
        setFilters({});
        setSorter(null);
        setCurrentPage(1);
        setTableParams({ filters: {}, sorter: {} });
        fetchData(1, pageSizeRef.current, {}, null);
    };

    return {
        data,
        setData,
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
        fetchData,
        changeEndpoint,
        handleResetFilters,
    };
};