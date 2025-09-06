export enum TrangThai {
  NEW = 'new',
  REVIEWED = 'reviewed',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export const getTrangThaiName = (
  trangThai: TrangThai,
  isBCSL: boolean = false,
  isXuatKho: boolean = false,
): string => {
  switch (trangThai) {
    case TrangThai.NEW:
      return 'Mới';
    case TrangThai.REVIEWED:
      return 'Chờ duyệt';
    case TrangThai.COMPLETED:
      return isBCSL
        ? isXuatKho
          ? 'Đã xuất kho'
          : 'Đã nhập kho'
        : 'Đã hoàn thành';
    case TrangThai.CANCELLED:
      return 'Đã hủy bỏ';
    case TrangThai.PROCESSING:
      return isBCSL ? 'Chờ duyệt' : 'Đang xử lý';
    case TrangThai.APPROVED:
      return 'Đã duyệt';
    case TrangThai.REJECTED:
      return 'Không Duyệt';
    default:
      return 'Tạo mới';
  }
};

export const getTrangThaiColor = (
  trangThai: TrangThai,
  isXuatKho: boolean | null = null,
): string => {
  if (trangThai === TrangThai.COMPLETED && isXuatKho !== null) {
    if (isXuatKho) {
      return 'green';
    } else {
      return 'red';
    }
  }
  switch (trangThai) {
    case TrangThai.NEW:
      return 'gold';
    case TrangThai.REVIEWED:
      return 'cyan';
    case TrangThai.COMPLETED:
      return 'green';
    case TrangThai.CANCELLED:
      return 'red';
    case TrangThai.PROCESSING:
      return 'blue';
    default:
      return '';
  }
};
