/**
 * OMS (Operation Management System) - Inventory & Requisition Module
 * File: js/inventory.js
 */

// ==========================================
// INVENTORY (สินค้าคงคลัง & การจัดสต็อก)
// ==========================================

app.renderInventory = function(container) {
    const isAdmin = this.currentUser.role === 'admin';
    let whOpts = this.mockData.warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
    let sumHtml = '';
    
    this.mockData.warehouses.forEach(wh => {
        const prods = this.mockData.products.filter(p => p.warehouse === wh.id && p.stock_qty > 0);
        if (prods.length > 0) {
            let iHtml = prods.map(p => {
                const cQty = p.carton_qty || 1;
                const cartons = Math.floor(p.stock_qty / cQty);
                const remainder = p.stock_qty % cQty;
                return `
                <div class="flex justify-between items-center border-b border-dashed py-1.5 text-sm">
                    <span class="truncate pr-2 font-medium text-slate-700">${p.name}</span>
                    <span class="font-bold whitespace-nowrap text-slate-800">
                        ${p.stock_qty} ${p.unit} 
                        <span class="text-xs text-slate-400 font-normal">(${cartons} ลัง ${remainder} ${p.unit})</span>
                    </span>
                </div>
            `;
            }).join('');
            sumHtml += `
                <div class="bg-white p-4 rounded-xl border shadow-sm">
                    <h4 class="font-bold mb-2 pb-2 border-b flex items-center justify-between">
                        <span class="flex items-center gap-2"><i class="ph ph-warehouse text-amber-500 text-lg"></i> ${wh.name}</span>
                        <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">${wh.id}</span>
                    </h4>
                    <div class="max-h-36 overflow-y-auto pr-1">${iHtml}</div>
                </div>
            `;
        }
    });

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">สินค้าและสต็อก (Inventory)</h2>
                <p class="text-slate-500 text-sm">บริหารจัดการสต็อกสินค้าคงเหลือ รายงานสรุปแยกคลัง</p>
            </div>
            ${isAdmin ? `
            <button onclick="app.openAddProductModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-plus text-lg"></i> +เพิ่มสินค้า (Admin)
            </button>` : ''}
        </div>

        <h3 class="font-bold mb-3 flex items-center text-slate-800">
            <i class="ph ph-chart-pie-slice mr-2 text-blue-500 text-xl"></i> สรุปคงเหลือแยกคลังสินค้า
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">${sumHtml || '<div class="col-span-full bg-white p-6 rounded-xl border text-center text-slate-400">ยังไม่มีสินค้าในคลัง</div>'}</div>

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h3 class="font-bold flex items-center text-slate-800">
                <i class="ph ph-list-dashes mr-2 text-blue-500 text-xl"></i> รายละเอียดสินค้าคงคลังทั้งหมด
            </h3>
            <div class="bg-white border rounded-xl px-3 py-1.5 shadow-sm flex items-center">
                <i class="ph ph-funnel text-slate-400 mr-2"></i>
                <span class="text-xs font-bold text-slate-500 mr-2">กรองตามคลัง:</span>
                <select id="inv-wh-filter" onchange="app.filterInventory()" class="bg-transparent text-sm font-bold text-slate-700 outline-none">
                    <option value="ALL">ทุกคลังสินค้า</option>
                    ${whOpts}
                </select>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-4 py-3.5">SKU</th>
                        <th class="px-4 py-3.5">ชื่อสินค้า</th>
                        <th class="px-4 py-3.5 text-center">สต็อกคงเหลือ</th>
                        <th class="px-4 py-3.5 text-center">ค้างรับเข้า</th>
                        <th class="px-4 py-3.5">ตำแหน่ง / คลังสินค้า</th>
                        <th class="px-4 py-3.5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody id="inv-table-body" class="divide-y"></tbody>
            </table>
        </div>
    `;
    this.filterInventory();
};

app.filterInventory = function() {
    const wh = document.getElementById('inv-wh-filter')?.value || 'ALL';
    const canMan = ['admin','warehouse'].includes(this.currentUser.role);
    let pList = wh === 'ALL' ? this.mockData.products : this.mockData.products.filter(p => p.warehouse === wh);
    
    let rows = pList.map(p => {
        const wName = this.mockData.warehouses.find(w => w.id === p.warehouse)?.name || p.warehouse;
        const cQty = p.carton_qty || 1;
        const cartons = Math.floor(p.stock_qty / cQty);
        const remainder = p.stock_qty % cQty;
        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3.5 font-mono font-bold text-blue-600">${p.sku}</td>
                <td class="px-4 py-3.5 font-medium text-slate-800">${p.name}</td>
                <td class="px-4 py-3.5 text-center">
                    <span class="px-2.5 py-1 rounded-full font-bold text-xs border ${p.stock_qty > 20 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : (p.stock_qty > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200')}">
                        ${p.stock_qty} ${p.unit} <span class="text-[11px] font-normal">(${cartons} ลัง ${remainder} ${p.unit})</span>
                    </span>
                </td>
                <td class="px-4 py-3.5 text-center text-amber-600 font-bold font-mono">${p.pending_in || 0} ${p.unit}</td>
                <td class="px-4 py-3.5 text-slate-600 text-xs">${wName}</td>
                <td class="px-4 py-3.5 text-center">
                    ${canMan ? `<button onclick="app.openEditProductModal(${p.id})" class="text-slate-400 hover:text-blue-500 p-1.5 rounded-lg hover:bg-slate-100" title="แก้ไขสินค้าสต็อก"><i class="ph ph-pencil-simple text-lg"></i></button>` : '-'}
                </td>
            </tr>
        `;
    }).join('');
    
    const tbody = document.getElementById('inv-table-body');
    if (tbody) tbody.innerHTML = rows || '<tr><td colspan="6" class="text-center py-8 text-slate-400">ไม่พบสินค้าในคลังนี้</td></tr>';
};

