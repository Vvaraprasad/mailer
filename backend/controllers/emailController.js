// const Template = require('../models/Template');
// const User = require('../models/User');
// const xlsx = require('xlsx');
// const fs = require('fs');
// const nodemailer = require('nodemailer');
// // const User = require('../models/User');

// exports.getTemplates = async (req, res) => {
//   // console.log("!")
//   const userId = req.params.id;
//   console.log(userId)
//   const templates = await Template.find({ userId });
//   console.log(templates)
//   res.json(templates);
// };

// exports.createTemplate = async (req, res) => {
//   const { name, subject, body, userId } = req.body;
//   console.log(req.body)
//   console.log(name,subject,body,userId)
//   const template = new Template({ name, subject, body, userId });
//   await template.save();
//   res.status(201).json(template);
// };

// exports.updateTemplate = async (req, res) => {
//   const { name, subject, body } = req.body;
//   const template = await Template.findByIdAndUpdate(
//     req.params.id,
//     { name, subject, body },
//     { new: true }
//   );
//   res.json(template);
// };

// exports.deleteTemplate = async (req, res) => {
//   await Template.findByIdAndDelete(req.params.id);
//   res.status(204).send();
// };

// exports.getUserSettings = async (req, res) => {
//   const user = await User.findById(req.params.userId);
//   console.log(user)
//   console.log(res)
//   res.json({ smtp: user.smtp, parseKeys: user.parseKeys });
// };

// exports.updateUserSettings = async (req, res) => {
//   const { smtp, parseKeys } = req.body;
//   console.log(req.body)
//   const user = await User.findByIdAndUpdate(
//     req.params.userId,
//     { smtp, parseKeys },
//     { new: true }
//   );
//   // console.log(user);
//   // console.log(res);
//   res.json(user);
// };

// exports.sendBulkEmails = async (req, res) => {
//   const userId = req.body.userId;
//   const templateId = req.body.templateId;
//   const filePath = req.file.path;

//   const user = await User.findById(userId);
//   const template = await Template.findById(templateId);

//   const workbook = xlsx.readFile(filePath);
//   const sheetName = workbook.SheetNames[0];
//   const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//   const transporter = nodemailer.createTransport(user.smtp);

//   for (const row of data) {
//     let body = template.body;
//     for (const key of user.parseKeys) {
//       const regex = new RegExp(`\\[${key}\\]`, 'g');
//       body = body.replace(regex, row[key] || '');
//     }
//     await transporter.sendMail({
//       from: user.smtp.auth.user,
//       to: row.Email,
//       subject: template.subject,
//       html: body,
//     });
//   }

//   fs.unlinkSync(filePath);
//   res.status(200).json({ message: 'Bulk emails sent successfully' });
// };

// exports.sendSingleEmail = async (req, res) => {
//   const { userId, templateId, recipient } = req.body;

//   const user = await User.findById(userId);
//   const template = await Template.findById(templateId);

//   let body = template.body;
//   for (const key of user.parseKeys) {
//     const regex = new RegExp(`\\[${key}\\]`, 'g');
//     body = body.replace(regex, recipient[key] || '');
//   }

//   const transporter = nodemailer.createTransport(user.smtp);

//   await transporter.sendMail({
//     from: user.smtp.auth.user,
//     to: recipient.Email,
//     subject: template.subject,
//     html: body,
//   });

//   res.status(200).json({ message: 'Single email sent successfully' });
// };
// exports.downloadTemplate = async (req, res) => {
//   const template = await Template.findById(req.params.id)
//   if (!template) {
//     return res.status(404).json({ message: 'Template not found' })
    
//   }
//   const workbook = xlsx.utils.book_new()
//   const worksheet = xlsx.utils.json_to_sheet([{ Name: template.name, subject: template.subject, body: template.body }])
//   xlsx.utils.book_append_sheet(workbook, worksheet, 'Template')
//   const filePath = `./templates/${template.name}.xlsx`;
//   xlsx.writeFile(workbook, filePath)
//   res.download(filePath, `${template.name}.xlsx`,
//     (err) => {
//       if (err) {
//         console.error('Error downloading file:', err)
//         res.status(500).json({
//           message: 'Error downloading file',
//           error: err.message
          
//         })

//       }

//     }

//   );

// }


// exports.getUserParseKeys = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.userId);
//     if (!user || !user.parseKeys) {
//       return res.status(404).json({ message: 'Parse keys not found' });
//     }
//     res.json({ parseKeys: user.parseKeys });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

const Template = require('../models/Template');
const User = require('../models/User');
const xlsx = require('xlsx');
const fs = require('fs');
const nodemailer = require('nodemailer');

exports.getTemplates = async (req, res) => {
  const userId = req.params.id;
  const templates = await Template.find({ userId });
  res.json(templates);
};

