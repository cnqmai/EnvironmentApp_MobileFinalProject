import { API_BASE_URL } from '../constants/api';
import { getToken } from '../utils/apiHelper';

export const uploadFile = async (uri) => {
  try {
    const token = await getToken();
    
    // 1. Chuẩn bị tên file và kiểu file
    const uriParts = uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1];
    const fileName = `upload_${Date.now()}.${fileExtension}`;
    const fileType = `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`;

    // 2. Tạo FormData
    const formData = new FormData();
    formData.append('file', { 
      uri: uri, 
      name: fileName, 
      type: fileType 
    });

    // 3. Gọi API bằng fetch (thay vì axios/apiHelper để tránh lỗi Boundary)
    // Lưu ý: Endpoint này phải khớp với Backend của bạn
    const response = await fetch(`${API_BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // KHÔNG set Content-Type, để fetch tự xử lý
      },
      body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server lỗi: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // 4. Trả về URL (Xử lý nếu server trả về path tương đối)
    let fileUrl = data.url; 
    if (fileUrl && fileUrl.startsWith("/")) {
        const domain = API_BASE_URL.replace("/api", ""); // Lấy domain gốc
        fileUrl = `${domain}${fileUrl}`;
    }
    
    return fileUrl;

  } catch (error) {
    console.error("File Service Error:", error);
    throw error;
  }
};