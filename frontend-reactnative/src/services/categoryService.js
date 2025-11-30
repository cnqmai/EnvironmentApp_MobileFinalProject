import { API_BASE_URL } from '../constants/api';

export const getAllCategories = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const searchCategories = async (keyword) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/search?keyword=${encodeURIComponent(keyword)}`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const classifyWasteByText = async (description) => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/classify/text?description=${encodeURIComponent(description)}`, { method: 'POST' });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const classifyWasteByImage = async (imageUri) => {
    try {
        const formData = new FormData();
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('image', { uri: imageUri, name: filename, type });

        const response = await fetch(`${API_BASE_URL}/categories/classify/image`, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        return null;
    }
};