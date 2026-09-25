# คู่มือการติดตั้งและเชื่อมต่อ Supabase Database & Storage สำหรับระบบ OMS v1.22

ระบบ OMS (Operation Management System) รองรับการทำงานแบบ Full-Cloud ร่วมกับ **Supabase Database** (PostgreSQL) และ **Supabase Storage** (พร้อมระบบบีบอัดรูปภาพฝั่ง Client อัตโนมัติก่อนอัปโหลด) ทำให้สามารถนำโค้ดขึ้น **GitHub** แล้ว Deploy บน GitHub Pages, Vercel, Netlify หรือโฮสติ้งใดๆ ได้ทันทีโดยไม่ต้องตั้งค่าเซิร์ฟเวอร์ Backend ให้ยุ่งยาก

---

## ⚡ วิธีแก้ปัญหา: Publish ขึ้น GitHub แล้วไม่พบปุ่ม "Supabase Online" (ทำไมขึ้นเป็น โหมด Local?)

### 🔍 สาเหตุที่เกิดขึ้น:
1. **การแยกพื้นที่จัดเก็บของเบราว์เซอร์ (Domain Origin Isolation)**:
   - ตอนที่ท่านทดสอบเชื่อมต่อในหน้าสภาพแวดล้อม Dev ข้อมูล Supabase URL และ Anon Key จะถูกบันทึกไว้ใน `localStorage` ของโดเมนนั้น
   - เมื่อนำโค้ดขึ้น **GitHub Pages** (เช่น `https://<username>.github.io/<repo>/`) เบราว์เซอร์จะมองว่าเป็น **คนละโดเมนโดยสิ้นเชิง** ทำให้ `localStorage` ของหน้า GitHub ยังว่างเปล่า
   - ระบบจึงเข้าสู่ **โหมดจำลอง (Local Mockup Mode)** และปุ่มด้านบนขวาจะแสดงเป็น `[ ⚙️ Supabase: โหมด Local (คลิกเชื่อมต่อ) ]` สีเทา แทนที่จะเป็นสีเขียว `[ 🟢 Supabase: Online ]`

---

### 🛠️ วิธีแก้ไข (เลือกวิธีใดวิธีหนึ่ง):

#### ✅ วิธีที่ 1: ตั้งค่าให้ Online อัตโนมัติถาวรบน GitHub สำหรับทุกคน (แนะนำที่สุด ⭐)
1. เปิดไฟล์ `js/supabase-config.js` ในโปรเจกต์
2. นำ **Supabase URL** และ **Anon Key** ของท่านมากรอกลงในออบเจ็กต์:
   ```javascript
   window.OMS_SUPABASE_DEFAULT_CONFIG = {
       url: 'https://xxxxxxxxxxxx.supabase.co', // URL โปรเจกต์ Supabase ของคุณ
       key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Anon Public Key
       bucket: 'oms-storage'
   };
   ```
   *(หมายเหตุ: สามารถกดปุ่ม **"คัดลอกโค้ดไปใส่ js/supabase-config.js"** จากหน้าต่างตั้งค่าในเว็บได้ทันที)*
3. ทำการ `git commit` และ `git push` ไฟล์ `js/supabase-config.js` ขึ้น GitHub
4. เมื่อรีเฟรชหน้าเว็บ GitHub หรือใครก็ตามเปิดลิงก์ ระบบจะเชื่อมต่อเป็น **`[ 🟢 Supabase: Online ]` อัตโนมัติทันที** ทุกเครื่องและทุกเบราว์เซอร์!

#### ✅ วิธีที่ 2: กรอกเชื่อมต่อผ่านหน้าเว็บโดยตรง (เฉพาะสิทธิ์ผู้ดูแลระบบ Admin)
1. เข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบ (Username: `admin`, Password: `123`)
2. ในหน้า **Dashboard**:
   - ระบบจะแสดงปุ่ม **`[ 🗄️ Supabase: Online ]`** (หรือ **`[ 🗄️ ตั้งค่า Supabase Online ]`**) ที่มุมขวาบนของหน้าแดชบอร์ด
   - พร้อมการ์ดแจ้งสถานะ Supabase บนหน้าแดชบอร์ด
   - *(ผู้ใช้งานทั่วไป เช่น ฝ่ายขาย, คลัง, จัดซื้อ จะไม่เห็นปุ่มตั้งค่านี้ เพื่อความปลอดภัย)*
