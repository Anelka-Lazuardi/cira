"use server";

import { cretaeSessionClient } from "@/lib/appwrite";

export const getCurrent = async () => {
    try {
        const { account } = await cretaeSessionClient();

        return await account.get()
    } catch {
        return null;
    }

}