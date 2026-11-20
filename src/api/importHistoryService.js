import api from './axios';

export const importHistoryService = {
    async getImportHistory(page = 0, size = 10, sort = 'id,desc') {
        const response = await api.get(`/importHistory`, {
            params: { page, size, sort }
        });
        return response.data;
    }
};