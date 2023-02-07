import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import axios from 'axios';

// External authorisation using NextJS. Currently supports Google authentication
// which is able to create a user server side. The backend authenticates the jwt
// with Google and returns to the user an access token. 

// In future, this feature is easily configurable to support refresh tokens.
const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers:[
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret:"LlKq6ZtYbr+hTC073mAmAh9/h2HwMfsFo4hrfCx5mLg=",
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {

        try {
          const response = await axios.post(
            // `${process.env.DJANGO_URL}/api/social/login/google/`,
            `https://cxnpl-server-production.up.railway.app/api/social/login/google/`,
            {
              access_token: account.access_token,
              id_token: account.id_token,
            },
          );
          // eslint-disable-next-line 
          // @ts-ignore
          user.access_token =response.data.access_token;

          return true;
        } catch (error) {
          return false;
        }
      }
      return false;
    },

    async jwt({token, user}) {
      if (user) {
        // eslint-disable-next-line 
        // @ts-ignore
        token.access_token = user.access_token;
        token.uid = user.id;
      }
      return token;
    },

    async redirect({url}) {
      url = `${process.env.NEXTAUTH_URL}`
      return url
    },

    async session({session, token}) {
      // eslint-disable-next-line 
    // @ts-ignore
      session.access_token = token.access_token;
      if (session?.user) {
        // eslint-disable-next-line 
        // @ts-ignore
        session.user.id = token.uid;
      }
      return session;
    },
},

};

export default NextAuth(authOptions);