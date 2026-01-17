const express = require('express');
const router = express.Router();
const docController = require('../controllers/docController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', auth, upload.single('file'), docController.uploadFile);
router.get('/list', auth, docController.getDocs); // Dùng chung một hàm getDocs
router.post('/share', auth, docController.shareFileToPatient);
router.get('/patients', auth, docController.getAllPatients);
router.delete('/delete/:fileName', auth, docController.deleteDocument);
router.post('/unshare', auth, docController.unshareFileFromPatient);
router.get('/global', auth, docController.getGlobalDocs);
module.exports = router;