3. คลิกที่ปุ่มเพื่อเปิดหน้าต่างตั้งค่า กรอก **Supabase URL** และ **Anon Public Key**
4. กดปุ่ม **"บันทึกการตั้งค่า"**
5. สถานะจะเปลี่ยนเป็น **`[ 🟢 Supabase: Online ]`** สีเขียวทันที และข้อมูลจะซิงค์กับฐานข้อมูลบนคลาวด์

---

## 1. ลิสต์ตารางและฟิลด์ข้อมูลทั้งหมดในระบบ OMS (Data Dictionary)

### 1. ตาราง `system_settings` (ข้อมูลบริษัทและการตั้งค่าระบบ)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | รหัสอ้างอิงการตั้งค่า (ค่าเริ่มต้น: `'default'`) |
| `company_name` | TEXT | NOT NULL | ชื่อบริษัท |
| `company_address` | TEXT | - | ที่อยู่บริษัทตามทะเบียนภาษี |
| `tax_id` | TEXT | - | เลขประจำตัวผู้เสียภาษี 13 หลัก |
| `banks` | JSONB | - | รายการบัญชีธนาคาร (ชื่อธนาคาร, สาขา, เลขบัญชี, ชื่อบัญชี) |
| `security_settings` | JSONB | - | การตั้งค่าความปลอดภัย (จำนวนครั้งที่ใส่รหัสผิด, เวลาหน่วง, ล็อกบัญชี) |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่อัปเดตล่าสุด |

