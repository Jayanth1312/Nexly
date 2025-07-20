require("dotenv").config();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await User.findByProvider("google", profile.id);

        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findByEmail(profile.emails[0].value);

        if (user) {
          // Link Google account to existing user
          user.providers.google = {
            id: profile.id,
            email: profile.emails[0].value,
          };
          user.isEmailVerified = true;
          user.lastLogin = new Date();
          if (!user.avatar && profile.photos && profile.photos[0]) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = new User({
          email: profile.emails[0].value,
          name: profile.displayName,
          providers: {
            google: {
              id: profile.id,
              email: profile.emails[0].value,
            },
          },
          avatar:
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null,
          isEmailVerified: true,
          lastLogin: new Date(),
        });

        await user.save();
        done(null, user);
      } catch (error) {
        console.error("Google OAuth error:", error);
        done(error, null);
      }
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this GitHub ID
        let user = await User.findByProvider("github", profile.id);

        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (email) {
          user = await User.findByEmail(email);

          if (user) {
            // Link GitHub account to existing user
            user.providers.github = {
              id: profile.id,
              username: profile.username,
              email: email,
            };
            user.isEmailVerified = true;
            user.lastLogin = new Date();
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        user = new User({
          email: email || `${profile.username}@github.local`, // Fallback email
          name: profile.displayName || profile.username,
          providers: {
            github: {
              id: profile.id,
              username: profile.username,
              email: email,
            },
          },
          avatar:
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null,
          isEmailVerified: !!email,
          lastLogin: new Date(),
        });

        await user.save();
        done(null, user);
      } catch (error) {
        console.error("GitHub OAuth error:", error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
