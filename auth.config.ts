import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
        const isLoggedIn = !!auth?.user
        const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
        if (isOnDashboard) {
            return isLoggedIn // Redirect unauthenticated users to login page if
        } else if (isLoggedIn) {
            return Response.redirect(new URL('/dashboard', nextUrl))
        }

        return true //returning true here to allow users see the homepage. In a prod app, this should be defaulted to false and explicitly allow pages for un-authorised access
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