### 2. ตาราง `warehouses` (คลังสินค้า)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | TEXT | PRIMARY KEY | รหัสคลังสินค้า เช่น `W-MAIN`, `W-SUB1`, `W-SALES-4` |
| `name` | TEXT | NOT NULL | ชื่อคลังสินค้า เช่น คลังสินค้าหลัก, คลังย่อย, คลังรถเซลส์ |
| `address` | JSONB | - | ที่อยู่คลัง (เลขที่, หมู่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์) |
| `contact` | TEXT | - | ผู้ติดต่อประจำคลัง |
| `phone` | TEXT | - | เบอร์โทรศัพท์ผู้ติดต่อ |
| `type` | TEXT | DEFAULT 'sub' | ประเภทคลัง (`main` = คลังหลัก, `sub` = คลังย่อย, `sales` = คลังรถเซลส์) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 3. ตาราง `users` (ผู้ใช้งานและสิทธิ์ในระบบ)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | รหัสผู้ใช้ |
| `username` | TEXT | UNIQUE, NOT NULL | ชื่อบัญชีเข้าสู่ระบบ (เช่น admin, sales, warehouse) |
| `password_hash` | TEXT | DEFAULT '123' | รหัสผ่าน |
| `fullname` | TEXT | NOT NULL | ชื่อ-นามสกุลจริง |
| `nickname` | TEXT | - | ชื่อเล่น |
| `phone` | TEXT | - | เบอร์โทรศัพท์ (ใส่เลขและขีดได้) |
| `email` | TEXT | - | อีเมล |
| `role` | TEXT | NOT NULL | สิทธิ์การใช้งาน (`admin`, `purchasing`, `warehouse`, `sales`, `accounting`, `management`) |
| `area` | TEXT | DEFAULT 'HQ' | เขตการขายหรือพื้นที่ดูแล |
| `warehouse_id` | TEXT | REFERENCES warehouses(id) | คลังสินค้าที่ผู้ใช้สังกัดอยู่ |
| `shipping_address` | TEXT | - | ที่อยู่จัดส่งประจำตัวพนักงาน |
| `failed_attempts` | INTEGER | DEFAULT 0 | จำนวนครั้งที่กรอกรหัสผ่านผิด |
| `locked_until` | TIMESTAMPTZ | - | เวลาที่ปลดล็อคกรณีถูกระงับ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 4. ตาราง `vendors` (ผู้จำหน่าย / ซัพพลายเออร์)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | รหัสผู้จำหน่าย |
| `name` | TEXT | NOT NULL | ชื่อบริษัท/ร้านค้าผู้จำหน่าย |
| `contact` | TEXT | - | ชื่อผู้ติดต่อ |
| `phone` | TEXT | - | เบอร์โทรศัพท์ |
| `email` | TEXT | - | อีเมล |
| `tax_id` | TEXT | - | เลขประจำตัวผู้เสียภาษี |
| `address` | JSONB | - | ที่อยู่ผู้จำหน่าย (เลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์) |
| `products` | JSONB | DEFAULT '[]' | รายการสินค้าที่สั่งซื้อจากผู้จำหน่ายนี้ประจำ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 5. ตาราง `customers` (ข้อมูลลูกค้า / ร้านค้า)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | รหัสลูกค้า |
| `code` | TEXT | UNIQUE | รหัสลูกค้า เช่น `CUS-001` |
| `name` | TEXT | NOT NULL | ชื่อร้านค้าหรือชื่อลูกค้า |
| `contact` | TEXT | - | ชื่อผู้ติดต่อ |
| `phone` | TEXT | - | เบอร์โทรศัพท์ |
| `line_id` | TEXT | - | LINE ID |
| `address` | JSONB | - | ที่อยู่หลักของลูกค้า |
| `shipping_differs` | BOOLEAN | DEFAULT FALSE | แยกที่อยู่จัดส่งสินค้าคนละที่กับที่อยู่หลักหรือไม่ |
| `shipping_address` | JSONB | - | ที่อยู่จัดส่งสินค้า (กรณีแตกต่าง) |
| `vat_req` | BOOLEAN | DEFAULT FALSE | ต้องการใบกำกับภาษีหรือไม่ |
| `tax_name` | TEXT | - | ชื่อสำหรับออกใบกำกับภาษี |
| `tax_id` | TEXT | - | เลขประจำตัวผู้เสียภาษี 13 หลัก |
| `tax_address` | TEXT | - | ที่อยู่สำหรับออกใบกำกับภาษี |
| `assigned_sales` | JSONB | DEFAULT '[]' | รายชื่อเซลส์ที่รับผิดชอบลูกค้ารายนี้ (เช่น `["sales", "admin"]`) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 6. ตาราง `products` (สินค้าและสต็อกคงเหลือ)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | รหัสสินค้า |
| `sku` | TEXT | NOT NULL | รหัสสินค้า (SKU) เช่น `PROD-001` |
| `name` | TEXT | NOT NULL | ชื่อสินค้า |
| `category` | TEXT | DEFAULT 'ทั่วไป' | หมวดหมู่สินค้า |
| `cost_price` | NUMERIC(12,2) | DEFAULT 0 | ราคาทุน |
| `wholesale_price` | NUMERIC(12,2) | DEFAULT 0 | ราคาขายส่ง |
| `stock_qty` | INTEGER | DEFAULT 0 | จำนวนคงเหลือในคลังนี้ |
| `pending_in` | INTEGER | DEFAULT 0 | จำนวนที่รอรับเข้าจาก PO |
| `location` | TEXT | DEFAULT '-' | จุดจัดเก็บในคลัง (เช่น Zone A-1) |
| `warehouse` | TEXT | REFERENCES warehouses(id) | รหัสคลังที่เก็บสินค้าชิ้นนี้ |
| `unit` | TEXT | DEFAULT 'กล่อง' | หน่วยนับสินค้า เช่น กล่อง, ชิ้น, ลัง |
| `carton_qty` | INTEGER | DEFAULT 1 | จำนวนชิ้นต่อ 1 ลังบรรจุ |
| `image_url` | TEXT | - | URL รูปภาพสินค้าบน Supabase Storage |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 7. ตาราง `purchase_orders` (ใบสั่งซื้อสินค้า PO)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `po_no` | TEXT | UNIQUE, NOT NULL | เลขที่ใบสั่งซื้อ เช่น `PO-2607-001` |
| `vendor_id` | BIGINT | REFERENCES vendors(id) | รหัสผู้จำหน่าย |
| `vendor_name` | TEXT | NOT NULL | ชื่อผู้จำหน่าย |
| `status` | TEXT | DEFAULT 'Pending' | สถานะการสั่งซื้อ (`Pending`, `Complete`, `Cancelled`) |
| `payment_status` | TEXT | DEFAULT 'Unpaid' | สถานะจ่ายเงิน (`Unpaid`, `Partial Paid`, `Paid`, `Overpaid`) |
| `total_amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดรวมเงินสั่งซื้อทั้งสิ้น |
| `unpaid_amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดค้างชำระ |
| `created_by` | TEXT | - | ผู้สร้างใบสั่งซื้อ |
| `date` | DATE | DEFAULT CURRENT_DATE | วันที่เปิด PO |
| `completed_date` | DATE | - | วันที่รับสินค้าครบ |
| `items` | JSONB | DEFAULT '[]' | รายการสินค้าที่สั่ง (SKU, ชื่อ, จำนวน, ราคา, หน่วย) |
| `notes` | TEXT | - | หมายเหตุ |
| `attachment_url` | TEXT | - | URL ไฟล์แนบใน Supabase Storage |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 8. ตาราง `goods_receipts` (ประวัติการรับสินค้าเข้าคลัง)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `po_no` | TEXT | NOT NULL | อ้างอิงเลขที่ PO |
| `vendor_name` | TEXT | - | ชื่อผู้จำหน่าย |
| `date` | DATE | DEFAULT CURRENT_DATE | วันที่รับของ |
| `received_by` | TEXT | - | ผู้ตรวจรับสินค้าเข้าคลัง |
| `items` | JSONB | DEFAULT '[]' | รายการสินค้าและจำนวนที่รับจริง |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 9. ตาราง `purchase_payments` (ประวัติการชำระเงินค่าจัดซื้อ)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `po_id` | BIGINT | REFERENCES purchase_orders(id) | อ้างอิง PO ID |
| `po_no` | TEXT | - | อ้างอิงเลขที่ PO |
| `vendor_name` | TEXT | - | ชื่อผู้จำหน่าย |
| `date` | DATE | DEFAULT CURRENT_DATE | วันที่จ่ายเงิน |
| `amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดเงินที่จ่ายรอบนี้ |
| `net_amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดสุทธิของ PO |
| `unpaid_amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดคงเหลือค้างจ่าย |
| `method` | TEXT | DEFAULT 'โอนเงิน' | วิธีการชำระเงิน |
| `status` | TEXT | DEFAULT 'Completed' | สถานะรายการ |
| `sales_ref` | TEXT | - | เลขที่อ้างอิงใบเสร็จ/การขาย |
| `customer_ref` | TEXT | - | ลูกค้าอ้างอิง |
| `sales_name` | TEXT | - | พนักงานขายอ้างอิง |
| `created_by` | TEXT | - | ผู้บันทึกการจ่ายเงิน |
| `slip_url` | TEXT | - | URL สลิปโอนเงินจ่ายซัพพลายเออร์ (Supabase Storage) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 10. ตาราง `sales_orders` (รายการสั่งขาย SO)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `so_no` | TEXT | UNIQUE, NOT NULL | เลขที่ใบสั่งขาย เช่น `SO-2607-001` |
| `customer_id` | BIGINT | REFERENCES customers(id) | รหัสลูกค้า |
| `customer_name` | TEXT | NOT NULL | ชื่อลูกค้า/ร้านค้า |
| `date` | DATE | DEFAULT CURRENT_DATE | วันที่สั่งขาย |
| `subtotal` | NUMERIC(12,2) | DEFAULT 0 | ยอดรวมก่อนภาษี |
| `vat_amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดภาษีมูลค่าเพิ่ม (7%) |
| `total_amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดรวมทั้งสิ้น |
| `vat_req` | BOOLEAN | DEFAULT FALSE | ขอใบกำกับภาษีหรือไม่ |
| `delivery_type` | TEXT | DEFAULT 'จัดส่งโดยคลัง' | รูปแบบการจัดส่ง |
| `payment_type` | TEXT | DEFAULT 'เครดิต' | เงื่อนไขการชำระเงิน (เงินสด/เครดิต/โอน) |
| `payment_date` | DATE | - | วันครบกำหนดชำระ |
| `status` | TEXT | DEFAULT 'Pending' | สถานะ SO (`Pending`, `Approved`, `ไม่อนุมัติ`, `Completed`) |
| `payment_status` | TEXT | DEFAULT 'Unpaid' | สถานะเงิน (`Unpaid`, `Pending Review`, `Paid`) |
| `sales_person` | TEXT | - | พนักงานขายผู้ดูแลออเดอร์ |
| `po_no` | TEXT | - | เลข PO ของลูกค้า |
| `items` | JSONB | DEFAULT '[]' | รายการสินค้า (รหัส, ชื่อ, จำนวน, ราคา, หน่วย, ของแถม) |
| `delivery_address` | JSONB | - | ที่อยู่จัดส่งสินค้าตามโครงสร้าง (เลขที่, หมู่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์) |
| `tax_invoice_issued` | BOOLEAN | DEFAULT FALSE | ออกใบกำกับภาษีแล้วหรือไม่ |
| `tax_invoice_no` | TEXT | - | เลขที่ใบกำกับภาษี |
| `tax_invoice_date` | DATE | - | วันที่ออกใบกำกับภาษี |
| `tax_invoice_img` | TEXT | - | URL รูปภาพใบกำกับภาษี (Supabase Storage) |
| `slip_url` | TEXT | - | URL สลิปการโอนเงินชำระค่าสินค้า (Supabase Storage) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 11. ตาราง `sales_receipts` (แจ้งการเก็บเงิน / รับชำระจากลูกค้า)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `ref_no` | TEXT | - | เลขที่ใบเสร็จรับเงิน เช่น `RC-2606-01` |
| `so_no` | TEXT | - | อ้างอิงเลขที่ SO |
| `customer_name` | TEXT | - | ชื่อลูกค้า |
| `amount` | NUMERIC(12,2) | DEFAULT 0 | ยอดเงินที่รับชำระ |
| `date` | DATE | DEFAULT CURRENT_DATE | วันที่รับชำระเงิน |
| `method` | TEXT | DEFAULT 'โอนเงิน' | ช่องทางการชำระเงิน |
| `status` | TEXT | DEFAULT 'Pending' | สถานะ (`Pending` รอตรวจสอบ, `Approved` ตรวจสอบแล้ว) |
| `sales_person` | TEXT | - | พนักงานขายที่แจ้งเก็บเงิน |
| `slip_url` | TEXT | - | URL สลิปโอนเงิน (บีบอัด Client-Side แล้วเก็บใน Supabase Storage) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 12. ตาราง `requisitions` (รายการขอเบิกสินค้า)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `req_no` | TEXT | UNIQUE, NOT NULL | เลขที่ใบขอเบิก เช่น `REQ-2607-01` |
| `so_id` | BIGINT | REFERENCES sales_orders(id) | เชื่อมโยงรายการสั่งขาย (กรณีเบิกเพื่อขาย) |
| `so_no` | TEXT | - | เลขที่ SO ที่เชื่อมโยง |
| `type` | TEXT | DEFAULT 'เบิกเพื่อสต็อก' | ประเภทเบิก (`เบิกเพื่อขาย`, `เบิกเพื่อสต็อก`) |
| `status` | TEXT | DEFAULT 'Pending' | สถานะ (`Pending`, `Approved`, `Completed`) |
| `req_by` | TEXT | - | ผู้ขอเบิกสินค้า |
| `date` | DATE | DEFAULT CURRENT_DATE | วันที่ขอเบิก |
| `to_wh` | TEXT | - | เบิกไปให้ใคร/คลังปลายทาง |
| `req_method` | TEXT | DEFAULT 'จัดส่งตามที่อยู่' | วิธีการรับสินค้า (`จัดส่งตามที่อยู่`, `มารับสินค้าเอง`) |
| `delivery_address` | TEXT | - | ที่อยู่จัดส่งแบบครบถ้วนทุก field |
| `items` | JSONB | DEFAULT '[]' | รายการสินค้าและจำนวนที่เบิก |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 13. ตาราง `shipments` (สถานะการจัดส่งสินค้าและพิมพ์ใบปะหน้า)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `req_id` | BIGINT | REFERENCES requisitions(id) | รหัสใบขอเบิก |
| `req_no` | TEXT | - | เลขที่ใบขอเบิก |
| `type` | TEXT | - | ประเภทการเบิก |
| `to_wh` | TEXT | - | จุดหมายปลายทาง |
| `receiver` | TEXT | - | ชื่อผู้รับสินค้า |
| `sales` | TEXT | - | พนักงานขายที่ดูแล |
| `address` | TEXT | - | ที่อยู่จัดส่งครบทุกฟิลด์ (เลขที่ หมู่ ถนน ตำบล อำเภอ จังหวัด รหัสไปรษณีย์) |
| `date` | DATE | DEFAULT CURRENT_DATE | วันที่จัดส่ง |
| `carrier` | TEXT | - | บริษัทขนส่ง เช่น Kerry, Flash, ไปรษณีย์ไทย |
| `tracking` | TEXT | - | เลขติดตามพัสดุ (Tracking No.) |
| `doc` | TEXT | - | เลขที่ใบส่งของ (Delivery Order No.) |
| `items` | JSONB | DEFAULT '[]' | สินค้าที่บรรจุในลังพัสดุ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่สร้าง |

### 14. ตาราง `login_history` (ประวัติการเข้าใช้งาน)
| ชื่อฟิลด์ (Field) | ชนิดข้อมูล (Type) | Constraints | คำอธิบาย |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY (IDENTITY) | ลำดับ |
| `user` | TEXT | - | ชื่อผู้ใช้ที่ล็อกอิน |
| `fullname` | TEXT | - | ชื่อเต็ม |
| `time` | TIMESTAMPTZ | DEFAULT NOW() | วันเวลาที่เข้าใช้งาน |
| `ip` | TEXT | DEFAULT '127.0.0.1' | IP Address |
| `status` | TEXT | - | สถานะ (Success หรือ Failed) |

---

## 2. ขั้นตอนการสร้างโปรเจกต์และฐานข้อมูลบน Supabase (Step-by-Step)

### ขั้นตอนที่ 1: สมัครและสร้าง Project บน Supabase
1. เข้าไปที่ [https://supabase.com](https://supabase.com) แล้วล็อกอินด้วยบัญชี GitHub หรือ Google
2. คลิก **"New Project"**
3. กรอกข้อมูล:
   - **Name**: `oms-system` (หรือชื่อบริษัทของคุณ)
   - **Database Password**: ตั้งรหัสผ่านที่ปลอดภัย และจดบันทึกไว้
   - **Region**: เลือก `Singapore (ap-southeast-1)` เพื่อให้เชื่อมต่อได้เร็วที่สุดจากประเทศไทย
4. คลิก **"Create new project"** และรอประมาณ 1-2 นาทีจนระบบเตรียมฐานข้อมูลเสร็จสิ้น

---

### ขั้นตอนที่ 2: รันคำสั่ง SQL สร้างตารางทั้งหมด (ในคลิกเดียว)
1. ในเมนูด้านซ้ายของ Supabase Dashboard ให้คลิกที่ไอคอน **"SQL Editor"** (รูป `>_`)
2. คลิกปุ่ม **"New query"**
3. เปิดไฟล์ `supabase_schema.sql` ในโปรเจกต์นี้ คัดลอกโค้ด SQL ทั้งหมดมาวางลงในช่องพิมพ์
4. คลิกปุ่มสีเขียว **"Run"** (หรือกด `Ctrl + Enter`)
5. ระบบจะสร้าง:
   - ตารางทั้งหมด 14 ตาราง
   - กำหนด Primary Keys, Foreign Keys, Indexes
   - เปิดใช้งาน Row Level Security (RLS) พร้อมสิทธิ์การอ่านเขียนสำหรับ Web Application
   - สร้าง Storage Bucket ชื่อ `oms-storage` ให้โดยอัตโนมัติ

---

### ขั้นตอนที่ 3: ตรวจสอบ Storage Bucket สำหรับเก็บสลิปและรูปภาพ
1. คลิกเมนู **"Storage"** ในแถบด้านซ้าย
2. จะเห็น Bucket ชื่อ **`oms-storage`** (หากยังไม่มี ให้คลิก "New bucket" ตั้งชื่อว่า `oms-storage` และเปิดสวิตช์ **"Public bucket"** ให้เป็น ON)
3. ภายใน Bucket นี้ ระบบจะรองรับโฟลเดอร์:
   - `slips/` สำหรับสลิปโอนเงิน
   - `invoices/` สำหรับภาพใบกำกับภาษี
   - `products/` สำหรับรูปสินค้า

---

### ขั้นตอนที่ 4: นำ URL และ API Key มาใส่ในระบบ OMS
1. ใน Supabase Dashboard ให้คลิกที่ **"Project Settings"** (ไอคอนฟันเฟืองที่แถบซ้ายล่าง)
2. เลือกแท็บ **"API"**
3. คัดลอกข้อมูล 2 ค่าต่อไปนี้:
   - **Project URL**: ขึ้นต้นด้วย `https://xxxxxxxxxxxx.supabase.co`
   - **anon public Key**: ชุดตัวอักษรยาวๆ ในช่อง `Project API keys` (anon public)
