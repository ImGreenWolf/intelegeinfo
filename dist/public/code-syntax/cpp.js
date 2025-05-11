"use strict";
// import { ChildProcess, spawn } from 'child_process';
// import express, { Request, Response } from 'express';
// import fs from 'fs'
// import path from 'path';
// const router = express.Router();
// router.post('/check-syntax', (req, res) => {
//     const { filePath } = req.body;
//     if (!filePath || typeof filePath !== 'string') {
//          res.status(400).json({ error: 'Missing or invalid filePath' });
//     }
//     const absolutePath = path.resolve(filePath);
//     if (!fs.existsSync(absolutePath)) {
//          res.status(404).json({ error: 'File not found' });
//     }
//     const clang = spawn(`clang -fsyntax-only "${absolutePath}"`)
//     clang.stdout.on('data', (data) => {
//         console.log(data)
//     })
// });
