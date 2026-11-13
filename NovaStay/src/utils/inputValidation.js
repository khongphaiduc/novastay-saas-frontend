// Quy tắc nhập liệu dùng chung cho số điện thoại và số CCCD.
// Phải khớp với backend: VietnamesePhoneAttribute (^0[0-9]{9}$) và CitizenIdAttribute (^[0-9]{12}$).

export const PHONE_PATTERN = /^0[0-9]{9}$/;
export const CITIZEN_ID_PATTERN = /^[0-9]{12}$/;

export const PHONE_MAX_LENGTH = 10;
export const CITIZEN_ID_MAX_LENGTH = 12;

export const PHONE_ERROR_MESSAGE = 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.';
export const CITIZEN_ID_ERROR_MESSAGE = 'Số CCCD phải gồm đúng 12 chữ số.';

// Trả về chuỗi lỗi, hoặc '' nếu hợp lệ.
// Ô không bắt buộc và để trống thì coi là hợp lệ.
export function validatePhone(value, { required = true } = {}) {
  const text = (value ?? '').toString().trim();
  if (!text) return required ? 'Vui lòng nhập số điện thoại.' : '';
  return PHONE_PATTERN.test(text) ? '' : PHONE_ERROR_MESSAGE;
}

export function validateCitizenId(value, { required = false } = {}) {
  const text = (value ?? '').toString().trim();
  if (!text) return required ? 'Vui lòng nhập số CCCD.' : '';
  return CITIZEN_ID_PATTERN.test(text) ? '' : CITIZEN_ID_ERROR_MESSAGE;
}
