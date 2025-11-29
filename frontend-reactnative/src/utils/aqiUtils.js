// utils/aqiUtils.js

/**
 * Lấy màu sắc tương ứng với chỉ số AQI (Dựa trên AQI Service)
 * @param {number|string} aqiValue Giá trị AQI (0-500)
 * @returns {string} Mã màu Hex
 */
export const getAqiColor = (aqiValue) => {
    const aqi = parseInt(aqiValue);
    if (isNaN(aqi) || aqi < 0) return '#999999'; // Unknown

    if (aqi >= 301) return '#800080'; // Hazardous
    if (aqi >= 201) return '#FF0000'; // Very Unhealthy
    if (aqi >= 151) return '#FF9900'; // Unhealthy
    if (aqi >= 101) return '#FFFF00'; // Unhealthy for sensitive groups
    if (aqi >= 51) return '#00C853'; // Moderate - Giữ màu xanh lá đậm cho Moderate
    return '#00C853'; // Good - Màu xanh lá (dùng chung với Moderate để đơn giản)
};

/**
 * Lấy tên trạng thái tương ứng với chỉ số AQI (Dựa trên AQI Service)
 * @param {number|string} aqiValue Giá trị AQI (0-500)
 * @returns {string} Tên trạng thái
 */
export const getAqiStatusText = (aqiValue) => {
    const aqi = parseInt(aqiValue);
    if (isNaN(aqi) || aqi < 0) return 'Không rõ';

    if (aqi >= 301) return 'Nguy hiểm';
    if (aqi >= 201) return 'Rất không lành mạnh';
    if (aqi >= 151) return 'Không lành mạnh';
    if (aqi >= 101) return 'Không lành mạnh cho nhóm nhạy cảm';
    if (aqi >= 51) return 'Trung bình';
    return 'Tốt';
};