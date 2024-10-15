import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { loginSchema, registerSchema } from '../schemas'
import { createAdminClient } from '@/lib/appwrite'
import { ID } from 'node-appwrite'
import { deleteCookie, setCookie } from 'hono/cookie'
import { AUTH_COOKIE } from '../constants'
import { sessionMiddleware } from '@/lib/session-middleware'

const app = new Hono()
    .get('/me', sessionMiddleware, async (c) => {
        const user = c.get("user");
        return c.json({ data: user })
    })

    .post('/login', zValidator("json", loginSchema), async (c) => {
        const { email, password } = await c.req.valid("json")

        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(email, password);

        setCookie(c, AUTH_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 60 * 60 * 24 * 30,
        })
        return c.json({
            success: true
        })
    })

    .post('/register', zValidator("json", registerSchema), async (c) => {
        const { name, email, password } = await c.req.valid("json")
        const { account } = await createAdminClient();

        await account.create(ID.unique(), email, password, name);
        const session = await account.createEmailPasswordSession(email, password);



        setCookie(c, AUTH_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            maxAge: 60 * 60 * 24 * 30,
        })

        return c.json({
            success: true,
        })
    })
    .post('/logout', sessionMiddleware, async (c) => {
        const account = c.get("account");

        deleteCookie(c, AUTH_COOKIE);
        await account.deleteSession("current");

        return c.json({
            success: true
        })
    })

export default app