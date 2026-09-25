/**
 * OMS (Operation Management System) - Main Application Controller
 * File: app.js
 */

const app = {
    roles: {
        admin: { name: 'ผู้ดูแลระบบ', color: 'bg-red-600' },
        purchasing: { name: 'ฝ่ายจัดซื้อ', color: 'bg-blue-600' },
        warehouse: { name: 'ฝ่ายคลังสินค้า', color: 'bg-amber-600' },
        sales: { name: 'ฝ่ายขาย', color: 'bg-green-600' },
        accounting: { name: 'ฝ่ายบัญชี', color: 'bg-purple-600' },
        management: { name: 'ผู้บริหาร', color: 'bg-slate-800' }
    },
    currentUser: null,
    isSidebarOpen: true,
    isProfileMenuOpen: false,
    
    mockData: {
        company: {
            name: 'บริษัท โอเอ็มเอส โซลูชั่น จำกัด',
            address: '123/45 หมู่ 1 ถ.สุขุมวิท ต.คลองเตย อ.คลองเตย จ.กรุงเทพมหานคร 10110',
            tax_id: '0105555555555',
            banks: [ { bank: 'กสิกรไทย', branch: 'สุขุมวิท', account_name: 'บจก. โอเอ็มเอส', account_no: '0123456789' } ]
        },
        warehouses: [
            { id: 'W-MAIN', name: 'คลังสินค้าหลัก (Main WH)', address: { no: '99', moo: '1', road: 'บางนา-ตราด', subdistrict: 'บางพลีใหญ่', district: 'บางพลี', province: 'สมุทรปราการ', zip: '10540' }, contact: 'สมหมาย', phone: '0833333333', type: 'main' },
            { id: 'W-SUB1', name: 'คลังสินค้าย่อย (Branch 1)', address: { no: '11', moo: '-', road: 'ลาดพร้าว', subdistrict: 'จตุจักร', district: 'จตุจักร', province: 'กรุงเทพมหานคร', zip: '10900' }, contact: 'พนักงานย่อย', phone: '021112222', type: 'sub' }
        ],
        users: [
            { id: 1, username: 'admin', password: '123', fullname: 'สมชาย ระบบดี', nickname: 'ชาย', phone: '0811111111', email: 'admin@oms.com', role: 'admin', area: 'HQ', shipping_address: '-' },
            { id: 2, username: 'purchasing', password: '123', fullname: 'วิชัย จัดให้', nickname: 'ชัย', phone: '0822222222', email: 'pur@oms.com', role: 'purchasing', area: 'HQ', shipping_address: '-' },
            { id: 3, username: 'warehouse', password: '123', fullname: 'สมหมาย คลังของ', nickname: 'หมาย', phone: '0833333333', email: 'wh@oms.com', role: 'warehouse', area: 'Main WH', warehouse_id: 'W-MAIN', shipping_address: '-' },
            { id: 4, username: 'sales', password: '123', fullname: 'สมหญิง ยอดขาย', nickname: 'หญิง', phone: '0844444444', email: 'sale@oms.com', role: 'sales', area: 'BKK', shipping_address: '123 ถ.สุขุมวิท กทม 10110' },
            { id: 5, username: 'management', password: '123', fullname: 'ท่านประธาน', nickname: 'บอส', phone: '0855555555', email: 'ceo@oms.com', role: 'management', area: 'HQ', shipping_address: '-' },
            { id: 6, username: 'accounting', password: '123', fullname: 'สมศรี การเงิน', nickname: 'ศรี', phone: '0866666666', email: 'acc@oms.com', role: 'accounting', area: 'HQ', shipping_address: '-' },
            { id: 7, username: 'sales2', password: '123', fullname: 'น้องเซลส์ใหม่', nickname: 'นิว', phone: '0899999999', email: 'sale2@oms.com', role: 'sales', area: 'CNX', shipping_address: '99/9 เชียงใหม่ 50000' },
            { id: 8, username: 'wh_sub1', password: '123', fullname: 'สมปอง คลังย่อย', nickname: 'ปอง', phone: '0877777777', email: 'wh2@oms.com', role: 'warehouse', area: 'Branch 1', warehouse_id: 'W-SUB1', shipping_address: '-' }
        ],
        products: [
            { id: 1, sku: 'PROD-001', name: 'Grakcu บรรจุ 6 Capsule', cost_price: 18000, wholesale_price: 20000, stock_qty: 450, pending_in: 0, location: 'Zone A-1', warehouse: 'W-MAIN', unit: 'กล่อง', carton_qty: 300 },
            { id: 2, sku: 'PROD-002', name: 'เมาส์ไร้สาย Ergo M1', cost_price: 400, wholesale_price: 550, stock_qty: 120, pending_in: 10, location: 'Zone B-2', warehouse: 'W-MAIN', unit: 'กล่อง', carton_qty: 50 },
            { id: 3, sku: 'PROD-003', name: 'คีย์บอร์ด Mechanical', cost_price: 1100, wholesale_price: 1500, stock_qty: 12, pending_in: 0, location: 'Zone B-3', warehouse: 'W-MAIN', unit: 'กล่อง', carton_qty: 20 },
            { id: 4, sku: 'PROD-001', name: 'Grakcu บรรจุ 6 Capsule', cost_price: 18000, wholesale_price: 20000, stock_qty: 10, pending_in: 0, location: 'รถเซลส์', warehouse: 'W-SALES-4', unit: 'กล่อง', carton_qty: 300 }
        ],
        vendors: [
            { 
                id: 1, name: 'IT Supplier Co.,Ltd.', contact: 'คุณวิชัย', phone: '021112222', email: 'sales@itsupplier.com',
                address: { no: '123/4', moo: '5', road: 'รัชดาภิเษก', subdistrict: 'ดินแดง', district: 'ดินแดง', province: 'กรุงเทพมหานคร', zip: '10400' },
                tax_id: '0105511111111',
                products: [ { product_id: 1, sku: 'PROD-001', name: 'Grakcu บรรจุ 6 Capsule', unit: 'กล่อง', carton_qty: 300, cost: 18000 }, { product_id: 3, sku: 'PROD-003', name: 'คีย์บอร์ด Mechanical', unit: 'กล่อง', carton_qty: 20, cost: 1100 } ]
            }
        ],
        customers: [
            {
                id: 1, code: 'CUS-001', name: 'ร้านไอทีสแควร์ (IT Square)', contact: 'คุณสมศักดิ์', phone: '029998888', line_id: '@itsquare',
                address: { no: '12', moo: '-', road: 'ลาดพร้าว', subdistrict: 'จอมพล', district: 'จตุจักร', province: 'กรุงเทพมหานคร', zip: '10900' },
                shipping_differs: false, shipping_address: null,
                vat_req: true, tax_name: 'บริษัท ไอทีสแควร์ จำกัด', tax_id: '0105522222222', tax_address: '12 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กทม. 10900',
                assigned_sales: ['sales', 'admin', 'management']
            }
        ],
        purchaseOrders: [
            {
                id: 1, po_no: 'PO-2607-001', vendor_id: 1, vendor_name: 'IT Supplier Co.,Ltd.',
                status: 'Pending', payment_status: 'Partial Paid', total_amount: 90000, unpaid_amount: 40000,
                created_by: 'Management (ท่านประธาน)', date: '2026-07-18', completed_date: null,
                items: [ { product_id: 1, sku: 'PROD-001', name: 'Grakcu บรรจุ 6 Capsule', ordered_qty: 5, received_qty: 0, pending_qty: 5, price: 18000, is_free: false, unit: 'กล่อง' } ]
            },
            {
                id: 3, po_no: 'PO-2607-003', vendor_id: 1, vendor_name: 'IT Supplier Co.,Ltd.',
                status: 'Complete', payment_status: 'Overpaid', total_amount: 10000, unpaid_amount: -5000,
                created_by: 'Purchasing (วิชัย)', date: '2026-07-20', completed_date: '2026-07-21',
                items: [ { product_id: 3, sku: 'PROD-003', name: 'คีย์บอร์ด Mechanical', ordered_qty: 10, received_qty: 10, pending_qty: 0, price: 1000, is_free: false, unit: 'กล่อง' } ]
            }
        ],
        goodsReceipts: [
            { id: 1, po_no: 'PO-2607-003', vendor_name: 'IT Supplier Co.,Ltd.', date: '2026-07-21', received_by: 'สมหมาย คลังของ', items: [{ sku: 'PROD-003', name: 'คีย์บอร์ด Mechanical', ordered_qty: 10, received_qty: 10, pending_qty: 0, unit: 'กล่อง' }] }
        ],
        purchasePayments: [
            { id: 1, po_id: 1, po_no: 'PO-2607-001', vendor_name: 'IT Supplier Co.,Ltd.', date: '2026-07-20', amount: 50000, net_amount: 90000, unpaid_amount: 40000, method: 'โอนเงิน', status: 'Completed', sales_ref: 'RC-2606-01', customer_ref: 'ร้านไอทีสแควร์', sales_name: 'สมหญิง ยอดขาย', created_by: 'สมศรี การเงิน' },
            { id: 2, po_id: 3, po_no: 'PO-2607-003', vendor_name: 'IT Supplier Co.,Ltd.', date: '2026-07-21', amount: 15000, net_amount: 10000, unpaid_amount: -5000, method: 'โอนเงิน', status: 'Completed', sales_ref: '', customer_ref: '-', sales_name: '-', created_by: 'สมศรี การเงิน' }
        ],
        salesOrders: [
            { 
                id: 1, so_no: 'SO-2607-001', customer_id: 1, customer_name: 'ร้านไอทีสแควร์', date: '2026-07-22', 
                subtotal: 20000, vat_amount: 0, total_amount: 20000, vat_req: true, 
                delivery_type: 'จัดส่งโดยคลัง', payment_type: 'เครดิต', payment_date: '2026-08-22', 
                status: 'Pending', payment_status: 'Unpaid', sales_person: 'สมหญิง ยอดขาย', po_no: 'PO-IT-001',
                items: [ { product_id: 1, sku: 'PROD-001', name: 'Grakcu บรรจุ 6 Capsule', qty: 1, price: 20000, is_free: false, unit: 'กล่อง' } ] 
            }
        ],
        salesReceipts: [
            { id: 1, ref_no: 'RC-2606-01', so_no: '', customer: 'ร้านไอทีสแควร์', amount: 50000, date: '2026-07-20', method: 'โอนเงิน', status: 'Verified', sales_name: 'สมหญิง ยอดขาย' }
        ],
        requisitions: [
            { id: 1, req_no: 'REQ-2607-01', type: 'เบิกเพื่อสต็อก', status: 'Pending', req_by: 'สมหญิง ยอดขาย', date: '2026-07-24', to_wh: 'คลังเซลส์ - sales', req_method: 'จัดส่งตามที่อยู่', delivery_address: 'กทม.', items: [{ sku: 'PROD-002', name: 'เมาส์ไร้สาย', req_qty: 5, unit: 'กล่อง' }] },
            { id: 2, so_id: 1, so_no: 'SO-2607-001', req_no: 'REQ-2607-02', type: 'เบิกเพื่อขาย', status: 'Pending', req_by: 'สมหญิง ยอดขาย', date: '2026-07-23', to_wh: 'ลูกค้า: ร้านไอทีสแควร์', req_method: 'จัดส่งตามที่อยู่', delivery_address: '12 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร กทม. 10900', items: [{ sku: 'PROD-001', name: 'Grakcu บรรจุ 6 Capsule', req_qty: 1, unit: 'กล่อง' }] },
            { id: 3, req_no: 'REQ-2607-03', type: 'เบิกเพื่อสต็อก', status: 'Completed', req_by: 'สมหมาย คลังของ', date: '2026-07-20', to_wh: 'คลังสินค้าย่อย (Branch 1)', req_method: 'มารับสินค้าเอง (ไม่ต้องส่ง)', delivery_address: '-', items: [{ sku: 'PROD-003', name: 'คีย์บอร์ด Mechanical', req_qty: 5, unit: 'กล่อง' }] }
        ],
        shipments: [
            { id: 1, req_id: 99, req_no: 'REQ-2606-99', type: 'เบิกเพื่อขาย', to_wh: 'ร้านไอทีสแควร์', receiver: 'ร้านไอทีสแควร์', sales: 'sales', address: '12 ลาดพร้าว กทม.', date: '2026-06-25', carrier: 'Kerry', tracking: 'KRY123456', doc: 'DO-001', items: [{name: 'เมาส์ไร้สาย', req_qty: 2, unit: 'กล่อง'}] }
        ],
        securitySettings: {
            maxFailedBeforeDelay: 5,
            delaySeconds: 30,
            maxFailedBeforeLock: 10
        },
        loginHistory: []
    },

    init: function() {
        // Auto generate Sales Warehouses
        this.mockData.users.filter(u => u.role === 'sales').forEach(u => {
            const wid = 'W-SALES-' + u.id;
            if(!this.mockData.warehouses.find(w => w.id === wid)) {
                this.mockData.warehouses.push({ id: wid, name: `คลังเซลส์ - ${u.fullname}`, address: { no: '-', road: '-', province: 'รถเซลส์/ส่วนตัว' }, contact: u.fullname, phone: u.phone, type: 'sales' });
            }
        });
        
        this.renderLogin();
        
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('profile-dropdown');
            const btn = document.getElementById('profile-btn');
            if(dropdown && this.isProfileMenuOpen && !dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
                this.toggleProfileMenu();
            }
        });
    },

    showToast: function(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = { info: 'bg-blue-600', success: 'bg-green-600', warning: 'bg-amber-500', error: 'bg-red-600' };
        toast.className = `${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transform transition-all duration-300 translate-x-full pointer-events-auto mt-2 z-[99]`;
        toast.innerHTML = `<i class="ph ph-info text-xl"></i> <span>${message}</span>`;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => toast.classList.remove('translate-x-full'), 10);
        setTimeout(() => { toast.classList.add('translate-x-full'); setTimeout(() => toast.remove(), 300); }, 3500);
    },
    
    showConfirm: function(title, message, onConfirmJSCode) {
        const html = `
            <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-[70]">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-fade-in">
                    <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><i class="ph ph-warning-circle text-4xl"></i></div>
                    <h3 class="text-lg font-bold text-slate-800 mb-2">${title}</h3><p class="text-slate-500 text-sm mb-6">${message}</p>
                    <div class="flex justify-center gap-3">
                        <button onclick="document.getElementById('confirm-modal').remove()" class="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold">ยกเลิก</button>
                        <button onclick="${onConfirmJSCode}; document.getElementById('confirm-modal').remove()" class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">ยืนยัน</button>
                    </div>
                </div>
            </div>
        `;
        const div = document.createElement('div'); div.id = 'confirm-modal'; div.innerHTML = html;
        document.getElementById('confirm-modal-container').appendChild(div);
    },
    
    closeModal: function() { 
        document.getElementById('modal-container').innerHTML = ''; 
        document.body.classList.remove('modal-open');
    },
    openModalHTML: function(html) {
        document.getElementById('modal-container').innerHTML = html;
        document.body.classList.add('modal-open');
    },

    formatAddr: function(a) {
        if(!a || typeof a === 'string') return a || '-';
        return `เลขที่ ${a.no||'-'} ${a.moo && a.moo!=='-'?'ม.'+a.moo:''} ${a.road?'ถ.'+a.road:''} ${a.subdistrict?'ต.'+a.subdistrict:''} ${a.district?'อ.'+a.district:''} จ.${a.province||''} ${a.zip||''}`.replace(/\s+/g, ' ').trim();
    },
    allowOnlyNumbers: function(e) { e.target.value = e.target.value.replace(/[^0-9]/g, ''); },
    allowOnlyNumbersAndHyphen: function(e) { e.target.value = e.target.value.replace(/[^0-9-]/g, ''); },

    formatBankAccount: function(val) {
        const digits = (val || '').replace(/\D/g, '').slice(0, 10);
        if (digits.length <= 3) return digits;
        if (digits.length <= 4) return digits.slice(0, 3) + '-' + digits.slice(3);
        if (digits.length <= 9) return digits.slice(0, 3) + '-' + digits.slice(3, 4) + '-' + digits.slice(4);
        return digits.slice(0, 3) + '-' + digits.slice(3, 4) + '-' + digits.slice(4, 9) + '-' + digits.slice(9);
    },
    formatBankInput: function(e) {
        e.target.value = this.formatBankAccount(e.target.value);
    },

    isDuplicateSku: function(sku, excludeProdId = null) {
        if (!sku) return false;
        const normSku = sku.trim().toLowerCase();
        const foundMain = (this.mockData.products || []).find(p => p.sku && p.sku.trim().toLowerCase() === normSku && p.id !== excludeProdId);
        if (foundMain) return true;
        for (const v of (this.mockData.vendors || [])) {
            if (v.products && Array.isArray(v.products)) {
                const foundV = v.products.find(p => p.sku && p.sku.trim().toLowerCase() === normSku && (p.id || p.product_id) !== excludeProdId);
                if (foundV) return true;
            }
        }
        return false;
    },

    getProductCostPrice: function(sku) {
        if (!sku) return 0;
        const normSku = sku.trim().toLowerCase();
        for (const v of (this.mockData.vendors || [])) {
            if (v.products && Array.isArray(v.products)) {
                const vp = v.products.find(p => p.sku && p.sku.trim().toLowerCase() === normSku);
                if (vp && vp.cost) return parseFloat(vp.cost);
            }
        }
        const foundMain = (this.mockData.products || []).find(p => p.sku && p.sku.trim().toLowerCase() === normSku);
        if (foundMain && foundMain.cost_price) return parseFloat(foundMain.cost_price);
        return 0;
    },

    login: function(e) {
        e.preventDefault();
        const u = document.getElementById('username').value.trim();
        const p = document.getElementById('password').value;
        const user = this.mockData.users.find(x => x.username === u);
        
        if (!user) {
            this.showToast('Username หรือ Password ไม่ถูกต้อง', 'error');
            return;
        }

        const sec = this.mockData.securitySettings || { maxFailedBeforeDelay: 5, delaySeconds: 30, maxFailedBeforeLock: 10 };

        // 1. Check if user is locked
        if (user.status === 'Locked' || user.status === 'ถูกล็อค') {
            this.showToast('บัญชีของคุณถูกล็อคเนื่องจากใส่รหัสผ่านผิดเกินกำหนด กรุณาติดต่อ Admin เพื่อปลดล็อค', 'error');
            this.mockData.loginHistory.unshift({ user: user.username, fullname: user.fullname, time: new Date().toLocaleString(), ip: '127.0.0.1', status: 'Locked' });
            return;
        }

        // 2. Check if user is currently delayed / in cooldown
        if (user.cooldown_until && Date.now() < user.cooldown_until) {
            const remainingSec = Math.ceil((user.cooldown_until - Date.now()) / 1000);
            this.showToast(`กรุณารอ ${remainingSec} วินาที ก่อนลองเข้าสู่ระบบอีกครั้ง (หน่วงเวลาเนื่องจากใส่รหัสผิดเกิน ${sec.maxFailedBeforeDelay} ครั้ง)`, 'warning');
            return;
        }

        // 3. Password Verification
        if (user.password === p) {
            user.failed_attempts = 0;
            user.cooldown_until = null;
            this.currentUser = user;
            this.mockData.loginHistory.unshift({ user: user.username, fullname: user.fullname, time: new Date().toLocaleString(), ip: '127.0.0.1', status: 'Success' });
            this.renderApp();
            this.showToast(`ยินดีต้อนรับคุณ ${user.fullname}`, 'success');
        } else {
            user.failed_attempts = (user.failed_attempts || 0) + 1;

            if (user.failed_attempts >= sec.maxFailedBeforeLock) {
                user.status = 'Locked';
                user.cooldown_until = null;
                this.mockData.loginHistory.unshift({ user: user.username, fullname: user.fullname, time: new Date().toLocaleString(), ip: '127.0.0.1', status: `Locked (${user.failed_attempts}x)` });
                this.showToast(`ใส่รหัสผ่านผิดรวม ${user.failed_attempts} ครั้ง! บัญชีของคุณถูกล็อคแล้ว กรุณาติดต่อ Admin`, 'error');
            } else if (user.failed_attempts >= sec.maxFailedBeforeDelay) {
                user.cooldown_until = Date.now() + (sec.delaySeconds * 1000);
                this.mockData.loginHistory.unshift({ user: user.username, fullname: user.fullname, time: new Date().toLocaleString(), ip: '127.0.0.1', status: `Delay (${user.failed_attempts}x)` });
                this.showToast(`รหัสผ่านไม่ถูกต้อง (ครั้งที่ ${user.failed_attempts}) คุณใส่รหัสผ่านผิดเกิน ${sec.maxFailedBeforeDelay} ครั้ง กรุณารอ ${sec.delaySeconds} วินาที`, 'warning');
            } else {
                this.mockData.loginHistory.unshift({ user: user.username, fullname: user.fullname, time: new Date().toLocaleString(), ip: '127.0.0.1', status: `Failed (${user.failed_attempts}/${sec.maxFailedBeforeLock})` });
                this.showToast(`Username หรือ Password ไม่ถูกต้อง (ใส่ผิด ${user.failed_attempts}/${sec.maxFailedBeforeLock} ครั้ง)`, 'error');
            }
        }
    },
    logout: function() { this.currentUser = null; this.renderLogin(); },

    renderLogin: function() {
        document.getElementById('app-container').innerHTML = `
            <div class="flex items-center justify-center h-full w-full bg-slate-900 bg-opacity-50" style="background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80'); background-size: cover; background-position: center;">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4"><i class="ph ph-cube text-4xl"></i></div>
                        <h1 class="text-2xl font-bold text-slate-800">OMS System</h1>
                        <p class="text-slate-500 text-sm mt-1">Operation Management System</p>
                        <div class="mt-2 text-[10px] font-bold text-blue-500 bg-blue-50 inline-block px-2 py-0.5 rounded-full border border-blue-200">v1.22</div>
                    </div>
                    <form onsubmit="app.login(event)" class="space-y-5">
                        <div><label class="block text-sm font-medium text-slate-700 mb-1">Username</label><div class="relative"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="ph ph-user text-slate-400 text-lg"></i></div><input type="text" id="username" class="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required></div></div>
                        <div><label class="block text-sm font-medium text-slate-700 mb-1">Password</label><div class="relative"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i class="ph ph-lock text-slate-400 text-lg"></i></div><input type="password" id="password" class="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" required></div></div>
                        <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md transition-all">เข้าสู่ระบบ</button>
                    </form>
                    <div class="mt-8 bg-slate-50 rounded-lg p-4 text-xs text-slate-500 border border-slate-200"><p class="font-bold text-slate-700 mb-2">บัญชีทดสอบ (Password: 123):</p><div class="grid grid-cols-2 gap-2"><div>• admin</div><div>• purchasing</div><div>• warehouse</div><div>• sales</div><div>• accounting</div><div>• management</div></div></div>
                </div>
            </div>
        `;
    },

    toggleSidebar: function() {
        this.isSidebarOpen = !this.isSidebarOpen;
        const sidebar = document.getElementById('app-sidebar');
        if(this.isSidebarOpen) { sidebar.classList.remove('sidebar-hidden'); sidebar.classList.add('w-64', 'border-r'); } 
        else { sidebar.classList.add('sidebar-hidden'); sidebar.classList.remove('w-64', 'border-r'); }
    },
    toggleProfileMenu: function() {
        this.isProfileMenuOpen = !this.isProfileMenuOpen;
        const menu = document.getElementById('profile-dropdown');
        if(menu) { if(this.isProfileMenuOpen) menu.classList.remove('hidden'); else menu.classList.add('hidden'); }
    },

    renderApp: function() {
        const role = this.currentUser.role;
        const roleInfo = this.roles[role];
        this.isSidebarOpen = true;
        this.isProfileMenuOpen = false;
        
        document.getElementById('app-container').innerHTML = `
            <div class="flex h-full w-full bg-slate-50 overflow-hidden">
                <!-- Sidebar -->
                <div id="app-sidebar" class="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 flex-shrink-0 sidebar-transition border-r border-slate-800">
                    <div class="p-5 flex items-center gap-3 border-b border-slate-800 h-16">
                        <div class="w-8 h-8 bg-blue-500 rounded flex items-center justify-center shadow-lg"><i class="ph ph-cube text-xl text-white"></i></div>
                        <div><h2 class="font-bold text-lg leading-tight">OMS <span class="text-xs text-blue-400 font-mono">v1.22</span></h2><div class="text-[9px] text-blue-300 uppercase tracking-wider font-semibold">Mockup System</div></div>
                    </div>
                    <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1" id="sidebar-nav">
                        <li><a href="#" onclick="app.switchMenu('dashboard')" class="block px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white rounded transition-colors text-sm"><i class="ph ph-squares-four mr-2 text-lg align-text-bottom"></i> หน้าแรก</a></li>
                        
                        ${role === 'admin' ? `
                        <div class="pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">ผู้ดูแลระบบ</div>
                        <li><a href="#" onclick="app.switchMenu('users')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-users mr-2 align-text-bottom"></i> จัดการผู้ใช้งาน</a></li>
                        <li><a href="#" onclick="app.switchMenu('settings')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-buildings mr-2 align-text-bottom"></i> ข้อมูลบริษัท/ตั้งค่าคลัง</a></li>
                        <li><a href="#" onclick="app.switchMenu('vendors')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-storefront mr-2 align-text-bottom"></i> จัดการผู้จำหน่าย</a></li>
                        ` : ''}

                        ${['admin', 'purchasing', 'management'].includes(role) ? `
                        <div class="pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">ระบบจัดซื้อ</div>
                        <li><a href="#" onclick="app.switchMenu('purchase_orders')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-shopping-cart mr-2 align-text-bottom"></i> ใบสั่งซื้อ (PO)</a></li>
                        <li><a href="#" onclick="app.switchMenu('purchase_payments')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-receipt mr-2 align-text-bottom"></i> แจ้งการชำระเงิน</a></li>
                        ${role !== 'admin' ? `<li><a href="#" onclick="app.switchMenu('vendors')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-storefront mr-2 align-text-bottom"></i> ข้อมูลผู้จำหน่าย (View)</a></li>` : ''}
                        ` : ''}
                        
                        <div class="pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">สินค้าคงคลัง</div>
                        <li><a href="#" onclick="app.switchMenu('inventory')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-package mr-2 align-text-bottom"></i> ${['warehouse','admin'].includes(role) ? 'จัดการสต็อกสินค้า' : 'รายการสินค้า (View)'}</a></li>
                        <li><a href="#" onclick="app.switchMenu('requisitions')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-hand-grabbing mr-2 align-text-bottom"></i> รายการเบิกสินค้า</a></li>
                        ${['admin', 'warehouse', 'sales', 'management'].includes(role) ? `<li><a href="#" onclick="app.switchMenu('shipments')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-truck mr-2 align-text-bottom"></i> สถานะรอจัดส่ง / จ่ายสินค้า</a></li>` : ''}

                        ${['admin', 'sales', 'management'].includes(role) ? `
                        <div class="pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">ระบบการขาย</div>
                        <li><a href="#" onclick="app.switchMenu('customers')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-users-three mr-2 align-text-bottom"></i> ข้อมูลลูกค้า/ร้านค้า</a></li>
                        <li><a href="#" onclick="app.switchMenu('sales_orders')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-file-text mr-2 align-text-bottom"></i> รายการสั่งซื้อ (SO)</a></li>
                        <li><a href="#" onclick="app.switchMenu('sales_receipts')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-money mr-2 align-text-bottom"></i> แจ้งการเก็บเงิน</a></li>
                        <li><a href="#" onclick="app.switchMenu('so_history')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-clock-counter-clockwise mr-2 align-text-bottom"></i> ประวัติการสั่งซื้อลูกค้า</a></li>
                        ` : ''}

                        ${['admin', 'accounting', 'management'].includes(role) ? `
                        <div class="pt-4 pb-1 text-xs font-bold text-slate-500 uppercase tracking-wider pl-4">บัญชีและการเงิน</div>
                        <li><a href="#" onclick="app.switchMenu('tax_invoices')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-receipt mr-2 align-text-bottom"></i> รายการรอออกใบกำกับ</a></li>
                        <li><a href="#" onclick="app.switchMenu('accounting')" class="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded text-sm"><i class="ph ph-chart-line-up mr-2 align-text-bottom"></i> รายงานบัญชีการเงิน</a></li>
                        ` : ''}
                    </nav>
                    <div class="p-4 border-t border-slate-800"><button onclick="app.logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-medium"><i class="ph ph-sign-out text-lg"></i> ออกจากระบบ</button></div>
                </div>

                <!-- Main Content -->
                <div class="flex-1 flex flex-col h-full overflow-hidden relative">
                    <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shadow-sm z-10 flex-shrink-0">
                        <div class="flex items-center gap-4">
                            <button onclick="app.toggleSidebar()" class="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"><i class="ph ph-list text-2xl"></i></button>
                            <h1 class="text-lg font-bold text-slate-800 hidden sm:block uppercase tracking-wide" id="top-header-title">Dashboard</h1>
                        </div>
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <button id="profile-btn" onclick="app.toggleProfileMenu()" class="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-3 rounded-full border border-slate-200 transition-all shadow-sm">
                                    <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner"><i class="ph ph-user"></i></div>
                                    <div class="text-left hidden md:block"><div class="text-sm font-bold text-slate-800 leading-tight" id="top-profile-name">${this.currentUser.fullname}</div><div class="text-[10px] text-slate-500">${roleInfo.name}</div></div>
                                    <i class="ph ph-caret-down text-slate-400 hidden md:block ml-1"></i>
                                </button>
                                <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                                    <div class="px-4 py-3 border-b border-slate-100 md:hidden bg-slate-50 rounded-t-xl"><div class="text-sm font-bold text-slate-800">${this.currentUser.fullname}</div><div class="text-xs text-slate-500">${roleInfo.name}</div></div>
                                    <a href="#" onclick="app.openMyProfileModal(); app.toggleProfileMenu();" class="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"><i class="ph ph-user-circle mr-2 text-lg align-text-bottom"></i> โปรไฟล์ของฉัน</a>
                                    <div class="border-t border-slate-100 my-1"></div>
                                    <button onclick="app.logout()" class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"><i class="ph ph-sign-out mr-2 text-lg align-text-bottom"></i> ออกจากระบบ</button>
                                </div>
                            </div>
                        </div>
                    </header>
                    
                    <main class="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6 bg-slate-50" id="main-content"></main>
                    
                    <footer class="bg-white border-t border-slate-200 p-3 text-center text-xs text-slate-500 z-10 flex justify-between px-6 flex-shrink-0">
                        <div>&copy; 2026 OMS System | All Rights Reserved</div>
                        <div class="font-bold text-slate-400">Version 1.22 (OMS)</div>
                    </footer>
                </div>
            </div>
        `;
        this.switchMenu('dashboard');
    },

    switchMenu: function(menuId) {
        const content = document.getElementById('main-content');
        let title = menuId.replace('_', ' ').toUpperCase();
        if(menuId === 'settings') title = "ข้อมูลบริษัท และตั้งค่าคลังสินค้า";
        else if(menuId === 'purchase_payments') title = "แจ้งการชำระเงินจัดซื้อ";
        else if(menuId === 'customers') title = "จัดการข้อมูลลูกค้า/ร้านค้า";
        else if(menuId === 'sales_orders') title = "รายการสั่งซื้อ (Sales Orders)";
        else if(menuId === 'sales_receipts') title = "แจ้งการเก็บเงิน (Receipts)";
        else if(menuId === 'so_history') title = "ประวัติการสั่งซื้อลูกค้า";
        else if(menuId === 'tax_invoices') title = "รายการรอออกใบกำกับภาษี";
        else if(menuId === 'accounting') title = "รายงานบัญชีการเงิน";
        
        document.getElementById('top-header-title').innerText = title;
        document.querySelectorAll('#sidebar-nav a').forEach(el => { el.classList.remove('bg-blue-600', 'text-white', 'shadow-md'); el.classList.add('text-slate-300'); });
        const active = document.querySelector(`#sidebar-nav a[onclick="app.switchMenu('${menuId}')"]`);
        if(active) { active.classList.remove('text-slate-300'); active.classList.add('bg-blue-600', 'text-white', 'shadow-md'); }

        if (menuId === 'dashboard') this.renderDashboard(content);
        else if (menuId === 'users') this.renderUsers(content);
        else if (menuId === 'settings') this.renderSettings(content);
        else if (menuId === 'vendors') this.renderVendors(content);
        else if (menuId === 'purchase_orders') this.renderPurchaseOrders ? this.renderPurchaseOrders(content) : this.renderFallback(content, title);
        else if (menuId === 'purchase_payments') this.renderPurchasePayments ? this.renderPurchasePayments(content) : this.renderFallback(content, title);
        else if (menuId === 'inventory') this.renderInventory ? this.renderInventory(content) : this.renderFallback(content, title);
        else if (menuId === 'requisitions') this.renderRequisitions ? this.renderRequisitions(content) : this.renderFallback(content, title);
        else if (menuId === 'shipments') this.renderShipments ? this.renderShipments(content) : this.renderFallback(content, title);
        else if (menuId === 'customers') this.renderCustomers ? this.renderCustomers(content) : this.renderFallback(content, title);
        else if (menuId === 'sales_orders') this.renderSalesOrders ? this.renderSalesOrders(content) : this.renderFallback(content, title);
        else if (menuId === 'sales_receipts') this.renderSalesReceipts ? this.renderSalesReceipts(content) : this.renderFallback(content, title);
        else if (menuId === 'so_history') this.renderSOHistory ? this.renderSOHistory(content) : this.renderFallback(content, title);
        else if (menuId === 'tax_invoices') this.renderTaxInvoices ? this.renderTaxInvoices(content) : this.renderFallback(content, title);
        else if (menuId === 'accounting') this.renderAccounting ? this.renderAccounting(content) : this.renderFallback(content, title);
        else this.renderFallback(content, title);
    },

    renderFallback: function(container, title) {
        container.innerHTML = `<div class="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border"><i class="ph ph-code text-4xl mb-2"></i><p>กำลังโหลดโมดูล ${title}...</p></div>`;
    },

    openMyProfileModal: function() {
        const u = this.currentUser;
        const html = `
            <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col animate-fade-in">
                    <div class="flex justify-between items-center p-5 border-b bg-slate-50"><h3 class="text-lg font-bold"><i class="ph ph-user text-blue-600 mr-2"></i> โปรไฟล์ของฉัน</h3><button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button></div>
                    <div class="p-6">
                        <form id="my-profile-form" onsubmit="event.preventDefault(); app.saveMyProfile()" class="space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-sm mb-1 text-slate-500">Username</label><input type="text" value="${u.username}" class="w-full border rounded-lg px-3 py-2 bg-slate-100 text-slate-500" disabled></div><div><label class="block text-sm mb-1 font-bold">รหัสผ่าน (ใหม่)</label><input type="text" id="mp_password" value="${u.password}" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required></div></div>
                            <div><label class="block text-sm mb-1 font-bold">ชื่อ-นามสกุล *</label><input type="text" id="mp_fullname" value="${u.fullname}" class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" required></div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-sm mb-1">ชื่อเล่น</label><input type="text" id="mp_nickname" value="${u.nickname || ''}" class="w-full border rounded-lg px-3 py-2"></div><div><label class="block text-sm mb-1">เบอร์โทร</label><input type="text" id="mp_phone" value="${u.phone || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-2"></div></div>
                            <div><label class="block text-sm mb-1">อีเมล</label><input type="email" id="mp_email" value="${u.email || ''}" class="w-full border rounded-lg px-3 py-2"></div>
                        </form>
                    </div>
                    <div class="p-5 border-t bg-slate-50 flex justify-end gap-3"><button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 rounded-lg text-slate-700">ยกเลิก</button><button type="submit" form="my-profile-form" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm">บันทึกข้อมูล</button></div>
                </div>
            </div>
        `;
        this.openModalHTML(html);
    },
    saveMyProfile: function() {
        this.currentUser.password = document.getElementById('mp_password').value;
        this.currentUser.fullname = document.getElementById('mp_fullname').value;
        this.currentUser.nickname = document.getElementById('mp_nickname').value;
        this.currentUser.phone = document.getElementById('mp_phone').value;
        this.currentUser.email = document.getElementById('mp_email').value;
        const idx = this.mockData.users.findIndex(u => u.id === this.currentUser.id);
        if (idx > -1) this.mockData.users[idx] = { ...this.currentUser };
        document.getElementById('top-profile-name').innerText = this.currentUser.fullname;
        this.showToast('อัปเดตโปรไฟล์ส่วนตัวสำเร็จ', 'success'); this.closeModal();
    },

    renderDashboard: function(container) {
        const role = this.currentUser.role;
        let html = `<div class="mb-6"><h2 class="text-2xl font-bold text-slate-800">แดชบอร์ด (Dashboard)</h2><p class="text-slate-500">ภาพรวมระบบสำหรับ ${this.roles[role].name}</p></div>`;

        // Calculate common metrics
        const totalSales = this.mockData.salesOrders.reduce((sum, so) => sum + so.total_amount, 0);
        const pendingPOs = this.mockData.purchaseOrders.filter(p=>p.status!=='Complete').length;
        const lowStockCount = this.mockData.products.filter(p=>p.stock_qty <= 20).length;

        if (['admin', 'management'].includes(role)) {
            // Admin & Management View
            let salesByRep = {};
            this.mockData.salesOrders.forEach(so => { 
                const rep = so.sales_person || so.created_by || 'ไม่ระบุ';
                salesByRep[rep] = (salesByRep[rep]||0) + (so.total_amount||0); 
            });
            let bars = Object.keys(salesByRep).map(rep => {
                let pct = Math.min(100, Math.max(10, (salesByRep[rep] / (totalSales || 1)) * 100));
                return `<div class="mb-3"><div class="flex justify-between text-xs mb-1 font-bold"><span class="text-slate-700">${rep}</span><span class="text-blue-600">฿${salesByRep[rep].toLocaleString()}</span></div><div class="w-full bg-slate-100 rounded-full h-2.5"><div class="bg-blue-500 h-2.5 rounded-full" style="width: ${pct}%"></div></div></div>`;
            }).join('');

            html += `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-xl p-5 border shadow-sm border-l-4 border-l-blue-500"><div class="text-xs text-slate-500 font-bold uppercase">ยอดขายรวมทั้งหมด</div><div class="text-2xl font-black text-slate-800 mt-1">฿${totalSales.toLocaleString()}</div></div>
                    <div class="bg-white rounded-xl p-5 border shadow-sm border-l-4 border-l-orange-500"><div class="text-xs text-slate-500 font-bold uppercase">ใบสั่งซื้อรอรับเข้า</div><div class="text-2xl font-black text-slate-800 mt-1">${pendingPOs} <span class="text-sm font-normal text-slate-500">PO</span></div></div>
                    <div class="bg-white rounded-xl p-5 border shadow-sm border-l-4 border-l-red-500"><div class="text-xs text-slate-500 font-bold uppercase">สินค้าใกล้หมด (Low Stock)</div><div class="text-2xl font-black text-slate-800 mt-1">${lowStockCount} <span class="text-sm font-normal text-slate-500">รายการ</span></div></div>
                    <div class="bg-white rounded-xl p-5 border shadow-sm border-l-4 border-l-green-500"><div class="text-xs text-slate-500 font-bold uppercase">อนุมัติเบิกสต็อก (รอดำเนินการ)</div><div class="text-2xl font-black text-slate-800 mt-1">${this.mockData.requisitions.filter(r=>r.status==='Pending').length} <span class="text-sm font-normal text-slate-500">รายการ</span></div></div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white p-5 rounded-xl border shadow-sm"><h3 class="font-bold text-slate-800 mb-4 flex items-center"><i class="ph ph-chart-bar mr-2 text-blue-500 text-xl"></i> ยอดขายแยกตามเซลส์</h3>${bars||'<div class="text-slate-400 text-sm text-center py-4">ไม่มีข้อมูลยอดขาย</div>'}</div>
                    <div class="bg-white p-5 rounded-xl border shadow-sm"><h3 class="font-bold text-slate-800 mb-4 flex items-center"><i class="ph ph-warning-circle mr-2 text-red-500 text-xl"></i> สินค้าคงคลังต่ำกว่าเกณฑ์ (20 ชิ้น)</h3><ul class="space-y-2">${this.mockData.products.filter(p=>p.stock_qty<=20).map(p=>`<li class="flex justify-between text-sm border-b pb-2"><span class="text-slate-700">${p.sku} - ${p.name}</span><span class="font-bold text-red-600">${p.stock_qty} ${p.unit}</span></li>`).join('') || '<li class="text-slate-400 text-sm text-center py-4">สต็อกปกติทุกรายการ</li>'}</ul></div>
                </div>
            `;
        } else if (role === 'sales') {
            // Sales View
            const username = this.currentUser ? this.currentUser.username : '';
            const mySales = this.mockData.salesOrders
                .filter(so => ((so.created_by || so.sales_person || '')).includes(username))
                .reduce((s, so) => s + (so.total_amount || 0), 0);
            const myCustomers = this.mockData.customers
                .filter(c => (c.assigned_sales || []).includes(username)).length;
            html += `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-md"><div class="text-blue-100 font-medium">ยอดขายส่วนตัว (My Sales)</div><div class="text-3xl font-bold mt-2">฿${mySales.toLocaleString()}</div></div>
                    <div class="bg-white rounded-xl p-6 border shadow-sm flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl"><i class="ph ph-users-three"></i></div><div><div class="text-sm text-slate-500">ลูกค้าในความดูแล</div><div class="text-xl font-bold">${myCustomers} ร้าน</div></div></div>
                    <div class="bg-white rounded-xl p-6 border shadow-sm flex items-center gap-4"><div class="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl"><i class="ph ph-truck"></i></div><div><div class="text-sm text-slate-500">SO รอจัดส่ง</div><div class="text-xl font-bold">${this.mockData.salesOrders.filter(so=> so.status === 'Pending' || so.delivery_status==='Pending').length} รายการ</div></div></div>
                </div>
            `;
        } else if (role === 'purchasing') {
            // Purchasing View
            html += `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-white rounded-xl p-6 border shadow-sm border-t-4 border-t-orange-500"><div class="text-slate-500 text-sm font-bold">PO รอรับเข้า</div><div class="text-3xl font-bold text-slate-800 mt-2">${pendingPOs}</div></div>
                    <div class="bg-white rounded-xl p-6 border shadow-sm border-t-4 border-t-red-500"><div class="text-slate-500 text-sm font-bold">ยอดค้างชำระผู้จำหน่าย</div><div class="text-3xl font-bold text-red-600 mt-2">฿${this.mockData.purchaseOrders.reduce((s,p)=>s+p.unpaid_amount,0).toLocaleString()}</div></div>
                    <div class="bg-white rounded-xl p-6 border shadow-sm border-t-4 border-t-blue-500"><div class="text-slate-500 text-sm font-bold">จำนวนคู่ค้า (Vendors)</div><div class="text-3xl font-bold text-blue-600 mt-2">${this.mockData.vendors.length}</div></div>
                </div>
            `;
        } else if (role === 'warehouse') {
            // Warehouse View
            html += `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div class="bg-white rounded-xl p-6 border shadow-sm border-t-4 border-t-amber-500"><div class="text-slate-500 text-sm font-bold">รายการเบิกสต็อก (รอจ่าย)</div><div class="text-3xl font-bold text-slate-800 mt-2">${this.mockData.requisitions.filter(r=>r.status==='Approved').length}</div></div>
                    <div class="bg-white rounded-xl p-6 border shadow-sm border-t-4 border-t-orange-500"><div class="text-slate-500 text-sm font-bold">รายการรอแพ็ค/ส่ง</div><div class="text-3xl font-bold text-orange-600 mt-2">${this.mockData.requisitions.filter(r=>r.status==='Approved' && r.req_method==='จัดส่งตามที่อยู่').length}</div></div>
                    <div class="bg-white rounded-xl p-6 border shadow-sm border-t-4 border-t-red-500"><div class="text-slate-500 text-sm font-bold">สินค้าใกล้หมด (Low Stock)</div><div class="text-3xl font-bold text-red-600 mt-2">${lowStockCount}</div></div>
                </div>
            `;
        } else if (role === 'accounting') {
            html += `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div class="bg-white rounded-xl p-6 border shadow-sm"><div class="text-slate-500 text-sm font-bold mb-1">ยอดรอตรวจสอบรับเงิน (Receipts)</div><div class="text-3xl font-bold text-green-600">฿${this.mockData.salesReceipts.filter(r=>r.status==='Pending').reduce((s,r)=>s+r.amount,0).toLocaleString()}</div></div>
                    <div class="bg-white rounded-xl p-6 border shadow-sm"><div class="text-slate-500 text-sm font-bold mb-1">ยอดต้องชำระ (Accounts Payable)</div><div class="text-3xl font-bold text-red-600">฿${this.mockData.purchaseOrders.reduce((s,p)=>s+p.unpaid_amount,0).toLocaleString()}</div></div>
                </div>
            `;
        }
        container.innerHTML = html;
    },

    renderUsers: function(container) {
        let rows = this.mockData.users.map(u => `<tr class="hover:bg-slate-50"><td class="px-6 py-4 font-bold text-slate-800">${u.username}</td><td class="px-6 py-4"><div>${u.fullname}</div><div class="text-slate-500 text-xs">(${u.nickname})</div></td><td class="px-6 py-4 text-slate-600 text-sm"><div><i class="ph ph-phone mr-1"></i> ${u.phone}</div><div><i class="ph ph-envelope mr-1"></i> ${u.email}</div></td><td class="px-6 py-4 font-bold text-purple-700">${u.area||'-'}</td><td class="px-6 py-4"><span class="px-2 py-1 rounded bg-slate-100 text-slate-700 text-xs font-bold border">${u.role}</span></td><td class="px-6 py-4 text-center"><button onclick="app.openUserModal(${u.id})" class="text-slate-400 hover:text-blue-500 p-2"><i class="ph ph-pencil-simple text-lg"></i></button></td></tr>`).join('');
        let html = `<div class="flex justify-between items-end mb-6"><div><h2 class="text-2xl font-bold text-slate-800">จัดการผู้ใช้งานระบบ</h2></div><button onclick="app.openUserModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm flex"><i class="ph ph-plus mr-2 text-lg"></i> สร้างผู้ใช้ใหม่</button></div><div class="bg-white rounded-xl shadow-sm border overflow-x-auto mb-8"><table class="w-full text-left text-sm whitespace-nowrap"><thead class="bg-slate-50 border-b"><tr><th class="px-6 py-4">Username</th><th class="px-6 py-4">ชื่อ-นามสกุล</th><th class="px-6 py-4">ข้อมูลติดต่อ</th><th class="px-6 py-4">พื้นที่ทำงาน</th><th class="px-6 py-4">สิทธิ์ (Role)</th><th class="px-6 py-4 text-center">จัดการ</th></tr></thead><tbody class="divide-y">${rows}</tbody></table></div>`;
        if (this.currentUser.role === 'admin') {
            let logRows = this.mockData.loginHistory.map(h => `<tr><td class="px-4 py-2">${h.user} <span class="text-xs text-slate-500">(${h.fullname})</span></td><td class="px-4 py-2">${h.time}</td><td class="px-4 py-2 font-mono text-xs text-slate-500">${h.ip}</td><td class="px-4 py-2 text-green-600 text-xs font-bold">${h.status}</td></tr>`).join('');
            html += `<div class="bg-white rounded-xl shadow-sm border overflow-hidden"><div class="p-4 bg-slate-50 border-b font-bold"><i class="ph ph-clock-counter-clockwise mr-2"></i> ประวัติการเข้าใช้งาน (Login Log)</div><div class="p-0 max-h-64 overflow-y-auto"><table class="w-full text-left text-sm"><thead class="bg-white sticky top-0 border-b shadow-sm"><tr><th class="px-4 py-2">User</th><th class="px-4 py-2">Time</th><th class="px-4 py-2">IP</th><th class="px-4 py-2">Status</th></tr></thead><tbody class="divide-y">${logRows||'<tr><td colspan="4" class="text-center py-4">No data</td></tr>'}</tbody></table></div></div>`;
        }
        container.innerHTML = html;
    },
    toggleUserShipping: function() {
        const r = document.getElementById('u_role').value;
        const box = document.getElementById('u_shipping_box');
        if(r === 'sales') box.classList.remove('hidden');
        else box.classList.add('hidden');
    },
    openUserModal: function(userId = null) {
        let u = userId ? this.mockData.users.find(x => x.id === userId) : null;
        const html = `
            <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                    <div class="flex justify-between items-center p-5 border-b bg-slate-50"><h3 class="text-lg font-bold"><i class="ph ph-user-plus text-blue-600 mr-2"></i> ${u ? 'แก้ไขผู้ใช้งาน' : 'สร้างผู้ใช้ใหม่'}</h3><button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button></div>
                    <div class="p-6 overflow-y-auto">
                        <form id="user-form" onsubmit="event.preventDefault(); app.saveUser(${userId || 'null'})" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label class="block text-sm font-bold mb-1">Username *</label><input type="text" id="u_username" value="${u?.username||''}" class="w-full border rounded-lg px-3 py-2" required></div>
                            <div><label class="block text-sm font-bold mb-1">Password *</label><input type="text" id="u_password" value="${u?.password||''}" class="w-full border rounded-lg px-3 py-2" required></div>
                            <div class="md:col-span-2"><label class="block text-sm font-bold mb-1">ชื่อ-นามสกุล *</label><input type="text" id="u_fullname" value="${u?.fullname||''}" class="w-full border rounded-lg px-3 py-2" required></div>
                            <div><label class="block text-sm font-bold mb-1">ชื่อเล่น</label><input type="text" id="u_nickname" value="${u?.nickname||''}" class="w-full border rounded-lg px-3 py-2"></div>
                            <div><label class="block text-sm font-bold mb-1">เบอร์โทร</label><input type="text" id="u_phone" value="${u?.phone||''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-2"></div>
                            <div><label class="block text-sm font-bold mb-1">อีเมล</label><input type="email" id="u_email" value="${u?.email||''}" class="w-full border rounded-lg px-3 py-2"></div>
                            <div><label class="block text-sm font-bold mb-1">สิทธิ์ (Role) *</label><select id="u_role" onchange="app.toggleUserShipping()" class="w-full border rounded-lg px-3 py-2 bg-slate-50" required><option value="admin" ${u?.role==='admin'?'selected':''}>Admin</option><option value="purchasing" ${u?.role==='purchasing'?'selected':''}>Purchasing</option><option value="warehouse" ${u?.role==='warehouse'?'selected':''}>Warehouse</option><option value="sales" ${u?.role==='sales'?'selected':''}>Sales</option><option value="accounting" ${u?.role==='accounting'?'selected':''}>Accounting</option><option value="management" ${u?.role==='management'?'selected':''}>Management</option></select></div>
                            <div class="md:col-span-2"><label class="block text-sm font-bold mb-1 text-purple-700">พื้นที่ทำงาน (Area)</label><input type="text" id="u_area" value="${u?.area||''}" class="w-full border rounded-lg px-3 py-2"></div>
                            <div class="md:col-span-2 hidden bg-orange-50 p-3 rounded-lg border border-orange-200" id="u_shipping_box"><label class="block text-sm font-bold mb-1 text-orange-800">ที่อยู่จัดส่งสินค้า (สำหรับ Sales)</label><p class="text-xs text-orange-600 mb-2">ใช้ตั้งเป็นที่อยู่จัดส่งเริ่มต้นเวลาขอเบิกสินค้าเพื่อสต็อก</p><textarea id="u_shipping_address" class="w-full border rounded-lg px-3 py-2 text-sm" rows="2">${u?.shipping_address||''}</textarea></div>
                        </form>
                    </div>
                    <div class="p-5 border-t bg-slate-50 flex justify-end gap-3"><button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 rounded-lg">ยกเลิก</button><button type="submit" form="user-form" class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm font-bold">บันทึก</button></div>
                </div>
            </div>
        `;
        this.openModalHTML(html);
        this.toggleUserShipping();
    },
    saveUser: function(userId) {
        const u = { username: document.getElementById('u_username').value, password: document.getElementById('u_password').value, fullname: document.getElementById('u_fullname').value, nickname: document.getElementById('u_nickname').value, phone: document.getElementById('u_phone').value, email: document.getElementById('u_email').value, role: document.getElementById('u_role').value, area: document.getElementById('u_area').value, shipping_address: document.getElementById('u_shipping_address').value };
        if (userId) { const idx = this.mockData.users.findIndex(x=>x.id===userId); if(idx>-1) this.mockData.users[idx] = {...this.mockData.users[idx], ...u}; }
        else { u.id = Date.now(); this.mockData.users.push(u); }
        this.showToast('บันทึกผู้ใช้สำเร็จ', 'success'); this.closeModal(); this.renderUsers(document.getElementById('main-content'));
    },

    renderSettings: function(container) {
        const comp = this.mockData.company;
        let bankHtml = comp.banks.map((b, idx) => `<div class="flex items-center justify-between bg-white border p-4 rounded-xl shadow-sm"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl"><i class="ph ph-bank"></i></div><div><div class="font-bold">${b.bank} <span class="text-slate-500 text-sm font-normal">(${b.branch})</span></div><div class="text-sm text-slate-600">${b.account_name} | <span class="font-mono font-bold text-blue-700">${this.formatBankAccount(b.account_no)}</span></div></div></div><div class="flex gap-2"><button type="button" onclick="app.openBankModal(${idx})" class="text-slate-400 hover:text-blue-500 p-2"><i class="ph ph-pencil-simple text-xl"></i></button><button type="button" onclick="app.deleteBank(${idx})" class="text-slate-400 hover:text-red-500 p-2"><i class="ph ph-trash text-xl"></i></button></div></div>`).join('');
        let whHtml = this.mockData.warehouses.filter(w=>w.type!=='sales').map((w, idx) => `<div class="bg-white border p-4 rounded-xl shadow-sm"><div class="flex justify-between items-start"><h4 class="font-bold text-slate-800"><i class="ph ph-warehouse text-amber-600 mr-2"></i>${w.name}</h4><span class="text-[10px] bg-slate-100 px-2 py-0.5 rounded border uppercase">${w.type}</span></div><div class="mt-3 text-sm text-slate-600 space-y-1"><p><i class="ph ph-map-pin mr-1"></i> ${this.formatAddr(w.address)}</p><p><i class="ph ph-user mr-1"></i> ติดต่อ: ${w.contact}</p><p><i class="ph ph-phone mr-1"></i> โทร: ${w.phone}</p></div><div class="mt-3 pt-3 border-t flex justify-end gap-2"><button onclick="app.openWarehouseModal('${w.id}')" class="text-slate-400 hover:text-blue-600 p-1"><i class="ph ph-pencil-simple text-lg"></i></button><button onclick="app.deleteWarehouse('${w.id}')" class="text-slate-400 hover:text-red-600 p-1"><i class="ph ph-trash text-lg"></i></button></div></div>`).join('');
        
        container.innerHTML = `
            <div class="mb-6"><h2 class="text-2xl font-bold text-slate-800">ข้อมูลบริษัทและตั้งค่าระบบ</h2></div>
            <div class="bg-white rounded-xl shadow-sm border mb-6">
                <div class="border-b px-6 py-4 bg-slate-50 rounded-t-xl"><h3 class="font-bold text-lg"><i class="ph ph-buildings text-blue-600 mr-2"></i> ข้อมูลบริษัท</h3></div>
                <form onsubmit="event.preventDefault(); app.saveCompanySettings()" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="block text-sm mb-1 font-bold">ชื่อบริษัท</label><input type="text" id="comp_name" value="${comp.name}" class="w-full border rounded-lg px-3 py-2 bg-white"></div>
                    <div><label class="block text-sm mb-1 font-bold">เลขผู้เสียภาษี (13 หลัก)</label><input type="text" id="comp_tax" value="${comp.tax_id}" maxlength="13" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-2 bg-white font-mono"></div>
                    <div class="md:col-span-2"><label class="block text-sm mb-1 font-bold">ที่อยู่ตั้งทำการ</label><textarea id="comp_addr" class="w-full border rounded-lg px-3 py-2 bg-white" rows="2">${comp.address}</textarea></div>
                    <div class="md:col-span-2 text-right"><button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-sm">บันทึกข้อมูลบริษัท</button></div>
                </form>
            </div>
            <div class="mb-4 flex justify-between items-end"><h3 class="font-bold text-lg"><i class="ph ph-wallet text-blue-600 mr-2"></i> บัญชีธนาคารรับเงิน</h3><button onclick="app.openBankModal()" class="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-sm"><i class="ph ph-plus mr-1"></i> เพิ่มบัญชี</button></div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">${bankHtml}</div>
            <div class="mb-4 flex justify-between items-end"><h3 class="font-bold text-lg"><i class="ph ph-warehouse text-amber-600 mr-2"></i> ตั้งค่าคลังสินค้า (Warehouses)</h3><button onclick="app.openWarehouseModal()" class="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-sm"><i class="ph ph-plus mr-1"></i> เพิ่มคลัง</button></div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">${whHtml}</div>
        `;
    },
    saveCompanySettings: function() {
        this.mockData.company.name = document.getElementById('comp_name').value;
        this.mockData.company.tax_id = document.getElementById('comp_tax').value;
        this.mockData.company.address = document.getElementById('comp_addr').value;
        this.showToast('บันทึกข้อมูลองค์กรเรียบร้อย', 'success');
    },
    openBankModal: function(idx = null) {
        const b = idx !== null ? this.mockData.company.banks[idx] : null;
        const formattedAccNo = b ? this.formatBankAccount(b.account_no) : '';
        const html = `
            <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-fade-in">
                    <div class="flex justify-between items-center p-5 border-b bg-slate-50"><h3 class="text-lg font-bold"><i class="ph ph-bank text-blue-600 mr-2"></i> ${b ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}</h3><button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button></div>
                    <div class="p-6">
                        <form id="bank-form" onsubmit="event.preventDefault(); app.saveBank(${idx})" class="space-y-4">
                            <div><label class="block text-sm mb-1 font-bold">ธนาคาร *</label><input type="text" id="b_bank" value="${b?.bank||''}" class="w-full border rounded-lg px-3 py-2" required></div>
                            <div><label class="block text-sm mb-1 font-bold">สาขา *</label><input type="text" id="b_branch" value="${b?.branch||''}" class="w-full border rounded-lg px-3 py-2" required></div>
                            <div><label class="block text-sm mb-1 font-bold">ชื่อบัญชี *</label><input type="text" id="b_name" value="${b?.account_name||''}" class="w-full border rounded-lg px-3 py-2" required></div>
                            <div><label class="block text-sm mb-1 font-bold">เลขบัญชี (10 หลัก) *</label><input type="text" id="b_no" value="${formattedAccNo}" maxlength="13" oninput="app.formatBankInput(event)" placeholder="xxx-x-xxxxx-x" class="w-full border rounded-lg px-3 py-2 font-mono" required></div>
                        </form>
                    </div>
                    <div class="p-5 border-t bg-slate-50 flex justify-end gap-3"><button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 rounded-lg">ยกเลิก</button><button type="submit" form="bank-form" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm">บันทึก</button></div>
                </div>
            </div>
        `;
        this.openModalHTML(html);
    },
    saveBank: function(idx) {
        const rawNo = document.getElementById('b_no').value.replace(/\D/g, '');
        if (rawNo.length !== 10) {
            this.showToast('เลขบัญชีธนาคารต้องเป็นตัวเลข 10 หลัก (xxx-x-xxxxx-x)', 'error');
            return;
        }
        const b = { bank: document.getElementById('b_bank').value, branch: document.getElementById('b_branch').value, account_name: document.getElementById('b_name').value, account_no: rawNo };
        if (idx !== null) this.mockData.company.banks[idx] = b; else this.mockData.company.banks.push(b);
        this.showToast('บันทึกบัญชีสำเร็จ', 'success'); this.closeModal(); this.renderSettings(document.getElementById('main-content'));
    },
    deleteBank: function(idx) { this.showConfirm('ยืนยันลบ?', 'ลบบัญชีนี้หรือไม่?', `app.mockData.company.banks.splice(${idx},1); app.renderSettings(document.getElementById('main-content'));`); },
    
    openWarehouseModal: function(wid = null) {
        const w = wid ? this.mockData.warehouses.find(x=>x.id===wid) : null;
        const html = `
            <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
                <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col animate-fade-in">
                    <div class="flex justify-between items-center p-5 border-b bg-slate-50"><h3 class="text-lg font-bold"><i class="ph ph-warehouse text-amber-600 mr-2"></i> ${w ? 'แก้ไขคลังสินค้า' : 'เพิ่มคลังสินค้าใหม่'}</h3><button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button></div>
                    <div class="p-6 overflow-y-auto">
                        <form id="wh-form" onsubmit="event.preventDefault(); app.saveWarehouse('${wid||''}')" class="space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div><label class="block text-sm mb-1 font-bold">ชื่อคลังสินค้า *</label><input type="text" id="w_name" value="${w?.name||''}" class="w-full border rounded-lg px-3 py-2" required></div>
                                <div><label class="block text-sm mb-1 font-bold">ประเภทคลัง *</label><select id="w_type" class="w-full border rounded-lg px-3 py-2"><option value="main" ${w?.type==='main'?'selected':''}>คลังหลัก (Main)</option><option value="sub" ${w?.type==='sub'?'selected':''}>คลังย่อย (Sub)</option></select></div>
                                <div><label class="block text-sm mb-1 font-bold">ชื่อผู้ติดต่อ</label><input type="text" id="w_contact" value="${w?.contact||''}" class="w-full border rounded-lg px-3 py-2"></div>
                                <div><label class="block text-sm mb-1 font-bold">เบอร์โทรติดต่อ</label><input type="text" id="w_phone" value="${w?.phone||''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-2"></div>
                            </div>
                            <h4 class="font-bold border-b pb-1 mt-4 mb-2">ที่ตั้งคลังสินค้า</h4>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <div><label class="text-sm">เลขที่/หมู่</label><input type="text" id="wa_no" value="${w?.address?.no||w?.address||''}" class="w-full border rounded px-2 py-1"></div>
                                <div><label class="text-sm">ถนน</label><input type="text" id="wa_road" value="${w?.address?.road||''}" class="w-full border rounded px-2 py-1"></div>
                                <div><label class="text-sm">แขวง/ตำบล</label><input type="text" id="wa_subd" value="${w?.address?.subdistrict||''}" class="w-full border rounded px-2 py-1"></div>
                                <div><label class="text-sm">เขต/อำเภอ</label><input type="text" id="wa_dist" value="${w?.address?.district||''}" class="w-full border rounded px-2 py-1"></div>
                                <div><label class="text-sm">จังหวัด</label><input type="text" id="wa_prov" value="${w?.address?.province||''}" class="w-full border rounded px-2 py-1"></div>
                                <div><label class="text-sm">รหัสไปรษณีย์</label><input type="text" id="wa_zip" value="${w?.address?.zip||''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded px-2 py-1"></div>
                            </div>
                        </form>
                    </div>
                    <div class="p-5 border-t bg-slate-50 flex justify-end gap-3"><button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 rounded-lg">ยกเลิก</button><button type="submit" form="wh-form" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">บันทึก</button></div>
                </div>
            </div>
        `;
        this.openModalHTML(html);
    },
    saveWarehouse: function(wid) {
        const w = {
            name: document.getElementById('w_name').value, type: document.getElementById('w_type').value, contact: document.getElementById('w_contact').value, phone: document.getElementById('w_phone').value,
            address: { no: document.getElementById('wa_no').value, road: document.getElementById('wa_road').value, subdistrict: document.getElementById('wa_subd').value, district: document.getElementById('wa_dist').value, province: document.getElementById('wa_prov').value, zip: document.getElementById('wa_zip').value }
        };
        if(wid) { const idx = this.mockData.warehouses.findIndex(x=>x.id===wid); if(idx>-1) { w.id = wid; this.mockData.warehouses[idx] = w; } }
        else { w.id = 'W-SUB-'+Date.now(); this.mockData.warehouses.push(w); }
        this.showToast('บันทึกคลังสำเร็จ', 'success'); this.closeModal(); this.renderSettings(document.getElementById('main-content'));
    },
    deleteWarehouse: function(wid) { this.showConfirm('ลบคลังสินค้า?', 'แน่ใจหรือไม่?', `app.mockData.warehouses = app.mockData.warehouses.filter(w=>w.id!=='${wid}'); app.renderSettings(document.getElementById('main-content'));`); }
};

// Initialize Application when DOM is ready
window.onload = () => app.init();
