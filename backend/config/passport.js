const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // Update avatar if it changed
                    const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null;
                    if (avatarUrl && user.avatar !== avatarUrl) {
                        user.avatar = avatarUrl;
                        await user.save();
                    }
                    // User exists, return user
                    return done(null, user);
                }

                // Check if user exists with this email
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    user.isVerified = true;
                    user.avatar = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : user.avatar;
                    await user.save();
                    user.wasLinked = true; // Flag for controller
                    return done(null, user);
                }

                // Create new user
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                    isVerified: true,
                    avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                    role: 'customer', // Default role
                });

                user.isNewAccount = true; // Flag for controller
                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