4. เปิดเว็บแอป OMS v1.22 ของคุณ
5. ที่มุมขวาบนของหน้าจอ (ข้างชื่อผู้ใช้) คลิกปุ่ม **"Supabase: Setup / Local"** หรือไปที่เมนู **"ข้อมูลบริษัท/ตั้งค่าคลัง"**
6. นำ **Project URL** และ **Anon Key** วางลงในช่อง
7. คลิกปุ่ม **"ทดสอบการเชื่อมต่อ"** -> เมื่อขึ้นสำเร็จ ให้กด **"บันทึกการตั้งค่า"**
8. คลิกปุ่ม **"เริ่มต้นส่งข้อมูลตัวอย่างเข้า Supabase (Seed Initial Data)"** เพื่อนำข้อมูลตัวอย่างแรกเข้าสู่ระบบ Cloud ทันที!

---

## 3. ระบบบีบอัดรูปภาพฝั่งไคลเอนต์ (Client-Side Image Compression)

เพื่อประหยัดพื้นที่จัดเก็บข้อมูลบน Supabase Storage และทำให้การอัปโหลดผ่านสมาร์ทโฟนหรืออินเทอร์เน็ตมือถือรวดเร็ว ระบบ OMS ได้รวมกลไกการบีบอัดอัตโนมัติไว้ในตัว (`compressImage`):

