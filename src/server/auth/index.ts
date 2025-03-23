import NextAuth, { getServerSession } from "next-auth";

import { authConfig } from "./config";

const handler = NextAuth(authConfig);
const getServerAuthSession = () => getServerSession(authConfig);

export { getServerAuthSession, handler };
