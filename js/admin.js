/**
 * OMS (Operation Management System) - System Administration & Settings Module
 * File: js/admin.js
 */

// ==========================================
// USER MANAGEMENT (จัดการผู้ใช้งานระบบ)
// ==========================================

app.renderUsers = function(container) {
    let rows = this.mockData.users.map(u => {
        let areaDisplay = `<span class="font-bold text-purple-700 text-xs">${u.area || '-'}</span>`;
        if (u.role === 'warehouse' && u.warehouse_id) {
            const whObj = this.mockData.warehouses.find(w => w.id === u.warehouse_id);
            const whTypeLabel = whObj?.type === 'main' ? 'คลังหลัก' : 'คลังย่อย';
            areaDisplay = `<span class="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200 inline-flex items-center gap-1"><i class="ph ph-warehouse text-amber-600"></i> ${whObj ? whObj.name : u.warehouse_id} <span class="text-[10px] text-amber-600 font-normal">(${whTypeLabel})</span></span>`;
        }

        const isLocked = u.status === 'Locked' || u.status === 'ถูกล็อค';
        const failedCount = u.failed_attempts || 0;
        
        const statusBadge = isLocked
            ? `<span class="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 inline-flex items-center gap-1"><i class="ph ph-lock text-red-600"></i> ถูกล็อค</span>`
            : `<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1"><i class="ph ph-check-circle text-emerald-600"></i> ปกติ</span>`;

        const failedBadge = failedCount > 0
            ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold font-mono border border-amber-300">${failedCount} ครั้ง</span>`
            : `<span class="text-slate-400 font-mono text-xs">0 ครั้ง</span>`;

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-bold text-slate-800 font-mono">${u.username}</td>
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">${u.fullname}</div>
                    <div class="text-slate-500 text-xs">(${u.nickname || '-'})</div>
                </td>
                <td class="px-6 py-4 text-slate-600 text-xs">
                    <div><i class="ph ph-phone mr-1 text-blue-500"></i> ${u.phone || '-'}</div>
                    <div><i class="ph ph-envelope mr-1 text-slate-400"></i> ${u.email || '-'}</div>
                </td>
                <td class="px-6 py-4">${areaDisplay}</td>
                <td class="px-6 py-4">
                    <span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300">
                        ${u.role}
                    </span>
                </td>
                <td class="px-6 py-4 text-center">${failedBadge}</td>
                <td class="px-6 py-4 text-center">${statusBadge}</td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                    <div class="flex items-center justify-center gap-1">
                        ${(isLocked || failedCount > 0) ? `
                            <button onclick="app.unlockUser(${u.id})" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1" title="ปลดล็อคผู้ใช้และรีเซ็ตจำรหัสผิด">
                                <i class="ph ph-key-return text-sm"></i> ปลดล็อค
                            </button>
                        ` : ''}
                        <button onclick="app.openUserModal(${u.id})" class="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="แก้ไขผู้ใช้">
                            <i class="ph ph-pencil-simple text-lg"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    let html = `
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">จัดการผู้ใช้งานระบบ (User Management)</h2>
                <p class="text-slate-500 text-sm">กำหนดสิทธิ์การใช้งาน บัญชีผู้ใช้ สังกัดคลังสินค้า และตรวจสอบสถานะความปลอดภัย/ปลดล็อคผู้ใช้</p>
            </div>
            <button onclick="app.openUserModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-user-plus text-lg"></i> สร้างผู้ใช้ใหม่
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto mb-8">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-6 py-4">Username</th>
                        <th class="px-6 py-4">ชื่อ-นามสกุล</th>
                        <th class="px-6 py-4">ข้อมูลติดต่อ</th>
                        <th class="px-6 py-4">พื้นที่ / สังกัดคลังสินค้า</th>
                        <th class="px-6 py-4">สิทธิ์ (Role)</th>
                        <th class="px-6 py-4 text-center">ใส่รหัสผิด</th>
                        <th class="px-6 py-4 text-center">สถานะ</th>
                        <th class="px-6 py-4 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${rows}</tbody>
            </table>
        </div>
    `;

    if (this.currentUser.role === 'admin') {
        let logRows = (this.mockData.loginHistory || []).map(h => `
            <tr>
                <td class="px-4 py-2.5 font-bold">${h.user} <span class="text-xs text-slate-500 font-normal">(${h.fullname})</span></td>
                <td class="px-4 py-2.5 text-xs text-slate-600">${h.time}</td>
                <td class="px-4 py-2.5 font-mono text-xs text-slate-500">${h.ip}</td>
                <td class="px-4 py-2.5 text-xs font-bold ${(h.status || '').includes('Locked') ? 'text-red-600' : (h.status || '').includes('Delay') ? 'text-amber-600' : 'text-emerald-600'}">${h.status}</td>
            </tr>
        `).join('');

        html += `
            <div class="bg-white rounded-2xl shadow-sm border overflow-hidden">
                <div class="p-4 bg-slate-50 border-b font-bold text-slate-800 flex items-center gap-2">
                    <i class="ph ph-clock-counter-clockwise text-blue-600 text-lg"></i> ประวัติการเข้าใช้งานระบบ (Login Audit Log)
                </div>
                <div class="p-0 max-h-64 overflow-y-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-white sticky top-0 border-b shadow-sm text-slate-600 text-xs uppercase font-bold">
                            <tr>
                                <th class="px-4 py-2.5">User</th>
                                <th class="px-4 py-2.5">Time</th>
                                <th class="px-4 py-2.5">IP Address</th>
                                <th class="px-4 py-2.5">Status</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">${logRows || '<tr><td colspan="4" class="text-center py-4 text-slate-400">ยังไม่มีประวัติการเข้าใช้งาน</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
};

app.unlockUser = function(userId) {
    const u = this.mockData.users.find(x => x.id === userId);
    if (u) {
        u.status = 'Active';
        u.failed_attempts = 0;
        u.cooldown_until = null;
        this.showToast(`ปลดล็อคผู้ใช้ ${u.username} (${u.fullname}) และรีเซ็ตจำนวนครั้งรหัสผิดเรียบร้อยแล้ว`, 'success');
        this.renderUsers(document.getElementById('main-content'));
    }
};

app.toggleUserOptions = function() {
    const r = document.getElementById('u_role')?.value;
    const shipBox = document.getElementById('u_shipping_box');
    const whBox = document.getElementById('u_warehouse_box');

    if (shipBox) {
        if (r === 'sales') shipBox.classList.remove('hidden');
        else shipBox.classList.add('hidden');
    }
    if (whBox) {
        if (r === 'warehouse') whBox.classList.remove('hidden');
        else whBox.classList.add('hidden');
    }
};

app.toggleUserShipping = function() { app.toggleUserOptions(); };

app.openUserModal = function(userId = null) {
    let u = userId ? this.mockData.users.find(x => x.id === userId) : null;
    const whList = this.mockData.warehouses.filter(w => w.type !== 'sales');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-user-plus text-blue-600 text-xl"></i>
                        ${u ? 'แก้ไขผู้ใช้งาน' : 'สร้างผู้ใช้ใหม่'}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto">
                    <form id="user-form" onsubmit="event.preventDefault(); app.saveUser(${userId || 'null'})" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                            <input type="text" id="u_username" value="${u?.username || ''}" class="w-full border rounded-lg px-3 py-2 text-sm font-mono" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                            <input type="text" id="u_password" value="${u?.password || ''}" class="w-full border rounded-lg px-3 py-2 text-sm font-mono" required>
                        </div>
                        <div class="md:col-span-2">
                            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                            <input type="text" id="u_fullname" value="${u?.fullname || ''}" class="w-full border rounded-lg px-3 py-2 text-sm" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อเล่น</label>
                            <input type="text" id="u_nickname" value="${u?.nickname || ''}" class="w-full border rounded-lg px-3 py-2 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทร</label>
                            <input type="text" id="u_phone" value="${u?.phone || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-2 text-sm font-mono">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">อีเมล</label>
                            <input type="email" id="u_email" value="${u?.email || ''}" class="w-full border rounded-lg px-3 py-2 text-sm">
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">สิทธิ์ (Role) *</label>
                            <select id="u_role" onchange="app.toggleUserOptions()" class="w-full border rounded-lg px-3 py-2 text-sm bg-slate-50" required>
                                <option value="admin" ${u?.role==='admin'?'selected':''}>Admin (ผู้ดูแลระบบ)</option>
                                <option value="purchasing" ${u?.role==='purchasing'?'selected':''}>Purchasing (ฝ่ายจัดซื้อ)</option>
                                <option value="warehouse" ${u?.role==='warehouse'?'selected':''}>Warehouse (ฝ่ายคลัง)</option>
                                <option value="sales" ${u?.role==='sales'?'selected':''}>Sales (ฝ่ายขาย)</option>
                                <option value="accounting" ${u?.role==='accounting'?'selected':''}>Accounting (ฝ่ายบัญชี)</option>
                                <option value="management" ${u?.role==='management'?'selected':''}>Management (ผู้บริหาร)</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-purple-700 mb-1">พื้นที่ทำงาน (Area / Region)</label>
                            <input type="text" id="u_area" value="${u?.area || ''}" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="เช่น HQ, BKK, CNX, Main WH">
                        </div>

                        <!-- Warehouse Selection for Warehouse Role -->
                        <div class="md:col-span-2 hidden bg-amber-50 p-3.5 rounded-xl border border-amber-200" id="u_warehouse_box">
                            <label class="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                                <i class="ph ph-warehouse text-amber-600 text-base"></i> สังกัดคลังสินค้า (สำหรับฝ่ายคลัง Warehouse) *
                            </label>
                            <p class="text-xs text-amber-700 mb-2">แยกการทำงานและสิทธิ์ดูแลระหว่าง คลังสินค้าหลัก (Main WH) และ คลังสินค้าย่อย (Sub WH)</p>
                            <select id="u_warehouse_id" class="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white font-medium">
                                <option value="">-- เลือกคลังสินค้าที่สังกัด --</option>
                                ${whList.map(w => `<option value="${w.id}" ${u?.warehouse_id === w.id ? 'selected' : ''}>[${w.type === 'main' ? 'คลังหลัก' : 'คลังย่อย'}] ${w.name}</option>`).join('')}
                            </select>
                        </div>

                        <!-- Shipping Address for Sales Role -->
                        <div class="md:col-span-2 hidden bg-orange-50 p-3 rounded-xl border border-orange-200" id="u_shipping_box">
                            <label class="block text-xs font-bold text-orange-800 mb-1">ที่อยู่จัดส่งสินค้า (สำหรับ Sales)</label>
                            <p class="text-xs text-orange-600 mb-2">ใช้ตั้งเป็นที่อยู่จัดส่งเริ่มต้นเวลาขอเบิกสินค้าเพื่อสต็อกส่วนตัว</p>
                            <textarea id="u_shipping_address" class="w-full border rounded-lg px-3 py-2 text-sm bg-white" rows="2">${u?.shipping_address || ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 rounded-xl font-bold text-slate-700">ยกเลิก</button>
                    <button type="submit" form="user-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm font-bold">บันทึกข้อมูลผู้ใช้</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
    this.toggleUserOptions();
};

app.saveUser = function(userId) {
    const role = document.getElementById('u_role').value;
    const warehouse_id = document.getElementById('u_warehouse_id') ? document.getElementById('u_warehouse_id').value : '';
    let area = document.getElementById('u_area').value.trim();

    if (role === 'warehouse' && warehouse_id) {
        const whObj = this.mockData.warehouses.find(w => w.id === warehouse_id);
        if (whObj) area = whObj.name;
    }

    const u = {
        username: document.getElementById('u_username').value.trim(),
        password: document.getElementById('u_password').value.trim(),
        fullname: document.getElementById('u_fullname').value.trim(),
        nickname: document.getElementById('u_nickname').value.trim(),
        phone: document.getElementById('u_phone').value.trim(),
        email: document.getElementById('u_email').value.trim(),
        role: role,
        area: area,
        warehouse_id: warehouse_id,
        shipping_address: document.getElementById('u_shipping_address') ? document.getElementById('u_shipping_address').value.trim() : ''
    };

    if (!u.username || !u.fullname) {
        this.showToast('กรุณากรอก Username และชื่อ-นามสกุล', 'error');
        return;
    }

    if (role === 'warehouse' && !u.warehouse_id) {
        this.showToast('กรุณาเลือกคลังสินค้าที่สังกัดสำหรับสิทธิ์ Warehouse', 'warning');
    }

    if (userId) {
        const idx = this.mockData.users.findIndex(x => x.id === userId);
        if (idx > -1) this.mockData.users[idx] = { ...this.mockData.users[idx], ...u };
    } else {
        u.id = Date.now();
        this.mockData.users.push(u);
    }

    this.showToast('บันทึกผู้ใช้สำเร็จ', 'success');
    this.closeModal();
    this.renderUsers(document.getElementById('main-content'));
};

// ==========================================
// SYSTEM SETTINGS & WAREHOUSES (ข้อมูลองค์กร & ตั้งค่าคลัง)
// ==========================================

app.renderSettings = function(container) {
    const comp = this.mockData.company;
    const sec = this.mockData.securitySettings || { maxFailedBeforeDelay: 5, delaySeconds: 30, maxFailedBeforeLock: 10 };

    let bankHtml = comp.banks.map((b, idx) => `
        <div class="flex items-center justify-between bg-white border p-4 rounded-2xl shadow-sm">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl">
                    <i class="ph ph-bank"></i>
                </div>
                <div>
                    <div class="font-bold text-slate-800">${b.bank} <span class="text-slate-500 text-xs font-normal">(${b.branch})</span></div>
                    <div class="text-xs text-slate-600 mt-0.5">${b.account_name} | <span class="font-mono font-bold text-blue-600">${b.account_no}</span></div>
                </div>
            </div>
            <div class="flex gap-1">
                <button type="button" onclick="app.openBankModal(${idx})" class="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-100">
                    <i class="ph ph-pencil-simple text-lg"></i>
                </button>
                <button type="button" onclick="app.deleteBank(${idx})" class="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-slate-100">
                    <i class="ph ph-trash text-lg"></i>
                </button>
            </div>
        </div>
    `).join('');

    let whHtml = this.mockData.warehouses.filter(w => w.type !== 'sales').map((w, idx) => `
        <div class="bg-white border p-5 rounded-2xl shadow-sm">
            <div class="flex justify-between items-start">
                <h4 class="font-bold text-slate-800 flex items-center gap-2">
                    <i class="ph ph-warehouse text-amber-600 text-xl"></i> ${w.name}
                </h4>
                <span class="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full border font-bold uppercase text-slate-600">${w.type}</span>
            </div>
            <div class="mt-3 text-xs text-slate-600 space-y-1.5">
                <p><i class="ph ph-map-pin text-red-500 mr-1"></i> ${this.formatAddr(w.address)}</p>
                <p><i class="ph ph-user text-blue-500 mr-1"></i> ผู้ติดต่อ: ${w.contact || '-'}</p>
                <p><i class="ph ph-phone text-emerald-500 mr-1"></i> โทร: ${w.phone || '-'}</p>
            </div>
            <div class="mt-4 pt-3 border-t flex justify-end gap-2">
                <button onclick="app.openWarehouseModal('${w.id}')" class="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100">
                    <i class="ph ph-pencil-simple text-lg"></i>
                </button>
                <button onclick="app.deleteWarehouse('${w.id}')" class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100">
                    <i class="ph ph-trash text-lg"></i>
                </button>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-slate-800">ข้อมูลบริษัทและตั้งค่าระบบ (System Settings)</h2>
            <p class="text-slate-500 text-sm">กำหนดข้อมูลนิติบุคคล บัญชีรับชำระเงิน และโครงสร้างคลังสินค้า</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border mb-8">
            <div class="border-b px-6 py-4 bg-slate-50 rounded-t-2xl">
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                    <i class="ph ph-buildings text-blue-600 text-xl"></i> ข้อมูลบริษัท/องค์กร
                </h3>
            </div>
            <form onsubmit="event.preventDefault(); app.saveCompanySettings()" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อบริษัท *</label>
                    <input type="text" id="comp_name" value="${comp.name}" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" required>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก) *</label>
                    <input type="text" id="comp_tax" value="${comp.tax_id}" maxlength="13" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-xl px-3 py-2 text-sm bg-white font-mono" required>
                </div>
                <div class="md:col-span-2">
                    <label class="block text-xs font-bold text-slate-700 mb-1">ที่อยู่ตั้งทำการ *</label>
                    <textarea id="comp_addr" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" rows="2" required>${comp.address}</textarea>
                </div>
                <div class="md:col-span-2 text-right pt-2">
                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all">
                        บันทึกข้อมูลบริษัท
                    </button>
                </div>
            </form>
        </div>

        <div class="mb-4 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                <i class="ph ph-wallet text-emerald-600 text-xl"></i> บัญชีธนาคารรับชำระเงิน
            </h3>
            <button onclick="app.openBankModal()" class="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl font-bold shadow-sm flex items-center gap-1">
                <i class="ph ph-plus"></i> เพิ่มบัญชี
            </button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">${bankHtml}</div>

        <div class="mb-4 flex justify-between items-center">
            <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                <i class="ph ph-warehouse text-amber-600 text-xl"></i> ตั้งค่าคลังสินค้า (Warehouses)
            </h3>
            <button onclick="app.openWarehouseModal()" class="text-xs bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl font-bold shadow-sm flex items-center gap-1">
                <i class="ph ph-plus"></i> เพิ่มคลังสินค้า
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">${whHtml}</div>

        <div class="bg-white rounded-2xl shadow-sm border mb-8">
            <div class="border-b px-6 py-4 bg-slate-50 rounded-t-2xl">
                <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
                    <i class="ph ph-shield-check text-red-600 text-xl"></i> ตั้งค่าความปลอดภัยการล็อกอิน (Login Security Settings)
                </h3>
            </div>
            <form onsubmit="event.preventDefault(); app.saveSecuritySettings()" class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">จำนวนครั้งใส่รหัสผิดก่อนหน่วงเวลา (ครั้ง) *</label>
                    <input type="number" id="sec_max_delay" value="${sec.maxFailedBeforeDelay || 5}" min="1" max="20" class="w-full border rounded-xl px-3 py-2 text-sm bg-white font-mono font-bold" required>
                    <p class="text-[11px] text-slate-500 mt-1">เมื่อผิดถึงจำนวนนี้ ระบบจะเริ่มนับเวลาถอยหลังหน่วงเวลา</p>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">ระยะเวลาหน่วงล็อกอิน (วินาที) *</label>
                    <input type="number" id="sec_delay_sec" value="${sec.delaySeconds || 30}" min="5" max="300" class="w-full border rounded-xl px-3 py-2 text-sm bg-white font-mono font-bold" required>
                    <p class="text-[11px] text-slate-500 mt-1">เวลาที่ต้องรอคอยก่อนที่จะอนุญาตให้ลองเข้าสู่ระบบอีกครั้ง</p>
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-700 mb-1">จำนวนครั้งใส่รหัสผิดก่อนล็อคบัญชี (ครั้ง) *</label>
                    <input type="number" id="sec_max_lock" value="${sec.maxFailedBeforeLock || 10}" min="2" max="50" class="w-full border rounded-xl px-3 py-2 text-sm bg-white font-mono font-bold" required>
                    <p class="text-[11px] text-slate-500 mt-1">เมื่อผิดสะสมถึงจำนวนนี้ บัญชีจะถูกล็อคทันที ต้องปลดล็อคโดย Admin</p>
                </div>
                <div class="md:col-span-3 text-right pt-2 border-t mt-2">
                    <button type="submit" class="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 ml-auto">
                        <i class="ph ph-floppy-disk"></i> บันทึกเงื่อนไขความปลอดภัย
                    </button>
                </div>
            </form>
        </div>
    `;
};

app.saveSecuritySettings = function() {
    const maxDelay = parseInt(document.getElementById('sec_max_delay').value) || 5;
    const delaySec = parseInt(document.getElementById('sec_delay_sec').value) || 30;
    const maxLock = parseInt(document.getElementById('sec_max_lock').value) || 10;

    if (maxDelay >= maxLock) {
        this.showToast('จำนวนครั้งที่หน่วงเวลา ต้องน้อยกว่า จำนวนครั้งที่ล็อคผู้ใช้งาน', 'warning');
        return;
    }

    this.mockData.securitySettings = {
        maxFailedBeforeDelay: maxDelay,
        delaySeconds: delaySec,
        maxFailedBeforeLock: maxLock
    };

    this.showToast('บันทึกเงื่อนไขความปลอดภัยการเข้าสู่ระบบเรียบร้อยแล้ว', 'success');
};

app.saveCompanySettings = function() {
    this.mockData.company.name = document.getElementById('comp_name').value.trim();
    this.mockData.company.tax_id = document.getElementById('comp_tax').value.trim();
    this.mockData.company.address = document.getElementById('comp_addr').value.trim();
    this.showToast('บันทึกข้อมูลองค์กรเรียบร้อยแล้ว', 'success');
};

app.openBankModal = function(idx = null) {
    const b = idx !== null ? this.mockData.company.banks[idx] : null;
    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-bank text-emerald-600 text-xl"></i> ${b ? 'แก้ไขบัญชีธนาคาร' : 'เพิ่มบัญชีธนาคาร'}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6">
                    <form id="bank-form" onsubmit="event.preventDefault(); app.saveBank(${idx})" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ธนาคาร *</label>
                            <input type="text" id="b_bank" value="${b?.bank || ''}" placeholder="เช่น กสิกรไทย, ไทยพาณิชย์" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">สาขา *</label>
                            <input type="text" id="b_branch" value="${b?.branch || ''}" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อบัญชี *</label>
                            <input type="text" id="b_name" value="${b?.account_name || ''}" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">เลขบัญชี *</label>
                            <input type="text" id="b_no" value="${b?.account_no || ''}" maxlength="15" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-xl px-3 py-2 text-sm font-mono font-bold" required>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="bank-form" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm">บันทึกบัญชี</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveBank = function(idx) {
    const b = {
        bank: document.getElementById('b_bank').value.trim(),
        branch: document.getElementById('b_branch').value.trim(),
        account_name: document.getElementById('b_name').value.trim(),
        account_no: document.getElementById('b_no').value.trim()
    };
    if (idx !== null) this.mockData.company.banks[idx] = b;
    else this.mockData.company.banks.push(b);

    this.showToast('บันทึกบัญชีสำเร็จ', 'success');
    this.closeModal();
    this.renderSettings(document.getElementById('main-content'));
};

app.deleteBank = function(idx) {
    this.showConfirm('ลบบัญชีธนาคาร?', 'คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?', `app.mockData.company.banks.splice(${idx},1); app.renderSettings(document.getElementById('main-content'));`);
};

app.openWarehouseModal = function(wid = null) {
    const w = wid ? this.mockData.warehouses.find(x => x.id === wid) : null;
    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-warehouse text-amber-600 text-xl"></i>
                        ${w ? 'แก้ไขคลังสินค้า' : 'เพิ่มคลังสินค้าใหม่'}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto">
                    <form id="wh-form" onsubmit="event.preventDefault(); app.saveWarehouse('${wid || ''}')" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อคลังสินค้า *</label>
                                <input type="text" id="w_name" value="${w?.name || ''}" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ประเภทคลัง *</label>
                                <select id="w_type" class="w-full border rounded-xl px-3 py-2 text-sm bg-white">
                                    <option value="main" ${w?.type==='main'?'selected':''}>คลังหลัก (Main Warehouse)</option>
                                    <option value="sub" ${w?.type==='sub'?'selected':''}>คลังย่อย (Sub Warehouse)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ติดต่อประจำคลัง</label>
                                <input type="text" id="w_contact" value="${w?.contact || ''}" class="w-full border rounded-xl px-3 py-2 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรติดต่อ</label>
                                <input type="text" id="w_phone" value="${w?.phone || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-xl px-3 py-2 text-sm font-mono">
                            </div>
                        </div>
                        <h4 class="font-bold border-b pb-1 mt-4 mb-2 text-slate-800 text-sm">ที่ตั้งคลังสินค้า</h4>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div><label class="text-xs text-slate-500 font-bold">เลขที่/หมู่</label><input type="text" id="wa_no" value="${w?.address?.no || ''}" class="w-full border rounded-lg px-2.5 py-1.5 text-sm"></div>
                            <div><label class="text-xs text-slate-500 font-bold">ถนน</label><input type="text" id="wa_road" value="${w?.address?.road || ''}" class="w-full border rounded-lg px-2.5 py-1.5 text-sm"></div>
                            <div><label class="text-xs text-slate-500 font-bold">แขวง/ตำบล</label><input type="text" id="wa_subd" value="${w?.address?.subdistrict || ''}" class="w-full border rounded-lg px-2.5 py-1.5 text-sm"></div>
                            <div><label class="text-xs text-slate-500 font-bold">เขต/อำเภอ</label><input type="text" id="wa_dist" value="${w?.address?.district || ''}" class="w-full border rounded-lg px-2.5 py-1.5 text-sm"></div>
                            <div><label class="text-xs text-slate-500 font-bold">จังหวัด</label><input type="text" id="wa_prov" value="${w?.address?.province || ''}" class="w-full border rounded-lg px-2.5 py-1.5 text-sm"></div>
                            <div><label class="text-xs text-slate-500 font-bold">รหัสไปรษณีย์</label><input type="text" id="wa_zip" value="${w?.address?.zip || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-2.5 py-1.5 text-sm font-mono"></div>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="wh-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">บันทึกข้อมูลคลัง</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveWarehouse = function(wid) {
    const w = {
        name: document.getElementById('w_name').value.trim(),
        type: document.getElementById('w_type').value,
        contact: document.getElementById('w_contact').value.trim(),
        phone: document.getElementById('w_phone').value.trim(),
        address: {
            no: document.getElementById('wa_no').value.trim(),
            road: document.getElementById('wa_road').value.trim(),
            subdistrict: document.getElementById('wa_subd').value.trim(),
            district: document.getElementById('wa_dist').value.trim(),
            province: document.getElementById('wa_prov').value.trim(),
            zip: document.getElementById('wa_zip').value.trim()
        }
    };

    if (wid) {
        const idx = this.mockData.warehouses.findIndex(x => x.id === wid);
        if (idx > -1) {
            w.id = wid;
            this.mockData.warehouses[idx] = w;
        }
    } else {
        w.id = 'W-SUB-' + Date.now();
        this.mockData.warehouses.push(w);
    }

    this.showToast('บันทึกคลังสินค้าเรียบร้อยแล้ว', 'success');
    this.closeModal();
    this.renderSettings(document.getElementById('main-content'));
};

app.deleteWarehouse = function(wid) {
    this.showConfirm('ลบคลังสินค้า?', 'คุณแน่ใจหรือไม่ว่าต้องการลบคลังสินค้านี้?', `app.mockData.warehouses = app.mockData.warehouses.filter(w => w.id !== '${wid}'); app.renderSettings(document.getElementById('main-content'));`);
};
