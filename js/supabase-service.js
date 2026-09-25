/**
 * OMS (Operation Management System) - Supabase Service & Client Integration
 * File: js/supabase-service.js
 * 
 * Features:
 * - Supabase Database (PostgreSQL) synchronization
 * - Supabase Storage integration with public URLs
 * - Client-Side Image Compression using HTML5 Canvas (reducing ~5MB slips to ~180KB)
 * - Seamless fallback to local/mock data when Supabase is not yet configured
 * - In-app configuration modal and 1-click initial data seeding
 */

const supabaseService = {
    config: {
        url: '',
        key: '',
        bucket: 'oms-storage'
    },
    client: null,
    isConnected: false,
    isSyncing: false,

    cleanUrl: function(rawUrl) {
        if (!rawUrl) return '';
        let url = rawUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }
        try {
            const u = new URL(url);
            return u.origin;
        } catch (e) {
            return url.replace(/\/rest\/v1\/?$/i, '')
                      .replace(/\/auth\/v1\/?$/i, '')
                      .replace(/\/storage\/v1\/?$/i, '')
                      .replace(/\/+$/, '');
        }
    },

    onUrlBlur: function(input) {
        if (!input || !input.value) return;
        const orig = input.value.trim();
        const cleaned = this.cleanUrl(orig);
        if (cleaned && cleaned !== orig) {
            input.value = cleaned;
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('ปรับ URL เป็น Base URL อัตโนมัติ (ตัด /rest/v1/ ออก)', 'info');
            }
        }
    },

    init: function() {
        // Load stored credentials from localStorage & sanitize URL
        const rawUrl = localStorage.getItem('oms_supabase_url') || '';
        const storedUrl = this.cleanUrl(rawUrl);
        const storedKey = (localStorage.getItem('oms_supabase_key') || '').trim();
        const storedBucket = (localStorage.getItem('oms_supabase_bucket') || 'oms-storage').trim();

        if (rawUrl && rawUrl !== storedUrl) {
            localStorage.setItem('oms_supabase_url', storedUrl);
        }

        this.config.url = storedUrl;
        this.config.key = storedKey;
        this.config.bucket = storedBucket;

        if (this.config.url && this.config.key && window.supabase) {
            try {
                this.client = window.supabase.createClient(this.config.url, this.config.key);
                this.isConnected = true;
                // Asynchronously verify connection and sync data if available
                this.verifyConnectionBackground();
            } catch (err) {
                console.warn('[Supabase] Init error:', err);
                this.isConnected = false;
            }
        } else {
            this.isConnected = false;
        }

        this.updateHeaderBadge();
    },

    isConfigured: function() {
        return !!(this.config.url && this.config.key);
    },

    verifyConnectionBackground: async function() {
        if (!this.client) return;
        try {
            const { data, error } = await this.client.from('system_settings').select('id').limit(1);
            if (!error || (error && (error.message.includes('relation') || error.message.includes('not exist')))) {
                this.isConnected = true;
                this.updateHeaderBadge();
            }
        } catch (e) {
            console.warn('[Supabase] Background ping error:', e);
        }
    },

    updateHeaderBadge: function() {
        const badge = document.getElementById('supabase-status-badge');
        if (!badge) return;

        if (this.isConnected) {
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer shadow-xs";
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> <span>Supabase: Online</span>`;
            badge.title = "เชื่อมต่อ Supabase Database & Storage เรียบร้อยแล้ว (คลิกเพื่อตั้งค่า/ซิงค์)";
        } else if (this.isConfigured()) {
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer shadow-xs";
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-500"></span> <span>Supabase: Check Config</span>`;
            badge.title = "มีข้อมูลเชื่อมต่อ แต่ยังไม่ตอบสนอง (คลิกเพื่อทดสอบ)";
        } else {
            badge.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200 transition-colors cursor-pointer shadow-xs";
            badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-slate-400"></span> <span>Supabase: Local Mode</span>`;
            badge.title = "ระบบกำลังทำงานด้วยโหมด Local (คลิกเพื่อเชื่อมต่อ Supabase)";
        }
    },

    // -------------------------------------------------------------
    // CLIENT-SIDE IMAGE COMPRESSION (ลดขนาดรูปภาพก่อนอัปโหลด)
    // -------------------------------------------------------------
    compressImage: function(file, options = {}) {
        const maxWidth = options.maxWidth || 1280;
        const maxHeight = options.maxHeight || 1280;
        const quality = options.quality !== undefined ? options.quality : 0.8;
        const mimeType = options.mimeType || 'image/jpeg';

        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                // If not an image, return raw file
                resolve({
                    file: file,
                    blob: file,
                    originalSize: file ? file.size : 0,
                    compressedSize: file ? file.size : 0,
                    ratio: '0%',
                    isCompressed: false
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    const origWidth = width;
                    const origHeight = height;

                    if (width > maxWidth || height > maxHeight) {
                        if (width / height > maxWidth / maxHeight) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        } else {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    // Fill white background for transparent PNG / transparency fallback
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve({
                                file: file,
                                blob: file,
                                originalSize: file.size,
                                compressedSize: file.size,
                                previewUrl: e.target.result,
                                ratio: '0%',
                                isCompressed: false
                            });
                            return;
                        }

                        const newFileName = (file.name || 'image').replace(/\.[^/.]+$/, "") + ".jpg";
                        const compressedFile = new File([blob], newFileName, { type: mimeType, lastModified: Date.now() });
                        const savedBytes = file.size - blob.size;
                        const ratio = savedBytes > 0 ? ((savedBytes / file.size) * 100).toFixed(1) + '%' : '0%';
                        const previewUrl = URL.createObjectURL(blob);

                        resolve({
                            originalFile: file,
                            file: compressedFile,
                            blob: blob,
                            originalSize: file.size,
                            compressedSize: blob.size,
                            previewUrl: previewUrl,
                            ratio: ratio,
                            savedBytes: savedBytes,
                            width: width,
                            height: height,
                            origWidth: origWidth,
                            origHeight: origHeight,
                            isCompressed: true
                        });
                    }, mimeType, quality);
                };
                img.onerror = (err) => reject(err);
                img.src = e.target.result;
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    },

    formatBytes: function(bytes, decimals = 1) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },

    // -------------------------------------------------------------
    // SUPABASE STORAGE UPLOADER
    // -------------------------------------------------------------
    uploadToStorage: async function(folder, fileOrBlob, customFileName = null) {
        const bucket = this.config.bucket || 'oms-storage';
        const timePrefix = Date.now();
        const rand = Math.random().toString(36).substring(2, 8);
        const ext = fileOrBlob.type === 'image/png' ? 'png' : 'jpg';
        const fileName = customFileName || `${folder}/${timePrefix}_${rand}.${ext}`;

        // Fallback when Supabase is not connected: convert to Base64 Data URL so the app always works
        if (!this.client || !this.isConnected) {
            return await this.blobToDataUrl(fileOrBlob);
        }

        try {
            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(fileName, fileOrBlob, {
                    upsert: true,
                    contentType: fileOrBlob.type || 'image/jpeg'
                });

            if (error) {
                console.warn('[Supabase Storage] Upload error, fallback to Base64:', error.message);
                return await this.blobToDataUrl(fileOrBlob);
            }

            const { data: publicUrlData } = this.client.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return publicUrlData.publicUrl;
        } catch (err) {
            console.warn('[Supabase Storage] Upload exception:', err);
            return await this.blobToDataUrl(fileOrBlob);
        }
    },

    blobToDataUrl: function(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    },

    // -------------------------------------------------------------
    // DATABASE SYNCHRONIZATION (PULL / PUSH / SEED)
    // -------------------------------------------------------------
    testConnection: async function(url, key) {
        if (!window.supabase) {
            throw new Error('ไม่พบไลบรารี @supabase/supabase-js กรุณาตรวจสอบอินเทอร์เน็ต');
        }
        url = this.cleanUrl(url);
        key = (key || '').trim();

        if (!url || !key) {
            throw new Error('กรุณากรอก Supabase URL และ Anon Key');
        }

        const tempClient = window.supabase.createClient(url, key);
        // Test query against system_settings
        const { data, error } = await tempClient.from('system_settings').select('id').limit(1);
        if (error && error.code !== 'PGRST116') {
            const msg = (error.message || '').toLowerCase();
            // Check if error is permission denied
            if (msg.includes('permission denied') || error.code === '42501') {
                throw new Error('ติดสิทธิ์การเข้าถึง (Permission Denied): ให้คลิกปุ่ม "แก้สิทธิ์ Permission Denied (GRANT)" ด้านล่าง เพื่อนำคำสั่งไปรันใน Supabase > SQL Editor');
            }
            // Check if error is just missing table (schema not yet created)
            if (msg.includes('relation') || msg.includes('not exist') || msg.includes('find the table') || msg.includes('schema cache') || error.code === '42P01') {
                return { 
                    success: true, 
                    warning: 'เชื่อมต่อ Supabase Project สำเร็จแล้ว! (แต่ยังไม่ได้สร้างตาราง - กรุณากดปุ่ม "ดูคำสั่ง SQL Schema" เพื่อนำไปรันใน Supabase)' 
                };
            }
            if (msg.includes('api key') || msg.includes('jwt') || msg.includes('jws') || error.code === '401') {
                throw new Error('Anon Key ไม่ถูกต้อง กรุณาคัดลอก anon public key จาก Supabase > Project Settings > API');
            }
            throw new Error(error.message || 'เชื่อมต่อไม่สำเร็จ');
        }
        return { success: true, message: 'เชื่อมต่อ Supabase สำเร็จเรียบร้อย!' };
    },

    saveConfig: async function(url, key, bucket) {
        url = this.cleanUrl(url);
        key = (key || '').trim();
        bucket = (bucket || 'oms-storage').trim();

        localStorage.setItem('oms_supabase_url', url);
        localStorage.setItem('oms_supabase_key', key);
        localStorage.setItem('oms_supabase_bucket', bucket);

        this.config.url = url;
        this.config.key = key;
        this.config.bucket = bucket;

        if (url && key && window.supabase) {
            try {
                this.client = window.supabase.createClient(url, key);
                this.isConnected = true;
                if (typeof app !== 'undefined' && app.showToast) {
                    app.showToast('บันทึกการตั้งค่า Supabase เรียบร้อย', 'success');
                }
            } catch (err) {
                this.isConnected = false;
                if (typeof app !== 'undefined' && app.showToast) {
                    app.showToast('เกิดข้อผิดพลาดในการเริ่มต้น Supabase: ' + err.message, 'error');
                }
            }
        } else {
            this.client = null;
            this.isConnected = false;
            if (typeof app !== 'undefined' && app.showToast) {
                app.showToast('ยกเลิกการเชื่อมต่อ Supabase (กลับสู่โหมด Local)', 'info');
            }
        }

        this.updateHeaderBadge();
    },

    seedInitialData: async function() {
        if (!this.client) {
            throw new Error('กรุณาเชื่อมต่อ Supabase ให้เรียบร้อยก่อน');
        }
        if (typeof app === 'undefined' || !app.mockData) {
            throw new Error('ไม่พบข้อมูลตั้งต้นของระบบ');
        }

        const md = app.mockData;

        // 1. Settings
        await this.client.from('system_settings').upsert({
            id: 'default',
            company_name: md.company.name,
            company_address: md.company.address,
            tax_id: md.company.tax_id,
            banks: md.company.banks,
            security_settings: md.securitySettings
        });

        // 2. Warehouses
        if (md.warehouses && md.warehouses.length > 0) {
            for (const w of md.warehouses) {
                await this.client.from('warehouses').upsert({
                    id: w.id,
                    name: w.name,
                    address: w.address,
                    contact: w.contact,
                    phone: w.phone,
                    type: w.type || 'sub'
                });
            }
        }

        // 3. Users
        if (md.users && md.users.length > 0) {
            for (const u of md.users) {
                await this.client.from('users').upsert({
                    id: u.id,
                    username: u.username,
                    password_hash: u.password,
                    fullname: u.fullname,
                    nickname: u.nickname,
                    phone: u.phone,
                    email: u.email,
                    role: u.role,
                    area: u.area,
                    warehouse_id: u.warehouse_id || null,
                    shipping_address: u.shipping_address
                });
            }
        }

        // 4. Vendors
        if (md.vendors && md.vendors.length > 0) {
            for (const v of md.vendors) {
                await this.client.from('vendors').upsert({
                    id: v.id,
                    name: v.name,
                    contact: v.contact,
                    phone: v.phone,
                    email: v.email,
                    tax_id: v.tax_id,
                    address: v.address,
                    products: v.products
                });
            }
        }

        // 5. Customers
        if (md.customers && md.customers.length > 0) {
            for (const c of md.customers) {
                await this.client.from('customers').upsert({
                    id: c.id,
                    code: c.code,
                    name: c.name,
                    contact: c.contact,
                    phone: c.phone,
                    line_id: c.line_id,
                    address: c.address,
                    shipping_differs: !!c.shipping_differs,
                    shipping_address: c.shipping_address,
                    vat_req: !!c.vat_req,
                    tax_name: c.tax_name,
                    tax_id: c.tax_id,
                    tax_address: c.tax_address,
                    assigned_sales: c.assigned_sales
                });
            }
        }

        // 6. Products
        if (md.products && md.products.length > 0) {
            for (const p of md.products) {
                await this.client.from('products').upsert({
                    id: p.id,
                    sku: p.sku,
                    name: p.name,
                    cost_price: p.cost_price,
                    wholesale_price: p.wholesale_price,
                    stock_qty: p.stock_qty,
                    pending_in: p.pending_in || 0,
                    location: p.location,
                    warehouse: p.warehouse,
                    unit: p.unit,
                    carton_qty: p.carton_qty
                });
            }
        }

        // 7. Purchase Orders
        if (md.purchaseOrders && md.purchaseOrders.length > 0) {
            for (const po of md.purchaseOrders) {
                await this.client.from('purchase_orders').upsert({
                    id: po.id,
                    po_no: po.po_no,
                    vendor_id: po.vendor_id,
                    vendor_name: po.vendor_name,
                    status: po.status,
                    payment_status: po.payment_status,
                    total_amount: po.total_amount,
                    unpaid_amount: po.unpaid_amount,
                    created_by: po.created_by,
                    date: po.date,
                    completed_date: po.completed_date,
                    items: po.items
                });
            }
        }

        // 8. Sales Orders
        if (md.salesOrders && md.salesOrders.length > 0) {
            for (const so of md.salesOrders) {
                await this.client.from('sales_orders').upsert({
                    id: so.id,
                    so_no: so.so_no,
                    customer_id: so.customer_id,
                    customer_name: so.customer_name,
                    date: so.date,
                    subtotal: so.subtotal,
                    vat_amount: so.vat_amount,
                    total_amount: so.total_amount,
                    vat_req: !!so.vat_req,
                    delivery_type: so.delivery_type,
                    payment_type: so.payment_type,
                    payment_date: so.payment_date,
                    status: so.status,
                    payment_status: so.payment_status,
                    sales_person: so.sales_person,
                    po_no: so.po_no,
                    items: so.items,
                    tax_invoice_issued: !!so.tax_invoice_issued,
                    tax_invoice_no: so.tax_invoice_no || null,
                    tax_invoice_date: so.tax_invoice_date || null
                });
            }
        }

        // 9. Requisitions
        if (md.requisitions && md.requisitions.length > 0) {
            for (const r of md.requisitions) {
                await this.client.from('requisitions').upsert({
                    id: r.id,
                    req_no: r.req_no,
                    so_id: r.so_id || null,
                    so_no: r.so_no || null,
                    type: r.type,
                    status: r.status,
                    req_by: r.req_by,
                    date: r.date,
                    to_wh: r.to_wh,
                    req_method: r.req_method,
                    delivery_address: typeof r.delivery_address === 'object' ? JSON.stringify(r.delivery_address) : r.delivery_address,
                    items: r.items
                });
            }
        }

        // 10. Shipments
        if (md.shipments && md.shipments.length > 0) {
            for (const s of md.shipments) {
                await this.client.from('shipments').upsert({
                    id: s.id,
                    req_id: s.req_id,
                    req_no: s.req_no,
                    type: s.type,
                    to_wh: s.to_wh,
                    receiver: s.receiver,
                    sales: s.sales,
                    address: s.address,
                    date: s.date,
                    carrier: s.carrier,
                    tracking: s.tracking,
                    doc: s.doc,
                    items: s.items
                });
            }
        }

        return true;
    },

    pullAllData: async function() {
        if (!this.client) {
            throw new Error('กรุณาเชื่อมต่อ Supabase ให้เรียบร้อยก่อน');
        }

        const [
            settingsRes,
            whRes,
            userRes,
            prodRes,
            vendRes,
            custRes,
            poRes,
            soRes,
            reqRes,
            shipRes,
            recRes,
            payRes
        ] = await Promise.all([
            this.client.from('system_settings').select('*').limit(1),
            this.client.from('warehouses').select('*'),
            this.client.from('users').select('*'),
            this.client.from('products').select('*'),
            this.client.from('vendors').select('*'),
            this.client.from('customers').select('*'),
            this.client.from('purchase_orders').select('*'),
            this.client.from('sales_orders').select('*'),
            this.client.from('requisitions').select('*'),
            this.client.from('shipments').select('*'),
            this.client.from('sales_receipts').select('*'),
            this.client.from('purchase_payments').select('*')
        ]);

        if (settingsRes.data && settingsRes.data[0]) {
            const s = settingsRes.data[0];
            app.mockData.company.name = s.company_name || app.mockData.company.name;
            app.mockData.company.address = s.company_address || app.mockData.company.address;
            app.mockData.company.tax_id = s.tax_id || app.mockData.company.tax_id;
            if (s.banks) app.mockData.company.banks = s.banks;
            if (s.security_settings) app.mockData.securitySettings = s.security_settings;
        }

        if (whRes.data && whRes.data.length > 0) app.mockData.warehouses = whRes.data;
        if (userRes.data && userRes.data.length > 0) {
            app.mockData.users = userRes.data.map(u => ({
                id: u.id,
                username: u.username,
                password: u.password_hash || '123',
                fullname: u.fullname,
                nickname: u.nickname,
                phone: u.phone,
                email: u.email,
                role: u.role,
                area: u.area,
                warehouse_id: u.warehouse_id,
                shipping_address: u.shipping_address
            }));
        }
        if (prodRes.data && prodRes.data.length > 0) app.mockData.products = prodRes.data;
        if (vendRes.data && vendRes.data.length > 0) app.mockData.vendors = vendRes.data;
        if (custRes.data && custRes.data.length > 0) app.mockData.customers = custRes.data;
        if (poRes.data && poRes.data.length > 0) app.mockData.purchaseOrders = poRes.data;
        if (soRes.data && soRes.data.length > 0) app.mockData.salesOrders = soRes.data;
        if (reqRes.data && reqRes.data.length > 0) app.mockData.requisitions = reqRes.data;
        if (shipRes.data && shipRes.data.length > 0) app.mockData.shipments = shipRes.data;
        if (recRes.data && recRes.data.length > 0) app.mockData.salesReceipts = recRes.data;
        if (payRes.data && payRes.data.length > 0) app.mockData.purchasePayments = payRes.data;

        return true;
    },

    // -------------------------------------------------------------
    // UI MODALS
    // -------------------------------------------------------------
    openConfigModal: function() {
        const url = this.config.url || '';
        const key = this.config.key || '';
        const bucket = this.config.bucket || 'oms-storage';

        const html = `
            <div class="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 animate-fade-in">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div class="flex justify-between items-center p-5 border-b bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold">
                                ⚡
                            </div>
                            <div>
                                <h3 class="text-lg font-bold">ตั้งค่าเชื่อมต่อ Supabase Database & Storage</h3>
                                <p class="text-xs text-slate-300">รองรับ Deploy บน GitHub Pages, Cloud Database & Client Image Compression</p>
                            </div>
                        </div>
                        <button onclick="app.closeModal()" class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                    </div>

                    <div class="p-6 overflow-y-auto space-y-5 text-sm">
                        <!-- Status Banner -->
                        <div class="p-4 rounded-xl border flex items-center justify-between ${this.isConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'}">
                            <div class="flex items-center gap-3">
                                <span class="w-3.5 h-3.5 rounded-full ${this.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}"></span>
                                <div>
                                    <div class="font-bold text-sm">สถานะปัจจุบัน: ${this.isConnected ? 'เชื่อมต่อ Supabase Database ออนไลน์' : 'โหมดจำลอง (Local Mockup Mode)'}</div>
                                    <div class="text-xs ${this.isConnected ? 'text-emerald-600' : 'text-slate-500'}">
                                        ${this.isConnected ? 'บันทึกและซิงค์ข้อมูลจริงกับ Cloud ทันที' : 'ใช้งานข้อมูลในเครื่อง สามารถเชื่อมต่อได้ทุกเวลา'}
                                    </div>
                                </div>
                            </div>
                            <button type="button" onclick="supabaseService.runConnectionTest()" id="btn-test-conn" class="px-3.5 py-1.5 rounded-lg font-bold text-xs bg-white border border-slate-300 hover:bg-slate-100 shadow-xs flex items-center gap-1.5 transition-colors">
                                <i class="ph ph-plugs"></i> ทดสอบการเชื่อมต่อ
                            </button>
                        </div>

                        <!-- Form -->
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Supabase Project URL *</label>
                                <input type="url" id="sb_url" value="${url}" onblur="supabaseService.onUrlBlur(this)" placeholder="https://xxxxxxxxxxxx.supabase.co" class="w-full border rounded-xl px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none">
                                <p class="text-[11px] text-slate-500 mt-1">คัดลอกเฉพาะ Project URL เช่น <code class="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">https://xxxx.supabase.co</code> (ไม่ต้องใส่ <span class="line-through text-red-500">/rest/v1/</span> ระบบจะตัดออกให้อัตโนมัติ)</p>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Supabase Anon Public API Key *</label>
                                <input type="password" id="sb_key" value="${key}" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." class="w-full border rounded-xl px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none">
                                <p class="text-[11px] text-slate-500 mt-1">หาได้จาก Supabase > Project Settings > API > Project API keys (anon public)</p>
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-slate-700 mb-1">Storage Bucket Name (สำหรับเก็บสลิป/รูปภาพ)</label>
                                <input type="text" id="sb_bucket" value="${bucket}" placeholder="oms-storage" class="w-full border rounded-xl px-3.5 py-2.5 text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none">
                                <p class="text-[11px] text-slate-500 mt-1">ค่าเริ่มต้นคือ <code class="bg-slate-100 px-1 py-0.5 rounded font-bold text-slate-700">oms-storage</code> (สร้างเป็น Public Bucket)</p>
                            </div>
                        </div>

                        <!-- Action Tools -->
                        <div class="border-t pt-4 space-y-3">
                            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <i class="ph ph-database text-blue-600"></i> เครื่องมือจัดการฐานข้อมูล Supabase
                            </h4>
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                <button type="button" onclick="supabaseService.openSqlViewerModal()" class="p-3 bg-slate-50 hover:bg-slate-100 border rounded-xl text-left transition-colors flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg"><i class="ph ph-file-sql"></i></div>
                                    <div>
                                        <div class="font-bold text-xs text-slate-800">ดูคำสั่ง SQL Schema</div>
                                        <div class="text-[10px] text-slate-500">คัดลอกไปรันใน SQL Editor</div>
                                    </div>
                                </button>

                                <button type="button" onclick="supabaseService.copyGrantSql()" class="p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-left transition-colors flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-lg"><i class="ph ph-key"></i></div>
                                    <div>
                                        <div class="font-bold text-xs text-red-800">แก้ Permission (GRANT)</div>
                                        <div class="text-[10px] text-red-600">คัดลอกคำสั่งเปิดสิทธิ์ตาราง</div>
                                    </div>
                                </button>

                                <button type="button" onclick="supabaseService.handleSeedInitialData()" class="p-3 bg-slate-50 hover:bg-slate-100 border rounded-xl text-left transition-colors flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-lg"><i class="ph ph-cloud-arrow-up"></i></div>
                                    <div>
                                        <div class="font-bold text-xs text-slate-800">ส่งข้อมูลตัวอย่างเข้า Supabase</div>
                                        <div class="text-[10px] text-slate-500">Seed ข้อมูลตั้งต้นเข้าสู่ตาราง</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="p-4 border-t bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <button type="button" onclick="supabaseService.clearConfig()" class="text-xs text-red-600 hover:text-red-700 font-bold px-2 py-1">
                            รีเซ็ตกลับเป็นโหมด Local
                        </button>
                        <div class="flex gap-2 w-full sm:w-auto justify-end">
                            <button type="button" onclick="app.closeModal()" class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold text-xs">
                                ยกเลิก
                            </button>
                            <button type="button" onclick="supabaseService.handleSaveConfigFromModal()" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5">
                                <i class="ph ph-check"></i> บันทึกการตั้งค่า
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        app.openModalHTML(html);
    },

    runConnectionTest: async function() {
        let url = (document.getElementById('sb_url') ? document.getElementById('sb_url').value : this.config.url) || '';
        const key = (document.getElementById('sb_key') ? document.getElementById('sb_key').value : this.config.key) || '';

        url = this.cleanUrl(url);
        if (document.getElementById('sb_url')) {
            document.getElementById('sb_url').value = url;
        }

        if (!url || !key) {
            app.showToast('กรุณากรอก Supabase URL และ Anon Key ก่อนทดสอบ', 'warning');
            return;
        }

        const btn = document.getElementById('btn-test-conn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<i class="ph ph-spinner animate-spin"></i> กำลังทดสอบ...`;
        }

        try {
            const res = await this.testConnection(url, key);
            if (res.warning) {
                app.showToast(res.warning, 'warning');
            } else {
                app.showToast(res.message, 'success');
            }
        } catch (err) {
            app.showToast('ทดสอบไม่สำเร็จ: ' + err.message, 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `<i class="ph ph-plugs"></i> ทดสอบการเชื่อมต่อ`;
            }
        }
    },

    handleSaveConfigFromModal: async function() {
        let url = document.getElementById('sb_url').value.trim();
        url = this.cleanUrl(url);
        const key = document.getElementById('sb_key').value.trim();
        const bucket = document.getElementById('sb_bucket').value.trim() || 'oms-storage';

        await this.saveConfig(url, key, bucket);
        app.closeModal();
    },

    copyGrantSql: function() {
        const sql = `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;`;
        navigator.clipboard.writeText(sql);
        if (typeof app !== 'undefined' && app.showToast) {
            app.showToast('คัดลอกคำสั่ง GRANT เรียบร้อยแล้ว นำไปวางใน Supabase > SQL Editor แล้วกด Run ได้ทันที', 'success');
        }
    },

    clearConfig: function() {
        if (confirm('คุณต้องการรีเซ็ตการตั้งค่าและกลับไปใช้งานโหมด Local หรือไม่?')) {
            this.saveConfig('', '', 'oms-storage');
            app.closeModal();
        }
    },

    handleSeedInitialData: async function() {
        if (!this.client || !this.isConnected) {
            app.showToast('กรุณาบันทึกและเชื่อมต่อ Supabase ให้เรียบร้อยก่อนทำการ Seed', 'warning');
            return;
        }

        if (!confirm('ยืนยันการนำเข้าข้อมูลตัวอย่าง (สินค้า, ผู้ใช้งาน, ลูกค้า, SO, PO) เข้าสู่ฐานข้อมูล Supabase หรือไม่?')) {
            return;
        }

        app.showToast('กำลังส่งข้อมูลขึ้น Supabase Database...', 'info');
        try {
            await this.seedInitialData();
            app.showToast('ส่งข้อมูลตัวอย่างเข้า Supabase เรียบร้อยแล้ว!', 'success');
        } catch (err) {
            app.showToast('เกิดข้อผิดพลาดในการ Seed ข้อมูล: ' + err.message, 'error');
        }
    },

    openSqlViewerModal: function() {
        // Fetch or render SQL schema text
        const sql = `-- คัดลอกโค้ดนี้ไปรันใน Supabase > SQL Editor
-- สร้างตารางและ Bucket สำหรับระบบ OMS v1.22

-- 1. Enable pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ตาราง system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    company_name TEXT NOT NULL DEFAULT 'บริษัท โอเอ็มเอส โซลูชั่น จำกัด',
    company_address TEXT,
    tax_id TEXT,
    banks JSONB DEFAULT '[]'::jsonb,
    security_settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address JSONB DEFAULT '{}'::jsonb,
    contact TEXT,
    phone TEXT,
    type TEXT DEFAULT 'sub',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง users
CREATE TABLE IF NOT EXISTS public.users (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT DEFAULT '123',
    fullname TEXT NOT NULL,
    nickname TEXT,
    phone TEXT,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'sales',
    area TEXT DEFAULT 'HQ',
    warehouse_id TEXT,
    shipping_address TEXT DEFAULT '-',
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง vendors
CREATE TABLE IF NOT EXISTS public.vendors (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    phone TEXT,
    email TEXT,
    tax_id TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    products JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง customers
CREATE TABLE IF NOT EXISTS public.customers (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    code TEXT UNIQUE,
    name TEXT NOT NULL,
    contact TEXT,
    phone TEXT,
    line_id TEXT,
    address JSONB DEFAULT '{}'::jsonb,
    shipping_differs BOOLEAN DEFAULT FALSE,
    shipping_address JSONB DEFAULT NULL,
    vat_req BOOLEAN DEFAULT FALSE,
    tax_name TEXT,
    tax_id TEXT,
    tax_address TEXT,
    assigned_sales JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง products
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'ทั่วไป',
    cost_price NUMERIC(12,2) DEFAULT 0,
    wholesale_price NUMERIC(12,2) DEFAULT 0,
    stock_qty INTEGER DEFAULT 0,
    pending_in INTEGER DEFAULT 0,
    location TEXT DEFAULT '-',
    warehouse TEXT,
    unit TEXT DEFAULT 'กล่อง',
    carton_qty INTEGER DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง sales_orders
CREATE TABLE IF NOT EXISTS public.sales_orders (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    so_no TEXT UNIQUE NOT NULL,
    customer_id BIGINT,
    customer_name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    subtotal NUMERIC(12,2) DEFAULT 0,
    vat_amount NUMERIC(12,2) DEFAULT 0,
    total_amount NUMERIC(12,2) DEFAULT 0,
    vat_req BOOLEAN DEFAULT FALSE,
    delivery_type TEXT DEFAULT 'จัดส่งโดยคลัง',
    payment_type TEXT DEFAULT 'เครดิต',
    payment_date DATE,
    status TEXT DEFAULT 'Pending',
    payment_status TEXT DEFAULT 'Unpaid',
    sales_person TEXT,
    po_no TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    delivery_address JSONB DEFAULT NULL,
    tax_invoice_issued BOOLEAN DEFAULT FALSE,
    tax_invoice_no TEXT,
    tax_invoice_date DATE,
    tax_invoice_img TEXT,
    slip_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง sales_receipts
CREATE TABLE IF NOT EXISTS public.sales_receipts (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ref_no TEXT,
    so_no TEXT,
    customer_name TEXT,
    amount NUMERIC(12,2) DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    method TEXT DEFAULT 'โอนเงิน',
    status TEXT DEFAULT 'Pending',
    sales_person TEXT,
    slip_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง requisitions
CREATE TABLE IF NOT EXISTS public.requisitions (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    req_no TEXT UNIQUE NOT NULL,
    so_id BIGINT,
    so_no TEXT,
    type TEXT DEFAULT 'เบิกเพื่อสต็อก',
    status TEXT DEFAULT 'Pending',
    req_by TEXT,
    date DATE DEFAULT CURRENT_DATE,
    to_wh TEXT,
    req_method TEXT DEFAULT 'จัดส่งตามที่อยู่',
    delivery_address TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง shipments
CREATE TABLE IF NOT EXISTS public.shipments (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    req_id BIGINT,
    req_no TEXT,
    type TEXT,
    to_wh TEXT,
    receiver TEXT,
    sales TEXT,
    address TEXT,
    date DATE DEFAULT CURRENT_DATE,
    carrier TEXT,
    tracking TEXT,
    doc TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- กำหนดสิทธิ์ให้ role anon และ authenticated (แก้ permission denied)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- Storage Bucket สำหรับสลิปและรูปภาพ
INSERT INTO storage.buckets (id, name, public)
VALUES ('oms-storage', 'oms-storage', true)
ON CONFLICT (id) DO UPDATE SET public = true;`;

        const html = `
            <div class="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-[70] animate-fade-in">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div class="flex justify-between items-center p-4 border-b bg-slate-900 text-white">
                        <div class="flex items-center gap-2">
                            <i class="ph ph-terminal-window text-emerald-400 text-xl"></i>
                            <h3 class="font-bold text-base">Supabase SQL Schema Script (v1.22)</h3>
                        </div>
                        <button onclick="document.getElementById('sql-viewer-modal').remove()" class="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                    </div>
                    <div class="p-4 bg-slate-950 flex-1 overflow-y-auto">
                        <pre id="sql-text-content" class="text-xs text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed select-all">${sql}</pre>
                    </div>
                    <div class="p-4 border-t bg-slate-50 flex justify-between items-center">
                        <span class="text-xs text-slate-500">สามารถดูไฟล์ฉบับเต็มทั้งหมดได้ที่ <code class="font-mono text-blue-600 font-bold">/supabase_schema.sql</code></span>
                        <div class="flex gap-2">
                            <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('sql-text-content').innerText); app.showToast('คัดลอกคำสั่ง SQL เรียบร้อยแล้ว', 'success');" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm">
                                <i class="ph ph-copy"></i> คัดลอก SQL ทั้งหมด
                            </button>
                            <button type="button" onclick="document.getElementById('sql-viewer-modal').remove()" class="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl font-bold text-xs">
                                ปิด
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        const wrap = document.createElement('div');
        wrap.id = 'sql-viewer-modal';
        wrap.innerHTML = html;
        document.body.appendChild(wrap);
    },

    openImagePreview: function(imageUrl, title = 'รูปภาพเอกสาร / สลิปโอนเงิน') {
        if (!imageUrl) return;
        const html = `
            <div id="img-preview-modal" class="fixed inset-0 bg-black/75 flex justify-center items-center p-4 z-[90] animate-fade-in backdrop-blur-xs">
                <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
                    <div class="p-4 border-b flex justify-between items-center bg-slate-50">
                        <div class="font-bold text-slate-800 text-sm flex items-center gap-2">
                            <i class="ph ph-image text-blue-600 text-lg"></i> ${title}
                        </div>
                        <button onclick="document.getElementById('img-preview-modal').remove()" class="text-slate-400 hover:text-slate-700 text-2xl leading-none">&times;</button>
                    </div>
                    <div class="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-900/5">
                        <img src="${imageUrl}" alt="Preview" class="max-h-[70vh] w-auto object-contain rounded-lg shadow-md border border-slate-200">
                    </div>
                    <div class="p-3 border-t bg-slate-50 flex justify-between items-center text-xs">
                        <a href="${imageUrl}" target="_blank" download="slip.jpg" class="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1">
                            <i class="ph ph-arrow-square-out"></i> เปิดในแท็บใหม่
                        </a>
                        <button onclick="document.getElementById('img-preview-modal').remove()" class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg">
                            ปิด
                        </button>
                    </div>
                </div>
            </div>
        `;
        const wrap = document.createElement('div');
        wrap.innerHTML = html;
        document.body.appendChild(wrap);
    }
};

// Initialize Supabase Service on page load
if (typeof window !== 'undefined') {
    window.supabaseService = supabaseService;
    window.addEventListener('DOMContentLoaded', () => {
        supabaseService.init();
    });
}
