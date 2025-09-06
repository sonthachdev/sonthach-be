import { CongDoan } from '../cong-doan.enum';
import { VaiTro } from '../vai-tro.enum';
import { TrangThai } from '../trang-thai.enum';
import { MauDa } from '../mau-da.enum';
import { MatDa } from '../mat-da.enum';
import { DonViDoLuong } from '../don-vi.enum';
import { DonViQuyCach } from '../don-vi.enum';
import { Kho } from '../kho.enum';
import { BaoCaoState } from '../bao-cao-state.enum';
import { LoaiPhieu } from '../loai-phieu.enum';

export type NhanVien = {
  id: string;
  ten: string;
  vaiTro: VaiTro;
  congDoan?: CongDoan;
};

export type YCSX = {
  id: string;
  maPhieu: string;
  nguoiTao: NhanVien;
  ngayTao: number;
  nguoiDuyet: NhanVien;
  ngayDuyet: number | undefined;
  phanCong: PhanCong[] | undefined;
  ngayHoanThanh: number | undefined;
  trangThai: TrangThai;
  maHopDong: string; // chỉ ở ycsx
  tenKhachHang: string; // chỉ ở ycsx
  hangMuc: HangMuc[]; // chỉ ở ycsx
  nguoiXuLy: NhanVien; // chỉ ở ycsx
  ngayXuLy: number | undefined; // chỉ ở ycsx
};

export type YCSC = {
  id: string;
  maPhieu: string;
  nguoiTao: NhanVien;
  ngayTao: number;
  nguoiDuyet: NhanVien;
  ngayDuyet: number | undefined;
  phanCong: PhanCong[]; // chỉ có 1 cặp KCS-TNSX cho tổ bổ
  ngayHoanThanh: number | undefined;
  trangThai: TrangThai;
};

export type HangMuc = {
  id: string;
  mota: string;
  mauDa: MauDa | undefined;
  matDa: MatDa | undefined;
  quyCach: QuyCach;
  groupId: string;
  ghichu?: string;
};

export type BaoCaoSanLuong = {
  id: string;
  ycscId?: string; // nghiệp vụ Sơ Chế, chỉ cần khi chưa có phiếu nghiệp vụ
  ycsxId?: string; // nghiệp vụ Sản Xuất, chỉ cần khi chưa có phiếu nghiệp vụ
  mada: string;
  maphoi: number | undefined; // bao giờ bổ mới có maphoi
  mauDa: MauDa;
  matDa: MatDa | undefined;
  quyCach: QuyCach;
  ngayTao: number;
  ngayDuyet: number | undefined;
  tnsx: NhanVien | undefined;
  kcs: NhanVien | undefined;
  // thuKho?: NhanVien; // nghiệp vụ Kho
  kho?: Kho; // bao giờ nhập kho thì sẽ có kho
  parentId: string | undefined;
  completedCongDoan: CongDoan | undefined; // khi nào hoàn thành 1 công đoạn thì sẽ có completedStep
  viTri?: string; // dành cho nguyên liệu(block,phôi) hoặc thành phẩm
  reason?: string; // dành cho nghiệp vụ không duyệt
  trangThai: BaoCaoState;
  pallet?: number;
  theoDonHang?: boolean;
};

export type PhieuNghiepVu = {
  id: string;
  maPhieu: string;
  loaiPhieu: LoaiPhieu;
  ycscId?: string; // dành cho yêu cầu sơ chế nguyên liệu
  ycsxId?: string; // dành cho yêu cầu sản xuất
  nguoiTao: NhanVien;
  ngayTao: number;
  nguoiDuyet: NhanVien;
  ngayDuyet: number | undefined;
  kho: Kho | undefined; // dành cho nghiệp vụ xuất nhập kho
  trangThai: TrangThai;
  bcslIds: string[]; // danh sách id BCSL
  currentCongDoan?: CongDoan; // tương ứng với step của BCSL
  nextCongDoan?: CongDoan; // dành cho nghiệp vụ chuyển tiếp
  pallet?: number;
  theoDonHang?: boolean;
};

export type PhanCong = {
  kcs: NhanVien;
  tnsx: NhanVien;
  congDoan: CongDoan;
};

export type QuyCach = {
  dai: number;
  rong: number;
  day: number;
  soLuong: number;
  dvtDoLuong: DonViDoLuong;
  dvtQuyCach: DonViQuyCach;
};
