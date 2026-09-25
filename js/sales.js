/**
 * OMS (Operation Management System) - Sales & Accounts Receivable (AR) Module
 * File: js/sales.js
 */

// ==========================================
// SALES ORDERS & QUOTATIONS (การขาย & ใบเสนอราคา)
// ==========================================

app.renderSalesOrders = function(container) {
    const orders = this.mockData.salesOrders || [];
    let rows = orders.map(so => {
        let statusBadge = '';
        if (so.status === 'Pending') statusBadge = '<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">รออนุมัติ</span>';
        else if (so.status === 'ไม่อนุมัติ' || so.status === 'Unapproved') statusBadge = '<span class="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">ไม่อนุมัติ</span>';
        else if (so.status === 'Approved' || so.status === 'Confirmed') statusBadge = '<span class="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">รอจัดส่ง</span>';
        else if (so.status === 'Invoiced') statusBadge = '<span class="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">เปิดใบแจ้งหนี้</span>';
        else if (so.status === 'Completed' || so.status === 'Shipped') statusBadge = '<span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">เสร็จสิ้น</span>';
        else statusBadge = `<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300">${so.status}</span>`;

        let payBadge = '';
        if (so.payment_status === 'Unpaid') payBadge = '<span class="text-xs text-red-600 font-bold">ยังไม่ชำระ</span>';
        else if (so.payment_status === 'Partial') payBadge = '<span class="text-xs text-amber-600 font-bold">ชำระบางส่วน</span>';
        else if (so.payment_status === 'Paid') payBadge = '<span class="text-xs text-emerald-600 font-bold">ชำระเงินแล้ว</span>';

        let itemsSummary = (so.items || []).map(i => `<div class="truncate max-w-[200px] text-xs">• ${i.name} <span class="font-bold text-blue-600 font-mono">(${i.is_free ? 'แถม ' : ''}${i.qty} ${i.unit||'ชิ้น'})</span></div>`).join('');

        let vatBadge = so.vat_req ? '<span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">ออก VAT</span>' : '<span class="text-slate-400 text-xs">-</span>';

        let taxInvBadge = '-';
        if (so.vat_req) {
            if (so.tax_invoice_issued || so.tax_invoice_no) {
                taxInvBadge = '<span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">เรียบร้อย</span>';
            } else {
                taxInvBadge = '<span class="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">รอออก VAT</span>';
            }
        } else {
            taxInvBadge = '<span class="text-slate-400 text-xs">-</span>';
        }

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3.5 font-mono font-bold text-blue-600">${so.so_no}</td>
                <td class="px-4 py-3.5 font-medium text-slate-800">${so.customer_name}</td>
                <td class="px-4 py-3.5 text-xs text-slate-500">${so.date}</td>
                <td class="px-4 py-3.5">${itemsSummary || '-'}</td>
                <td class="px-4 py-3.5 text-xs text-slate-600">${so.delivery_type || 'จัดส่งโดยคลัง'}</td>
                <td class="px-4 py-3.5 text-center">${vatBadge}</td>
                <td class="px-4 py-3.5 text-xs text-slate-600">${so.sales_person}</td>
                <td class="px-4 py-3.5 font-mono font-bold text-blue-600 text-right">฿${(so.total_amount||0).toLocaleString('th-TH',{minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td class="px-4 py-3.5 text-center">${taxInvBadge}</td>
                <td class="px-4 py-3.5 text-center">${statusBadge}</td>
                <td class="px-4 py-3.5 text-center">${payBadge}</td>
                <td class="px-4 py-3.5 text-center whitespace-nowrap">
                    <button onclick="app.viewSalesOrderDetail(${so.id})" class="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100" title="ดูรายละเอียด SO">
                        <i class="ph ph-eye text-lg"></i>
                    </button>
                    ${so.status === 'Pending' || so.status === 'ไม่อนุมัติ' ? `
                    <button onclick="app.openSalesOrderModal(${so.id})" class="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 ml-1" title="แก้ไข SO">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    <button onclick="app.requestSalesRequisition(${so.id})" class="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 ml-1 font-bold text-xs" title="ส่งขอเบิกเพื่อขายใหม่">
                        <i class="ph ph-hand-grabbing text-lg align-middle"></i>
                    </button>` : ''}
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">รายการสั่งขาย (Sales Orders)</h2>
                <p class="text-slate-500 text-sm">สร้างใบสั่งขาย (SO) กำหนดเงื่อนไขจัดส่ง การชำระเงิน และออกใบแจ้งหนี้</p>
            </div>
            <button onclick="app.openSalesOrderModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-plus text-lg"></i> + สร้างใบสั่งขาย (SO)
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-4 py-3.5">เลขที่ SO</th>
                        <th class="px-4 py-3.5">ชื่อลูกค้า</th>
                        <th class="px-4 py-3.5">วันที่เอกสาร</th>
                        <th class="px-4 py-3.5">รายละเอียดสินค้า</th>
                        <th class="px-4 py-3.5">ประเภทจัดส่ง</th>
                        <th class="px-4 py-3.5 text-center">เงื่อนไขภาษี</th>
                        <th class="px-4 py-3.5">พนักงานขาย</th>
                        <th class="px-4 py-3.5 text-right">ยอดรวมสุทธิ (บาท)</th>
                        <th class="px-4 py-3.5 text-center">ใบกำกับภาษี</th>
                        <th class="px-4 py-3.5 text-center">สถานะจัดส่ง</th>
                        <th class="px-4 py-3.5 text-center">สถานะรับชำระ</th>
                        <th class="px-4 py-3.5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${rows || '<tr><td colspan="12" class="text-center py-8 text-slate-400">ยังไม่มีรายการสั่งขาย</td></tr>'}</tbody>
            </table>
        </div>
    `;
};

app.openSalesOrderModal = function() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const max45 = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const soNo = 'SO-' + today.getFullYear().toString().substring(2) + (today.getMonth()+1).toString().padStart(2,'0') + '-' + Math.floor(100+Math.random()*900);
    
    let custOpts = '<option value="">-- เลือกลูกค้า --</option>';
    (this.mockData.customers || []).forEach(c => {
        custOpts += `<option value="${c.id}">${c.name} (${c.contact || c.phone})</option>`;
    });

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-file-text text-blue-600 text-xl"></i> สร้างใบสั่งขาย (Sales Order)
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <form id="so-form" onsubmit="event.preventDefault(); app.saveSalesOrder()" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                            <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">เลือกลูกค้า *</label>
                                    <select id="so_customer" onchange="app.onSOCustomerChange()" class="w-full border rounded-xl px-3 py-2 text-sm bg-white font-bold" required>
                                        ${custOpts}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">เลขใบสั่งซื้อ PO (ถ้ามี)</label>
                                    <input type="text" id="so_po_no" placeholder="ระบุเลขที่ PO ลูกค้า..." class="w-full border rounded-xl px-3 py-2 text-sm font-mono">
                                </div>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ประเภทการจัดส่ง *</label>
                                <select id="so_delivery_type" class="w-full border rounded-xl px-3 py-2 text-sm bg-white font-medium" required>
                                    <option value="จัดส่งโดยคลัง">จัดส่งโดยคลัง (คลังหลัก/คลังย่อย)</option>
                                    <option value="เซลส์ส่งเอง">เซลส์ส่งเอง (คลังเซลส์)</option>
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">การชำระเงิน *</label>
                                    <select id="so_payment_type" onchange="app.onSOPaymentTypeChange()" class="w-full border rounded-xl px-3 py-2 text-sm bg-white font-medium" required>
                                        <option value="เงินสด">เงินสด</option>
                                        <option value="เครดิต">เครดิต</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">กำหนดชำระ * (ไม่เกิน 45 วัน)</label>
                                    <input type="date" id="so_payment_date" value="${todayStr}" max="${max45}" class="w-full border rounded-xl px-3 py-2 text-sm font-mono" required>
                                </div>
                            </div>
                        </div>

                        <!-- VAT Options Container -->
                        <div id="so_vat_container" class="hidden border rounded-xl p-3.5 bg-blue-50/60 border-blue-200">
                            <label class="inline-flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="so_vat_req" onchange="app.calcSalesOrderTotal()" class="w-4 h-4 text-blue-600 rounded">
                                <span class="font-bold text-slate-800 text-sm">ลูกค้าต้องการใบกำกับภาษี (VAT 7%)</span>
                            </label>
                            <p class="text-xs text-blue-600 mt-1 pl-6">* บันทึกเงื่อนไขว่าลูกค้าต้องการใบกำกับภาษี (ไม่มีการคำนวณบวกภาษีเพิ่ม)</p>
                        </div>

                        <!-- Item Table -->
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <h4 class="font-bold text-slate-800">รายการสินค้าสั่งขาย</h4>
                                <button type="button" onclick="app.addSalesOrderItemRow()" class="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-blue-100">
                                    <i class="ph ph-plus"></i> + เพิ่มแถว
                                </button>
                            </div>
                            <div class="border rounded-xl overflow-hidden shadow-sm">
                                <table class="w-full text-left text-sm">
                                    <thead class="bg-slate-100 text-slate-600 font-bold">
                                        <tr>
                                            <th class="p-3">สินค้า</th>
                                            <th class="p-3 w-16 text-center">แถม</th>
                                            <th class="p-3 w-28 text-right">จำนวน</th>
                                            <th class="p-3 w-36 text-right">ราคาขาย/ชิ้น (฿)</th>
                                            <th class="p-3 w-32 text-right">รวม (฿)</th>
                                            <th class="p-3 w-12 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="so-items-body" class="divide-y bg-white">
                                    </tbody>
                                    <tfoot class="bg-slate-50 font-bold border-t space-y-1">
                                        <tr class="border-t border-slate-200 bg-blue-50/30">
                                            <td colspan="4" class="p-3 text-right text-sm text-slate-800">ยอดรวมสุทธิ (Net Total):</td>
                                            <td class="p-3 text-right text-lg text-blue-600 font-mono font-bold" id="so-grand-total">฿0.00</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <!-- Remarks -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">หมายเหตุ (สำหรับกรอกข้อความบันทึกเพิ่มเติม)</label>
                            <textarea id="so_remarks" placeholder="กรอกหมายเหตุ หรือข้อความบันทึกเพิ่มเติม..." class="w-full border rounded-xl px-3 py-2 text-sm" rows="2"></textarea>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="so-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">บันทึกใบสั่งขาย</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
    this.addSalesOrderItemRow();
};

app.onSOCustomerChange = function() {
    const custId = parseInt(document.getElementById('so_customer')?.value);
    const vatContainer = document.getElementById('so_vat_container');
    const vatCb = document.getElementById('so_vat_req');
    
    if (!custId) {
        if (vatContainer) vatContainer.classList.add('hidden');
        if (vatCb) vatCb.checked = false;
        this.calcSalesOrderTotal();
        return;
    }

    const customer = (this.mockData.customers || []).find(c => c.id === custId);
    if (customer && customer.vat_req) {
        if (vatContainer) vatContainer.classList.remove('hidden');
        if (vatCb) vatCb.checked = true;
    } else {
        if (vatContainer) vatContainer.classList.add('hidden');
        if (vatCb) vatCb.checked = false;
    }
    this.calcSalesOrderTotal();
};

app.onSOPaymentTypeChange = function() {
    const payType = document.getElementById('so_payment_type')?.value;
    const dateInput = document.getElementById('so_payment_date');
    if (!dateInput) return;

    const today = new Date();
    if (payType === 'เครดิต') {
        const credit30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        dateInput.value = credit30.toISOString().split('T')[0];
    } else {
        dateInput.value = today.toISOString().split('T')[0];
    }
};

app.checkItemPriceCost = function(inputElem) {
    const row = inputElem.closest('tr');
    if (!row) return;
    const freeCb = row.querySelector('[name="so_item_free[]"]');
    if (freeCb && freeCb.checked) return;

    const prodSel = row.querySelector('[name="so_item_product[]"]');
    const opt = prodSel ? prodSel.options[prodSel.selectedIndex] : null;
    const sku = opt ? opt.getAttribute('data-sku') : '';
    let costPrice = opt ? parseFloat(opt.getAttribute('data-cost') || 0) : 0;

    if (sku && this.getProductCostPrice) {
        const vendorCost = this.getProductCostPrice(sku);
        if (vendorCost > costPrice) costPrice = vendorCost;
    }

    const val = parseFloat(inputElem.value) || 0;

    if (val < costPrice) {
        this.showToast(`ราคาขายต้องไม่ต่ำกว่าราคาทุน (฿${costPrice.toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2})})`, 'error');
        inputElem.value = costPrice;
        this.calcSalesOrderTotal();
    }
};

app.addSalesOrderItemRow = function() {
    const prods = this.mockData.products || [];
    const tbody = document.getElementById('so-items-body');
    if (!tbody) return;

    // Group products by SKU to summarize stock per warehouse type (Main vs Sub)
    const uniqueMap = {};
    prods.forEach(p => {
        if (!uniqueMap[p.sku]) {
            uniqueMap[p.sku] = {
                id: p.id,
                sku: p.sku,
                name: p.name,
                unit: p.unit || 'ชิ้น',
                cost_price: p.cost_price || 0,
                wholesale_price: p.wholesale_price || 0,
                mainStock: 0,
                subStock: 0
            };
        }
        if (p.warehouse === 'W-MAIN') {
            uniqueMap[p.sku].mainStock += (p.stock_qty || 0);
        } else {
            uniqueMap[p.sku].subStock += (p.stock_qty || 0);
        }
    });

    const uniqueList = Object.values(uniqueMap);

    let pOpts = uniqueList.map(p => {
        return `<option value="${p.id}" data-price="${p.wholesale_price}" data-cost="${p.cost_price}" data-sku="${p.sku}" data-name="${p.name}" data-unit="${p.unit}">${p.sku} - ${p.name} [คลังหลัก เหลือ ${p.mainStock} ${p.unit}] [คลังย่อย เหลือ ${p.subStock} ${p.unit}]</option>`;
    }).join('');

    const defaultCost = uniqueList[0]?.cost_price || 0;
    const defaultPrice = uniqueList[0]?.wholesale_price || 0;

    const tr = document.createElement('tr');
    tr.className = 'so-item-row';
    tr.innerHTML = `
        <td class="p-2">
            <select name="so_item_product[]" onchange="app.onSOProductChange(this)" class="w-full border rounded-lg p-2 text-sm bg-white" required>
                ${pOpts}
            </select>
        </td>
        <td class="p-2 text-center">
            <input type="checkbox" name="so_item_free[]" onchange="app.onSOFreeChange(this)" class="w-4 h-4 text-blue-600 rounded">
        </td>
        <td class="p-2">
            <input type="number" name="so_item_qty[]" value="1" min="1" oninput="app.calcSalesOrderTotal()" class="w-full border rounded-lg p-2 text-sm text-right font-mono" required>
        </td>
        <td class="p-2">
            <input type="number" name="so_item_price[]" value="${defaultPrice}" min="${defaultCost}" step="0.01" onchange="app.checkItemPriceCost(this)" oninput="app.calcSalesOrderTotal()" class="w-full border rounded-lg p-2 text-sm text-right font-mono" required>
        </td>
        <td class="p-2 text-right font-mono font-bold so-row-subtotal">฿0.00</td>
        <td class="p-2 text-center">
            <button type="button" onclick="this.closest('tr').remove(); app.calcSalesOrderTotal();" class="text-red-500 hover:text-red-700 p-1"><i class="ph ph-trash text-lg"></i></button>
        </td>
    `;
    tbody.appendChild(tr);
    this.calcSalesOrderTotal();
};

app.onSOProductChange = function(selectElem) {
    const opt = selectElem.options[selectElem.selectedIndex];
    const price = opt ? parseFloat(opt.getAttribute('data-price') || 0) : 0;
    const cost = opt ? parseFloat(opt.getAttribute('data-cost') || 0) : 0;
    const row = selectElem.closest('tr');
    const freeCb = row.querySelector('[name="so_item_free[]"]');
    const priceInput = row.querySelector('[name="so_item_price[]"]');

    if (priceInput) {
        priceInput.min = cost;
        if (!freeCb.checked) {
            priceInput.value = price;
        }
    }
    this.calcSalesOrderTotal();
};

app.onSOFreeChange = function(checkbox) {
    const row = checkbox.closest('tr');
    const priceInput = row.querySelector('[name="so_item_price[]"]');
    if (checkbox.checked) {
        priceInput.setAttribute('data-old-price', priceInput.value);
        priceInput.value = 0;
        priceInput.disabled = true;
    } else {
        priceInput.disabled = false;
        priceInput.value = priceInput.getAttribute('data-old-price') || 0;
        this.checkItemPriceCost(priceInput);
    }
    this.calcSalesOrderTotal();
};

app.calcSalesOrderTotal = function() {
    let subtotal = 0;
    const rows = document.querySelectorAll('.so-item-row');
    rows.forEach(r => {
        const isFree = r.querySelector('[name="so_item_free[]"]')?.checked;
        const qty = parseFloat(r.querySelector('[name="so_item_qty[]"]')?.value) || 0;
        const price = isFree ? 0 : (parseFloat(r.querySelector('[name="so_item_price[]"]')?.value) || 0);
        const sub = qty * price;
        subtotal += sub;
        const rowSubElem = r.querySelector('.so-row-subtotal');
        if (rowSubElem) rowSubElem.innerText = '฿' + sub.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    });

    const gtElem = document.getElementById('so-grand-total');
    if (gtElem) gtElem.innerText = '฿' + subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2});
};

app.saveSalesOrder = function() {
    const custId = parseInt(document.getElementById('so_customer')?.value);
    const poNo = document.getElementById('so_po_no')?.value.trim() || '-';
    const deliveryType = document.getElementById('so_delivery_type')?.value;
    const paymentType = document.getElementById('so_payment_type')?.value;
    const paymentDateStr = document.getElementById('so_payment_date')?.value;
    const remarks = document.getElementById('so_remarks')?.value.trim() || '';

    if (!custId) {
        this.showToast('กรุณาเลือกลูกค้า', 'error');
        return;
    }

    const customer = (this.mockData.customers || []).find(c => c.id === custId);
    if (!customer) return;

    // Validate payment credit date <= 45 days
    if (paymentDateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const payDate = new Date(paymentDateStr);
        const diffDays = Math.ceil((payDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays > 45) {
            this.showToast('กำหนดวันที่ชำระเงินเครดิตได้ไม่เกิน 45 วันนับจากวันทำรายการ', 'error');
            return;
        }
    }

    const rows = document.querySelectorAll('.so-item-row');
    if (!rows.length) {
        this.showToast('กรุณาเลือกรายการสินค้าอย่างน้อย 1 รายการ', 'error');
        return;
    }

    const items = [];
    let subtotal = 0;
    let priceError = false;

    rows.forEach(r => {
        const pId = parseInt(r.querySelector('[name="so_item_product[]"]').value);
        const isFree = r.querySelector('[name="so_item_free[]"]').checked;
        const qty = parseFloat(r.querySelector('[name="so_item_qty[]"]').value) || 0;
        const price = isFree ? 0 : (parseFloat(r.querySelector('[name="so_item_price[]"]').value) || 0);
        const prod = this.mockData.products.find(p => p.id === pId);

        if (!isFree && prod && price < (prod.cost_price || 0)) {
            this.showToast(`ราคาขายของ "${prod.name}" (฿${price}) ต่ำกว่าราคาทุน (฿${(prod.cost_price||0).toLocaleString()})`, 'error');
            priceError = true;
        }

        subtotal += qty * price;
        items.push({
            product_id: pId,
            sku: prod ? prod.sku : 'PROD',
            name: prod ? prod.name : 'สินค้า',
            qty: qty,
            price: price,
            is_free: isFree,
            unit: prod ? prod.unit : 'ชิ้น'
        });
    });

    if (priceError) return;

    const isVat = document.getElementById('so_vat_req')?.checked || false;
    const soNo = 'SO-' + new Date().getFullYear().toString().substring(2) + (new Date().getMonth()+1).toString().padStart(2,'0') + '-' + Math.floor(100+Math.random()*900);

    const newSO = {
        id: Date.now(),
        so_no: soNo,
        po_no: poNo,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        delivery_type: deliveryType,
        payment_type: paymentType,
        payment_date: paymentDateStr,
        vat_req: isVat,
        remarks: remarks,
        status: 'Pending', // ส่งไปรออนุมัติเสมอ
        payment_status: 'Unpaid',
        subtotal: subtotal,
        vat_amount: 0, // ยกเลิกการคิดภาษีเพิ่ม
        total_amount: subtotal,
        sales_person: this.currentUser.fullname,
        date: new Date().toISOString().split('T')[0],
        items: items
    };

    this.mockData.salesOrders.unshift(newSO);

    // Auto create Requisition ("เบิกเพื่อขาย") for inventory management approval
    const reqNo = 'REQ-' + new Date().getFullYear().toString().substring(2) + (new Date().getMonth()+1).toString().padStart(2,'0') + '-' + Math.floor(100+Math.random()*900);
    const newReq = {
        id: Date.now() + 1,
        so_id: newSO.id,
        so_no: soNo,
        req_no: reqNo,
        type: 'เบิกเพื่อขาย',
        status: 'Pending',
        req_by: this.currentUser.fullname,
        to_wh: `ลูกค้า: ${customer.name}`,
        req_method: deliveryType === 'เซลส์ส่งเอง' ? 'มารับสินค้าเอง (เซลส์ส่งเอง)' : 'จัดส่งตามที่อยู่',
        delivery_address: customer.address ? (typeof customer.address === 'object' ? `${customer.address.no||''} ${customer.address.road||''} ${customer.address.province||''}` : customer.address) : (customer.shipping_address || '-'),
        date: new Date().toISOString().split('T')[0],
        items: items.map(i => ({
            sku: i.sku,
            name: i.name,
            req_qty: i.qty,
            unit: i.unit,
            is_free: i.is_free,
            from_wh: 'W-MAIN'
        }))
    };
    this.mockData.requisitions.unshift(newReq);

    this.showToast('บันทึกใบสั่งขายเรียบร้อยแล้ว (ส่งไปรออนุมัติในระบบเบิกสินค้า)', 'success');
    this.closeModal();
    this.renderSalesOrders(document.getElementById('main-content'));
};

app.viewSalesOrderDetail = function(orderId) {
    const so = this.mockData.salesOrders.find(x => x.id === orderId);
    if (!so) return;

    let itemRows = (so.items || []).map(i => `
        <tr>
            <td class="p-3 font-mono text-xs">${i.sku}</td>
            <td class="p-3 font-bold">${i.name}</td>
            <td class="p-3 text-right font-mono">${i.qty} ${i.unit}</td>
            <td class="p-3 text-right font-mono">฿${(i.price||0).toLocaleString()}</td>
            <td class="p-3 text-right font-mono font-bold">฿${(i.qty * i.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">รายละเอียดเอกสารการขาย: ${so.so_no}</h3>
                        <p class="text-xs text-slate-500">ลูกค้า: ${so.customer_name} | เซลส์: ${so.sales_person}</p>
                    </div>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border text-sm">
                        <div><div class="text-xs text-slate-500">ยอดรวมสุทธิ</div><div class="font-bold text-lg text-blue-600 font-mono">฿${(so.total_amount||0).toLocaleString()}</div></div>
                        <div><div class="text-xs text-slate-500">สถานะเอกสาร</div><div class="font-bold">${so.status}</div></div>
                        <div><div class="text-xs text-slate-500">สถานะชำระเงิน</div><div class="font-bold">${so.payment_status}</div></div>
                        <div><div class="text-xs text-slate-500">วันที่</div><div class="font-bold text-xs">${so.date}</div></div>
                    </div>

                    <h4 class="font-bold text-slate-800">รายการสินค้า</h4>
                    <div class="border rounded-xl overflow-hidden">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-100 text-slate-600 font-bold">
                                <tr>
                                    <th class="p-3">SKU</th>
                                    <th class="p-3">สินค้า</th>
                                    <th class="p-3 text-right">จำนวน</th>
                                    <th class="p-3 text-right">ราคา/หน่วย</th>
                                    <th class="p-3 text-right">รวมเงิน</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">${itemRows}</tbody>
                        </table>
                    </div>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end items-center rounded-b-2xl">
                    <button onclick="app.closeModal()" class="px-5 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ปิด</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.printQuotation = function(orderId) {
    const so = this.mockData.salesOrders.find(x => x.id === orderId);
    if (!so) return;
    const comp = this.mockData.company;

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>ใบเสนอราคา ${so.so_no}</title>
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
                        <h2 class="text-xl font-bold text-slate-700 uppercase">ใบเสนอราคา (Quotation)</h2>
                        <p class="text-lg font-mono font-bold text-blue-600 mt-1">${so.so_no}</p>
                        <p class="text-sm text-slate-500">วันที่: ${so.date}</p>
                    </div>
                </div>

                <div class="bg-slate-50 p-4 rounded-xl border mb-6 text-sm">
                    <div class="font-bold text-slate-700 mb-1">ลูกค้า / Customer:</div>
                    <div class="font-bold text-lg">${so.customer_name}</div>
                    <div class="text-slate-600">โทรศัพท์: ${so.customer_phone || '-'}</div>
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
                        ${so.items.map((i, idx) => `
                            <tr>
                                <td class="p-3">${idx+1}</td>
                                <td class="p-3 font-bold">${i.name}</td>
                                <td class="p-3 text-right font-mono">${i.qty} ${i.unit}</td>
                                <td class="p-3 text-right font-mono">฿${i.price.toLocaleString()}</td>
                                <td class="p-3 text-right font-mono font-bold">฿${(i.qty * i.price).toLocaleString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot class="border-t bg-slate-50 font-bold">
                        <tr>
                            <td colspan="4" class="p-3 text-right">รวมเงินทั้งสิ้น:</td>
                            <td class="p-3 text-right font-mono text-lg text-blue-600">฿${so.total_amount.toLocaleString()}</td>
                        </tr>
                    </tfoot>
                </table>

                <div class="grid grid-cols-2 gap-8 text-center mt-12 pt-8 border-t text-sm">
                    <div>
                        <div class="h-16 border-b border-dashed"></div>
                        <p class="mt-2 font-bold">(${so.sales_person})</p>
                        <p class="text-slate-500 text-xs">พนักงานขาย</p>
                    </div>
                    <div>
                        <div class="h-16 border-b border-dashed"></div>
                        <p class="mt-2 font-bold">(${so.customer_name})</p>
                        <p class="text-slate-500 text-xs">ผู้ตกลงสั่งซื้อ</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
};

app.openInvoiceModal = function(orderId) {
    const so = this.mockData.salesOrders.find(x => x.id === orderId);
    if (!so) return;

    const invNo = 'INV-' + new Date().getFullYear().toString().substring(2) + (new Date().getMonth()+1).toString().padStart(2,'0') + '-' + Math.floor(100+Math.random()*900);

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-file-text text-amber-600 text-xl"></i> ออกใบแจ้งหนี้ / ใบเสร็จ
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 space-y-4">
                    <form id="inv-form" onsubmit="event.preventDefault(); app.saveInvoice(${orderId})" class="space-y-4">
                        <div class="bg-slate-50 p-3 rounded-xl border text-sm">
                            <div><strong>ลูกค้า:</strong> ${so.customer_name}</div>
                            <div><strong>อ้างอิง QT:</strong> ${so.so_no}</div>
                            <div><strong>ยอดเงินทั้งสิ้น:</strong> <span class="font-bold text-blue-600 font-mono">฿${so.total_amount.toLocaleString()}</span></div>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">เลขที่ Invoice *</label>
                            <input type="text" id="inv_no" value="${invNo}" class="w-full border rounded-xl px-3 py-2 text-sm font-mono font-bold" required readonly>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">วันที่ออกใบแจ้งหนี้ *</label>
                            <input type="date" id="inv_date" value="${new Date().toISOString().split('T')[0]}" class="w-full border rounded-xl px-3 py-2 text-sm" required>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="inv-form" class="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-sm">ยืนยันออก Invoice</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveInvoice = function(orderId) {
    const so = this.mockData.salesOrders.find(x => x.id === orderId);
    if (!so) return;

    so.status = 'Invoiced';
    so.inv_no = document.getElementById('inv_no').value;

    this.showToast('ออกใบแจ้งหนี้ Invoice เรียบร้อยแล้ว', 'success');
    this.closeModal();
    this.renderSalesOrders(document.getElementById('main-content'));
};

// ==========================================
// SALES RECEIPTS (การรับชำระเงินจากลูกค้า AR)
// ==========================================

app.renderSalesReceipts = function(container) {
    const receipts = this.mockData.salesReceipts || [];
    let rows = receipts.map(sr => {
        let statusBadge = '';
        if (sr.status === 'Pending') statusBadge = '<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">Pending (รอตรวจสอบ)</span>';
        else if (sr.status === 'Approved') statusBadge = '<span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">Approved (อนุมัติแล้ว)</span>';

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-mono text-xs text-slate-500">${sr.date}</td>
                <td class="px-6 py-4 font-bold text-slate-800">${sr.customer_name}</td>
                <td class="px-6 py-4 font-mono font-bold text-blue-600">${sr.so_no}</td>
                <td class="px-6 py-4 font-mono font-bold text-emerald-600 text-right">฿${(sr.amount||0).toLocaleString()}</td>
                <td class="px-6 py-4"><span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold border">${sr.method}</span></td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-xs text-slate-500">${sr.sales_person}</td>
                <td class="px-6 py-4 text-center">
                    ${sr.status === 'Pending' ? `
                    <button onclick="app.openApproveReceiptModal(${sr.id})" class="text-amber-600 hover:text-amber-700 p-1.5 rounded-lg hover:bg-amber-50 font-bold text-xs border border-amber-300" title="ตรวจสอบสลิป/อนุมัติ">
                        <i class="ph ph-check mr-1"></i> ตรวจสอบ
                    </button>` : '<i class="ph ph-check-circle text-emerald-500 text-xl"></i>'}
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">บัญชีลูกหนี้/รับชำระเงิน (Accounts Receivable)</h2>
                <p class="text-slate-500 text-sm">ตรวจสอบรายการรับชำระเงิน สลิปโอนเงิน และตัดหนี้ลูกค้ารายการขาย</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-6 py-4">วันที่รับชำระ</th>
                        <th class="px-6 py-4">ชื่อลูกค้า</th>
                        <th class="px-6 py-4">อ้างอิง SO/INV</th>
                        <th class="px-6 py-4 text-right">จำนวนเงิน (บาท)</th>
                        <th class="px-6 py-4">ช่องทาง</th>
                        <th class="px-6 py-4">สถานะ</th>
                        <th class="px-6 py-4">ผู้บันทึก</th>
                        <th class="px-6 py-4 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${rows || '<tr><td colspan="8" class="text-center py-8 text-slate-400">ยังไม่มีรายการรับชำระเงิน</td></tr>'}</tbody>
            </table>
        </div>
    `;
};

app.openApproveReceiptModal = function(receiptId) {
    const sr = this.mockData.salesReceipts.find(x => x.id === receiptId);
    if (!sr) return;

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-check-circle text-emerald-600 text-xl"></i> ตรวจสอบสลิปการรับชำระเงิน
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 space-y-4">
                    <div class="bg-slate-50 p-4 rounded-xl border text-sm space-y-2">
                        <div><span class="text-slate-500">ลูกค้า:</span> <strong>${sr.customer_name}</strong></div>
                        <div><span class="text-slate-500">อ้างอิง SO:</span> <strong>${sr.so_no}</strong></div>
                        <div><span class="text-slate-500">จำนวนเงิน:</span> <strong class="text-lg text-emerald-600 font-mono">฿${sr.amount.toLocaleString()}</strong></div>
                        <div><span class="text-slate-500">วิธีการชำระ:</span> ${sr.method}</div>
                        <div><span class="text-slate-500">วันที่:</span> ${sr.date}</div>
                    </div>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="button" onclick="app.saveApproveReceipt(${receiptId})" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm">อนุมัติรับชำระเงิน</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.saveApproveReceipt = function(receiptId) {
    const sr = this.mockData.salesReceipts.find(x => x.id === receiptId);
    if (!sr) return;

    sr.status = 'Approved';
    const so = this.mockData.salesOrders.find(x => x.so_no === sr.so_no);
    if (so) {
        so.payment_status = 'Paid';
        so.status = 'Completed';
    }

    this.showToast('อนุมัติการรับชำระเงินและปรับสถานะเป็น Completed เรียบร้อย', 'success');
    this.closeModal();
    this.renderSalesReceipts(document.getElementById('main-content'));
};

// ==========================================
// CUSTOMERS MANAGEMENT (จัดการข้อมูลลูกค้า/ร้านค้า)
// ==========================================

app.renderCustomers = function(container, selectedSalesFilter = 'ALL') {
    const customers = this.mockData.customers || [];
    const role = this.currentUser.role;
    const isSales = role === 'sales';

    // Filter customers: sales sees only their assigned customers, admin/management sees all (or filtered by selected sales)
    let filteredCustomers = customers;
    if (isSales) {
        filteredCustomers = customers.filter(c => (c.assigned_sales || []).includes(this.currentUser.username));
    } else if (selectedSalesFilter && selectedSalesFilter !== 'ALL') {
        filteredCustomers = customers.filter(c => (c.assigned_sales || []).includes(selectedSalesFilter));
    }

    let rows = filteredCustomers.map(c => {
        const assigned = c.assigned_sales || [];
        let displaySales = [];
        if (['admin', 'management'].includes(role)) {
            displaySales = assigned;
        } else {
            // Sales user: filter out admin/management from display list
            displaySales = assigned.filter(uName => {
                const u = (this.mockData.users || []).find(x => x.username === uName);
                return u && u.role === 'sales';
            });
        }

        const salesText = displaySales.map(uName => {
            const u = (this.mockData.users || []).find(x => x.username === uName);
            return u ? u.fullname : uName;
        }).join(', ') || '-';

        const vatBadge = c.vat_req 
            ? '<span class="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200"><i class="ph ph-receipt mr-1"></i>ออก VAT</span>'
            : '<span class="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs border">ไม่ออก VAT</span>';

        return `
            <tr class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 font-mono font-bold text-blue-600">${c.code}</td>
                <td class="px-6 py-4 font-bold text-slate-800">
                    <div>${c.name}</div>
                    ${c.vat_req && c.tax_name ? `<div class="text-xs text-slate-400 font-normal"><i class="ph ph-buildings mr-1"></i>${c.tax_name}</div>` : ''}
                </td>
                <td class="px-6 py-4 text-slate-600">${c.contact || '-'}</td>
                <td class="px-6 py-4 text-xs text-slate-600">
                    <div><i class="ph ph-phone text-blue-500 mr-1"></i> ${c.phone || '-'}</div>
                    ${c.line_id ? `<div><i class="ph ph-chat-circle-dots text-emerald-500 mr-1"></i> Line: ${c.line_id}</div>` : ''}
                </td>
                <td class="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title="${this.formatAddr(c.address)}">
                    <div><strong>ที่ตั้ง:</strong> ${this.formatAddr(c.address)}</div>
                    ${c.shipping_differs && c.shipping_address ? `<div class="text-emerald-600 font-medium"><strong>จัดส่ง:</strong> ${this.formatAddr(c.shipping_address)}</div>` : ''}
                </td>
                <td class="px-6 py-4">${vatBadge}</td>
                <td class="px-6 py-4 text-xs text-purple-700 font-bold">${salesText}</td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                    <button onclick="app.viewCustomerDetail(${c.id})" class="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100" title="ดูรายละเอียด">
                        <i class="ph ph-eye text-lg"></i>
                    </button>
                    <button onclick="app.openCustomerModal(${c.id})" class="text-slate-500 hover:text-amber-600 p-1.5 rounded-lg hover:bg-slate-100 ml-1" title="แก้ไขข้อมูล">
                        <i class="ph ph-pencil-simple text-lg"></i>
                    </button>
                    ${!isSales ? `
                    <button onclick="app.deleteCustomer(${c.id})" class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 ml-1" title="ลบลูกค้า">
                        <i class="ph ph-trash text-lg"></i>
                    </button>` : ''}
                </td>
            </tr>
        `;
    }).join('');

    let salesFilterHtml = '';
    if (['admin', 'management'].includes(role)) {
        const salesUsers = (this.mockData.users || []).filter(u => u.role === 'sales');
        let salesOpts = salesUsers.map(u => `<option value="${u.username}" ${selectedSalesFilter === u.username ? 'selected' : ''}>${u.fullname} (${u.username})</option>`).join('');
        salesFilterHtml = `
            <div class="bg-white border rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2">
                <i class="ph ph-funnel text-slate-400 text-base"></i>
                <span class="text-xs font-bold text-slate-600">กรองตามเซลส์:</span>
                <select id="cust-sales-filter" onchange="app.filterCustomersBySales()" class="bg-transparent text-xs font-bold text-slate-800 outline-none">
                    <option value="ALL" ${selectedSalesFilter === 'ALL' ? 'selected' : ''}>เซลส์ทุกคน (All Sales)</option>
                    ${salesOpts}
                </select>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">จัดการข้อมูลลูกค้า/ร้านค้า (Customer Management)</h2>
                <p class="text-slate-500 text-sm">จัดการรายชื่อลูกค้า ที่อยู่จัดส่ง ข้อมูลภาษี และเซลส์ผู้ดูแล</p>
            </div>
            <div class="flex items-center gap-3">
                ${salesFilterHtml}
                <button onclick="app.openCustomerModal()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                    <i class="ph ph-user-plus text-lg"></i> เพิ่มลูกค้าใหม่
                </button>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-6 py-4">รหัสลูกค้า</th>
                        <th class="px-6 py-4">ชื่อร้านค้า / บริษัท</th>
                        <th class="px-6 py-4">ผู้ติดต่อ</th>
                        <th class="px-6 py-4">เบอร์โทร / Line</th>
                        <th class="px-6 py-4">ที่ตั้งร้านค้า/ที่อยู่จัดส่ง</th>
                        <th class="px-6 py-4">เงื่อนไขภาษี</th>
                        <th class="px-6 py-4">เซลส์ผู้ดูแล</th>
                        <th class="px-6 py-4 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${rows || '<tr><td colspan="8" class="text-center py-8 text-slate-400">ยังไม่มีข้อมูลลูกค้าในระบบ</td></tr>'}</tbody>
            </table>
        </div>
    `;
};

app.filterCustomersBySales = function() {
    const selSales = document.getElementById('cust-sales-filter')?.value || 'ALL';
    this.renderCustomers(document.getElementById('main-content'), selSales);
};

app.openCustomerModal = function(customerId = null) {
    const c = customerId ? this.mockData.customers.find(x => x.id === customerId) : null;
    const nextCode = 'CUS-' + (this.mockData.customers.length + 1).toString().padStart(3, '0');
    
    // Sales choices
    const salesUsers = this.mockData.users.filter(u => u.role === 'sales');
    const assignedSales = c ? (c.assigned_sales || []) : [this.currentUser.username];

    const salesCheckboxes = salesUsers.map(u => `
        <label class="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border text-xs cursor-pointer hover:bg-slate-100">
            <input type="checkbox" name="cus_sales[]" value="${u.username}" ${assignedSales.includes(u.username) ? 'checked' : ''} class="rounded text-blue-600 focus:ring-blue-500">
            <span class="font-bold text-slate-700">${u.fullname} (${u.username})</span>
        </label>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-users-three text-blue-600 text-xl"></i> ${c ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้า/ร้านค้าใหม่'}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <form id="customer-form" onsubmit="event.preventDefault(); app.saveCustomer(${customerId || 'null'})" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">รหัสลูกค้า *</label>
                                <input type="text" id="cus_code" name="cus_code" value="${c?.code || nextCode}" class="w-full border rounded-lg px-3 py-2 text-sm font-mono font-bold" required>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อร้านค้า / ชื่อบริษัท *</label>
                                <input type="text" id="cus_name" name="cus_name" value="${c?.name || ''}" placeholder="ระบุชื่อลูกค้าหรือบริษัท..." class="w-full border rounded-lg px-3 py-2 text-sm" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ติดต่อ</label>
                                <input type="text" id="cus_contact" name="cus_contact" value="${c?.contact || ''}" class="w-full border rounded-lg px-3 py-2 text-sm">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                                <input type="text" id="cus_phone" name="cus_phone" value="${c?.phone || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-2 text-sm font-mono" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Line ID</label>
                                <input type="text" id="cus_line" name="cus_line" value="${c?.line_id || ''}" class="w-full border rounded-lg px-3 py-2 text-sm">
                            </div>
                        </div>

                        <!-- Store Location -->
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm mb-2"><i class="ph ph-map-pin text-red-500 mr-1"></i> ที่ตั้งร้านค้า</h4>
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border">
                                <div><label class="text-xs text-slate-500 font-bold">บ้านเลขที่ / อาคาร</label><input type="text" id="ca_no" name="ca_no" value="${c?.address?.no || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                <div><label class="text-xs text-slate-500 font-bold">หมู่ที่</label><input type="text" id="ca_moo" name="ca_moo" value="${c?.address?.moo || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                <div><label class="text-xs text-slate-500 font-bold">ถนน</label><input type="text" id="ca_road" name="ca_road" value="${c?.address?.road || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                <div><label class="text-xs text-slate-500 font-bold">แขวง/ตำบล</label><input type="text" id="ca_subd" name="ca_subd" value="${c?.address?.subdistrict || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                <div><label class="text-xs text-slate-500 font-bold">เขต/อำเภอ</label><input type="text" id="ca_dist" name="ca_dist" value="${c?.address?.district || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                <div><label class="text-xs text-slate-500 font-bold">จังหวัด</label><input type="text" id="ca_prov" name="ca_prov" value="${c?.address?.province || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                <div><label class="text-xs text-slate-500 font-bold">รหัสไปรษณีย์</label><input type="text" id="ca_zip" name="ca_zip" value="${c?.address?.zip || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-1.5 text-sm font-mono"></div>
                            </div>
                        </div>

                        <!-- Separate Shipping Address Toggle -->
                        <div class="border rounded-xl p-4 bg-emerald-50/40 border-emerald-200">
                            <label class="inline-flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="cus_shipping_differs" name="cus_shipping_differs" onchange="app.toggleCustomerShippingForm()" ${c?.shipping_differs ? 'checked' : ''} class="w-4 h-4 text-emerald-600 rounded">
                                <span class="font-bold text-slate-800 text-sm">กำหนดที่จัดส่งสินค้า (แยกจากที่ตั้งร้านค้า)</span>
                            </label>
                            
                            <div id="cus-shipping-box" class="${c?.shipping_differs ? '' : 'hidden'} mt-3 pt-3 border-t border-emerald-200 space-y-2">
                                <h5 class="text-xs font-bold text-emerald-800"><i class="ph ph-truck mr-1"></i> ข้อมูลสถานที่จัดส่งสินค้า</h5>
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-3 bg-white p-3 rounded-lg border">
                                    <div><label class="text-xs text-slate-500 font-bold">บ้านเลขที่ / อาคาร</label><input type="text" id="sa_no" value="${c?.shipping_address?.no || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                    <div><label class="text-xs text-slate-500 font-bold">หมู่ที่</label><input type="text" id="sa_moo" value="${c?.shipping_address?.moo || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                    <div><label class="text-xs text-slate-500 font-bold">ถนน</label><input type="text" id="sa_road" value="${c?.shipping_address?.road || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                    <div><label class="text-xs text-slate-500 font-bold">แขวง/ตำบล</label><input type="text" id="sa_subd" value="${c?.shipping_address?.subdistrict || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                    <div><label class="text-xs text-slate-500 font-bold">เขต/อำเภอ</label><input type="text" id="sa_dist" value="${c?.shipping_address?.district || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                    <div><label class="text-xs text-slate-500 font-bold">จังหวัด</label><input type="text" id="sa_prov" value="${c?.shipping_address?.province || ''}" class="w-full border rounded-lg px-3 py-1.5 text-sm"></div>
                                    <div><label class="text-xs text-slate-500 font-bold">รหัสไปรษณีย์</label><input type="text" id="sa_zip" value="${c?.shipping_address?.zip || ''}" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-1.5 text-sm font-mono"></div>
                                </div>
                            </div>
                        </div>

                        <!-- VAT Settings -->
                        <div class="border rounded-xl p-4 bg-blue-50/50 border-blue-200 space-y-3">
                            <label class="inline-flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" id="cus_vat_req" name="cus_vat_req" onchange="app.toggleCustomerVat()" ${c?.vat_req ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded">
                                <span class="font-bold text-slate-800 text-sm">ต้องการออกใบกำกับภาษีเต็มรูปแบบ (VAT 7%)</span>
                            </label>

                            <div id="cus-vat-box" class="${c?.vat_req ? '' : 'hidden'} space-y-3 pt-2 border-t border-blue-200">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">ชื่อในใบกำกับภาษี *</label>
                                        <input type="text" id="cus_tax_name" name="cus_tax_name" value="${c?.tax_name || ''}" class="w-full border rounded-lg px-3 py-2 text-sm bg-white">
                                    </div>
                                    <div>
                                        <label class="block text-xs font-bold text-slate-700 mb-1">เลขประจำตัวผู้เสียภาษี (13 หลัก)</label>
                                        <input type="text" id="cus_tax_id" name="cus_tax_id" value="${c?.tax_id || ''}" maxlength="13" oninput="app.allowOnlyNumbers(event)" class="w-full border rounded-lg px-3 py-2 text-sm font-mono bg-white">
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 mb-1">ที่อยู่ออกใบกำกับภาษี</label>
                                    <textarea id="cus_tax_address" name="cus_tax_address" class="w-full border rounded-lg px-3 py-2 text-sm bg-white" rows="2">${c?.tax_address || ''}</textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Assigned Sales -->
                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-2">พนักงานขายที่ดูแลลูกค้า (Assigned Sales)</label>
                            <div class="flex flex-wrap gap-2">
                                ${salesCheckboxes}
                            </div>
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold">ยกเลิก</button>
                    <button type="submit" form="customer-form" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm">บันทึกข้อมูลลูกค้า</button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.toggleCustomerShippingForm = function() {
    const isChecked = document.getElementById('cus_shipping_differs')?.checked;
    const box = document.getElementById('cus-shipping-box');
    if (box) {
        if (isChecked) box.classList.remove('hidden');
        else box.classList.add('hidden');
    }
};

app.toggleCustomerVat = function() {
    const isChecked = document.getElementById('cus_vat_req')?.checked;
    const vatBox = document.getElementById('cus-vat-box');
    if (vatBox) {
        if (isChecked) vatBox.classList.remove('hidden');
        else vatBox.classList.add('hidden');
    }
};

app.saveCustomer = function(customerId) {
    const code = document.getElementById('cus_code').value.trim();
    const name = document.getElementById('cus_name').value.trim();
    const contact = document.getElementById('cus_contact').value.trim();
    const phone = document.getElementById('cus_phone').value.trim();
    const line = document.getElementById('cus_line').value.trim();

    const addr = {
        no: document.getElementById('ca_no').value.trim(),
        moo: document.getElementById('ca_moo').value.trim(),
        road: document.getElementById('ca_road').value.trim(),
        subdistrict: document.getElementById('ca_subd').value.trim(),
        district: document.getElementById('ca_dist').value.trim(),
        province: document.getElementById('ca_prov').value.trim(),
        zip: document.getElementById('ca_zip').value.trim()
    };

    const shippingDiffers = document.getElementById('cus_shipping_differs')?.checked || false;
    let shippingAddr = null;
    if (shippingDiffers) {
        shippingAddr = {
            no: document.getElementById('sa_no')?.value.trim() || '',
            moo: document.getElementById('sa_moo')?.value.trim() || '',
            road: document.getElementById('sa_road')?.value.trim() || '',
            subdistrict: document.getElementById('sa_subd')?.value.trim() || '',
            district: document.getElementById('sa_dist')?.value.trim() || '',
            province: document.getElementById('sa_prov')?.value.trim() || '',
            zip: document.getElementById('sa_zip')?.value.trim() || ''
        };
    }

    const vatReq = document.getElementById('cus_vat_req').checked;
    const taxName = vatReq ? document.getElementById('cus_tax_name').value.trim() : '';
    const taxId = vatReq ? document.getElementById('cus_tax_id').value.trim() : '';
    const taxAddress = vatReq ? document.getElementById('cus_tax_address').value.trim() : '';

    const salesInputs = document.querySelectorAll('[name="cus_sales[]"]:checked');
    const assignedSales = Array.from(salesInputs).map(cb => cb.value);

    if (!name || !phone) {
        this.showToast('กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์', 'error');
        return;
    }

    const cusObj = {
        code: code,
        name: name,
        contact: contact,
        phone: phone,
        line_id: line,
        address: addr,
        shipping_differs: shippingDiffers,
        shipping_address: shippingAddr,
        vat_req: vatReq,
        tax_name: taxName,
        tax_id: taxId,
        tax_address: taxAddress,
        assigned_sales: assignedSales.length ? assignedSales : [this.currentUser.username]
    };

    if (customerId) {
        const idx = this.mockData.customers.findIndex(x => x.id === customerId);
        if (idx > -1) {
            cusObj.id = customerId;
            this.mockData.customers[idx] = cusObj;
        }
    } else {
        cusObj.id = Date.now();
        this.mockData.customers.push(cusObj);
    }

    this.showToast('บันทึกข้อมูลลูกค้าเรียบร้อยแล้ว', 'success');
    this.closeModal();
    this.renderCustomers(document.getElementById('main-content'));
};

app.deleteCustomer = function(customerId) {
    this.showConfirm(
        'ลบข้อมูลลูกค้า?', 
        'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้ารายนี้ออกจากระบบ?', 
        `app.mockData.customers = app.mockData.customers.filter(c => c.id !== ${customerId}); app.renderCustomers(document.getElementById('main-content'));`
    );
};

app.viewCustomerDetail = function(customerId) {
    const c = this.mockData.customers.find(x => x.id === customerId);
    if (!c) return;

    const customerSO = (this.mockData.salesOrders || []).filter(so => so.customer_name === c.name || so.customer_id === c.id);
    const totalSpent = customerSO.reduce((sum, so) => sum + (so.total_amount || 0), 0);

    let soRows = customerSO.map(so => `
        <tr>
            <td class="p-3 font-mono font-bold text-blue-600">${so.so_no}</td>
            <td class="p-3 text-xs text-slate-500">${so.date}</td>
            <td class="p-3 text-right font-mono font-bold">฿${(so.total_amount||0).toLocaleString()}</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-bold border ${so.status==='Completed'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-amber-50 text-amber-700 border-amber-200'}">${so.status}</span></td>
        </tr>
    `).join('');

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">${c.name} (${c.code})</h3>
                        <p class="text-xs text-slate-500">ผู้ติดต่อ: ${c.contact || '-'} | โทร: ${c.phone || '-'}</p>
                    </div>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 overflow-y-auto space-y-4">
                    <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border text-sm">
                        <div>
                            <div class="text-xs text-slate-500 font-bold">ที่อยู่ตามทะเบียน</div>
                            <div class="text-slate-700 mt-1">${this.formatAddr(c.address)}</div>
                        </div>
                        <div>
                            <div class="text-xs text-slate-500 font-bold">ยอดซื้อสะสมรวม</div>
                            <div class="text-xl font-mono font-bold text-blue-600 mt-1">฿${totalSpent.toLocaleString()}</div>
                        </div>
                    </div>

                    ${c.vat_req ? `
                    <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-200 text-sm space-y-1">
                        <div class="font-bold text-blue-800"><i class="ph ph-file-text mr-1"></i> ข้อมูลใบกำกับภาษี</div>
                        <div><strong>ชื่อนิติบุคคล:</strong> ${c.tax_name || '-'}</div>
                        <div><strong>เลขผู้เสียภาษี:</strong> <span class="font-mono">${c.tax_id || '-'}</span></div>
                        <div><strong>ที่อยู่ภาษี:</strong> ${c.tax_address || '-'}</div>
                    </div>` : ''}

                    <h4 class="font-bold text-slate-800 text-sm">ประวัติสั่งซื้อล่าสุด</h4>
                    <div class="border rounded-xl overflow-hidden">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-slate-100 text-slate-600 font-bold">
                                <tr>
                                    <th class="p-3">SO No.</th>
                                    <th class="p-3">วันที่</th>
                                    <th class="p-3 text-right">ยอดเงิน</th>
                                    <th class="p-3">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">${soRows || '<tr><td colspan="4" class="text-center py-4 text-slate-400">ยังไม่มีประวัติสั่งซื้อ</td></tr>'}</tbody>
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

// ==========================================
// SALES ORDER HISTORY (ประวัติการสั่งซื้อลูกค้า)
// ==========================================

app.renderSOHistory = function(container) {
    const orders = this.mockData.salesOrders || [];
    const totalRev = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const completedRev = orders.filter(o => o.status === 'Completed').reduce((s, o) => s + (o.total_amount || 0), 0);

    let rows = orders.map(so => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-6 py-4 font-mono font-bold text-blue-600">${so.so_no}</td>
            <td class="px-6 py-4 font-medium text-slate-800">${so.customer_name}</td>
            <td class="px-6 py-4 text-xs text-slate-500">${so.date}</td>
            <td class="px-6 py-4 text-xs text-slate-600">${so.sales_person || so.created_by}</td>
            <td class="px-6 py-4 font-mono font-bold text-right text-slate-800">฿${(so.total_amount || 0).toLocaleString()}</td>
            <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-full text-xs font-bold border ${so.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}">
                    ${so.status}
                </span>
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="app.viewSalesOrderDetail(${so.id})" class="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100" title="ดูรายละเอียด">
                    <i class="ph ph-eye text-lg"></i>
                </button>
                <button onclick="app.printQuotation(${so.id})" class="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 ml-1" title="พิมพ์เอกสาร">
                    <i class="ph ph-printer text-lg"></i>
                </button>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">ประวัติการสั่งซื้อลูกค้า (Sales Order History)</h2>
                <p class="text-slate-500 text-sm">ค้นหาและตรวจสอบประวัติคำสั่งซื้อ ยอดขายย้อนหลังแยกตามลูกค้า</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-2xl p-5 border shadow-sm border-l-4 border-l-blue-500">
                <div class="text-xs text-slate-500 font-bold uppercase">จำนวนคำสั่งซื้อทั้งหมด</div>
                <div class="text-2xl font-black text-slate-800 mt-1">${orders.length} <span class="text-sm font-normal text-slate-500">รายการ</span></div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm border-l-4 border-l-emerald-500">
                <div class="text-xs text-slate-500 font-bold uppercase">ยอดขายที่เสร็จสมบูรณ์</div>
                <div class="text-2xl font-black text-emerald-600 mt-1 font-mono">฿${completedRev.toLocaleString()}</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm border-l-4 border-l-purple-500">
                <div class="text-xs text-slate-500 font-bold uppercase">ยอดขายรวมคำสั่งซื้อทั้งหมด</div>
                <div class="text-2xl font-black text-purple-600 mt-1 font-mono">฿${totalRev.toLocaleString()}</div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-6 py-4">เลขที่ QT/SO</th>
                        <th class="px-6 py-4">ชื่อลูกค้า</th>
                        <th class="px-6 py-4">วันที่สั่งซื้อ</th>
                        <th class="px-6 py-4">ผู้ดูแลการขาย</th>
                        <th class="px-6 py-4 text-right">ยอดรวมสุทธิ (บาท)</th>
                        <th class="px-6 py-4">สถานะ</th>
                        <th class="px-6 py-4 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${rows || '<tr><td colspan="7" class="text-center py-8 text-slate-400">ยังไม่มีประวัติการสั่งซื้อ</td></tr>'}</tbody>
            </table>
        </div>
    `;
};

app.requestSalesRequisition = function(soId) {
    const so = (this.mockData.salesOrders || []).find(s => s.id === soId);
    if (!so) return;

    let existingReq = (this.mockData.requisitions || []).find(r => r.so_id === so.id || r.so_no === so.so_no);
    if (existingReq) {
        this.showToast(`รายการสั่งขาย ${so.so_no} มีใบขอเบิกอยู่ในระบบแล้ว (${existingReq.req_no})`, 'warning');
        return;
    }

    const cus = (this.mockData.customers || []).find(c => c.id === so.customer_id || c.name === so.customer_name);
    let addr = '-';
    if (cus) {
        addr = cus.shipping_differs && cus.shipping_address ? (typeof cus.shipping_address === 'object' ? this.formatAddr(cus.shipping_address) : cus.shipping_address) : (typeof cus.address === 'object' ? this.formatAddr(cus.address) : cus.address);
    }

    const reqItems = (so.items || []).map(i => ({
        sku: i.sku,
        name: i.name,
        req_qty: i.qty,
        unit: i.unit || 'กล่อง',
        is_free: i.is_free || false
    }));

    const newReq = {
        id: Date.now(),
        so_id: so.id,
        so_no: so.so_no,
        req_no: `REQ-2607-0${this.mockData.requisitions.length + 1}`,
        type: 'เบิกเพื่อขาย',
        status: 'Pending',
        req_by: so.sales_person || (this.currentUser ? this.currentUser.fullname : 'Sales'),
        to_wh: `ลูกค้า: ${so.customer_name}`,
        req_method: 'จัดส่งตามที่อยู่',
        delivery_address: addr,
        date: new Date().toISOString().split('T')[0],
        items: reqItems
    };

    this.mockData.requisitions.unshift(newReq);
    so.status = 'Pending';
    this.showToast(`สร้างใบขอเบิกเพื่อขาย ${newReq.req_no} สำหรับ ${so.so_no} เรียบร้อยแล้ว`, 'success');
    if (document.getElementById('main-content')) {
        this.renderSalesOrders(document.getElementById('main-content'));
    }
};
