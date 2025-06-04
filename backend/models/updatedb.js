const mongoose = require('mongoose');
const User = require('./User'); // your updated model path

mongoose.connect(
  'mongodb+srv://varaprasadvellanki0402:IxXncJxmeRHjlvI8@mailer.lnjt4ub.mongodb.net/?retryWrites=true&w=majority&appName=mailer',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function migrateUsers() {
  const users = await User.find({
    $or: [{ smtp: { $exists: true } }, { parseKeys: { $exists: true } }],
  });

  for (const user of users) {
    const updatedPlatforms = {
      gmail: {
        smtp: user.smtp || {
          host: '',
          port: 0,
          secure: false,
          auth: { user: '', pass: '' },
        },
        parseKeys: user.parseKeys || [],
      },
      outlook: {
        smtp: {
          host: '',
          port: 0,
          secure: false,
          auth: { user: '', pass: '' },
        },
        parseKeys: [],
      },
    };

    user.platforms = updatedPlatforms;

    // Remove old fields
    user.smtp = undefined;
    user.parseKeys = undefined;

    await user.save();
    console.log(`Updated user: ${user.email}`);
  }

  console.log('Migration complete.');
  mongoose.disconnect();
}

migrateUsers().catch(console.error);