app.openAddProductModal = function() {
    let vOpts = '<option value="">-- เลือกสินค้าจากคู่ค้า --</option>';
    this.mockData.vendors.forEach(v => v.products.forEach(p => { 
        vOpts += `<option value="${p.sku}" data-name="${p.name}" data-unit="${p.unit}" data-carton="${p.carton_qty}">${p.sku} - ${p.name} (${v.name})</option>`; 
    }));
    let wOpts = this.mockData.warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-package text-blue-600 text-xl"></i> เพิ่มสินค้าเข้าระบบสต็อก (Admin)
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6">
                    <form id="add-prod-form" onsubmit="event.preventDefault(); app.saveProduct()" class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-1">เลือก SKU จากซัพพลายเออร์ *</label>
                            <select id="ap_sku" onchange="app.onAddProdSkuChange()" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" required>
                                ${vOpts}
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">ชื่อสินค้า</label>
                                <input type="text" id="ap_name" class="w-full border rounded-xl px-3 py-2 text-sm bg-slate-100 text-slate-600" readonly>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">หน่วยนับ / จำนวนต่อลัง</label>
                                <div class="flex gap-2">
                                    <input type="text" id="ap_unit" class="w-1/2 border rounded-xl px-3 py-2 text-sm bg-slate-100 text-slate-600" readonly>
                                    <input type="number" id="ap_carton" class="w-1/2 border rounded-xl px-3 py-2 text-sm bg-slate-100 text-slate-600" readonly title="บรรจุ/ลัง">
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">ประจำคลังสินค้า *</label>
                                <select id="ap_wh" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" required>
                                    ${wOpts}
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-1">จำนวนตั้งต้นเริ่มต้น *</label>
                                <input type="number" id="ap_qty" min="1" value="1" class="w-full border rounded-xl px-3 py-2 text-sm font-bold font-mono" required>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="add-prod-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">บันทึกเพิ่มสินค้า</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.onAddProdSkuChange = function() {
    const sel = document.getElementById('ap_sku');
    if (sel && sel.selectedIndex > 0) {
        const opt = sel.options[sel.selectedIndex];
        document.getElementById('ap_name').value = opt.getAttribute('data-name');
        document.getElementById('ap_unit').value = opt.getAttribute('data-unit');
        document.getElementById('ap_carton').value = opt.getAttribute('data-carton');
    }
};

app.saveProduct = function() {
    const sel = document.getElementById('ap_sku');
    if (sel.selectedIndex <= 0) return;
    const opt = sel.options[sel.selectedIndex];
    const sku = sel.value;
    const wh = document.getElementById('ap_wh').value;
    const addedQty = parseInt(document.getElementById('ap_qty').value) || 0;

    let existing = this.mockData.products.find(p => p.sku === sku && p.warehouse === wh);
    if (existing) {
        existing.stock_qty += addedQty;
        this.showToast(`อัปเดตสต็อกสินค้า ${sku} ในคลังเรียบร้อย (เพิ่ม +${addedQty} ${existing.unit})`, 'success');
    } else {
        this.mockData.products.push({
            id: Date.now(),
            sku: sku,
            name: opt.getAttribute('data-name'),
            cost_price: 0,
            wholesale_price: 0,
            stock_qty: addedQty,
            pending_in: 0,
            location: '-',
            warehouse: wh,
            unit: opt.getAttribute('data-unit'),
            carton_qty: parseInt(opt.getAttribute('data-carton')) || 1
        });
        this.showToast('เพิ่มสินค้าเข้าระบบสต็อกเรียบร้อย', 'success');
    }

    this.closeModal();
    this.renderInventory(document.getElementById('main-content'));
};

app.openEditProductModal = function(productId) {
    const p = this.mockData.products.find(x => x.id === productId);
    if (!p) return;

    let wOpts = this.mockData.warehouses.map(w => `<option value="${w.id}" ${w.id === p.warehouse ? 'selected' : ''}>${w.name}</option>`).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-xl flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-pencil-simple text-blue-600 text-xl"></i> แก้ไขรายละเอียดสินค้า & สต็อก
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6">
                    <form id="edit-prod-form" onsubmit="event.preventDefault(); app.saveEditProduct(${productId})" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">รหัส SKU</label>
                                <input type="text" id="ep_sku" value="${p.sku}" class="w-full border rounded-xl px-3 py-2 text-sm bg-slate-100 font-mono font-bold" readonly>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ประจำคลังสินค้า *</label>
                                <select id="ep_wh" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" required>
                                    ${wOpts}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อสินค้า *</label>
                            <input type="text" id="ep_name" value="${p.name}" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                        </div>
                        <div class="grid grid-cols-3 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">จำนวนสต็อกคงเหลือ *</label>
                                <input type="number" id="ep_qty" value="${p.stock_qty}" min="0" class="w-full border-2 border-blue-200 rounded-xl px-3 py-2 text-sm font-bold font-mono text-blue-600" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">หน่วยนับ</label>
                                <input type="text" id="ep_unit" value="${p.unit}" class="w-full border rounded-xl px-3 py-2 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">จำนวนต่อลัง</label>
                                <input type="number" id="ep_carton" value="${p.carton_qty || 1}" min="1" class="w-full border rounded-xl px-3 py-2 text-sm font-mono">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ราคาทุนต่อหน่วย (บาท)</label>
                                <input type="number" id="ep_cost" value="${p.cost_price || 0}" min="0" step="0.01" class="w-full border rounded-xl px-3 py-2 text-sm font-mono">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ราคาขายต่อหน่วย (บาท)</label>
                                <input type="number" id="ep_price" value="${p.wholesale_price || 0}" min="0" step="0.01" class="w-full border rounded-xl px-3 py-2 text-sm font-mono">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="edit-prod-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">บันทึกการแก้ไข</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveEditProduct = function(productId) {
    const p = this.mockData.products.find(x => x.id === productId);
    if (!p) return;

    p.name = document.getElementById('ep_name').value.trim();
    p.warehouse = document.getElementById('ep_wh').value;
    p.stock_qty = parseInt(document.getElementById('ep_qty').value) || 0;
    p.unit = document.getElementById('ep_unit').value.trim() || 'ชิ้น';
    p.carton_qty = parseInt(document.getElementById('ep_carton').value) || 1;
    p.cost_price = parseFloat(document.getElementById('ep_cost').value) || 0;
    p.wholesale_price = parseFloat(document.getElementById('ep_price').value) || 0;

    this.showToast('อัปเดตข้อมูลสินค้าเรียบร้อยแล้ว', 'success');
    this.closeModal();
    this.renderInventory(document.getElementById('main-content'));
};

// ==========================================
// REQUISITIONS (การเบิกสินค้าเพื่อสต็อก / เพื่อขาย)
// ==========================================

app.renderRequisitions = function(container) {
    const role = this.currentUser ? this.currentUser.role : '';
    const canApproveReq = (r) => {
        if (r.type === 'เบิกเพื่อขาย') {
            return ['admin', 'management'].includes(role);
        }
        return ['admin', 'management', 'warehouse'].includes(role);
    };
    
    const rRow = (r) => {
        const canApprove = canApproveReq(r);
        return `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3.5 font-mono font-bold text-blue-600">${r.req_no}</td>
            <td class="px-4 py-3.5 text-xs text-slate-500">${r.date}</td>
            <td class="px-4 py-3.5"><span class="px-2 py-0.5 ${r.type==='เบิกเพื่อขาย'?'bg-blue-50 text-blue-700 border-blue-200':'bg-purple-50 text-purple-700 border-purple-200'} rounded border text-xs font-bold">${r.type}</span></td>
            <td class="px-4 py-3.5">
                <div class="font-bold text-slate-800 text-sm">${r.to_wh}</div>
                <div class="text-[11px] text-slate-500">${r.req_method}</div>
            </td>
            <td class="px-4 py-3.5 text-xs text-slate-600">
                ${r.items.map(i => `<div class="truncate max-w-xs">• ${i.name}</div>`).join('')}
            </td>
            <td class="px-4 py-3.5 text-xs font-mono font-bold text-slate-800">
                ${r.items.map(i => `<div>${i.req_qty} ${i.unit}</div>`).join('')}
            </td>
            <td class="px-4 py-3.5 text-xs text-slate-600">${r.req_by}</td>
            <td class="px-4 py-3.5 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${r.status==='Pending'?'bg-amber-50 text-amber-700 border-amber-200':(r.status==='Approved'?'bg-blue-50 text-blue-700 border-blue-200':'bg-emerald-50 text-emerald-700 border-emerald-200')}">
                    ${r.status==='Pending'?'รออนุมัติ':(r.status==='Approved'?'รอจัดส่ง':'เสร็จสิ้น')}
                </span>
            </td>
            <td class="px-4 py-3.5 text-center">
                <div class="flex justify-center gap-1">
                    ${r.status==='Pending' ? `
                    <button onclick="app.openApproveReqModal(${r.id}, ${!canApprove})" class="text-slate-400 hover:text-blue-600 p-1.5 rounded" title="${canApprove ? 'พิจารณาอนุมัติ' : 'ดูรายละเอียด'}">
                        <i class="ph ${canApprove ? 'ph-pencil-simple' : 'ph-eye'} text-lg"></i>
                    </button>
                    <button onclick="app.deleteReq(${r.id})" class="text-slate-400 hover:text-red-600 p-1.5 rounded" title="ลบ">
                        <i class="ph ph-trash text-lg"></i>
                    </button>` : `
                    <button onclick="app.openApproveReqModal(${r.id}, true)" class="text-slate-400 hover:text-blue-600 p-1.5 rounded" title="ดูรายละเอียด">
                        <i class="ph ph-eye text-lg"></i>
                    </button>`}
                </div>
            </td>
        </tr>
    `;
    };

    const pend = this.mockData.requisitions.filter(r => r.status === 'Pending' || r.status === 'Approved');
    const comp = this.mockData.requisitions.filter(r => r.status === 'Completed' || r.status === 'Shipped');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">รายการเบิกสินค้า (Requisitions)</h2>
                <p class="text-slate-500 text-sm">เบิกสินค้าจากคลังหลักเพื่อสต็อกคลังย่อย หรือเบิกเพื่อการขาย</p>
            </div>
            <button onclick="app.openCreateReqModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-plus text-lg"></i> สร้างใบขอเบิกสินค้า
            </button>
        </div>

        <h3 class="font-bold mb-3 flex items-center text-slate-800">
            <i class="ph ph-clock text-amber-500 mr-2 text-xl"></i> รายการรออนุมัติ / รอจัดส่ง (${pend.length})
        </h3>
        <div class="bg-white border rounded-2xl shadow-sm mb-8 overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-4 py-3.5">เลขที่เบิก</th>
                        <th class="px-4 py-3.5">วันที่</th>
                        <th class="px-4 py-3.5">ประเภท</th>
                        <th class="px-4 py-3.5">ปลายทาง / วิธีรับ</th>
                        <th class="px-4 py-3.5">รายการสินค้า</th>
                        <th class="px-4 py-3.5">จำนวน</th>
                        <th class="px-4 py-3.5">ผู้ขอเบิก</th>
                        <th class="px-4 py-3.5 text-center">สถานะ</th>
                        <th class="px-4 py-3.5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${pend.map(rRow).join('') || '<tr><td colspan="9" class="text-center py-6 text-slate-400">ไม่มีรายการรอดำเนินการ</td></tr>'}</tbody>
            </table>
        </div>

        <h3 class="font-bold mb-3 flex items-center text-slate-800">
            <i class="ph ph-check-circle text-emerald-500 mr-2 text-xl"></i> ประวัติรายการเบิกเสร็จสิ้น
        </h3>
        <div class="bg-white border rounded-2xl shadow-sm overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-4 py-3.5">เลขที่เบิก</th>
                        <th class="px-4 py-3.5">วันที่</th>
                        <th class="px-4 py-3.5">ประเภท</th>
                        <th class="px-4 py-3.5">ปลายทาง / วิธีรับ</th>
                        <th class="px-4 py-3.5">รายการสินค้า</th>
                        <th class="px-4 py-3.5">จำนวน</th>
                        <th class="px-4 py-3.5">ผู้ขอเบิก</th>
                        <th class="px-4 py-3.5 text-center">สถานะ</th>
                        <th class="px-4 py-3.5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${comp.map(rRow).join('') || '<tr><td colspan="9" class="text-center py-6 text-slate-400">ไม่มีประวัติการเบิกเสร็จสิ้น</td></tr>'}</tbody>
            </table>
        </div>
    `;
};

app.deleteReq = function(id) {
    const req = (this.mockData.requisitions || []).find(x => x.id === id);
    const executeDelete = () => {
        if (req && req.type === 'เบิกเพื่อขาย') {
            const so = (this.mockData.salesOrders || []).find(s => s.id === req.so_id || s.so_no === req.so_no);
            if (so) {
                so.status = 'ไม่อนุมัติ';
            }
        }
        this.mockData.requisitions = (this.mockData.requisitions || []).filter(x => x.id !== id);
        this.showToast('ลบรายการขอเบิกเรียบร้อยแล้ว (อัปเดตสถานะ SO เป็นไม่อนุมัติ)', 'success');
        this.renderRequisitions(document.getElementById('main-content'));
    };

    this.openConfirmModal('ลบรายการขอเบิก?', 'ยืนยันยกเลิกและลบรายการเบิกนี้ใช่หรือไม่? (หากเป็นรายการเบิกเพื่อขาย สถานะ SO จะถูกเปลี่ยนเป็น ไม่อนุมัติ)', executeDelete);
};

app.openConfirmModal = function(title, msg, onConfirm) {
    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm flex flex-col animate-fade-in p-6 text-center space-y-4">
                <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto"><i class="ph ph-warning"></i></div>
                <h3 class="text-lg font-bold text-slate-800">${title}</h3>
                <p class="text-sm text-slate-600">${msg}</p>
                <div class="flex justify-center gap-3 pt-2">
                    <button onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-sm font-bold">ยกเลิก</button>
                    <button id="btn-modal-confirm" class="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-sm">ยืนยัน</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
    document.getElementById('btn-modal-confirm').onclick = () => {
        this.closeModal();
        if (typeof onConfirm === 'function') onConfirm();
    };
};

app.openCreateReqModal = function() {
    let dWh = '';
    if (this.currentUser.role === 'sales') dWh = `คลังเซลส์ - ${this.currentUser.fullname}`;

    const whOpts = this.mockData.warehouses.filter(w => w.type !== 'main').map(w => `<option value="${w.name}" data-addr="${this.formatAddr(w.address)}" ${w.name===dWh?'selected':''}>${w.name}</option>`).join('');
    const pOpts = this.mockData.products.filter(p => p.warehouse === 'W-MAIN').map(p => `<option value="${p.sku}" data-name="${p.name}" data-unit="${p.unit}" data-stock="${p.stock_qty}">${p.sku} - ${p.name} (คงเหลือ: ${p.stock_qty} ${p.unit})</option>`).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-hand-grabbing text-blue-600 text-xl"></i> สร้างใบขอเบิกสินค้าเพื่อสต็อก/เบิกใช้งาน
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <form id="req-form" onsubmit="event.preventDefault(); app.saveReq()" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-1">ประเภทการเบิก</label>
                                <input type="text" value="เบิกเพื่อสต็อก" class="w-full border rounded-xl px-3 py-2 text-sm bg-slate-100 font-bold text-slate-700" disabled>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-1">ผู้เบิกสินค้า</label>
                                <input type="text" id="rq_req_by" value="${this.currentUser.fullname}" class="w-full border rounded-xl px-3 py-2 text-sm font-bold" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-purple-700 mb-1">ปลายทาง (คลังย่อย/คลังรถเซลส์) *</label>
                                <select id="rq_to_wh" onchange="app.onReqWhChange()" class="w-full border-2 border-purple-200 rounded-xl px-3 py-2 text-sm bg-white" required>
                                    <option value="">-- เลือกปลายทาง --</option>
                                    ${whOpts}
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-amber-700 mb-1">วิธีการรับสินค้า</label>
                                <select id="rq_method" onchange="app.onReqMethodChange()" class="w-full border-2 border-amber-200 rounded-xl px-3 py-2 text-sm bg-white">
                                    <option value="มารับสินค้าเอง (ไม่ต้องส่ง)">มารับสินค้าเอง</option>
                                    <option value="จัดส่งตามที่อยู่">จัดส่งตามที่อยู่</option>
                                </select>
                            </div>
                        </div>

                        <div id="rq_address_box" class="hidden bg-amber-50 border border-amber-200 p-3 rounded-xl">
                            <label class="block text-xs font-bold text-amber-800 mb-1">ที่อยู่จัดส่งสินค้า</label>
                            <textarea id="rq_address" class="w-full border rounded-lg px-3 py-2 text-sm bg-white" rows="2"></textarea>
                        </div>

                        <h4 class="font-bold text-slate-800 border-b pb-1 mt-4">ระบุรายการสินค้าที่เบิก</h4>
                        <div class="flex gap-2">
                            <select id="rq_add_item_sel" class="flex-1 border rounded-xl px-3 py-2 text-sm bg-white">
                                <option value="">-- เลือกสินค้าคลังหลัก --</option>
                                ${pOpts}
                            </select>
                            <input type="number" id="rq_add_qty" min="1" value="1" class="w-24 border rounded-xl px-3 py-2 text-sm text-center font-bold font-mono">
                            <button type="button" onclick="app.addReqItemToTemp()" class="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl px-4 py-2 font-bold text-sm">
                                เพิ่ม
                            </button>
                        </div>

                        <div class="border rounded-xl bg-slate-50 p-3 min-h-[100px] max-h-[180px] overflow-y-auto" id="rq_temp_items"></div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="req-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">ส่งใบขอเบิก</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
    this.tempReqItems = [];
    this.renderTempReqItems();
    if (dWh) this.onReqWhChange();
};

app.onReqWhChange = function() {
    const s = document.getElementById('rq_to_wh');
    if (s && s.selectedIndex > 0) {
        document.getElementById('rq_address').value = s.options[s.selectedIndex].getAttribute('data-addr') || '';
    }
};

app.onReqMethodChange = function() {
    const b = document.getElementById('rq_address_box');
    if (document.getElementById('rq_method').value === 'จัดส่งตามที่อยู่') {
        b.classList.remove('hidden');
        this.onReqWhChange();
    } else {
        b.classList.add('hidden');
    }
};

app.addReqItemToTemp = function() {
    const s = document.getElementById('rq_add_item_sel');
    const q = parseInt(document.getElementById('rq_add_qty').value) || 0;
    if (s.selectedIndex <= 0 || q <= 0) return;

    const o = s.options[s.selectedIndex];
    const sku = s.value;
    const n = o.getAttribute('data-name');
    const u = o.getAttribute('data-unit');
    const stk = parseInt(o.getAttribute('data-stock'));

    if (q > stk) {
        this.showToast(`สต็อกไม่พอ! สต็อกคงเหลือในคลังหลักมีเพียง ${stk} ${u}`, 'error');
        return;
    }

    this.tempReqItems.push({ sku, name: n, unit: u, req_qty: q });
    this.renderTempReqItems();
};

app.removeTempReqItem = function(idx) {
    this.tempReqItems.splice(idx, 1);
    this.renderTempReqItems();
};

app.renderTempReqItems = function() {
    const container = document.getElementById('rq_temp_items');
    if (!container) return;
    container.innerHTML = this.tempReqItems.length ? this.tempReqItems.map((i, idx) => `
        <div class="flex justify-between items-center bg-white border p-2.5 mb-2 rounded-xl text-sm shadow-sm">
            <span class="font-medium text-slate-800">${i.sku} - ${i.name}</span>
            <div class="flex items-center gap-3">
                <span class="font-bold text-blue-600 font-mono">เบิก: ${i.req_qty} ${i.unit}</span>
                <button type="button" onclick="app.removeTempReqItem(${idx})" class="text-red-500 hover:text-red-700 p-1"><i class="ph ph-trash text-lg"></i></button>
            </div>
        </div>
    `).join('') : '<div class="text-center text-slate-400 text-sm py-6">ยังไม่มีรายการสินค้าเบิก</div>';
};

app.saveReq = function() {
    if (!this.tempReqItems.length) {
        this.showToast('กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ', 'error');
        return;
    }
    const m = document.getElementById('rq_method').value;
    this.mockData.requisitions.unshift({
        id: Date.now(),
        req_no: `REQ-2607-0${this.mockData.requisitions.length + 1}`,
        type: 'เบิกเพื่อสต็อก',
        status: 'Pending',
        req_by: document.getElementById('rq_req_by').value,
        to_wh: document.getElementById('rq_to_wh').value,
        req_method: m,
        delivery_address: m === 'จัดส่งตามที่อยู่' ? document.getElementById('rq_address').value : '-',
        date: new Date().toISOString().split('T')[0],
        items: [...this.tempReqItems]
    });
    this.showToast('ส่งใบขอเบิกสินค้าเรียบร้อยแล้ว', 'success');
    this.closeModal();
    this.renderRequisitions(document.getElementById('main-content'));
};

app.openApproveReqModal = function(reqId, viewOnly = false) {
    const r = this.mockData.requisitions.find(x => x.id === reqId);
    if (!r) return;

    const role = this.currentUser ? this.currentUser.role : '';
    if (r.type === 'เบิกเพื่อขาย' && !['admin', 'management'].includes(role)) {
        viewOnly = true;
    }

    let whOpts = this.mockData.warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');

    let itemsHtml = r.items.map((i, idx) => {
        let itemWhOpts = this.mockData.warehouses.map(w => `<option value="${w.id}" ${(i.from_wh || 'W-MAIN') === w.id ? 'selected' : ''}>${w.name}</option>`).join('');
        return `
        <tr class="hover:bg-slate-50">
            <td class="p-3 border-b text-sm font-medium text-slate-800">${i.sku} - ${i.name}</td>
            <td class="p-3 border-b text-center w-20">
                <label class="inline-flex items-center cursor-pointer">
                    <input type="checkbox" id="req_item_free_${idx}" ${i.is_free ? 'checked' : ''} ${viewOnly?'disabled':''} class="w-4 h-4 text-emerald-600 rounded">
                </label>
            </td>
            <td class="p-3 border-b w-32">
                <div class="flex items-center gap-1.5">
                    <input type="number" id="req_item_qty_${idx}" value="${i.req_qty}" min="0" class="w-full border-2 rounded-lg p-1.5 text-center font-bold font-mono text-blue-600 focus:ring-2 focus:ring-blue-500" ${viewOnly?'disabled':''} required>
                    <span class="text-xs text-slate-500">${i.unit}</span>
                </div>
            </td>
            <td class="p-3 border-b w-48">
                <select id="req_item_wh_${idx}" class="w-full border rounded-lg p-1.5 text-xs bg-white font-medium" ${viewOnly?'disabled':''}>
                    ${itemWhOpts}
                </select>
            </td>
        </tr>
    `;
    }).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ${viewOnly?'ph-eye':'ph-check-circle text-emerald-600'} text-xl"></i> 
                        ${viewOnly ? 'รายละเอียดการเบิก' : 'พิจารณาอนุมัติใบขอเบิก'}: ${r.req_no}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <form id="approve-req-form" onsubmit="event.preventDefault(); app.saveApproveReq(${reqId})" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-1">ผู้เบิกสินค้า</label>
                                <input type="text" id="ar_req_by" value="${r.req_by}" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" ${viewOnly?'disabled':''} required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-500 mb-1">ปลายทาง</label>
                                <input type="text" id="ar_to_wh" value="${r.to_wh}" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" ${viewOnly?'disabled':''} required>
                            </div>
                        </div>
                        <div class="bg-amber-50 border border-amber-200 p-3 rounded-xl text-sm">
                            <span class="font-bold text-amber-800">วิธีการรับ:</span> ${r.req_method} 
                            ${r.req_method==='จัดส่งตามที่อยู่'?`<br><span class="font-bold text-amber-800">ที่อยู่จัดส่ง:</span> ${r.delivery_address}`:''}
                        </div>

                        <h4 class="font-bold text-slate-800">รายการสินค้าอนุมัติ & กำหนดคลังตัดสต็อก</h4>
                        <div class="border rounded-xl overflow-hidden">
                            <table class="w-full text-left">
                                <thead class="bg-slate-100 text-slate-600 font-bold text-xs uppercase">
                                    <tr>
                                        <th class="p-3">สินค้า</th>
                                        <th class="p-3 text-center">แถม</th>
                                        <th class="p-3 text-center">จำนวนอนุมัติ</th>
                                        <th class="p-3">ตัดสต็อกจากคลัง</th>
                                    </tr>
                                </thead>
                                <tbody>${itemsHtml}</tbody>
                            </table>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">${viewOnly?'ปิด':'ยกเลิก'}</button>
                    ${viewOnly ? '' : `<button type="submit" form="approve-req-form" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm">อนุมัติการเบิก & ตัดสต็อก</button>`}
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveApproveReq = function(reqId) {
    const r = this.mockData.requisitions.find(x => x.id === reqId);
    if (!r) return;

    const role = this.currentUser ? this.currentUser.role : '';
    if (r.type === 'เบิกเพื่อขาย' && !['admin', 'management'].includes(role)) {
        this.showToast('เฉพาะผู้บริหาร (Management) และ Admin เท่านั้นที่มีสิทธิ์อนุมัติรายการเบิกเพื่อขาย', 'error');
        return;
    }

    let err = false;

    // Check stock for each item in its chosen warehouse
    r.items.forEach((i, idx) => {
        let v = parseInt(document.getElementById(`req_item_qty_${idx}`).value) || 0;
        let isFree = document.getElementById(`req_item_free_${idx}`).checked;
        let chosenWh = document.getElementById(`req_item_wh_${idx}`).value;

        let p = this.mockData.products.find(x => x.sku === i.sku && x.warehouse === chosenWh);
        if (!p || p.stock_qty < v) {
            const whObj = this.mockData.warehouses.find(w => w.id === chosenWh);
            const whName = whObj ? whObj.name : chosenWh;
            this.showToast(`สต็อกสินค้า ${i.sku} ใน ${whName} ไม่เพียงพอ! (คงเหลือ ${p ? p.stock_qty : 0})`, 'error');
            err = true;
        }
    });

    if (err) return;

    r.req_by = document.getElementById('ar_req_by').value;
    r.to_wh = document.getElementById('ar_to_wh').value;

    // Assign chosen warehouses to requisition items
    r.items.forEach((i, idx) => {
        let v = parseInt(document.getElementById(`req_item_qty_${idx}`).value) || 0;
        let isFree = document.getElementById(`req_item_free_${idx}`).checked;
        let chosenWh = document.getElementById(`req_item_wh_${idx}`).value;

        i.req_qty = v;
        i.is_free = isFree;
        i.from_wh = chosenWh;
    });

    r.status = 'Approved';

    // Sync with Sales Order if this requisition is for sale
    if (r.so_id || r.so_no) {
        const so = (this.mockData.salesOrders || []).find(s => s.id === r.so_id || s.so_no === r.so_no);
        if (so) {
            so.status = 'Approved';
        }
    }

    this.showToast('อนุมัติใบขอเบิกและส่งไปยังคิวจัดส่งสินค้าเรียบร้อยแล้ว', 'success');

    this.closeModal();
    this.renderRequisitions(document.getElementById('main-content'));
};

app.getWarehouseName = function(whId) {
    if (!whId) return 'คลังสินค้าหลัก (Main Warehouse)';
    const w = (this.mockData.warehouses || []).find(x => x.id === whId || x.name === whId);
    return w ? w.name : whId;
};

// ==========================================
// SHIPMENTS (สถานะจัดส่งสินค้า / ออกใบขนส่ง)
// ==========================================

app.renderShipments = function(container) {
    const isS = this.currentUser.role === 'sales';
    const role = this.currentUser.role;
    const username = this.currentUser.username;

    // Determine current user's warehouse filter
    let myWh = 'ALL';
    if (role === 'warehouse') {
        if (username === 'wh_sub1' || this.currentUser.warehouse_id === 'W-SUB1') {
            myWh = 'W-SUB1';
        } else {
            myWh = 'W-MAIN';
        }
    }

    // Get approved requisitions and build queue entries split by warehouse (from_wh)
    const approvedReqs = this.mockData.requisitions.filter(r => r.status === 'Approved' || r.status === 'PartialShipped');
    const queueEntries = [];

    approvedReqs.forEach(r => {
        // Group items in requisition by from_wh
        const whMap = {};
        (r.items || []).forEach(i => {
            if (i.shipped) return; // skip items already shipped
            const whKey = i.from_wh || 'W-MAIN';
            if (!whMap[whKey]) whMap[whKey] = [];
            whMap[whKey].push(i);
        });

        Object.keys(whMap).forEach(whKey => {
            // Check permission: if user is warehouse staff, only show their warehouse items
            if (myWh === 'ALL' || myWh === whKey) {
                queueEntries.push({
                    req: r,
                    from_wh: whKey,
                    from_wh_name: this.getWarehouseName(whKey),
                    items: whMap[whKey]
                });
            }
        });
    });

    let wList = queueEntries.map(e => {
        const r = e.req;
        const itemsHtml = e.items.map(i => {
            const freeBadge = i.is_free ? '<span class="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold ml-1 border border-red-200">[แถม]</span>' : '';
            return `• ${i.name} ${freeBadge} <span class="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono ml-1">x${i.req_qty} ${i.unit || 'ชิ้น'}</span>`;
        }).join('<br>');

        let fullDeliveryAddr = '-';
        if (r.delivery_address) {
            fullDeliveryAddr = typeof r.delivery_address === 'object' ? this.formatAddr(r.delivery_address) : r.delivery_address;
        }
        if ((!fullDeliveryAddr || fullDeliveryAddr === '-') && (r.so_id || r.so_no)) {
            const so = (this.mockData.salesOrders || []).find(s => s.id === r.so_id || s.so_no === r.so_no);
            if (so) {
                const cus = (this.mockData.customers || []).find(c => c.id === so.customer_id || c.name === so.customer_name);
                if (cus) {
                    const addrObj = cus.shipping_differs && cus.shipping_address ? cus.shipping_address : cus.address;
                    fullDeliveryAddr = typeof addrObj === 'object' ? this.formatAddr(addrObj) : (addrObj || '-');
                }
            }
        }

        return `
            <div class="bg-white border rounded-2xl p-5 flex flex-col md:flex-row justify-between mb-4 shadow-sm relative overflow-hidden">
                <div class="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500"></div>
                <div class="flex-1 pl-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="font-bold text-lg text-slate-800">${r.req_no}</span>
                        ${r.so_no ? `<span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">SO: ${r.so_no}</span>` : ''}
                        <span class="text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">${r.type}</span>
                        <span class="text-xs text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"><i class="ph ph-warehouse"></i> คลังจัดส่ง: ${e.from_wh_name}</span>
                    </div>
                    <div class="text-sm mt-2 text-slate-600">ปลายทาง: <b>${r.to_wh}</b> (ผู้รับ: ${r.req_by})</div>
                    <div class="text-xs mt-1 text-slate-600 font-medium"><i class="ph ph-map-pin text-red-500 mr-1 text-sm"></i> <b>ที่อยู่จัดส่ง:</b> ${fullDeliveryAddr || '-'}</div>
                    <div class="text-xs mt-3 bg-slate-50 p-3 rounded-xl border max-h-32 overflow-y-auto">
                        <span class="font-bold text-slate-700">รายการแพ็คสินค้า (${e.from_wh_name}):</span><br>
                        ${itemsHtml}
                    </div>
                </div>
                <div class="mt-4 md:mt-0 md:ml-6 text-right flex flex-col justify-center gap-2 w-44">
                    <button onclick="app.printBoxSticker(${r.id}, '${e.from_wh}')" class="bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl font-bold shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5">
                        <i class="ph ph-printer text-base"></i> พิมพ์ใบปะหน้าลัง
                    </button>
                    ${!isS ? `
                    <button onclick="app.openShipModal(${r.id}, '${e.from_wh}')" class="bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded-xl font-bold shadow-sm transition-colors text-xs flex items-center justify-center gap-1.5">
                        <i class="ph ph-truck text-base"></i> บันทึกจัดส่ง
                    </button>
                    <button onclick="app.cancelShipment(${r.id})" class="bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-3 rounded-xl font-bold text-xs transition-colors">
                        ยกเลิก/ส่งคืน
                    </button>` : ''}
                </div>
            </div>
        `;
    }).join('');

    let dList = (this.mockData.shipments || []).map(s => {
        const itemSummary = (s.items || []).map(i => `${i.name}${i.is_free ? ' [แถม]' : ''} (x${i.req_qty})`).join(', ');
        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3.5 text-xs text-slate-500">${s.date}</td>
                <td class="px-4 py-3.5 font-mono font-bold text-blue-600">${s.so_no || '-'}</td>
                <td class="px-4 py-3.5 font-mono font-bold text-purple-600">${s.req_no}</td>
                <td class="px-4 py-3.5 text-xs font-bold text-slate-700">${s.from_wh || 'คลังหลัก'}</td>
                <td class="px-4 py-3.5 text-xs"><span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border font-bold">${s.type}</span></td>
                <td class="px-4 py-3.5 text-xs text-slate-600 max-w-[200px] truncate" title="${itemSummary}">${itemSummary}</td>
                <td class="px-4 py-3.5 text-sm font-medium">${s.to_wh}</td>
                <td class="px-4 py-3.5 text-sm text-slate-600">${s.receiver}</td>
                <td class="px-4 py-3.5 text-xs"><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border font-bold">${s.carrier}</span></td>
                <td class="px-4 py-3.5 font-mono font-bold text-amber-600">${s.tracking}</td>
                <td class="px-4 py-3.5 font-mono text-xs">${s.doc}</td>
                <td class="px-4 py-3.5 text-center">
                    <button onclick="app.openShipmentDetailModal(${s.id})" class="text-slate-400 hover:text-blue-500 p-1 rounded" title="ดูรายละเอียด">
                        <i class="ph ph-eye text-lg"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-slate-800">การจัดส่งสินค้า (Shipments)</h2>
            <p class="text-slate-500 text-sm">จัดการคิวรอแพ็คจัดส่งสินค้า แยกตามคลังสินค้า และบันทึกเลขพัสดุ Tracking</p>
        </div>

        <h3 class="font-bold mb-3 flex items-center text-slate-800">
            <i class="ph ph-package text-amber-500 mr-2 text-xl"></i> คิวรอแพ็ค/ส่งสินค้า ${isS ? '(มุมมองฝ่ายขาย - View Only)' : ''}
        </h3>
        ${wList || '<div class="text-center p-8 bg-white border border-dashed rounded-2xl text-slate-400 font-bold mb-8">ไม่มีรายการรอจัดส่งสินค้า</div>'}

        <div class="mt-8">
            <h3 class="font-bold mb-3 flex items-center text-slate-800">
                <i class="ph ph-truck text-blue-500 mr-2 text-xl"></i> ประวัติการจัดส่งเสร็จสิ้น
            </h3>
            <div class="bg-white border rounded-2xl overflow-x-auto shadow-sm">
                <table class="w-full text-left text-sm whitespace-nowrap">
                    <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                        <tr>
                            <th class="px-4 py-3.5">วันที่ส่ง</th>
                            <th class="px-4 py-3.5">SO No. อ้างอิง</th>
                            <th class="px-4 py-3.5">อ้างอิงใบเบิก</th>
                            <th class="px-4 py-3.5">คลังจัดส่ง</th>
                            <th class="px-4 py-3.5">ประเภท</th>
                            <th class="px-4 py-3.5">รายการสินค้า</th>
                            <th class="px-4 py-3.5">ปลายทาง</th>
                            <th class="px-4 py-3.5">ผู้รับสินค้า</th>
                            <th class="px-4 py-3.5">บริษัทขนส่ง</th>
                            <th class="px-4 py-3.5">เลข Tracking</th>
                            <th class="px-4 py-3.5">เลขใบส่งของ (DO)</th>
                            <th class="px-4 py-3.5 text-center">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">${dList || '<tr><td colspan="12" class="text-center py-6 text-slate-400">ยังไม่มีประวัติการจัดส่ง</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
};

app.cancelShipment = function(reqId) {
    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-[70]">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-fade-in">
                <h3 class="text-lg font-bold text-slate-800 mb-2">ยกเลิกรายการจัดส่ง</h3>
                <p class="text-slate-500 text-sm mb-4">กรุณาระบุสาเหตุที่ต้องส่งกลับรายการนี้ไปยังสถานะรออนุมัติ</p>
                <input type="text" id="cancel_reason" class="w-full border rounded-xl px-3 py-2 text-sm mb-6" placeholder="เหตุผล..." required>
                <div class="flex justify-end gap-3">
                    <button onclick="document.getElementById('prompt-modal').remove()" class="px-4 py-2 bg-slate-200 rounded-xl font-bold text-slate-700">ปิด</button>
                    <button onclick="app.processCancelShipment(${reqId})" class="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold">ยืนยันส่งกลับ</button>
                </div>
            </div>
        </div>
    `;
    const div = document.createElement('div');
    div.id = 'prompt-modal';
    div.innerHTML = html;
    document.body.appendChild(div);
};

app.processCancelShipment = function(reqId) {
    const rsn = document.getElementById('cancel_reason').value.trim();
    if (!rsn) {
        this.showToast('กรุณาระบุสาเหตุการส่งกลับ', 'warning');
        return;
    }
    const r = this.mockData.requisitions.find(x => x.id === reqId);
    if (r) {
        r.status = 'Pending';
        r.cancel_reason = rsn;
    }
    this.showToast('ส่งกลับรายการไปรออนุมัติใหม่เรียบร้อย', 'success');
    document.getElementById('prompt-modal').remove();
    this.renderShipments(document.getElementById('main-content'));
};

app.openShipModal = function(reqId, fromWhKey = 'W-MAIN') {
    const r = this.mockData.requisitions.find(x => x.id === reqId);
    if (!r) return;

    const fromWhName = this.getWarehouseName(fromWhKey);
    const shipItems = (r.items || []).filter(i => (i.from_wh || 'W-MAIN') === fromWhKey && !i.shipped);

    let rec = r.req_by;
    if (r.type === 'เบิกเพื่อขาย') rec = r.to_wh;

    const itemSummaryHtml = shipItems.map(i => `
        <div class="flex justify-between items-center text-xs py-1 border-b border-amber-100">
            <span class="font-medium text-slate-800">${i.name} ${i.is_free ? '<span class="text-red-600 font-bold">[แถม]</span>' : ''}</span>
            <span class="font-bold text-blue-600 font-mono">${i.req_qty} ${i.unit || 'ชิ้น'}</span>
        </div>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-truck text-amber-600 text-xl"></i> บันทึกจัดส่ง: ${r.req_no}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 space-y-4">
                    <form id="ship-form" onsubmit="event.preventDefault(); app.saveShip(${reqId}, '${fromWhKey}')" class="space-y-4">
                        <div class="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-sm space-y-1">
                            <div class="text-xs font-bold text-amber-900 mb-1"><i class="ph ph-warehouse mr-1"></i>จัดส่งจาก: ${fromWhName}</div>
                            <div><span class="font-bold text-amber-900">ปลายทาง:</span> ${r.to_wh}</div>
                            <div><span class="font-bold text-amber-900">ผู้รับ:</span> ${rec}</div>
                            <div class="text-xs text-amber-800"><i class="ph ph-map-pin mr-1"></i>${r.delivery_address || '-'}</div>
                            
                            <div class="mt-2 pt-2 border-t border-amber-200">
                                <div class="text-xs font-bold text-amber-900 mb-1">รายการสินค้าที่จะจัดส่ง:</div>
                                ${itemSummaryHtml}
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้รับสินค้า *</label>
                            <input type="text" id="sh_receiver" value="${rec}" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">วันที่จัดส่ง *</label>
                                <input type="date" id="sh_date" value="${new Date().toISOString().split('T')[0]}" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">เลขใบส่งของ (DO) *</label>
                                <input type="text" id="sh_doc" value="DO-2607-${Math.floor(100+Math.random()*900)}" class="w-full border rounded-xl px-3 py-2 text-sm font-mono" required>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">บริษัทขนส่ง *</label>
                            <select id="sh_carrier" class="w-full border rounded-xl px-3 py-2 text-sm bg-white" required>
                                <option value="ไปรษณีย์ไทย">ไปรษณีย์ไทย (Thailand Post)</option>
                                <option value="Kerry Express">Kerry Express</option>
                                <option value="Flash Express">Flash Express</option>
                                <option value="J&T Express">J&T Express</option>
                                <option value="NTC">NTC Transport</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">เลข Tracking / พัสดุ</label>
                            <input type="text" id="sh_track" placeholder="ระบุเลขพัสดุ..." class="w-full border-2 border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-blue-600 focus:border-blue-500">
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="ship-form" class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm">ยืนยันจัดส่ง & ตัดสต็อก</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveShip = function(reqId, fromWhKey = 'W-MAIN') {
    const r = this.mockData.requisitions.find(x => x.id === reqId);
    if (!r) return;

    const fromWhName = this.getWarehouseName(fromWhKey);
    const shipItems = (r.items || []).filter(i => (i.from_wh || 'W-MAIN') === fromWhKey && !i.shipped);

    // 1. Deduct stock from origin warehouse (fromWhKey)
    shipItems.forEach(i => {
        let p = this.mockData.products.find(x => x.sku === i.sku && x.warehouse === fromWhKey);
        if (p) {
            p.stock_qty -= (i.req_qty || 0);
        }
        i.shipped = true;
    });

    // 2. If requisition type is "เบิกเพื่อสต็อก", update receiving warehouse stock!
    if (r.type === 'เบิกเพื่อสต็อก') {
        let destWhObj = (this.mockData.warehouses || []).find(w => w.name === r.to_wh || w.id === r.to_wh || r.to_wh.includes(w.name));
        const destWhId = destWhObj ? destWhObj.id : r.to_wh;

        shipItems.forEach(i => {
            let targetProd = this.mockData.products.find(x => x.sku === i.sku && x.warehouse === destWhId);
            if (targetProd) {
                targetProd.stock_qty += (i.req_qty || 0);
            } else {
                this.mockData.products.push({
                    id: Date.now() + Math.floor(Math.random() * 10000),
                    sku: i.sku,
                    name: i.name,
                    cost_price: 0,
                    wholesale_price: 0,
                    stock_qty: i.req_qty || 0,
                    pending_in: 0,
                    location: 'Zone Sub',
                    warehouse: destWhId,
                    unit: i.unit || 'กล่อง',
                    carton_qty: 1
                });
            }
        });
    }

    // Check if all items in requisition are shipped
    const allShipped = (r.items || []).every(i => i.shipped);
    if (allShipped) {
        r.status = 'Shipped';
        // Sync with Sales Order if applicable
        if (r.so_id || r.so_no) {
            const so = (this.mockData.salesOrders || []).find(s => s.id === r.so_id || s.so_no === r.so_no);
            if (so) {
                so.status = 'Completed';
            }
        }
    } else {
        r.status = 'PartialShipped';
    }

    let sale = '-';
    if (r.type === 'เบิกเพื่อขาย') sale = r.req_by;

    this.mockData.shipments.unshift({
        id: Date.now(),
        req_id: r.id,
        req_no: r.req_no,
        so_no: r.so_no || '-',
        type: r.type,
        from_wh: fromWhName,
        to_wh: r.to_wh,
        receiver: document.getElementById('sh_receiver').value,
        sales: sale,
        address: r.delivery_address,
        date: document.getElementById('sh_date').value,
        carrier: document.getElementById('sh_carrier').value,
        tracking: document.getElementById('sh_track').value || '-',
        doc: document.getElementById('sh_doc').value,
        items: [...shipItems]
    });

    this.showToast(`บันทึกจัดส่งสินค้าและหักสต็อก (${fromWhName}) เรียบร้อยแล้ว`, 'success');
    this.closeModal();
    this.renderShipments(document.getElementById('main-content'));
};

app.openShipmentDetailModal = function(shipId) {
    const s = this.mockData.shipments.find(x => x.id === shipId);
    if (!s) return;

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-info text-blue-600 text-xl"></i> รายละเอียดจัดส่ง: ${s.req_no}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 space-y-4">
                    <form id="es-form" onsubmit="event.preventDefault(); app.saveEditShipment(${shipId})" class="space-y-4">
                        <div class="bg-slate-50 border p-3 rounded-xl text-sm space-y-1">
                            <div class="font-bold">ปลายทาง: ${s.to_wh}</div>
                            <div class="font-bold">ผู้รับ: ${s.receiver}</div>
                            <div class="text-xs text-slate-500"><i class="ph ph-map-pin mr-1"></i>${s.address}</div>
                        </div>

                        <div class="border rounded-xl p-3 bg-white max-h-32 overflow-y-auto">
                            <h5 class="font-bold text-xs text-slate-400 uppercase mb-2">รายการสินค้า</h5>
                            ${s.items.map(i => `<div class="flex justify-between border-b pb-1 mb-1 text-sm"><span class="text-slate-700">${i.name}</span><span class="font-bold font-mono">x${i.req_qty} ${i.unit}</span></div>`).join('')}
                        </div>

                        <h5 class="font-bold text-slate-800 border-b pb-1 mt-4">ข้อมูลใบขนส่ง (แก้ไขได้)</h5>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ใบส่งของ (DO)</label>
                                <input type="text" id="es_doc" value="${s.doc}" class="w-full border rounded-lg px-3 py-1.5 text-sm font-mono">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">วันที่ส่ง</label>
                                <input type="date" id="es_date" value="${s.date}" class="w-full border rounded-lg px-3 py-1.5 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ขนส่ง</label>
                                <select id="es_carrier" class="w-full border rounded-lg px-3 py-1.5 text-sm bg-white">
                                    <option value="ไปรษณีย์ไทย" ${s.carrier==='ไปรษณีย์ไทย'?'selected':''}>ไปรษณีย์ไทย</option>
                                    <option value="Kerry Express" ${s.carrier==='Kerry Express'?'selected':''}>Kerry Express</option>
                                    <option value="Flash Express" ${s.carrier==='Flash Express'?'selected':''}>Flash Express</option>
                                    <option value="J&T Express" ${s.carrier==='J&T Express'?'selected':''}>J&T Express</option>
                                    <option value="NTC" ${s.carrier==='NTC'?'selected':''}>NTC</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Tracking Number</label>
                                <input type="text" id="es_track" value="${s.tracking}" class="w-full border-2 border-slate-300 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-blue-600">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ปิด</button>
                    <button type="submit" form="es-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">บันทึกแก้ไข</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveEditShipment = function(id) {
    const s = this.mockData.shipments.find(x => x.id === id);
    if (!s) return;

    s.doc = document.getElementById('es_doc').value;
    s.date = document.getElementById('es_date').value;
    s.carrier = document.getElementById('es_carrier').value;
    s.tracking = document.getElementById('es_track').value;

    this.showToast('อัปเดตข้อมูลขนส่งเรียบร้อย', 'success');
    this.closeModal();
    this.renderShipments(document.getElementById('main-content'));
};

app.printBoxSticker = function(reqId, fromWhKey = 'W-MAIN') {
    const r = this.mockData.requisitions.find(x => x.id === reqId);
    if (!r) return;

    // Sender info
    const whObj = (this.mockData.warehouses || []).find(w => w.id === fromWhKey || w.name === fromWhKey);
    let senderName = 'ชนินธร (เล็ก)';
    let senderPhone = '099-7895645';
    let senderAddress = '129/162 ม.8 ถ.ราชพฤกษ์ ต.บางกร่าง อ.เมือง จ.นนทบุรี 11000';

    if (whObj) {
        senderName = `${whObj.contact || 'คลังสินค้า'} (${whObj.name})`;
        senderPhone = whObj.phone || '099-7895645';
        senderAddress = typeof whObj.address === 'object' ? this.formatAddr(whObj.address) : whObj.address;
    } else if (this.mockData.company) {
        senderName = this.mockData.company.name;
        senderPhone = '02-123-4567';
        senderAddress = this.mockData.company.address;
    }

    // Receiver info
    let receiverName = r.req_by || 'ลูกค้า';
    let receiverPhone = '081-243-5242';
    let receiverAddress = r.delivery_address || '-';

    if (typeof receiverAddress === 'object') {
        receiverAddress = this.formatAddr(receiverAddress);
    }

    if (r.so_id || r.so_no) {
        const so = (this.mockData.salesOrders || []).find(s => s.id === r.so_id || s.so_no === r.so_no);
        if (so) {
            const cus = (this.mockData.customers || []).find(c => c.id === so.customer_id || c.name === so.customer_name);
            if (cus) {
                receiverName = cus.contact || cus.name;
                receiverPhone = cus.phone || receiverPhone;
                const addrObj = cus.shipping_differs && cus.shipping_address ? cus.shipping_address : cus.address;
                receiverAddress = typeof addrObj === 'object' ? this.formatAddr(addrObj) : (addrObj || receiverAddress);
            }
        }
    }

    // Clean up "คุณ" prefix if already included
    receiverName = receiverName.replace(/^คุณ\s*/, '');

    const html = `
        <div class="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-[80]">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] animate-fade-in">
                <div class="flex justify-between items-center p-4 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-printer text-blue-600 text-xl"></i> แม่แบบใบปะหน้าลังพัสดุ (100x150 mm) - ${r.req_no}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                
                <div class="p-6 overflow-y-auto flex justify-center bg-slate-100">
                    <div id="print-sticker-area" class="bg-white border-2 border-slate-900 rounded-lg p-6 shadow-lg w-[360px] min-h-[520px] flex flex-col justify-between text-slate-900 font-sans">
                        <div>
                            <!-- Sender -->
                            <div class="text-sm font-bold text-slate-900 mb-1 leading-snug">
                                ผู้ส่ง <span class="text-base font-bold">${senderName}</span> <span class="ml-1">Tel.</span> <span class="font-mono font-bold">${senderPhone}</span>
                            </div>
                            <div class="text-xs text-slate-700 leading-normal mb-4">
                                ${senderAddress}
                            </div>

                            <!-- Divider -->
                            <div class="border-b-2 border-slate-900 my-4"></div>

                            <!-- Receiver -->
                            <div class="text-base font-bold text-slate-900 mb-3">
                                กรุณาส่ง (ผู้รับ)
                            </div>
                            <div class="text-xl font-black text-slate-900 mb-1">
                                คุณ${receiverName}
                            </div>
                            <div class="text-base font-bold text-slate-900 mb-3">
                                Tel. <span class="font-mono">${receiverPhone}</span>
                            </div>
                            <div class="text-base font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                                ${receiverAddress}
                            </div>
                        </div>

                        ${r.so_no ? `
                        <div class="pt-4 mt-6 border-t border-dashed border-slate-300 flex justify-between items-center text-[11px] text-slate-500 font-mono">
                            <span>SO: ${r.so_no}</span>
                            <span>REQ: ${r.req_no}</span>
                        </div>` : ''}
                    </div>
                </div>

                <div class="p-4 border-t bg-slate-50 flex justify-between items-center rounded-b-2xl">
                    <span class="text-xs text-slate-500 font-medium">ขนาด 10x15 ซม. ( sample1.pdf )</span>
                    <div class="flex gap-2">
                        <button onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm">ปิด</button>
                        <button onclick="app.executePrintSticker(\`${senderName.replace(/`/g, "\\`")}\`, \`${senderPhone}\`, \`${senderAddress.replace(/`/g, "\\`")}\`, \`${receiverName.replace(/`/g, "\\`")}\`, \`${receiverPhone}\`, \`${receiverAddress.replace(/`/g, "\\`")}\`)" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-sm flex items-center gap-1.5">
                            <i class="ph ph-printer text-lg"></i> พิมพ์ / บันทึก PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.executePrintSticker = function(sName, sPhone, sAddr, rName, rPhone, rAddr) {
    const printWin = window.open('', '_blank', 'width=650,height=850');
    if (!printWin) {
        this.showToast('กรุณายินยอมให้เปิด Popup เพื่อสั่งพิมพ์เอกสาร', 'warning');
        return;
    }
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>ใบปะหน้าลังพัสดุ (100x150 mm)</title>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet">
            <style>
                @page {
                    size: 100mm 150mm;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Sarabun', sans-serif;
                    background: #fff;
                    color: #000;
                    -webkit-print-color-adjust: exact;
                }
                .sticker-box {
                    width: 100mm;
                    height: 150mm;
                    padding: 8mm;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    border: 2px solid #000;
                }
                .sender-title {
                    font-size: 13px;
                    font-weight: bold;
                    margin-bottom: 2px;
                }
                .sender-name {
                    font-size: 14px;
                    font-weight: bold;
                }
                .sender-addr {
                    font-size: 12px;
                    line-height: 1.4;
                    margin-top: 2px;
                }
                .divider {
                    border-bottom: 2px solid #000;
                    margin: 12px 0;
                }
                .receiver-title {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 12px;
                }
                .receiver-name {
                    font-size: 22px;
                    font-weight: 800;
                    margin-bottom: 4px;
                }
                .receiver-phone {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .receiver-addr {
                    font-size: 16px;
                    font-weight: 600;
                    line-height: 1.5;
                }
            </style>
        </head>
        <body>
            <div class="sticker-box">
                <div>
                    <div class="sender-title">
                        ผู้ส่ง <span class="sender-name">${sName}</span> Tel. <span>${sPhone}</span>
                    </div>
                    <div class="sender-addr">
                        ${sAddr}
                    </div>

                    <div class="divider"></div>

                    <div class="receiver-title">
                        กรุณาส่ง (ผู้รับ)
                    </div>
                    <div class="receiver-name">
                        คุณ${rName}
                    </div>
                    <div class="receiver-phone">
                        Tel. ${rPhone}
                    </div>
                    <div class="receiver-addr">
                        ${rAddr}
                    </div>
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;
    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
};
