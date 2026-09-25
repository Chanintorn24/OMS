/**
 * OMS (Operation Management System) - Purchasing Module
 * File: js/purchasing.js
 */

// ==========================================
// VENDORS (จัดการผู้แทนจำหน่าย/ซัพพลายเออร์)
// ==========================================

app.renderVendors = function(container) {
    const vendors = this.mockData.vendors || [];
    
    let vendorCards = vendors.map(v => {
        let prodCards = v.products && v.products.length ? v.products.map(p => `
            <div class="bg-white p-3 rounded-xl border border-slate-200/90 shadow-sm hover:border-blue-200 transition-all">
                <div class="flex justify-between items-center text-xs mb-1">
                    <span class="font-bold text-blue-600 font-mono text-sm">${p.sku || 'PROD-001'}</span>
                    <span class="text-slate-500 font-medium">${p.unit || 'กล่อง'} (ลังละ ${p.carton_qty || 1})</span>
                </div>
                <div class="font-bold text-slate-800 text-sm leading-tight">${p.name || '-'}</div>
                <div class="text-right font-mono font-bold text-slate-900 text-base mt-2">
                    ฿${(p.cost || 0).toLocaleString()}
                </div>
            </div>
        `).join('') : '<div class="text-center py-6 text-slate-400 text-xs">ยังไม่มีรายการสินค้าที่จำหน่าย</div>';

        return `
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all mb-4">
                <!-- Top Header -->
                <div class="flex justify-between items-center mb-5">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl border border-blue-100">
                            <i class="ph ph-buildings"></i>
                        </div>
                        <h3 class="text-xl font-bold text-slate-900">${v.name}</h3>
                    </div>
                    <div class="flex items-center gap-1">
                        <button onclick="app.openVendorModal(${v.id})" class="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors" title="แก้ไข">
                            <i class="ph ph-pencil-simple text-xl"></i>
                        </button>
                        <button onclick="app.deleteVendor(${v.id})" class="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors" title="ลบ">
                            <i class="ph ph-trash text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Grid Details -->
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <!-- Left: Contact & Address Box -->
                    <div class="lg:col-span-7 bg-slate-50/80 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                        <div class="space-y-3">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div class="flex items-center gap-2">
                                    <i class="ph ph-user text-slate-400 text-lg"></i>
                                    <span class="text-slate-600">ติดต่อ:</span>
                                    <span class="font-bold text-slate-800">${v.contact || '-'}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="ph ph-phone text-slate-400 text-lg"></i>
                                    <span class="text-slate-600">โทร:</span>
                                    <span class="font-bold text-slate-800">${v.phone || '-'}</span>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div class="flex items-center gap-2">
                                    <i class="ph ph-envelope text-slate-400 text-lg"></i>
                                    <span class="text-slate-600">อีเมล:</span>
                                    <span class="font-medium text-slate-800 truncate">${v.email || '-'}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <i class="ph ph-identification-card text-slate-400 text-lg"></i>
                                    <span class="text-slate-600">Tax ID:</span>
                                    <span class="font-mono text-slate-800 font-bold">${v.tax_id || '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div class="border-t border-slate-200/70 my-3.5"></div>

                        <div class="flex items-start gap-2 text-sm text-slate-700">
                            <i class="ph ph-map-pin text-slate-400 text-lg mt-0.5 shrink-0"></i>
                            <div>
                                <span class="text-slate-600 font-medium">ที่อยู่:</span>
                                <span class="text-slate-800">${this.formatAddr(v.address)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Products Sold Box -->
                    <div class="lg:col-span-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/80">
                        <div class="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                            <i class="ph ph-package text-blue-600 text-lg"></i> รายการสินค้าที่จำหน่าย
                        </div>
                        <div class="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            ${prodCards}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">ผู้แทนจำหน่าย (Vendors)</h2>
                <p class="text-slate-500 text-sm">จัดการข้อมูลผู้ขาย ซัพพลายเออร์ และรายการสินค้าพร้อมราคาทุน</p>
            </div>
            <button onclick="app.openVendorModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-plus text-lg"></i> เพิ่มผู้ขายใหม่
            </button>
        </div>

        <div class="space-y-4">
            ${vendorCards || '<div class="bg-white p-12 text-center rounded-2xl border text-slate-400">ไม่พบข้อมูลผู้แทนจำหน่าย</div>'}
        </div>
    `;
};

app.onVendorSkuChange = function(inputElem) {
    // Manual SKU input only - auto-suggest and auto-fill disabled per user requirement
};

app.openVendorModal = function(vendorId = null) {
    const v = vendorId ? this.mockData.vendors.find(x => x.id === vendorId) : null;

    let prodRows = '';
    if (v && v.products && v.products.length) {
        prodRows = v.products.map((p) => `
            <div class="grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-2 rounded-xl border border-slate-200 v-prod-item mb-2">
                <div class="col-span-3">
                    <input type="text" name="vp_sku[]" value="${p.sku || ''}" placeholder="PROD-001" class="w-full border rounded-lg px-2.5 py-1.5 text-sm font-mono bg-white uppercase" required>
                </div>
                <div class="col-span-4">
                    <input type="text" name="vp_name[]" value="${p.name || ''}" placeholder="ชื่อสินค้า" class="w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white" required>
                </div>
                <div class="col-span-2">
                    <input type="text" name="vp_unit[]" value="${p.unit || 'กล่อง'}" placeholder="หน่วยนับ" class="w-full border rounded-lg px-2.5 py-1.5 text-sm text-center bg-white">
                </div>
                <div class="col-span-1">
                    <input type="number" name="vp_carton_qty[]" value="${p.carton_qty || 1}" placeholder="ต่อลัง" class="w-full border rounded-lg px-1.5 py-1.5 text-sm font-mono text-center bg-white">
                </div>
                <div class="col-span-2 flex items-center gap-1">
                    <input type="number" name="vp_cost[]" value="${p.cost || 0}" placeholder="ราคาทุน" class="w-full border rounded-lg px-2 py-1.5 text-sm font-mono text-right bg-white">
                    <button type="button" onclick="this.closest('.v-prod-item').remove()" class="text-slate-400 hover:text-red-600 p-1 shrink-0" title="ลบ">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-white rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-buildings text-blue-600 text-xl"></i>
                        ${v ? 'แก้ไขผู้จำหน่าย' : 'เพิ่มผู้จำหน่ายใหม่'}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-5">
                    <form id="vendor-form" onsubmit="event.preventDefault(); app.saveVendor(${vendorId || 'null'})" class="space-y-5">
                        <!-- Section 1: ข้อมูลบริษัท -->
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm mb-3">ข้อมูลบริษัท</h4>
                            <div class="space-y-3">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อบริษัท *</label>
                                    <input type="text" id="v_name" name="v_name" value="${v?.name || ''}" class="w-full border rounded-xl px-3.5 py-2 text-sm" placeholder="IT Supplier Co.,Ltd." required>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">ผู้ติดต่อ</label>
                                        <input type="text" id="v_contact" name="v_contact" value="${v?.contact || ''}" class="w-full border rounded-xl px-3.5 py-2 text-sm" placeholder="คุณวิชัย">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทร</label>
                                        <input type="text" id="v_phone" name="v_phone" value="${v?.phone || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-xl px-3.5 py-2 text-sm" placeholder="021112222">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">อีเมล</label>
                                        <input type="email" id="v_email" name="v_email" value="${v?.email || ''}" class="w-full border rounded-xl px-3.5 py-2 text-sm" placeholder="sales@itsupplier.com">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">Tax ID (13 หลัก)</label>
                                        <input type="text" id="v_tax_id" name="v_tax_id" value="${v?.tax_id || ''}" maxlength="13" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-xl px-3.5 py-2 text-sm font-mono" placeholder="0105511111111">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 2: ที่อยู่ -->
                        <div class="pt-3 border-t">
                            <h4 class="font-bold text-slate-800 text-sm mb-3">ที่อยู่</h4>
                            <div class="space-y-3">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">เลขที่/หมู่</label>
                                        <input type="text" id="va_no" name="va_no" value="${v?.address?.no || (typeof v?.address === 'string' ? v.address : '')}" class="w-full border rounded-xl px-3 py-2 text-sm" placeholder="123/4">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">ถนน</label>
                                        <input type="text" id="va_road" name="va_road" value="${v?.address?.road || ''}" class="w-full border rounded-xl px-3 py-2 text-sm" placeholder="รัชดาภิเษก">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">ตำบล/แขวง</label>
                                        <input type="text" id="va_subd" name="va_subd" value="${v?.address?.subdistrict || ''}" class="w-full border rounded-xl px-3 py-2 text-sm" placeholder="ดินแดง">
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">เขต/อำเภอ</label>
                                        <input type="text" id="va_dist" name="va_dist" value="${v?.address?.district || ''}" class="w-full border rounded-xl px-3 py-2 text-sm" placeholder="ดินแดง">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">จังหวัด</label>
                                        <input type="text" id="va_prov" name="va_prov" value="${v?.address?.province || ''}" class="w-full border rounded-xl px-3 py-2 text-sm" placeholder="กรุงเทพมหานคร">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">รหัสไปรษณีย์</label>
                                        <input type="text" id="va_zip" name="va_zip" value="${v?.address?.zip || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-xl px-3 py-2 text-sm font-mono" placeholder="10400">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 3: รายการสินค้าที่จำหน่าย -->
                        <div class="pt-3 border-t">
                            <div class="flex justify-between items-center mb-3">
                                <div>
                                    <h4 class="font-bold text-slate-800 text-sm">รายการสินค้าที่จำหน่าย</h4>
                                    <p class="text-xs text-slate-400">กรอกรหัสสินค้าแบบกำหนดเอง (ห้ามซ้ำกัน)</p>
                                </div>
                                <button type="button" onclick="app.addVendorProductRow()" class="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 transition-colors flex items-center gap-1">
                                    <i class="ph ph-plus"></i> เพิ่มแถวสินค้า
                                </button>
                            </div>

                            <div class="bg-slate-100 rounded-lg p-2.5 text-xs font-bold text-slate-700 grid grid-cols-12 gap-2 mb-2">
                                <div class="col-span-3">รหัสสินค้า</div>
                                <div class="col-span-4">ชื่อสินค้า</div>
                                <div class="col-span-2 text-center">หน่วยนับ(ย่อย)</div>
                                <div class="col-span-1 text-center">จำนวนต่อลัง</div>
                                <div class="col-span-2 text-right pr-6">ราคาทุน (B)</div>
                            </div>

                            <div id="vendor-products-container" class="space-y-1">
                                ${prodRows || '<div class="text-center py-4 text-slate-400 text-sm border border-dashed rounded-xl" id="vp-empty">ยังไม่ได้เพิ่มรายการสินค้า</div>'}
                            </div>
                        </div>
                    </form>
                </div>
                <div class="p-4 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors text-sm">ยกเลิก</button>
                    <button type="submit" form="vendor-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-colors text-sm">บันทึกข้อมูล</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.addVendorProductRow = function() {
    const empty = document.getElementById('vp-empty');
    if (empty) empty.remove();

    const container = document.getElementById('vendor-products-container');

    const div = document.createElement('div');
    div.className = 'grid grid-cols-12 gap-2 items-center bg-slate-50/80 p-2 rounded-xl border border-slate-200 v-prod-item mb-2 animate-fade-in';
    div.innerHTML = `
        <div class="col-span-3">
            <input type="text" name="vp_sku[]" placeholder="PROD-001" class="w-full border rounded-lg px-2.5 py-1.5 text-sm font-mono bg-white uppercase" required>
        </div>
        <div class="col-span-4">
            <input type="text" name="vp_name[]" placeholder="ชื่อสินค้า" class="w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white" required>
        </div>
        <div class="col-span-2">
            <input type="text" name="vp_unit[]" value="กล่อง" placeholder="หน่วยนับ" class="w-full border rounded-lg px-2.5 py-1.5 text-sm text-center bg-white">
        </div>
        <div class="col-span-1">
            <input type="number" name="vp_carton_qty[]" value="1" placeholder="ต่อลัง" class="w-full border rounded-lg px-1.5 py-1.5 text-sm font-mono text-center bg-white">
        </div>
        <div class="col-span-2 flex items-center gap-1">
            <input type="number" name="vp_cost[]" value="0" placeholder="ราคาทุน" class="w-full border rounded-lg px-2 py-1.5 text-sm font-mono text-right bg-white">
            <button type="button" onclick="this.closest('.v-prod-item').remove()" class="text-slate-400 hover:text-red-600 p-1 shrink-0" title="ลบ">
                <i class="ph ph-trash text-lg"></i>
            </button>
        </div>
    `;
    container.appendChild(div);
};

app.saveVendor = function(vendorId) {
    const name = document.getElementById('v_name').value.trim();
    if (!name) {
        this.showToast('กรุณาระบุชื่อบริษัท/ผู้แทนจำหน่าย', 'error');
        return;
    }

    const prodElems = document.querySelectorAll('.v-prod-item');
    const products = [];
    const skuSet = new Set();
    let duplicateSku = null;

    prodElems.forEach(elem => {
        const skuInput = elem.querySelector('[name="vp_sku[]"]');
        const nameInput = elem.querySelector('[name="vp_name[]"]');
        if (!skuInput || !nameInput) return;
        const sku = skuInput.value.trim().toUpperCase();
        const pName = nameInput.value.trim();
        if (!sku && !pName) return;

        if (sku) {
            if (skuSet.has(sku)) {
                duplicateSku = sku + ' (ซ้ำกันในแบบฟอร์ม)';
            } else {
                const existsInOtherVendor = (app.mockData.vendors || []).some(v => v.id !== vendorId && v.products && v.products.some(p => p.sku && p.sku.trim().toUpperCase() === sku));
                const existsInMainProd = (app.mockData.products || []).some(p => p.sku && p.sku.trim().toUpperCase() === sku);
                if (existsInOtherVendor || existsInMainProd) {
                    duplicateSku = sku + ' (รหัสสินค้าซ้ำกับในระบบ)';
                } else {
                    skuSet.add(sku);
                }
            }
        }

        const unit = elem.querySelector('[name="vp_unit[]"]').value.trim() || 'กล่อง';
        const cartonQty = parseInt(elem.querySelector('[name="vp_carton_qty[]"]').value) || 1;
        const cost = parseFloat(elem.querySelector('[name="vp_cost[]"]').value) || 0;

        products.push({
            product_id: Date.now() + Math.floor(Math.random()*1000),
            sku: sku || 'PROD-NEW',
            name: pName || 'สินค้าใหม่',
            unit: unit,
            carton_qty: cartonQty,
            cost: cost
        });
    });

    if (duplicateSku) {
        this.showToast(`พบรหัสสินค้าซ้ำซ้อนกัน (${duplicateSku}) กรุณาตรวจสอบ`, 'error');
        return;
    }

    const vData = {
        name: name,
        tax_id: document.getElementById('v_tax_id').value,
        contact: document.getElementById('v_contact').value,
        phone: document.getElementById('v_phone').value,
        email: document.getElementById('v_email').value,
        address: {
            no: document.getElementById('va_no').value,
            road: document.getElementById('va_road').value,
            subdistrict: document.getElementById('va_subd').value,
            district: document.getElementById('va_dist').value,
            province: document.getElementById('va_prov').value,
            zip: document.getElementById('va_zip').value
        },
        products: products
    };

    if (vendorId) {
        const idx = this.mockData.vendors.findIndex(x => x.id === vendorId);
        if (idx > -1) {
            vData.id = vendorId;
            this.mockData.vendors[idx] = vData;
        }
    } else {
        vData.id = Date.now();
        this.mockData.vendors.push(vData);
    }

    this.showToast('บันทึกข้อมูลผู้แทนจำหน่ายเรียบร้อย', 'success');
    this.closeModal();
    this.renderVendors(document.getElementById('main-content'));
};

app.deleteVendor = function(vendorId) {
    this.showConfirm('ลบผู้แทนจำหน่าย?', 'คุณต้องการลบข้อมูลผู้ขายรายนี้ใช่หรือไม่?', `app.mockData.vendors = app.mockData.vendors.filter(v=>v.id !== ${vendorId}); app.renderVendors(document.getElementById('main-content'));`);
};

// ==========================================
// PURCHASE ORDERS (ใบสั่งซื้อ PO & รับสินค้า GRN)
// ==========================================

app.renderPurchaseOrders = function(container) {
    const pos = this.mockData.purchaseOrders || [];
    const grs = this.mockData.goodsReceipts || [];

    const pendingPOs = pos.filter(p => p.status !== 'Complete');

    // Section 1: รอรับเข้า / ค้างรับ Cards
    let pendingCardsHTML = pendingPOs.map(p => `
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border-l-4 border-l-amber-500">
            <div>
                <div class="flex justify-between items-start mb-1">
                    <div>
                        <h4 class="font-bold text-slate-900 text-base leading-tight">${p.po_no}</h4>
                        <p class="text-xs text-slate-400 font-medium mt-0.5">${p.vendor_name}</p>
                    </div>
                    <span class="bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 rounded-lg text-xs font-bold shrink-0">
                        ${p.status === 'Partial' ? 'ค้างรับบางส่วน' : 'รอรับเข้า'}
                    </span>
                </div>

                <div class="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs my-3 space-y-1.5 max-h-36 overflow-y-auto">
                    ${(p.items || []).map(i => `
                        <div class="flex justify-between items-center gap-2">
                            <span class="text-slate-700 font-medium truncate">${i.name}</span>
                            <span class="font-mono text-slate-500 shrink-0">
                                สั่ง: <b class="text-slate-800">${i.ordered_qty}</b> | รับ: <b class="text-emerald-600">${i.received_qty}</b> | ค้าง: <b class="text-amber-600">${i.pending_qty}</b>
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="flex justify-between items-center pt-3 border-t border-slate-100">
                <div class="font-mono font-bold text-blue-600 text-lg">
                    ฿${(p.total_amount || 0).toLocaleString()}
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="app.openPOModal(${p.id})" class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors" title="แก้ไข/ดูรายละเอียด PO">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onclick="app.openReceiveModal(${p.id})" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors shadow-sm">
                        รับเข้า
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Section 2: Goods Receipts History Table
    let grRows = grs.map(gr => {
        const po = pos.find(p => p.po_no === gr.po_no);

        const itemDetailsStr = (gr.items || []).map(i => `
            <div class="text-xs mb-0.5">
                <span class="text-slate-800 font-bold">${i.sku ? i.sku + ' - ' : ''}${i.name}</span>
                <span class="text-slate-500 font-mono"> | สั่ง: ${i.ordered_qty || (i.received_qty + (i.pending_qty || 0))} | <b class="text-emerald-600">รับรอบนี้: ${i.received_qty}</b> | ค้าง: ${i.pending_qty || 0}</span>
            </div>
        `).join('');

        let payBadge = '';
        const payStatus = po ? po.payment_status : 'Unpaid';
        if (payStatus === 'Paid' || payStatus === 'Overpaid') {
            payBadge = '<span class="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-bold">จ่ายครบ</span>';
        } else if (payStatus === 'Partial Paid') {
            payBadge = '<span class="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded text-xs font-bold">จ่ายบางส่วน</span>';
        } else {
            payBadge = '<span class="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded text-xs font-bold">ยังไม่ชำระ</span>';
        }

        const unpaidVal = po ? po.unpaid_amount : 0;
        let unpaidDisplay = `฿${unpaidVal.toLocaleString()}`;
        if (unpaidVal < 0) unpaidDisplay = `฿-${Math.abs(unpaidVal).toLocaleString()}`;

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3.5 font-mono font-bold text-blue-600">${gr.po_no}</td>
                <td class="px-5 py-3.5 text-xs text-slate-500">${gr.date}</td>
                <td class="px-5 py-3.5 font-medium text-slate-800">${gr.vendor_name}</td>
                <td class="px-5 py-3.5">${itemDetailsStr}</td>
                <td class="px-5 py-3.5 text-xs text-blue-600 font-semibold">${gr.received_by || '-'}</td>
                <td class="px-5 py-3.5 font-mono font-bold text-slate-800 text-right">฿${po ? po.total_amount.toLocaleString() : '0'}</td>
                <td class="px-5 py-3.5 font-mono text-right text-xs ${unpaidVal > 0 ? 'text-red-600 font-bold' : unpaidVal < 0 ? 'text-purple-600 font-bold' : 'text-slate-400'}">${unpaidDisplay}</td>
                <td class="px-5 py-3.5">${payBadge}</td>
                <td class="px-5 py-3.5 text-center whitespace-nowrap">
                    <button onclick="app.viewGRNDetail(${gr.id})" class="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors" title="ดูรายละเอียด">
                        <i class="ph ph-eye text-lg"></i>
                    </button>
                    <button onclick="app.openEditGRNModal(${gr.id})" class="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors ml-1" title="แก้ไขประวัติรับเข้า">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">Purchase Orders (จัดซื้อ)</h2>
                <p class="text-slate-500 text-sm">จัดการการสั่งซื้อสินค้า ตรวจสอบรายการค้างรับ และประวัติการรับเข้าคลังสินค้า</p>
            </div>
            <button onclick="app.openPOModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-plus text-lg"></i> สร้างใบสั่งซื้อ
            </button>
        </div>

        <!-- Section 1: รอรับเข้า / ค้างรับ -->
        <div class="mb-8">
            <div class="flex items-center gap-2 mb-4">
                <i class="ph ph-clock text-amber-500 text-xl font-bold"></i>
                <h3 class="text-lg font-bold text-slate-800">รอรับเข้า / ค้างรับ (${pendingPOs.length})</h3>
            </div>
            ${pendingCardsHTML ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${pendingCardsHTML}
                </div>
            ` : `
                <div class="bg-white p-8 rounded-2xl border text-center text-slate-400 text-sm">
                    ไม่มีรายการค้างรับสินค้าในขณะนี้
                </div>
            `}
        </div>

        <!-- Section 2: ประวัติรายการรับเข้า (Goods Receipts) -->
        <div>
            <div class="flex items-center gap-2 mb-4">
                <i class="ph ph-check-circle text-emerald-500 text-xl font-bold"></i>
                <h3 class="text-lg font-bold text-slate-800">ประวัติรายการรับเข้า (Goods Receipts)</h3>
            </div>
            <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-slate-50 border-b text-slate-600 font-bold whitespace-nowrap">
                        <tr>
                            <th class="px-5 py-3.5">PO No.</th>
                            <th class="px-5 py-3.5">วันที่รับเข้า</th>
                            <th class="px-5 py-3.5">ผู้จำหน่าย</th>
                            <th class="px-5 py-3.5">รายละเอียด (สั่ง/รับรอบนี้/ค้าง)</th>
                            <th class="px-5 py-3.5">ผู้รับเข้า (User)</th>
                            <th class="px-5 py-3.5 text-right">ยอดสุทธิ PO</th>
                            <th class="px-5 py-3.5 text-right">ค้างชำระ PO</th>
                            <th class="px-5 py-3.5">สถานะการจ่าย</th>
                            <th class="px-5 py-3.5 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">${grRows || '<tr><td colspan="9" class="text-center py-8 text-slate-400">ยังไม่มีประวัติการรับเข้าสินค้า</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
};

app.openPOModal = function(poId = null) {
    const vendors = this.mockData.vendors || [];
    if (!vendors.length) {
        this.showToast('กรุณากรอกข้อมูลผู้แทนจำหน่ายก่อนออกใบ PO', 'warning');
        return;
    }

    const po = poId ? this.mockData.purchaseOrders.find(x => x.id === poId) : null;
    const today = new Date().toISOString().split('T')[0];
    const poNo = po ? po.po_no : ('PO-' + new Date().getFullYear().toString().substring(2) + (new Date().getMonth()+1).toString().padStart(2,'0') + '-' + Math.floor(100+Math.random()*900));

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-file-plus text-blue-600 text-xl"></i>
                        ${po ? 'แก้ไขใบสั่งซื้อสินค้า (PO)' : 'สร้างใบสั่งซื้อสินค้า (PO)'}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <form id="po-form" onsubmit="event.preventDefault(); app.savePO(${poId || 'null'})" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-1">เลขที่ PO *</label>
                                <input type="text" id="po_no" name="po_no" value="${poNo}" class="w-full border rounded-lg px-3 py-2 text-sm font-mono font-bold" required readonly>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-1">ผู้แทนจำหน่าย (Vendor) *</label>
                                <select id="po_vendor_id" name="po_vendor_id" onchange="app.onPOVendorChange()" class="w-full border rounded-lg px-3 py-2 text-sm bg-white" required ${po ? 'disabled' : ''}>
                                    <option value="">-- เลือกผู้ขาย --</option>
                                    ${vendors.map(v => `<option value="${v.id}" ${po && po.vendor_id === v.id ? 'selected' : ''}>${v.name}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-1">วันที่ออก PO *</label>
                                <input type="date" id="po_date" name="po_date" value="${po ? po.date : today}" class="w-full border rounded-lg px-3 py-2 text-sm" required>
                            </div>
                        </div>

                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="font-bold text-slate-800">รายการสินค้าที่ต้องการสั่งซื้อ</h4>
                                <button type="button" id="btn-add-po-item" onclick="app.addPOItemRow()" class="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed" ${!po || !po.vendor_id ? 'disabled' : ''}>
                                    <i class="ph ph-plus"></i> เพิ่มรายการ
                                </button>
                            </div>
                            <div class="border rounded-xl overflow-hidden">
                                <table class="w-full text-left text-sm">
                                    <thead class="bg-slate-100 text-slate-600 font-bold">
                                        <tr>
                                            <th class="p-3">สินค้า</th>
                                            <th class="p-3 w-16 text-center">แถม</th>
                                            <th class="p-3 w-28 text-right">จำนวน</th>
                                            <th class="p-3 w-32 text-right">ทุน/ชิ้น</th>
                                            <th class="p-3 w-32 text-right">รวม</th>
                                            <th class="p-3 w-12 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="po-items-body" class="divide-y bg-white">
                                        <tr><td colspan="6" class="text-center py-6 text-slate-400">กรุณาเลือกผู้แทนจำหน่ายเพื่อเลือกสินค้า</td></tr>
                                    </tbody>
                                    <tfoot class="bg-slate-50 font-bold border-t">
                                        <tr>
                                            <td colspan="4" class="p-3 text-right">ยอดรวมทั้งสิ้น:</td>
                                            <td class="p-3 text-right text-lg text-blue-600 font-mono" id="po-grand-total">0.00</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="po-form" class="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-sm">
                        ${po ? 'บันทึกแก้ไข PO' : 'บันทึกอนุมัติ PO'}
                    </button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);

    if (po) {
        this.populatePOItemsForEdit(po);
    }
};

app.populatePOItemsForEdit = function(po) {
    const tbody = document.getElementById('po-items-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const vendor = this.mockData.vendors.find(v => v.id === po.vendor_id);
    const availableProds = vendor && vendor.products && vendor.products.length ? vendor.products : this.mockData.products;

    po.items.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = 'po-item-row';
        tr.innerHTML = `
            <td class="p-2">
                <select name="po_item_product[]" onchange="app.onPOItemProductChange(this)" class="w-full border rounded-lg p-2 text-sm">
                    ${availableProds.map(p => `<option value="${p.product_id || p.id}" data-cost="${p.cost || p.cost_price || 0}" data-sku="${p.sku}" ${(p.product_id || p.id) === item.product_id ? 'selected' : ''}>${p.sku} - ${p.name}</option>`).join('')}
                </select>
            </td>
            <td class="p-2 text-center">
                <input type="checkbox" name="po_item_is_free[]" onchange="app.calcPOTotal()" ${item.is_free ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer">
            </td>
            <td class="p-2">
                <div class="flex items-center gap-1 justify-end">
                    <input type="number" name="po_item_qty[]" value="${item.ordered_qty}" min="1" oninput="app.calcPOTotal()" class="w-20 border rounded-lg p-2 text-sm text-right font-mono" required>
                    <span class="text-xs text-slate-500">${item.unit || 'กล่อง'}</span>
                </div>
            </td>
            <td class="p-2">
                <input type="number" name="po_item_price[]" value="${item.price}" oninput="app.calcPOTotal()" class="w-full border rounded-lg p-2 text-sm text-right font-mono ${item.is_free ? 'hidden' : ''}">
                <span class="po-free-label text-purple-600 font-bold text-xs block text-center py-2 ${item.is_free ? '' : 'hidden'}">แถม</span>
            </td>
            <td class="p-2 text-right font-mono font-bold po-row-subtotal">0.00</td>
            <td class="p-2 text-center">
                <button type="button" onclick="this.closest('tr').remove(); app.calcPOTotal();" class="text-slate-400 hover:text-red-600"><i class="ph ph-trash text-lg"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    this.calcPOTotal();
};

app.onPOVendorChange = function() {
    const vId = parseInt(document.getElementById('po_vendor_id').value);
    const tbody = document.getElementById('po-items-body');
    const addBtn = document.getElementById('btn-add-po-item');
    if (!vId) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6 text-slate-400">กรุณาเลือกผู้แทนจำหน่ายเพื่อเลือกสินค้า</td></tr>';
        document.getElementById('po-grand-total').innerText = '0.00';
        if (addBtn) addBtn.disabled = true;
        return;
    }
    if (addBtn) addBtn.disabled = false;
    tbody.innerHTML = '';
    this.addPOItemRow();
};

app.addPOItemRow = function() {
    const vId = parseInt(document.getElementById('po_vendor_id')?.value);
    if (!vId) {
        this.showToast('กรุณาเลือกผู้แทนจำหน่ายก่อนเพิ่มรายการสินค้า', 'warning');
        return;
    }
    const vendor = this.mockData.vendors.find(v => v.id === vId);
    const availableProds = vendor && vendor.products && vendor.products.length ? vendor.products : this.mockData.products;

    const tbody = document.getElementById('po-items-body');
    if (!tbody) return;

    const tr = document.createElement('tr');
    tr.className = 'po-item-row';
    tr.innerHTML = `
        <td class="p-2">
            <select name="po_item_product[]" onchange="app.onPOItemProductChange(this)" class="w-full border rounded-lg p-2 text-sm">
                ${availableProds.map(p => `<option value="${p.product_id || p.id}" data-cost="${p.cost || p.cost_price || 0}" data-sku="${p.sku}">${p.sku} - ${p.name}</option>`).join('')}
            </select>
        </td>
        <td class="p-2 text-center">
            <input type="checkbox" name="po_item_is_free[]" onchange="app.calcPOTotal()" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer">
        </td>
        <td class="p-2">
            <div class="flex items-center gap-1 justify-end">
                <input type="number" name="po_item_qty[]" value="1" min="1" oninput="app.calcPOTotal()" class="w-20 border rounded-lg p-2 text-sm text-right font-mono" required>
                <span class="text-xs text-slate-500">${availableProds[0]?.unit || 'กล่อง'}</span>
            </div>
        </td>
        <td class="p-2">
            <input type="number" name="po_item_price[]" value="${availableProds[0]?.cost || availableProds[0]?.cost_price || 0}" oninput="app.calcPOTotal()" class="w-full border rounded-lg p-2 text-sm text-right font-mono">
            <span class="po-free-label text-purple-600 font-bold text-xs block text-center py-2 hidden">แถม</span>
        </td>
        <td class="p-2 text-right font-mono font-bold po-row-subtotal">0.00</td>
        <td class="p-2 text-center">
            <button type="button" onclick="this.closest('tr').remove(); app.calcPOTotal();" class="text-slate-400 hover:text-red-600"><i class="ph ph-trash text-lg"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
    this.calcPOTotal();
};

app.onPOItemProductChange = function(selectElem) {
    const opt = selectElem.options[selectElem.selectedIndex];
    const cost = opt.getAttribute('data-cost') || 0;
    const row = selectElem.closest('tr');
    const priceInput = row.querySelector('[name="po_item_price[]"]');
    if (priceInput) priceInput.value = cost;
    this.calcPOTotal();
};

app.calcPOTotal = function() {
    let grandTotal = 0;
    const rows = document.querySelectorAll('.po-item-row');
    rows.forEach(r => {
        const isFree = r.querySelector('[name="po_item_is_free[]"]')?.checked || false;
        const priceInput = r.querySelector('[name="po_item_price[]"]');
        const freeLabel = r.querySelector('.po-free-label');
        const qty = parseFloat(r.querySelector('[name="po_item_qty[]"]')?.value) || 0;

        let sub = 0;
        if (isFree) {
            if (priceInput) priceInput.classList.add('hidden');
            if (freeLabel) freeLabel.classList.remove('hidden');
            sub = 0;
            r.querySelector('.po-row-subtotal').innerText = '0.00';
        } else {
            if (priceInput) priceInput.classList.remove('hidden');
            if (freeLabel) freeLabel.classList.add('hidden');
            const price = parseFloat(priceInput ? priceInput.value : 0) || 0;
            sub = qty * price;
            r.querySelector('.po-row-subtotal').innerText = sub.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        }
        grandTotal += sub;
    });
    const gtElem = document.getElementById('po-grand-total');
    if (gtElem) gtElem.innerText = grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
};

app.savePO = function(existingPoId = null) {
    const poNo = document.getElementById('po_no').value;
    const vId = parseInt(document.getElementById('po_vendor_id').value);
    const date = document.getElementById('po_date').value;
    const vendor = this.mockData.vendors.find(v => v.id === vId);

    const rows = document.querySelectorAll('.po-item-row');
    if (!rows.length) {
        this.showToast('กรุณาเลือกรายการสินค้าอย่างน้อย 1 รายการ', 'error');
        return;
    }

    const items = [];
    let totalAmount = 0;

    rows.forEach(r => {
        const pId = parseInt(r.querySelector('[name="po_item_product[]"]').value);
        const qty = parseFloat(r.querySelector('[name="po_item_qty[]"]').value) || 0;
        const isFree = r.querySelector('[name="po_item_is_free[]"]').checked;
        const price = isFree ? 0 : (parseFloat(r.querySelector('[name="po_item_price[]"]').value) || 0);
        const prod = this.mockData.products.find(p => p.id === pId) || (vendor?.products || []).find(p => (p.product_id || p.id) === pId);

        const sub = isFree ? 0 : (qty * price);
        totalAmount += sub;

        items.push({
            product_id: pId,
            sku: prod ? prod.sku : 'PROD',
            name: prod ? prod.name : 'สินค้า',
            ordered_qty: qty,
            received_qty: 0,
            pending_qty: qty,
            price: price,
            is_free: isFree,
            unit: prod ? prod.unit : 'กล่อง'
        });
    });

    if (existingPoId) {
        const po = this.mockData.purchaseOrders.find(p => p.id === existingPoId);
        if (po) {
            po.po_no = poNo;
            po.date = date;
            po.total_amount = totalAmount;
            po.unpaid_amount = totalAmount;
            po.items = items;
            this.showToast('แก้ไขใบสั่งซื้อ PO เรียบร้อยแล้ว', 'success');
        }
    } else {
        const newPO = {
            id: Date.now(),
            po_no: poNo,
            vendor_id: vId,
            vendor_name: vendor ? vendor.name : 'Vendor',
            status: 'Pending',
            payment_status: 'Unpaid',
            total_amount: totalAmount,
            unpaid_amount: totalAmount,
            created_by: `${this.currentUser.role} (${this.currentUser.fullname})`,
            date: date,
            completed_date: null,
            items: items
        };
        this.mockData.purchaseOrders.unshift(newPO);
        this.showToast('สร้างใบสั่งซื้อ PO เรียบร้อยแล้ว', 'success');
    }

    this.closeModal();
    this.renderPurchaseOrders(document.getElementById('main-content'));
};

app.viewGRNDetail = function(grId) {
    const gr = this.mockData.goodsReceipts.find(g => g.id === grId);
    if (!gr) return;

    let itemRows = (gr.items || []).map((i, idx) => `
        <tr>
            <td class="p-3 font-mono text-xs">${idx + 1}</td>
            <td class="p-3 font-mono text-xs font-bold text-slate-700">${i.sku || '-'}</td>
            <td class="p-3 font-bold text-slate-800">${i.name}</td>
            <td class="p-3 text-right font-mono font-bold text-emerald-600">${i.received_qty} ${i.unit || 'กล่อง'}</td>
            <td class="p-3 text-right font-mono text-amber-600">${i.pending_qty || 0} ${i.unit || 'กล่อง'}</td>
        </tr>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">รายละเอียดใบรับสินค้าเข้าคลัง (GRN)</h3>
                        <p class="text-xs text-slate-500">อ้างอิง PO: ${gr.po_no} | ผู้จำหน่าย: ${gr.vendor_name}</p>
                    </div>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <div class="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border text-sm">
                        <div><div class="text-xs text-slate-500">วันที่รับเข้า</div><div class="font-bold text-slate-800 font-mono">${gr.date}</div></div>
                        <div><div class="text-xs text-slate-500">ผู้ตรวจรับเข้า (User)</div><div class="font-bold text-blue-600">${gr.received_by}</div></div>
                    </div>

                    <h4 class="font-bold text-slate-800">รายการสินค้าที่รับเข้า</h4>
                    <div class="border rounded-xl overflow-hidden">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-100 text-slate-600 font-bold">
                                <tr>
                                    <th class="p-3">#</th>
                                    <th class="p-3">SKU</th>
                                    <th class="p-3">ชื่อสินค้า</th>
                                    <th class="p-3 text-right">จำนวนที่รับเข้า</th>
                                    <th class="p-3 text-right">จำนวนค้างรับ</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">${itemRows}</tbody>
                        </table>
                    </div>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end rounded-b-2xl">
                    <button onclick="app.closeModal()" class="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ปิด</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.openEditGRNModal = function(grId) {
    const gr = this.mockData.goodsReceipts.find(g => g.id === grId);
    if (!gr) return;

    let itemInputs = (gr.items || []).map((i, idx) => `
        <div class="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2">
            <div class="col-span-6">
                <div class="font-bold text-sm text-slate-800">${i.name}</div>
                <div class="text-xs text-slate-500 font-mono">${i.sku || '-'}</div>
            </div>
            <div class="col-span-6">
                <label class="block text-xs font-bold text-slate-600 mb-1 text-right">จำนวนรับรอบนี้ (${i.unit || 'กล่อง'})</label>
                <input type="number" name="egrn_qty_${idx}" value="${i.received_qty}" min="1" class="w-full border rounded-lg p-2 text-sm text-right font-bold font-mono text-emerald-600 focus:ring-2 focus:ring-emerald-500" required>
            </div>
        </div>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-pencil-simple text-amber-600 text-xl"></i> แก้ไขประวัติรับเข้าสินค้า (GRN)
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <form id="edit-grn-form" onsubmit="event.preventDefault(); app.saveEditGRN(${gr.id})" class="space-y-4">
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">เลขที่ PO</label>
                                <input type="text" value="${gr.po_no}" class="w-full border rounded-xl p-2.5 text-sm bg-slate-100 font-mono font-bold" readonly>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">วันที่รับเข้า *</label>
                                <input type="date" id="egrn_date" value="${gr.date}" class="w-full border rounded-xl p-2.5 text-sm" required>
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ผู้รับสินค้า (User) *</label>
                            <input type="text" id="egrn_by" value="${gr.received_by}" class="w-full border rounded-xl p-2.5 text-sm" required>
                        </div>

                        <div>
                            <h4 class="font-bold text-slate-800 text-sm mb-2">แก้ไขจำนวนสินค้าที่ตรวจรับ</h4>
                            ${itemInputs}
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="edit-grn-form" class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm">บันทึกแก้ไข</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveEditGRN = function(grId) {
    const gr = this.mockData.goodsReceipts.find(g => g.id === grId);
    if (!gr) return;

    gr.date = document.getElementById('egrn_date').value;
    gr.received_by = document.getElementById('egrn_by').value.trim();

    (gr.items || []).forEach((item, idx) => {
        const input = document.querySelector(`[name="egrn_qty_${idx}"]`);
        if (input) {
            item.received_qty = parseFloat(input.value) || item.received_qty;
        }
    });

    this.showToast('แก้ไขประวัติการรับเข้าสินค้าเรียบร้อย', 'success');
    this.closeModal();
    this.renderPurchaseOrders(document.getElementById('main-content'));
};

app.viewPODetail = function(poId) {
    const p = this.mockData.purchaseOrders.find(x => x.id === poId);
    if (!p) return;

    let itemRows = (p.items || []).map(i => `
        <tr>
            <td class="p-3 font-mono text-xs">${i.sku}</td>
            <td class="p-3 font-bold">${i.name}</td>
            <td class="p-3 text-right font-mono">${i.ordered_qty} ${i.unit}</td>
            <td class="p-3 text-right font-mono text-emerald-600">${i.received_qty}</td>
            <td class="p-3 text-right font-mono text-amber-600">${i.pending_qty}</td>
            <td class="p-3 text-right font-mono">฿${(i.price||0).toLocaleString()}</td>
            <td class="p-3 text-right font-mono font-bold">฿${(i.ordered_qty * i.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">รายละเอียดใบสั่งซื้อ: ${p.po_no}</h3>
                        <p class="text-xs text-slate-500">ผู้ขาย: ${p.vendor_name} | วันที่: ${p.date}</p>
                    </div>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border text-sm">
                        <div><div class="text-xs text-slate-500">ยอดรวมสั่งซื้อ</div><div class="font-bold text-lg text-blue-600 font-mono">฿${(p.total_amount||0).toLocaleString()}</div></div>
                        <div><div class="text-xs text-slate-500">ยอดคงค้างชำระ</div><div class="font-bold text-lg text-red-600 font-mono">฿${(p.unpaid_amount||0).toLocaleString()}</div></div>
                        <div><div class="text-xs text-slate-500">สถานะรับของ</div><div class="font-bold">${p.status}</div></div>
                        <div><div class="text-xs text-slate-500">ผู้ออกเอกสาร</div><div class="font-bold text-xs">${p.created_by}</div></div>
                    </div>

                    <h4 class="font-bold text-slate-800">รายการสินค้าสั่งซื้อ</h4>
                    <div class="border rounded-xl overflow-hidden">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-100 text-slate-600 font-bold">
                                <tr>
                                    <th class="p-3">SKU</th>
                                    <th class="p-3">สินค้า</th>
                                    <th class="p-3 text-right">จำนวนสั่ง</th>
                                    <th class="p-3 text-right">รับแล้ว</th>
                                    <th class="p-3 text-right">คงเหลือ</th>
                                    <th class="p-3 text-right">ราคา/หน่วย</th>
                                    <th class="p-3 text-right">รวมเงิน</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">${itemRows}</tbody>
                        </table>
                    </div>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-between items-center rounded-b-2xl">
                    <button onclick="app.printPO(${p.id})" class="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2">
                        <i class="ph ph-printer"></i> พิมพ์ PO
                    </button>
                    <button onclick="app.closeModal()" class="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ปิด</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.printPO = function(poId) {
    const p = this.mockData.purchaseOrders.find(x => x.id === poId);
    if (!p) return;
    const comp = this.mockData.company;

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ใบสั่งซื้อ ${p.po_no}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>body { font-family: 'Sarabun', sans-serif; }</style>
        </head>
        <body class="p-8 bg-white text-slate-800" onload="window.print()">
            <div class="max-w-3xl mx-auto border p-8 rounded-xl">
                <div class="flex justify-between border-b pb-6 mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-blue-800">${comp.name}</h1>
                        <p class="text-sm text-slate-600 mt-1 max-w-md">${comp.address}</p>
                        <p class="text-sm text-slate-600">เลขผู้เสียภาษี: ${comp.tax_id}</p>
                    </div>
                    <div class="text-right">
                        <h2 class="text-xl font-bold text-slate-700 uppercase">ใบสั่งซื้อ (Purchase Order)</h2>
                        <p class="text-lg font-mono font-bold text-blue-600 mt-1">${p.po_no}</p>
                        <p class="text-sm text-slate-500">วันที่: ${p.date}</p>
                    </div>
                </div>

                <div class="bg-slate-50 p-4 rounded-xl border mb-6 text-sm">
                    <div class="font-bold text-slate-700 mb-1">ผู้ขาย / Vendor:</div>
                    <div class="font-bold text-lg">${p.vendor_name}</div>
                </div>

                <table class="w-full text-left text-sm mb-6 border">
                    <thead class="bg-slate-100 border-b">
                        <tr>
                            <th class="p-3">#</th>
                            <th class="p-3">สินค้า</th>
                            <th class="p-3 text-right">จำนวน</th>
                            <th class="p-3 text-right">ราคา/หน่วย</th>
                            <th class="p-3 text-right">จำนวนเงิน</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${p.items.map((i, idx) => `
                            <tr>
                                <td class="p-3">${idx+1}</td>
                                <td class="p-3 font-bold">${i.name}</td>
                                <td class="p-3 text-right font-mono">${i.ordered_qty} ${i.unit}</td>
                                <td class="p-3 text-right font-mono">฿${i.price.toLocaleString()}</td>
                                <td class="p-3 text-right font-mono font-bold">฿${(i.ordered_qty * i.price).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot class="border-t bg-slate-50 font-bold">
                        <tr>
                            <td colspan="4" class="p-3 text-right">รวมเงินทั้งสิ้น:</td>
                            <td class="p-3 text-right font-mono text-lg text-blue-600">฿${p.total_amount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="grid grid-cols-2 gap-8 text-center mt-12 pt-8 border-t text-sm">
                    <div>
                        <div class="h-16 border-b border-dashed"></div>
                        <p class="mt-2 font-bold">(${p.created_by})</p>
                        <p class="text-slate-500 text-xs">ผู้จัดทำ/ผู้อนุมัติสั่งซื้อ</p>
                    </div>
                    <div>
                        <div class="h-16 border-b border-dashed"></div>
                        <p class="mt-2 font-bold">(${p.vendor_name})</p>
                        <p class="text-slate-500 text-xs">ผู้รับใบสั่งซื้อ</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
};

app.openReceiveModal = function(poId) {
    const p = this.mockData.purchaseOrders.find(x => x.id === poId);
    if (!p) return;

    let itemInputs = p.items.filter(i => i.pending_qty > 0).map(i => `
        <div class="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200 mb-2">
            <div class="col-span-5">
                <div class="font-bold text-sm text-slate-800">${i.name}</div>
                <div class="text-xs text-slate-500 font-mono">${i.sku} | สั่งซื้อ: ${i.ordered_qty} | รับแล้ว: ${i.received_qty}</div>
            </div>
            <div class="col-span-3 text-right font-mono text-amber-600 font-bold text-sm">
                ค้างรับ: ${i.pending_qty} ${i.unit}
            </div>
            <div class="col-span-4">
                <input type="number" name="rcv_qty_${i.product_id}" value="${i.pending_qty}" max="${i.pending_qty}" min="0" class="w-full border rounded-lg p-2 text-sm text-right font-bold font-mono text-emerald-600 focus:ring-2 focus:ring-emerald-500">
            </div>
        </div>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-package text-amber-600 text-xl"></i> บันทึกรับสินค้าเข้าคลัง (GRN) - ${p.po_no}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <form id="receive-form" onsubmit="event.preventDefault(); app.saveReceiveGoods(${p.id})" class="space-y-4">
                        <div class="text-sm bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200">
                            <strong>ผู้ขาย:</strong> ${p.vendor_name} | <strong>ระบุจำนวนสินค้าที่ตรวจรับจริงเข้าคลังสินค้าหลัก</strong>
                        </div>

                        ${itemInputs || '<div class="text-center py-6 text-slate-400">สินค้าในใบ PO นี้รับเข้าครบถ้วนแล้ว</div>'}
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="receive-form" class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm">ยืนยันรับสินค้าเข้าคลัง</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveReceiveGoods = function(poId) {
    const p = this.mockData.purchaseOrders.find(x => x.id === poId);
    if (!p) return;

    let totalReceivedThisTime = 0;
    const grnItems = [];

    p.items.forEach(i => {
        const input = document.querySelector(`[name="rcv_qty_${i.product_id}"]`);
        if (input) {
            const rcvQty = parseFloat(input.value) || 0;
            if (rcvQty > 0) {
                totalReceivedThisTime += rcvQty;
                i.received_qty += rcvQty;
                i.pending_qty = Math.max(0, i.ordered_qty - i.received_qty);

                // Update Warehouse Main Product Stock
                const prod = this.mockData.products.find(item => item.id === i.product_id);
                if (prod) {
                    prod.stock_qty += rcvQty;
                }

                grnItems.push({
                    sku: i.sku,
                    name: i.name,
                    ordered_qty: i.ordered_qty,
                    received_qty: rcvQty,
                    pending_qty: i.pending_qty,
                    unit: i.unit
                });
            }
        }
    });

    if (totalReceivedThisTime === 0) {
        this.showToast('ไม่ได้ระบุจำนวนรับสินค้า', 'warning');
        return;
    }

    // Update PO Status
    const allCompleted = p.items.every(i => i.pending_qty === 0);
    p.status = allCompleted ? 'Complete' : 'Partial';
    if (allCompleted) p.completed_date = new Date().toISOString().split('T')[0];

    // Add Goods Receipt Record
    this.mockData.goodsReceipts.unshift({
        id: Date.now(),
        po_no: p.po_no,
        vendor_name: p.vendor_name,
        date: new Date().toISOString().split('T')[0],
        received_by: `${this.currentUser.fullname}`,
        items: grnItems
    });

    this.showToast('บันทึกรับสินค้าเข้าคลังเรียบร้อย', 'success');
    this.closeModal();
    this.renderPurchaseOrders(document.getElementById('main-content'));
};

// ==========================================
// PURCHASE PAYMENTS (ชำระเงินค้างจ่าย AP)
// ==========================================

app.renderPurchasePayments = function(container) {
    const purchaseOrders = this.mockData.purchaseOrders || [];
    const payments = this.mockData.purchasePayments || [];

    // Filter POs with unpaid amount > 0 for top cards
    const unpaidPOs = purchaseOrders.filter(p => p.unpaid_amount > 0);

    const pendingCardsHTML = unpaidPOs.map(p => `
        <div class="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm min-w-[280px] flex justify-between items-center border-l-4 border-l-amber-500">
            <div>
                <div class="font-bold text-slate-800 text-base font-mono">${p.po_no}</div>
                <div class="text-xs text-slate-400 mt-0.5">${p.vendor_name}</div>
            </div>
            <div class="text-right">
                <div class="text-[11px] text-slate-400">ยอดค้างชำระ</div>
                <div class="font-mono font-bold text-amber-600 text-lg">฿${p.unpaid_amount.toLocaleString()}</div>
            </div>
        </div>
    `).join('');

    let rows = payments.map(pm => {
        const unpaidVal = pm.unpaid_amount;
        let unpaidDisplay = `฿${(unpaidVal || 0).toLocaleString()}`;
        let unpaidClass = 'text-slate-500';
        let statusBadge = '<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold">จ่ายครบ</span>';

        if (unpaidVal > 0) {
            unpaidClass = 'text-red-600 font-bold';
            statusBadge = '<span class="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-xs font-bold">ค้างชำระ</span>';
        } else if (unpaidVal < 0) {
            unpaidClass = 'text-purple-600 font-bold';
            unpaidDisplay = `฿-${Math.abs(unpaidVal).toLocaleString()}`;
            statusBadge = '<span class="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-xs font-bold">จ่ายเกิน(เครดิต)</span>';
        }

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-5 py-3.5 text-xs text-slate-500">${pm.date}</td>
                <td class="px-5 py-3.5 font-mono font-bold text-blue-600">${pm.po_no}</td>
                <td class="px-5 py-3.5 font-medium text-slate-800">${pm.vendor_name}</td>
                <td class="px-5 py-3.5 text-xs text-slate-600">${pm.customer_ref || pm.sales_ref || '-'}</td>
                <td class="px-5 py-3.5 text-xs text-slate-600">${pm.sales_name || pm.created_by || '-'}</td>
                <td class="px-5 py-3.5"><span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border">${pm.method}</span></td>
                <td class="px-5 py-3.5 font-mono font-bold text-emerald-600">฿${(pm.amount || 0).toLocaleString()}</td>
                <td class="px-5 py-3.5 font-mono text-slate-700">฿${(pm.net_amount || 0).toLocaleString()}</td>
                <td class="px-5 py-3.5 font-mono ${unpaidClass}">${unpaidDisplay}</td>
                <td class="px-5 py-3.5">${statusBadge}</td>
                <td class="px-5 py-3.5 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button onclick="app.openPayPOModal(${pm.id})" class="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 transition-colors" title="แก้ไข">
                            <i class="ph ph-pencil-simple text-lg"></i>
                        </button>
                        <button onclick="app.deletePayPO(${pm.id})" class="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors" title="ลบ">
                            <i class="ph ph-trash text-lg"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">แจ้งการชำระเงิน</h2>
            </div>
            <button onclick="app.openPayPOModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-plus text-lg"></i> แจ้งชำระเงินใหม่
            </button>
        </div>

        <!-- Section 1: PO ค้างชำระ -->
        <div class="mb-8">
            <div class="flex items-center gap-2 mb-4">
                <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs border border-amber-300">!</span>
                <h3 class="text-base font-bold text-slate-800">PO ค้างชำระ</h3>
            </div>
            ${pendingCardsHTML ? `
                <div class="flex flex-wrap gap-4">
                    ${pendingCardsHTML}
                </div>
            ` : `
                <div class="bg-white p-6 rounded-2xl border text-center text-slate-400 text-sm">
                    ไม่มีรายการ PO ค้างชำระในขณะนี้
                </div>
            `}
        </div>

        <!-- Section 2: ประวัติจ่ายเงิน -->
        <div>
            <div class="flex items-center gap-2 mb-4">
                <i class="ph ph-list-checks text-blue-600 text-xl font-bold"></i>
                <h3 class="text-base font-bold text-slate-800">ประวัติจ่ายเงิน</h3>
            </div>
            <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                        <tr>
                            <th class="px-5 py-3.5">วันที่</th>
                            <th class="px-5 py-3.5">PO</th>
                            <th class="px-5 py-3.5">ผู้จำหน่าย</th>
                            <th class="px-5 py-3.5">อ้างอิงลูกค้า</th>
                            <th class="px-5 py-3.5">เซลส์/ผู้แจ้ง</th>
                            <th class="px-5 py-3.5">ประเภท</th>
                            <th class="px-5 py-3.5">ยอดชำระเงิน</th>
                            <th class="px-5 py-3.5">ยอดสุทธิ PO</th>
                            <th class="px-5 py-3.5">ค้างชำระ/ชำระเกิน</th>
                            <th class="px-5 py-3.5">สถานะ</th>
                            <th class="px-5 py-3.5 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">${rows || '<tr><td colspan="11" class="text-center py-8 text-slate-400">ยังไม่มีประวัติการชำระเงิน</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
};

app.openPayPOModal = function(editPaymentId = null) {
    const allPOs = this.mockData.purchaseOrders || [];
    const salesReceipts = this.mockData.salesReceipts || [];
    const today = new Date().toISOString().split('T')[0];

    const editPm = editPaymentId ? (this.mockData.purchasePayments || []).find(p => p.id === editPaymentId) : null;

    // Filter POs with unpaid amount > 0 (or currently selected PO if editing)
    const payablePOs = allPOs.filter(p => p.unpaid_amount > 0 || (editPm && editPm.po_id === p.id));

    // POs with credit balance
    const creditPOs = allPOs.filter(p => p.unpaid_amount < 0);

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-money text-emerald-600 text-xl"></i> แจ้งชำระเงิน
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
                    <form id="pay-po-form" onsubmit="event.preventDefault(); app.savePayPO(${editPaymentId || 'null'})" class="space-y-4">
                        <!-- 1. Select PO to Pay (Blue Box) -->
                        <div class="bg-blue-50/60 border border-blue-200 p-4 rounded-2xl space-y-3">
                            <label class="block text-sm font-bold text-blue-900">เลือก PO ที่ต้องการจ่าย *</label>
                            <select id="pay_po_id" onchange="app.onPaymentPOSelect(this)" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" required>
                                <option value="">-- เลือกใบสั่งซื้อ (เฉพาะค้างชำระ) --</option>
                                ${payablePOs.map(p => {
                                    const statusText = p.unpaid_amount > 0 ? `(ค้าง: ฿${p.unpaid_amount.toLocaleString()})` : (p.unpaid_amount < 0 ? `(ชำระเกิน: ฿${Math.abs(p.unpaid_amount).toLocaleString()})` : '(จ่ายครบแล้ว)');
                                    return `<option value="${p.id}" data-unpaid="${p.unpaid_amount}" data-total="${p.total_amount}" ${editPm && editPm.po_id === p.id ? 'selected' : ''}>${p.po_no} - ${p.vendor_name} ${statusText}</option>`;
                                }).join('')}
                            </select>

                            <!-- Selected PO Preview Box -->
                            <div id="pay_po_preview_box" class="hidden bg-white p-3.5 rounded-xl border border-blue-100 text-xs text-slate-700 space-y-2 shadow-sm">
                            </div>
                        </div>

                        <!-- 2. Use Credit from Other PO (Purple Box) -->
                        <div class="bg-purple-50/60 border border-purple-200 p-4 rounded-2xl space-y-2">
                            <label class="block text-sm font-bold text-purple-900">ใช้เครดิตเงินทอน/จ่ายเกิน จาก PO อื่น</label>
                            <select id="pay_credit_po_id" onchange="app.onPaymentCreditSelect(this)" class="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                                <option value="">-- ไม่ใช้เครดิต --</option>
                                ${creditPOs.map(p => `<option value="${p.id}" data-credit="${Math.abs(p.unpaid_amount)}">${p.po_no} (เครดิต ฿${Math.abs(p.unpaid_amount).toLocaleString()})</option>`).join('')}
                            </select>
                        </div>

                        <!-- 3. Reference Sales Receipt -->
                        <div class="space-y-1">
                            <label class="block text-sm font-bold text-slate-700">อ้างอิงรายรับฝ่ายขาย (Sales Receipt)</label>
                            <select id="pay_sales_ref" onchange="app.onPaymentSalesRefSelect(this)" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="">-- ไม่ระบุอ้างอิง --</option>
                                ${salesReceipts.map(sr => `<option value="${sr.ref_no}" data-customer="${sr.customer}" data-sales="${sr.sales_name}" data-amount="${sr.amount}" ${editPm && editPm.sales_ref === sr.ref_no ? 'selected' : ''}>${sr.ref_no} - ${sr.customer} (${sr.sales_name || 'ฝ่ายขาย'}) [฿${(sr.amount||0).toLocaleString()}]</option>`).join('')}
                            </select>
                        </div>

                        <!-- 4. Date & Method -->
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">วันที่ชำระ *</label>
                                <input type="date" id="pay_date" value="${editPm ? editPm.date : today}" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm" required>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">ประเภท *</label>
                                <select id="pay_method" class="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" required>
                                    <option value="โอนเงิน" ${editPm && editPm.method === 'โอนเงิน' ? 'selected' : ''}>โอนเงิน</option>
                                    <option value="เงินสด" ${editPm && editPm.method === 'เงินสด' ? 'selected' : ''}>เงินสด</option>
                                    <option value="เช็ค" ${editPm && editPm.method === 'เช็ค' ? 'selected' : ''}>เช็ค</option>
                                    <option value="ตัดเครดิต" ${editPm && editPm.method === 'ตัดเครดิต' ? 'selected' : ''}>ตัดเครดิต</option>
                                </select>
                            </div>
                        </div>

                        <!-- 5. Payment Amount -->
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">ยอดชำระเงิน (฿) *</label>
                            <input type="number" id="pay_amount" value="${editPm ? editPm.amount : ''}" placeholder="0.00" class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" required>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-5 py-2.5 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="pay-po-form" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm">บันทึก</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);

    if (editPm) {
        const selElem = document.getElementById('pay_po_id');
        if (selElem) this.onPaymentPOSelect(selElem);
    }
};

app.onPaymentPOSelect = function(selectElem) {
    const poId = parseInt(selectElem.value);
    const previewBox = document.getElementById('pay_po_preview_box');
    const payAmountInput = document.getElementById('pay_amount');

    if (!poId) {
        if (previewBox) {
            previewBox.innerHTML = '';
            previewBox.classList.add('hidden');
        }
        return;
    }

    const po = this.mockData.purchaseOrders.find(p => p.id === poId);
    if (!po) return;

    const unpaid = po.unpaid_amount;
    const unpaidClass = unpaid > 0 ? 'text-red-600 font-bold' : (unpaid < 0 ? 'text-purple-600 font-bold' : 'text-slate-500');
    const unpaidLabel = unpaid > 0 ? 'ค้าง:' : 'ยอดค้าง/ชำระเกิน:';
    const unpaidDisplay = unpaid < 0 ? `฿-${Math.abs(unpaid).toLocaleString()}` : `฿${unpaid.toLocaleString()}`;

    const itemsStr = (po.items || []).map(i => `• ${i.name} (x${i.ordered_qty})`).join('<br>');

    previewBox.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <span class="font-bold text-slate-800">ผู้จำหน่าย:</span> ${po.vendor_name}
            </div>
            <div class="text-right">
                <div><span class="text-slate-500">รวม:</span> <b class="font-mono text-slate-800">฿${(po.total_amount || 0).toLocaleString()}</b></div>
                <div><span class="text-slate-500">${unpaidLabel}</span> <b class="font-mono ${unpaidClass}">${unpaidDisplay}</b></div>
            </div>
        </div>
        <div class="pt-2 border-t border-slate-100 text-slate-600 space-y-0.5">
            ${itemsStr}
        </div>
    `;
    previewBox.classList.remove('hidden');

    if (payAmountInput && (!payAmountInput.value || payAmountInput.value === '0')) {
        payAmountInput.value = Math.max(0, unpaid);
    }
};

app.onPaymentCreditSelect = function(selectElem) {
    const salesRefSelect = document.getElementById('pay_sales_ref');
    const payAmountInput = document.getElementById('pay_amount');
    const opt = selectElem.options[selectElem.selectedIndex];

    if (selectElem.value !== '') {
        if (salesRefSelect) {
            salesRefSelect.value = '';
            salesRefSelect.disabled = true;
        }
        const creditAmt = parseFloat(opt.getAttribute('data-credit')) || 0;
        if (payAmountInput && creditAmt > 0) {
            payAmountInput.value = creditAmt;
        }
    } else {
        if (salesRefSelect) {
            salesRefSelect.disabled = false;
        }
    }
};

app.onPaymentSalesRefSelect = function(selectElem) {
    const creditSelect = document.getElementById('pay_credit_po_id');
    const payAmountInput = document.getElementById('pay_amount');
    const opt = selectElem.options[selectElem.selectedIndex];

    if (selectElem.value !== '') {
        if (creditSelect) {
            creditSelect.value = '';
            creditSelect.disabled = true;
        }
        const refAmt = parseFloat(opt.getAttribute('data-amount')) || 0;
        if (payAmountInput && refAmt > 0) {
            payAmountInput.value = refAmt;
        }
    } else {
        if (creditSelect) {
            creditSelect.disabled = false;
        }
    }
};

app.savePayPO = function(editPaymentId = null) {
    const poId = parseInt(document.getElementById('pay_po_id').value);
    const amount = parseFloat(document.getElementById('pay_amount').value) || 0;
    const date = document.getElementById('pay_date').value;
    const method = document.getElementById('pay_method').value;
    const creditPoId = parseInt(document.getElementById('pay_credit_po_id')?.value) || null;
    const salesRef = document.getElementById('pay_sales_ref')?.value || '';

    const po = this.mockData.purchaseOrders.find(p => p.id === poId);
    if (!po) {
        this.showToast('กรุณาเลือกใบสั่งซื้อ (PO)', 'error');
        return;
    }

    if (editPaymentId) {
        const editPm = (this.mockData.purchasePayments || []).find(p => p.id === editPaymentId);
        if (editPm) {
            // 1. Revert previous payment on old PO
            const prevPo = this.mockData.purchaseOrders.find(p => p.id === editPm.po_id);
            if (prevPo) {
                prevPo.unpaid_amount += editPm.amount;
                if (prevPo.unpaid_amount >= prevPo.total_amount) {
                    prevPo.payment_status = 'Pending';
                } else if (prevPo.unpaid_amount > 0) {
                    prevPo.payment_status = 'Partial Paid';
                } else if (prevPo.unpaid_amount < 0) {
                    prevPo.payment_status = 'Overpaid';
                } else {
                    prevPo.payment_status = 'Paid';
                }
            }

            // Revert previous credit PO if used
            if (editPm.credit_po_id) {
                const prevCreditPo = this.mockData.purchaseOrders.find(p => p.id === editPm.credit_po_id);
                if (prevCreditPo) {
                    prevCreditPo.unpaid_amount -= editPm.amount;
                    if (prevCreditPo.unpaid_amount < 0) {
                        prevCreditPo.payment_status = 'Overpaid';
                    }
                }
            }

            // 2. Apply new credit PO if used
            if (creditPoId) {
                const creditPO = this.mockData.purchaseOrders.find(p => p.id === creditPoId);
                if (creditPO) {
                    creditPO.unpaid_amount += amount;
                    if (creditPO.unpaid_amount >= 0) {
                        creditPO.payment_status = 'Paid';
                    }
                }
            }

            // 3. Apply new amount to selected PO
            po.unpaid_amount -= amount;
            if (po.unpaid_amount <= 0) {
                po.payment_status = po.unpaid_amount < 0 ? 'Overpaid' : 'Paid';
            } else if (po.unpaid_amount >= po.total_amount) {
                po.payment_status = 'Pending';
            } else {
                po.payment_status = 'Partial Paid';
            }

            // 4. Update payment object
            editPm.po_id = po.id;
            editPm.po_no = po.po_no;
            editPm.vendor_name = po.vendor_name;
            editPm.amount = amount;
            editPm.net_amount = po.total_amount;
            editPm.unpaid_amount = po.unpaid_amount;
            editPm.date = date;
            editPm.method = method;
            editPm.status = po.unpaid_amount <= 0 ? (po.unpaid_amount < 0 ? 'จ่ายเกิน(เครดิต)' : 'Completed') : 'ค้างชำระ';
            editPm.sales_ref = salesRef || '-';
            editPm.credit_po_id = creditPoId;

            let customerRef = '-';
            let salesName = '-';
            if (salesRef) {
                const sr = (this.mockData.salesReceipts || []).find(r => r.ref_no === salesRef);
                if (sr) {
                    customerRef = sr.customer || '-';
                    salesName = sr.sales_name || '-';
                }
            } else if (creditPoId) {
                customerRef = 'ตัดเครดิต PO';
            }
            editPm.customer_ref = customerRef;
            editPm.sales_name = salesName;
        }
    } else {
        // Create new payment
        if (creditPoId) {
            const creditPO = this.mockData.purchaseOrders.find(p => p.id === creditPoId);
            if (creditPO) {
                creditPO.unpaid_amount += amount;
                if (creditPO.unpaid_amount >= 0) {
                    creditPO.payment_status = 'Paid';
                }
            }
        }

        po.unpaid_amount -= amount;
        if (po.unpaid_amount <= 0) {
            po.payment_status = po.unpaid_amount < 0 ? 'Overpaid' : 'Paid';
        } else {
            po.payment_status = 'Partial Paid';
        }

        let customerRef = '-';
        let salesName = '-';
        if (salesRef) {
            const sr = (this.mockData.salesReceipts || []).find(r => r.ref_no === salesRef);
            if (sr) {
                customerRef = sr.customer || '-';
                salesName = sr.sales_name || '-';
            }
        } else if (creditPoId) {
            customerRef = 'ตัดเครดิต PO';
        }

        this.mockData.purchasePayments.unshift({
            id: Date.now(),
            po_id: po.id,
            po_no: po.po_no,
            vendor_name: po.vendor_name,
            date: date,
            amount: amount,
            net_amount: po.total_amount,
            unpaid_amount: po.unpaid_amount,
            method: method,
            status: po.unpaid_amount <= 0 ? (po.unpaid_amount < 0 ? 'จ่ายเกิน(เครดิต)' : 'Completed') : 'ค้างชำระ',
            sales_ref: salesRef || '-',
            customer_ref: customerRef,
            sales_name: salesName,
            credit_po_id: creditPoId,
            created_by: `${this.currentUser.fullname}`
        });
    }

    this.showToast('บันทึกแจ้งชำระเงินเรียบร้อยแล้ว', 'success');
    this.closeModal();
    this.renderPurchasePayments(document.getElementById('main-content'));
};

app.deletePayPO = function(paymentId) {
    if (!confirm('คุณต้องการลบรายการแจ้งชำระเงินนี้ใช่หรือไม่?')) return;

    const payments = this.mockData.purchasePayments || [];
    const pmIndex = payments.findIndex(p => p.id === paymentId);
    if (pmIndex === -1) return;

    const pm = payments[pmIndex];

    // Revert primary PO balance & status
    const po = (this.mockData.purchaseOrders || []).find(p => p.id === pm.po_id);
    if (po) {
        po.unpaid_amount += pm.amount;
        if (po.unpaid_amount >= po.total_amount) {
            po.payment_status = 'Pending';
        } else if (po.unpaid_amount > 0) {
            po.payment_status = 'Partial Paid';
        } else if (po.unpaid_amount < 0) {
            po.payment_status = 'Overpaid';
        } else {
            po.payment_status = 'Paid';
        }
    }

    // Revert credit PO balance if credit was used
    if (pm.credit_po_id) {
        const creditPO = (this.mockData.purchaseOrders || []).find(p => p.id === pm.credit_po_id);
        if (creditPO) {
            creditPO.unpaid_amount -= pm.amount;
            if (creditPO.unpaid_amount < 0) {
                creditPO.payment_status = 'Overpaid';
            }
        }
    }

    // Remove payment record
    payments.splice(pmIndex, 1);

    this.showToast('ลบรายการแจ้งชำระเงินเรียบร้อยแล้ว', 'success');
    this.renderPurchasePayments(document.getElementById('main-content'));
};
