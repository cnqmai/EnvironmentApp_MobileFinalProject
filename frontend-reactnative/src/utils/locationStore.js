// File: src/utils/locationStore.js

let pickedLocation = null;
// Thêm biến lưu nháp form
let draftForm = { description: '', imageUri: null };

// --- PHẦN VỊ TRÍ (Dùng cho MapScreen) ---
export const setLocation = (location) => {
  pickedLocation = location;
};

export const getLocation = () => {
  return pickedLocation;
};

// --- PHẦN DỮ LIỆU FORM (Dùng cho CreateReport) ---
export const saveDraftForm = (data) => {
  draftForm = { ...draftForm, ...data };
};

export const getDraftForm = () => {
  return draftForm;
};

// --- XÓA TẤT CẢ (Dùng khi gửi thành công) ---
export const clearAll = () => {
  pickedLocation = null;
  draftForm = { description: '', imageUri: null };
};