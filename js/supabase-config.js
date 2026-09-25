/**
 * OMS (Operation Management System) - Supabase Default Configuration
 * File: js/supabase-config.js
 * 
 * 💡 เคล็ดลับสำหรับการนำขึ้น GitHub Pages / Production Hosting:
 * เมื่อนำโค้ดขึ้น GitHub หรือโฮสติ้งสาธารณะ เบราว์เซอร์จะแยก LocalStorage ตามโดเมน
 * หากต้องการให้ทุกคนที่เปิดลิงก์ GitHub เข้าถึงและออนไลน์กับ Supabase ทันทีโดยไม่ต้องกรอกค่าใหม่ในแต่ละเครื่อง:
 * 1. นำ URL และ Anon Public Key มาใส่ในออบเจ็กต์ OMS_SUPABASE_DEFAULT_CONFIG ด้านล่าง
 * 2. Commit และ Push ไฟล์นี้ขึ้น GitHub
 * ระบบจะตรวจจับและเชื่อมต่อ Supabase Online ให้อัตโนมัติทันที!
 */

window.OMS_SUPABASE_DEFAULT_CONFIG = {
    // 1. ระบุ Supabase Project URL ของคุณ (เช่น 'https://xxxxxxxxxxxx.supabase.co')
    // หมายเหตุ: ตัด /rest/v1/ ออก ให้เหลือเฉพาะ Base URL
    url: '',

    // 2. ระบุ Supabase Anon Public Key (คัดลอกได้จาก Supabase > Project Settings > API > anon public)
    key: '',

    // 3. ชื่อ Storage Bucket สำหรับจัดเก็บรูปภาพและสลิปการโอนเงิน (ค่าเริ่มต้น: oms-storage)
    bucket: 'oms-storage'
};
