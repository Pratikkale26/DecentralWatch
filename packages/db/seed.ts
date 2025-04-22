import { prismaClient } from "./src";

const USER_ID = "8";

async function seed() {
    await prismaClient.user.create({
        data: {
            id: USER_ID,
            email: "admin@admin.com",
            address: "0x1231231231231231231231231231231231231231",
            name: "Admin kale",
        }
    })

    const website = await prismaClient.website.create({
        data: {
            url: "https://www.google.com",
            userId: USER_ID,
            expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            disabled: false,
            signature: "fdfdfadfa"
        }
    })

    const validator1 = await prismaClient.validator.create({
        data: {
            id: "1",
            publicKey: "1",
            location: "1",
            ip: "1",
        }
    })

    const validator2 = await prismaClient.validator.create({
        data: {
            id: "2",
            publicKey: "2",
            location: "2",
            ip: "2",
        }
    })

    await prismaClient.websiteTick.create({
        data: {
            websiteId: website.id,
            validatorId:  validator1.id,
            status: "UP",
            latency: 40,
            createdAt: new Date(),
        }
    })

    await prismaClient.websiteTick.create({
        data: {
            websiteId: website.id,
            validatorId: validator2.id,
            status: "UP",
            latency: 100,
            createdAt: new Date(Date.now() - 10 * 60 * 1000),
        }
    })

    await prismaClient.websiteTick.create({
        data: {
            websiteId: website.id,
            validatorId: validator2.id,
            status: "DOWN",
            latency: 100,
            createdAt: new Date(Date.now() - 20 * 60 * 1000),
        }
    })
}

seed();