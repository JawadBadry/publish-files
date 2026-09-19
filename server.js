const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// التأكد من وجود مجلد لحفظ الملفات المرفوعة
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// إعداد مكان حفظ الملفات الحقيقي
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // إضافة تاريخ ووقت لمنع تشابه أسماء الملفات
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// قراءة ملفات الواجهة الأمامية من نفس المجلد
app.use(express.static(__dirname));
// السماح بالوصول للملفات المرفوعة للتحميل
app.use('/uploads', express.static(uploadDir));

// استقبال طلب الرفع وتوليد الرابط الحقيقي
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'لم يتم اختيار أي ملف' });
    }

    // توليد رابط التحميل الحقيقي بناءً على عنوان السيرفر الحالي
    const host = req.get('host');
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({ url: fileUrl });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
