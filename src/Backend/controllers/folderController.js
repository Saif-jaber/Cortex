import Folder from "../models/Folder.js"
import File from "../models/File.js"
import FileChunk from "../models/FileChunk.js"
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";

export async function listFolders(req, res){
    try {
        const folders = await Folder.find({ owner: req.user.id });
        res.json(folders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function createFolder(req, res){
    try {
        const {folderName} = req.body;

        if(!folderName){
            return res.status(400).json({ error: "folder name is required" });
        }

        const folder = await Folder.create({ folderName, owner: req.user.id});
        res.status(201).json(folder);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export async function deleteFolder(req, res) {
    try {
        const folder = await Folder.findOne({ _id: req.params.id, owner: req.user.id });
        if (!folder) return res.status(404).json({ error: "Folder not found" });

        const files = await File.find({ folder: folder._id, owner: req.user.id });

        for (const file of files) {
            try {
                await r2.send(new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: file.fileKey,
                }));
            } catch { /* R2 key may not exist */ }
            await FileChunk.deleteMany({ file: file._id });
            await file.deleteOne();
        }

        await folder.deleteOne();
        res.json({ message: "Folder deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}