1. **วิธีการทำงาน**:
   - เมื่อผู้ใช้เลือกรูปสลิปหรือรูปถ่ายสินค้า (ขนาด 3MB - 12MB)
   - ระบบจะอ่านไฟล์ด้วย HTML5 Canvas ในเครื่องผู้ใช้ทันที โดยไม่ต้องส่งรูปต้นฉบับขนาดใหญ่ขึ้นเซิร์ฟเวอร์
   - ปรับสัดส่วนกว้าง x ยาว สูงสุดไม่เกิน `1280 x 1280 px` พร้อมคงอัตราส่วนเดิม (Aspect Ratio)
   - แปลงและบีบอัดเป็นภาพ JPEG คุณภาพ 80% (`quality: 0.8`)
   - ขนาดไฟล์จะลดลงจาก **5MB เหลือเพียง ~150KB - 250KB (ประหยัดพื้นที่และแบนด์วิดท์มากกว่า 90-95%)**
2. **การแสดงผลในหน้าจอ**:
   - มีป้ายแจ้งขนาดก่อนบีบอัด vs หลังบีบอัดแบบ Real-time ให้ผู้ใช้งานเห็นชัดเจน
   - มีช่องพรีวิวภาพก่อนกดอัปโหลด
   - เมื่ออัปโหลดเสร็จ ระบบจะนำ Public URL จาก Supabase Storage ไปบันทึกลงในรายการสั่งขาย (SO) หรือใบแจ้งชำระเงิน (Receipt) ทันที

---

## 4. วิธีแก้ไขปัญหาที่พบบ่อย (Troubleshooting)

### กรณีขึ้นแจ้งเตือน: `permission denied for table system_settings`
- **สาเหตุ**: เกิดจากสิทธิ์ในระดับตารางของ PostgreSQL ยังไม่ได้อนุญาตให้บทบาท `anon` (Public API Key) เข้าถึงข้อมูล
- **วิธีแก้ไข**: ให้ไปที่ Supabase > **SQL Editor** แล้วรันคำสั่ง 4 บรรทัดนี้:
```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
```
เมื่อรันแล้ว ให้กลับมากด **"ทดสอบการเชื่อมต่อ"** อีกครั้ง จะเชื่อมต่อสำเร็จทันทีครับ!
