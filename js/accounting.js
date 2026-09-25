/**
 * OMS (Operation Management System) - Accounting & Financial Reports Module
 * File: js/accounting.js
 */

// ==========================================
// ACCOUNTING & FINANCIAL REPORTS (รายงานบัญชีและการเงิน)
// ==========================================

app.renderAccounting = function(container) {
    const salesOrders = this.mockData.salesOrders || [];
    const purchaseOrders = this.mockData.purchaseOrders || [];
    const salesReceipts = this.mockData.salesReceipts || [];
    const purchasePayments = this.mockData.purchasePayments || [];

    // Financial Metrics Calculation
    const totalSalesRev = salesOrders.reduce((sum, so) => sum + (so.total_amount || 0), 0);
    const totalPurchaseExp = purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0);
    const totalCollected = salesReceipts.filter(r => r.status === 'Approved' || r.status === 'Verified').reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalPaidPO = purchasePayments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingAR = totalSalesRev - totalCollected;
    const pendingAP = purchaseOrders.reduce((sum, po) => sum + (po.unpaid_amount > 0 ? po.unpaid_amount : 0), 0);
    const grossProfit = totalSalesRev - totalPurchaseExp;

    // Accounts Receivable Table Rows
    let arRows = salesOrders.map(so => {
        const paidAmount = salesReceipts.filter(r => r.so_no === so.so_no && (r.status === 'Approved' || r.status === 'Verified')).reduce((s, r) => s + (r.amount || 0), 0);
        const unpaidAmount = Math.max(0, (so.total_amount || 0) - paidAmount);
        
        let statusBadge = '';
        if (unpaidAmount <= 0) statusBadge = '<span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">ชำระครบแล้ว</span>';
        else if (paidAmount > 0) statusBadge = '<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">ชำระแล้วบางส่วน</span>';
        else statusBadge = '<span class="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">ตั้งหนี้ / รอชำระ</span>';

        return `
            <tr class="hover:bg-slate-50 transition-colors text-sm">
                <td class="px-6 py-4 font-mono font-bold text-blue-600">${so.so_no}</td>
                <td class="px-6 py-4 font-medium text-slate-800">${so.customer_name}</td>
                <td class="px-6 py-4 text-xs text-slate-500">${so.date}</td>
                <td class="px-6 py-4 text-xs text-slate-600 font-mono">${so.due_date || '-'}</td>
                <td class="px-6 py-4 text-right font-mono font-bold text-slate-800">฿${(so.total_amount||0).toLocaleString()}</td>
                <td class="px-6 py-4 text-right font-mono text-emerald-600 font-bold">฿${paidAmount.toLocaleString()}</td>
                <td class="px-6 py-4 text-right font-mono text-red-600 font-bold">฿${unpaidAmount.toLocaleString()}</td>
                <td class="px-6 py-4">${statusBadge}</td>
            </tr>
        `;
    }).join('');

    // Accounts Payable Table Rows
    let apRows = purchaseOrders.map(po => {
        let statusBadge = '';
        if (po.unpaid_amount <= 0) statusBadge = '<span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">ชำระเจ้าหนี้ครบแล้ว</span>';
        else if (po.unpaid_amount < po.total_amount) statusBadge = '<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">ชำระแล้วบางส่วน</span>';
        else statusBadge = '<span class="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">ค้างชำระเจ้าหนี้</span>';

        return `
            <tr class="hover:bg-slate-50 transition-colors text-sm">
                <td class="px-6 py-4 font-mono font-bold text-orange-600">${po.po_no}</td>
                <td class="px-6 py-4 font-medium text-slate-800">${po.vendor_name}</td>
                <td class="px-6 py-4 text-xs text-slate-500">${po.date}</td>
                <td class="px-6 py-4 text-right font-mono font-bold text-slate-800">฿${(po.total_amount||0).toLocaleString()}</td>
                <td class="px-6 py-4 text-right font-mono text-emerald-600 font-bold">฿${((po.total_amount||0) - Math.max(0, po.unpaid_amount||0)).toLocaleString()}</td>
                <td class="px-6 py-4 text-right font-mono text-red-600 font-bold">฿${Math.max(0, po.unpaid_amount||0).toLocaleString()}</td>
                <td class="px-6 py-4">${statusBadge}</td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">รายงานบัญชีและการเงิน (Accounting & Financial Statements)</h2>
                <p class="text-slate-500 text-sm">สรุปยอดขาย ต้นทุน รายรับ-รายจ่าย บัญชีลูกหนี้ (AR) และเจ้าหนี้การค้า (AP)</p>
            </div>
            <button onclick="app.printFinancialReport()" class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm flex items-center gap-2 transition-all">
                <i class="ph ph-printer text-lg"></i> พิมพ์รายงานสรุปงบการเงิน
            </button>
        </div>

        <!-- Metric Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div class="bg-white rounded-2xl p-5 border shadow-sm border-l-4 border-l-blue-500">
                <div class="text-xs text-slate-500 font-bold uppercase">ยอดขายรวม (Gross Revenues)</div>
                <div class="text-2xl font-black text-blue-600 mt-1 font-mono">฿${totalSalesRev.toLocaleString()}</div>
                <div class="text-xs text-slate-400 mt-2">รับเงินแล้ว: ฿${totalCollected.toLocaleString()}</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm border-l-4 border-l-orange-500">
                <div class="text-xs text-slate-500 font-bold uppercase">ยอดซื้อจัดสินค้า (Purchases)</div>
                <div class="text-2xl font-black text-orange-600 mt-1 font-mono">฿${totalPurchaseExp.toLocaleString()}</div>
                <div class="text-xs text-slate-400 mt-2">จ่ายแล้ว: ฿${totalPaidPO.toLocaleString()}</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm border-l-4 border-l-red-500">
                <div class="text-xs text-slate-500 font-bold uppercase">ลูกหนี้ค้างชำระ (Pending AR)</div>
                <div class="text-2xl font-black text-red-600 mt-1 font-mono">฿${pendingAR.toLocaleString()}</div>
                <div class="text-xs text-slate-400 mt-2">ยอดเก็บเงินคงค้าง</div>
            </div>
            <div class="bg-white rounded-2xl p-5 border shadow-sm border-l-4 border-l-emerald-500">
                <div class="text-xs text-slate-500 font-bold uppercase">กำไรขั้นต้นประมาณการ</div>
                <div class="text-2xl font-black ${grossProfit >= 0 ? 'text-emerald-600' : 'text-red-600'} mt-1 font-mono">฿${grossProfit.toLocaleString()}</div>
                <div class="text-xs text-slate-400 mt-2">ยอดขาย ลบ ยอดจัดซื้อ</div>
            </div>
        </div>

        <!-- Tabs for AR / AP -->
        <div class="bg-white rounded-2xl shadow-sm border p-6 space-y-8">
            <div>
                <div class="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-receipt text-blue-600 text-xl"></i> บัญชีลูกหนี้การค้า (Accounts Receivable - AR)
                    </h3>
                    <span class="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                        คงค้างชำระรวม: ฿${pendingAR.toLocaleString()}
                    </span>
                </div>
                <div class="overflow-x-auto border rounded-xl">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 border-b text-slate-600 font-bold text-sm">
                            <tr>
                                <th class="px-6 py-4">เลขที่ SO</th>
                                <th class="px-6 py-4">ลูกค้า / ร้านค้า</th>
                                <th class="px-6 py-4">วันที่เปิด SO</th>
                                <th class="px-6 py-4">วันครบกำหนด</th>
                                <th class="px-6 py-4 text-right">ยอดรวม (บาท)</th>
                                <th class="px-6 py-4 text-right">ชำระแล้ว</th>
                                <th class="px-6 py-4 text-right">คงค้าง</th>
                                <th class="px-6 py-4">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">${arRows || '<tr><td colspan="8" class="text-center py-6 text-slate-400">ไม่มีข้อมูลลูกหนี้การค้า</td></tr>'}</tbody>
                    </table>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between border-b pb-4 mb-4">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-shopping-bag-open text-orange-600 text-xl"></i> บัญชีเจ้าหนี้การค้า (Accounts Payable - AP)
                    </h3>
                    <span class="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                        ค้างชำระซัพพลายเออร์รวม: ฿${pendingAP.toLocaleString()}
                    </span>
                </div>
                <div class="overflow-x-auto border rounded-xl">
                    <table class="w-full text-left whitespace-nowrap">
                        <thead class="bg-slate-50 border-b text-slate-600 font-bold text-sm">
                            <tr>
                                <th class="px-6 py-4">เลขที่ PO</th>
                                <th class="px-6 py-4">ผู้จำหน่าย / ซัพพลายเออร์</th>
                                <th class="px-6 py-4">วันที่เปิด PO</th>
                                <th class="px-6 py-4 text-right">ยอดรวมสั่งซื้อ (บาท)</th>
                                <th class="px-6 py-4 text-right">ชำระแล้ว</th>
                                <th class="px-6 py-4 text-right">คงค้างชำระ</th>
                                <th class="px-6 py-4">สถานะ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">${apRows || '<tr><td colspan="7" class="text-center py-6 text-slate-400">ไม่มีข้อมูลเจ้าหนี้การค้า</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
};

app.printFinancialReport = function() {
    const comp = this.mockData.company;
    const salesOrders = this.mockData.salesOrders || [];
    const purchaseOrders = this.mockData.purchaseOrders || [];

    const totalSalesRev = salesOrders.reduce((sum, so) => sum + (so.total_amount || 0), 0);
    const totalPurchaseExp = purchaseOrders.reduce((sum, po) => sum + (po.total_amount || 0), 0);

    const printWin = window.open('', '_blank');
    printWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>รายงานสรุปงบการเงิน - ${comp.name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>body { font-family: 'Sarabun', sans-serif; }</style>
        </head>
        <body class="p-8 bg-white text-slate-800" onload="window.print()">
            <div class="max-w-4xl mx-auto border p-8 rounded-xl">
                <div class="text-center border-b pb-6 mb-6">
                    <h1 class="text-2xl font-bold text-blue-900">${comp.name}</h1>
                    <p class="text-sm text-slate-600 mt-1">${comp.address}</p>
                    <p class="text-sm text-slate-600">เลขผู้เสียภาษี: ${comp.tax_id}</p>
                    <h2 class="text-xl font-bold text-slate-800 uppercase mt-4">รายงานสรุปงบการเงินและกระแสเงินสด</h2>
                    <p class="text-xs text-slate-500">ข้อมูล ณ วันที่ ${new Date().toLocaleDateString('th-TH')}</p>
                </div>

                <div class="grid grid-cols-2 gap-6 mb-8 text-sm">
                    <div class="bg-slate-50 p-4 rounded-xl border">
                        <div class="font-bold text-slate-700 mb-2">สรุปรายได้และต้นทุน</div>
                        <div class="flex justify-between py-1 border-b"><span>ยอดขายรวม:</span> <strong class="font-mono text-blue-600">฿${totalSalesRev.toLocaleString()}</strong></div>
                        <div class="flex justify-between py-1 border-b"><span>ยอดซื้อต้นทุนรวม:</span> <strong class="font-mono text-orange-600">฿${totalPurchaseExp.toLocaleString()}</strong></div>
                        <div class="flex justify-between py-1 pt-2 font-bold text-base"><span>กำไรขั้นต้น:</span> <strong class="font-mono text-emerald-600">฿${(totalSalesRev - totalPurchaseExp).toLocaleString()}</strong></div>
                    </div>
                    <div class="bg-slate-50 p-4 rounded-xl border">
                        <div class="font-bold text-slate-700 mb-2">สรุปหนี้สินและลูกหนี้</div>
                        <div class="flex justify-between py-1 border-b"><span>จำนวนรายการ SO:</span> <strong>${salesOrders.length} รายการ</strong></div>
                        <div class="flex justify-between py-1 border-b"><span>จำนวนรายการ PO:</span> <strong>${purchaseOrders.length} รายการ</strong></div>
                    </div>
                </div>

                <div class="mt-12 pt-8 border-t text-center text-xs text-slate-400">
                    เอกสารรายงานทางการเงินพิมพ์จากระบบ OMS | พิมพ์โดย: ${this.currentUser.fullname}
                </div>
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
};

// ==========================================
// TAX INVOICES (รายการรอออกใบกำกับภาษี)
// ==========================================

app.renderTaxInvoices = function(container) {
    const orders = (this.mockData.salesOrders || []).filter(so => so.vat_req);
    
    let rows = orders.map(so => {
        const isIssued = so.tax_invoice_issued || !!so.tax_invoice_no;
        const statusBadge = isIssued
            ? '<span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">ออกใบกำกับภาษีแล้ว</span>'
            : '<span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">รอออกใบกำกับภาษี</span>';

        return `
            <tr class="hover:bg-slate-50 transition-colors text-sm">
                <td class="px-5 py-3.5 font-mono font-bold text-blue-600">${so.so_no}</td>
                <td class="px-5 py-3.5 font-medium text-slate-800">${so.customer_name}</td>
                <td class="px-5 py-3.5 text-xs text-slate-500">${so.date}</td>
                <td class="px-5 py-3.5 font-mono text-right font-bold text-slate-800">฿${(so.total_amount||0).toLocaleString('th-TH', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                <td class="px-5 py-3.5 text-center">${statusBadge}</td>
                <td class="px-5 py-3.5 font-mono text-xs text-slate-600">${so.tax_invoice_no || '-'}</td>
                <td class="px-5 py-3.5 text-xs text-slate-500">${so.tax_invoice_date || '-'}</td>
                <td class="px-5 py-3.5 text-center whitespace-nowrap flex items-center justify-center gap-1.5">
                    ${so.tax_invoice_img ? `
                    <button onclick="supabaseService.openImagePreview('${so.tax_invoice_img}', 'ใบกำกับภาษี ${so.tax_invoice_no}')" class="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all border border-emerald-300 flex items-center gap-1">
                        <i class="ph ph-file-image"></i> ดูไฟล์
                    </button>` : ''}
                    <button onclick="app.openIssueTaxInvoiceModal(${so.id})" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1">
                        <i class="ph ph-receipt"></i> ${isIssued ? 'แก้ไขใบกำกับ' : 'ออกใบกำกับ'}
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
                <h2 class="text-2xl font-bold text-slate-800">รายการรอออกใบกำกับภาษี (Tax Invoices)</h2>
                <p class="text-slate-500 text-sm">จัดการการออกใบกำกับภาษี (VAT 7%) สำหรับคำสั่งซื้อที่ลูกค้าร้องขอ</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border overflow-x-auto">
            <table class="w-full text-left text-sm whitespace-nowrap">
                <thead class="bg-slate-50 border-b text-slate-600 font-bold">
                    <tr>
                        <th class="px-5 py-3.5">เลขที่ SO</th>
                        <th class="px-5 py-3.5">ชื่อลูกค้า</th>
                        <th class="px-5 py-3.5">วันที่เปิด SO</th>
                        <th class="px-5 py-3.5 text-right">ยอดเงินรวม</th>
                        <th class="px-5 py-3.5 text-center">สถานะ</th>
                        <th class="px-5 py-3.5">เลขใบกำกับภาษี</th>
                        <th class="px-5 py-3.5">วันที่ออก</th>
                        <th class="px-5 py-3.5 text-center">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y">${rows || '<tr><td colspan="8" class="text-center py-8 text-slate-400">ไม่มีรายการคำสั่งซื้อที่ต้องออกใบกำกับภาษี</td></tr>'}</tbody>
            </table>
        </div>
    `;
};

app.currentCompressedTaxInv = null;

app.openIssueTaxInvoiceModal = function(soId) {
    const so = (this.mockData.salesOrders || []).find(x => x.id === soId);
    if (!so) return;

    this.currentCompressedTaxInv = null;
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultTaxNo = so.tax_invoice_no || ('TAX-' + new Date().getFullYear().toString().substring(2) + Math.floor(1000+Math.random()*9000));

    const html = `
        <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 animate-fade-in">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">
                <div class="flex justify-between items-center p-5 border-b bg-slate-50 rounded-t-2xl">
                    <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <i class="ph ph-receipt text-blue-600 text-xl"></i> ออกใบกำกับภาษี: ${so.so_no}
                    </h3>
                    <button onclick="app.closeModal()" class="text-slate-400 hover:text-slate-700 text-xl"><i class="ph ph-x"></i></button>
                </div>
                <div class="p-6 space-y-4 overflow-y-auto">
                    <form id="tax-inv-form" onsubmit="event.preventDefault(); app.saveTaxInvoice(${soId})" class="space-y-4">
                        <div class="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-sm space-y-1">
                            <div><span class="font-bold text-blue-900">ลูกค้า:</span> ${so.customer_name}</div>
                            <div><span class="font-bold text-blue-900">ยอดรวมทั้งสิ้น:</span> ฿${(so.total_amount||0).toLocaleString()}</div>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">เลขที่ใบกำกับภาษี *</label>
                            <input type="text" id="ti_no" value="${defaultTaxNo}" class="w-full border rounded-xl px-3 py-2 text-sm font-mono font-bold" required>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1">วันที่ออกใบกำกับภาษี *</label>
                            <input type="date" id="ti_date" value="${so.tax_invoice_date || todayStr}" class="w-full border rounded-xl px-3 py-2 text-sm font-mono" required>
                        </div>

                        <div>
                            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                                <span>แนบไฟล์รูปภาพใบกำกับภาษี (Auto-Compress)</span>
                                <span class="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Client-Side Compression</span>
                            </label>
                            <input type="file" id="ti_file" accept="image/*" onchange="app.handleTaxInvoiceFileSelect(event)" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
                            
                            <div id="ti_preview_box" class="hidden mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs">
                                <img id="ti_img_preview" class="w-12 h-12 object-cover rounded-lg border shadow-xs" src="">
                                <div>
                                    <div class="font-bold text-emerald-800" id="ti_filename">รูปใบกำกับ.jpg</div>
                                    <div class="text-[11px] text-slate-600" id="ti_size_info"></div>
                                </div>
                            </div>

                            ${so.tax_invoice_img ? `
                                <div class="mt-2 text-xs text-blue-600 flex items-center gap-1 font-bold">
                                    <i class="ph ph-check-circle text-emerald-500"></i> มีไฟล์แนบเดิมแล้ว
                                    <button type="button" onclick="supabaseService.openImagePreview('${so.tax_invoice_img}', 'ใบกำกับภาษี ${so.tax_invoice_no}')" class="underline ml-1">ดูรูปภาพ</button>
                                </div>
                            ` : ''}
                        </div>
                    </form>
                </div>
                <div class="p-5 border-t bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
                    <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs">ยกเลิก</button>
                    <button type="submit" form="tax-inv-form" id="btn-save-tax-inv" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5">
                        <i class="ph ph-check"></i> ยืนยันการออกใบกำกับภาษี
                    </button>
                </div>
            </div>
        </div>
    `;
    this.openModalHTML(html);
};

app.handleTaxInvoiceFileSelect = async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        this.showToast('กรุณาเลือกไฟล์รูปภาพ', 'warning');
        return;
    }

    try {
        const result = await supabaseService.compressImage(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.8 });
        this.currentCompressedTaxInv = result;

        const box = document.getElementById('ti_preview_box');
        const img = document.getElementById('ti_img_preview');
        const nameEl = document.getElementById('ti_filename');
        const sizeEl = document.getElementById('ti_size_info');

        if (box && img) {
            img.src = result.previewUrl;
            nameEl.innerText = file.name;
            sizeEl.innerHTML = `${supabaseService.formatBytes(result.originalSize)} ➔ <span class="font-bold text-emerald-700">${supabaseService.formatBytes(result.compressedSize)}</span> (-${result.ratio})`;
            box.classList.remove('hidden');
        }
        this.showToast('บีบอัดรูปภาพใบกำกับภาษีแล้ว', 'info');
    } catch (err) {
        console.error('Tax invoice compression error:', err);
    }
};

app.saveTaxInvoice = async function(soId) {
    const so = (this.mockData.salesOrders || []).find(x => x.id === soId);
    if (!so) return;

    const tiNo = document.getElementById('ti_no').value.trim();
    const tiDate = document.getElementById('ti_date').value;
    const btn = document.getElementById('btn-save-tax-inv');

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="ph ph-spinner animate-spin"></i> กำลังบันทึก...`;
    }

    so.tax_invoice_issued = true;
    so.tax_invoice_no = tiNo;
    so.tax_invoice_date = tiDate;

    if (this.currentCompressedTaxInv && this.currentCompressedTaxInv.blob) {
        try {
            const url = await supabaseService.uploadToStorage('invoices', this.currentCompressedTaxInv.blob);
            so.tax_invoice_img = url;
        } catch (err) {
            console.warn('Storage upload error, using preview:', err);
            so.tax_invoice_img = this.currentCompressedTaxInv.previewUrl;
        }
    }

    this.currentCompressedTaxInv = null;
    this.showToast('บันทึกข้อมูลใบกำกับภาษีและอัปโหลดไฟล์เรียบร้อยแล้ว', 'success');
    this.closeModal();
    this.renderTaxInvoices(document.getElementById('main-content'));
};
