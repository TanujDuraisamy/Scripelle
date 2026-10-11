import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../db/prisma";
export const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
if (googleEnabled) passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.SERVER_URL}/api/v1/auth/google/callback`,
  state: true,
}, async (_access, _refresh, profile, done) => {
  try {
    const email = profile.emails?.find(entry => entry.verified)?.value;
    if (!email) return done(new Error("Verified email required"));
    let user = await prisma.user.findUnique({ where: { email } });
    if (user && user.googleId !== profile.id) return done(new Error("Automatic linking of existing accounts is disabled"));
    if (!user) {
      const beta = await prisma.betaAccessList.findUnique({ where: { email } });
      user = await prisma.user.create({ data: {
        email, googleId: profile.id, firstName: profile.name?.givenName || "",
        lastName: profile.name?.familyName || "", betaMember: !!beta?.approved,
        status: beta?.approved ? "approved" : "pending",
      }});
    }
    if (user.status !== "approved") return done(new Error("Account awaiting approval"));
    return done(null, user);
  } catch (error) { return done(error as Error); }
}));
export default passport;