exports.createTemplate = async (req, res) => {
  const { name, subject, body, userId } = req.body;
  const template = new Template({ name, subject, body, userId });
  await template.save();
  res.status(201).json(template);
};

exports.updateTemplate = async (req, res) => {
  const { name, subject, body } = req.body;
  const template = await Template.findByIdAndUpdate(
    req.params.id,
    { name, subject, body },
    { new: true }
  );
  res.json(template);
};

exports.deleteTemplate = async (req, res) => {
  await Template.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

exports.getUserSettings = async (req, res) => {
  const { userId } = req.params;
  const { platform } = req.query;

  const user = await User.findById(userId);
  if (!user || !user.platforms[platform]) {
    return res.status(404).json({ message: 'Platform data not found' });
  }

  const { smtp, parseKeys } = user.platforms[platform];
  res.json({ smtp, parseKeys });
};

exports.updateUserSettings = async (req, res) => {
  // console.log("!")
  try {
    const { smtp, parseKeys, platform } = req.body;
    const { userId } = req.params;
    // console.log(req.body)
    // Validate input
    if (!smtp || !parseKeys || !platform) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!['gmail', 'outlook'].includes(platform)) {
      return res.status(400).json({ message: 'Invalid platform' });
    }

    const updateData = {
      [`platforms.${platform}.smtp`]: smtp,
      [`platforms.${platform}.parseKeys`]: parseKeys,
    };

    console.log('Updating user with:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    // console.log(updatedUser)
    res.json({
      message: `Settings updated for ${platform}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.sendBulkEmails = async (req, res) => {
  const { userId, templateId, platform } = req.body;
  const filePath = req.file.path;

  const user = await User.findById(userId);
  const userPlatform = user?.platforms?.[platform];
  if (!userPlatform)
    return res.status(400).json({ message: 'Invalid platform selected' });

  const template = await Template.findById(templateId);

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // const transporter = nodemailer.createTransport(userPlatform.smtp);
  const transporter = nodemailer.createTransport({
    service: platform === 'gmail' ? 'gmail' : undefined,
    host: platform === 'outlook' ? 'smtp.office365.com' : 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: userPlatform.smtp.auth.user,
      pass: userPlatform.smtp.auth.pass,
    },
  });
  
  for (const row of data) {
    let body = template.body;
    for (const key of userPlatform.parseKeys) {
      const regex = new RegExp(`\\[${key}\\]`, 'g');
      body = body.replace(regex, row[key] || '');
    }
    await transporter.sendMail({
      from: userPlatform.smtp.auth.user,
      to: row.Email,
      subject: template.subject,
      html: body,
    });
  }

  fs.unlinkSync(filePath);
  res.status(200).json({ message: 'Bulk emails sent successfully' });
};

exports.sendSingleEmail = async (req, res) => {
  const { userId, templateId, recipient, platform } = req.body;
  

  const user = await User.findById(userId);
 
  const userPlatform = user?.platforms?.[platform];
  
  if (!userPlatform) {
    console.log("err")
    return res.status(400).json({ message: 'Invalid platform selected' });
  }
  const template = await Template.findById(templateId);

  let body = template.body;
  console.log(userPlatform.parseKeys);
  for (const key of userPlatform.parseKeys) {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    body = body.replace(regex, recipient[key] || '');
  }
  // console.log("!")
  
  const transporter = nodemailer.createTransport({
    service: platform === 'gmail' ? 'gmail' : undefined,
    host: platform === 'outlook' ? 'smtp.office365.com' : 'smtp.gmail.com',
    port: 587 ,
    secure: false,
    auth: {
      user: userPlatform.smtp.auth.user,
      pass: userPlatform.smtp.auth.pass,
    },
  });
  await transporter.sendMail({
    from: userPlatform.smtp.auth.user,
    to: recipient.Email,
    subject: template.subject,
    html: body,
  });

  res.status(200).json({ message: 'Single email sent successfully' });
};

exports.downloadTemplate = async (req, res) => {
  const template = await Template.findById(req.params.id);
  if (!template) {
    return res.status(404).json({ message: 'Template not found' });
  }
  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.json_to_sheet([
    { Name: template.name, subject: template.subject, body: template.body },
  ]);
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');
  const filePath = `./templates/${template.name}.xlsx`;
  xlsx.writeFile(workbook, filePath);
  res.download(filePath, `${template.name}.xlsx`, (err) => {
    if (err) {
      console.error('Error downloading file:', err);
      res
        .status(500)
        .json({ message: 'Error downloading file', error: err.message });
    }
  });
};

exports.getUserParseKeys = async (req, res) => {
  const { platform } = req.query;
  try {
    const user = await User.findById(req.params.userId);
    const parseKeys = user?.platforms?.[platform]?.parseKeys;
    if (!parseKeys) {
      return res
        .status(404)
        .json({ message: 'Parse keys not found for platform' });
    }
    res.json({ parseKeys });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
