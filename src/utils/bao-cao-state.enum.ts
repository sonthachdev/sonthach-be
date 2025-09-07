export enum BaoCaoState {
  NEW = 'new', // mới được tạo
  APPROVED = 'approved', // đã được duyệt
  REJECTED = 'rejected', // không được duyệt
  IMPORTED = 'imported', // đã được nhập kho
  RESERVED = 'reserved', // chờ xuất/nhập kho
  EXPORTED = 'exported', // đã được xuất kho để sản xuất hoặc bán
  FORWARDED = 'forwarded', // đã được chuyển tiếp
}
