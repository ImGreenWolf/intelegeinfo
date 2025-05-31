import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from './dbClient';
import { authMiddleware } from './server';
// import { rootDirName } from './server';
// import rootDirName from "./server"
const rootDirName = path.resolve("./")

const router = express.Router();

router.post('frame', (req, res)=>{

    req.body
})

export default router;