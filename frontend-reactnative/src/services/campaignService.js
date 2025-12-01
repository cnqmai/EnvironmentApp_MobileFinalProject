// File: src/services/campaignService.js

import { API_BASE_URL } from '../constants/api'; 
import { fetchWithAuth } from '../utils/apiHelper'; // Giả định import helper

/**
 * Đăng ký tham gia chiến dịch và nhận 100 điểm thưởng
 * POST /api/campaigns/{eventId}/register
 */
export const registerForCampaign = async (eventId) => {
    const url = `${API_BASE_URL}/campaigns/${eventId}/register`;

    const response = await fetchWithAuth(url, {
        method: 'POST',
    });

    if (!response.ok) {
        let errorDetail;
        try {
            errorDetail = await response.json();
        } catch (e) {
            errorDetail = { message: 'Đăng ký thất bại với mã lỗi: ' + response.status };
        }
        
        throw new Error(errorDetail.message || 'Đăng ký chiến dịch thất bại.');
    }
    
    return true; 
};

/**
 * Lấy TẤT CẢ sự kiện (campaigns).
 * GET /api/campaigns/all 
 */
export const fetchAllEvents = async () => {
    const url = `${API_BASE_URL}/campaigns/all`;

    const response = await fetchWithAuth(url, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Không thể tải tất cả sự kiện.');
    }
    
    return response.json(); 
};

/**
 * Lấy chi tiết một sự kiện.
 * GET /api/campaigns/{eventId}
 */
export const fetchEventDetail = async (eventId) => {
    const url = `${API_BASE_URL}/campaigns/${eventId}`;

    const response = await fetchWithAuth(url, {
        method: 'GET',
    });

    if (!response.ok) {
        throw new Error('Không thể tải chi tiết sự kiện.');
    }
    
    return response.json(); 
};

/**
 * Tạo sự kiện/chiến dịch mới. 
 * POST /api/campaigns
 */
export const createCampaign = async (eventData) => { 
    const url = `${API_BASE_URL}/campaigns`;

    const response = await fetchWithAuth(url, {
        method: 'POST',
        body: JSON.stringify(eventData),
    });

    if (!response.ok) {
        let errorDetail;
        try {
            errorDetail = await response.json();
        } catch (e) {
            errorDetail = { message: 'Lỗi khi tạo sự kiện' };
        }
        
        throw new Error(errorDetail.message || 'Tạo sự kiện thất bại.');
    }
    
    return response.json(); // Trả về sự kiện mới được tạo
};