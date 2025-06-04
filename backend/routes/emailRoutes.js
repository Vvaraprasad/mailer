// // const express = require('express');
// // const router = express.Router();
// // const multer = require('multer');
// // const upload = multer({ dest: 'uploads/' });
// // const {
// //   sendBulkEmails,
// //   sendSingleEmail,
// //   getTemplates,
// //   createTemplate,
// //   updateTemplate,
// //   deleteTemplate,
// //   getUserSettings,
// //   updateUserSettings,
// // } = require('../controllers/emailController');

// // router.get('/templates/user/:id', getTemplates);
// // router.post('/templates', createTemplate);
// // router.put('/templates/:id', updateTemplate);
// // router.delete('/templates/:id', deleteTemplate);
// // router.post('/send-bulk', upload.single('file'), sendBulkEmails);
// // router.post('/send-single', sendSingleEmail);
// // router.get('/settings/:userId', getUserSettings);
// // router.put('/settings/:userId', updateUserSettings);

// // module.exports = router;

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

// const {
//   sendBulkEmails,
//   sendSingleEmail,
//   getTemplates,
//   createTemplate,
//   updateTemplate,
//   deleteTemplate,
//   getUserSettings,
//   updateUserSettings,
//   getUserParseKeys,
// } = require('../controllers/emailController');

// // Template management
// router.get('/templates/user/:id', getTemplates);
// router.post('/templates', createTemplate);
// router.put('/templates/:id', updateTemplate);
// router.delete('/templates/:id', deleteTemplate);

// // Email sending
// router.post('/send-bulk', upload.single('file'), sendBulkEmails);
// router.post('/send-single', sendSingleEmail);

// // Settings and parse keys
// router.get('/settings/:userId', getUserSettings);
// router.put('/settings/:userId', updateUserSettings);
// router.get('/user/parsekeys/:userId', getUserParseKeys);

// module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  sendBulkEmails,
  sendSingleEmail,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getUserSettings,
  updateUserSettings,
  getUserParseKeys,
} = require('../controllers/emailController');

// Template management
router.get('/templates/user/:id', getTemplates);
router.post('/templates', createTemplate);
router.put('/templates/:id', updateTemplate);
router.delete('/templates/:id', deleteTemplate);

// Email sending
router.post('/send-bulk', upload.single('file'), sendBulkEmails);
router.post('/send-single', sendSingleEmail);

// Settings and parse keys (platform-aware)
router.get('/settings/:userId', getUserSettings); // pass ?platform=gmail or ?platform=outlook
router.put('/settings/:userId', updateUserSettings); // include { platform: 'gmail', smtp, parseKeys }
router.get('/user/parsekeys/:userId', getUserParseKeys); // pass ?platform=gmail or ?platform=outlook

module.exports = router;
