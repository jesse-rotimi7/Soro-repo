import User from '../models/User';

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'jesserotimi360@gmail.com';
const DEMO_USERNAME = process.env.DEMO_USERNAME || 'Jesse Rotimi';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'password';

export const ensureDemoUser = async () => {
  try {
    let user = await User.findOne({ email: DEMO_EMAIL });

    if (!user) {
      user = new User({
        username: DEMO_USERNAME,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        avatar: '',
      });

      await user.save();
      console.log(`Demo user created with email ${DEMO_EMAIL}`);
    } else {
      // ensure username consistent
      if (user.username !== DEMO_USERNAME) {
        user.username = DEMO_USERNAME;
        await user.save();
      }
    }
  } catch (error) {
    console.error('Failed to ensure demo user:', error);
  }
};






