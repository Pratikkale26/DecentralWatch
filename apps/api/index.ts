import express from "express";
import { authMiddleware } from "./middleware";
import { prismaClient } from "db/client";
import cors from "cors";

const app = express();
app.use(express.json());

app.use(cors());

// create website
app.post("/api/v1/website", authMiddleware, async (req, res) => {
    const userId = req.userId!;
    const {url} = req.body;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const data = await prismaClient.website.create({
        data: {
            userId,
            url,
            expiry: expiryDate
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
    if (!data) {
        res.status(404).json({ error: "Website not found or expired." });
        return
      }      

    res.json(data)
});

// get all websites
app.get("/api/v1/websites", authMiddleware, async (req, res) => {
    const userId = req.userId;
    const now = new Date();


    const websites = await prismaClient.website.findMany({
        where:{
            userId: userId,
            disabled: false,
            expiry: {
                gt: now
            }
        },
        include:{
            websiteTicks: true
        }
    })

    res.json({
        websites
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



app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
