import express from "express";
import { authMiddleware } from "./middleware";
import { prismaClient } from "db/client";
import { id } from "ethers";

const app = express();
app.use(express.json());

// create website
app.post("/api/v1/website", authMiddleware, async (req, res) => {
    const userId = req.userId!;
    const {url} = req.body;

    const data = await prismaClient.website.create({
        data: {
            userId,
            url,
        }
    })

    res.json({
        id: data.id
    })
});

// get website status
app.get("/api/v1/website/status", authMiddleware, async (req, res) => {
    const websiteId = req.query.websiteId! as string;
    const userId = req.userId;

    const data = await prismaClient.website.findFirst({
        where:{
            id: websiteId,
            userId,   // it will make sure that the website belongs to the user
            disabled: false
        },
        include:{
            websiteTicks: true
        }
    })

    res.json(data)
});

// get all websites
app.get("/api/v1/website", authMiddleware, async (req, res) => {
    const userId = req.userId;

    const websitesData = await prismaClient.website.findMany({
        where:{
            userId: userId,
            disabled: false
        }
    })

    res.json({
        websitesData
    })
});

// disable website
app.delete("/api/v1/website/:websiteId", authMiddleware, async (req, res) => {
  const userId = req.userId;
  const websiteId = req.params.websiteId;

  await prismaClient.website.update({
    where:{
        userId,
        id: websiteId
    },
    data: {
      disabled: true
    }
  })

  res.json({
    message: "Website disabled successfully"
  })
});



app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
