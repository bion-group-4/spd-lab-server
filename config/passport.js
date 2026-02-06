const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userModel = require("../models/users");
require("dotenv").config();

module.exports = (passport) => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://cuan-shop-830d14389646.herokuapp.com/api/google/callback",
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists by googleId
                    let user = await userModel.findOne({ googleId: profile.id });
                    if (user) {
                        return done(null, user);
                    }

                    // Check if user exists by email
                    user = await userModel.findOne({ email: profile.emails[0].value });
                    if (user) {
                        // Update existing user with googleId if missing
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            user.loginType = "google";
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Create new user
                    const newUser = new userModel({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        loginType: "google",
                        userRole: 0, // Customer role
                        verified: true, // Google emails are verified
                        // Password is not required per schema change
                    });

                    await newUser.save();
                    return done(null, newUser);
                } catch (err) {
                    console.error(err);
                    return done(err, false);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};
