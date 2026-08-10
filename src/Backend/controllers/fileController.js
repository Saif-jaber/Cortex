import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomBytes } from "crypto";
import { r2 } from "../config/r2.js";
import File from "../models/File.js";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export async function getUploadUrl(req, res) {
  try {
    const { fileName, fileType, fileSize } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "fileName and fileType are required" });
    }
    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ error: "File type not allowed" });
    }
    if (fileSize > MAX_SIZE) {
      return res.status(400).json({ error: "File too large (max 50 MB)" });
    }

    const fileKey = `${randomBytes(16).toString("hex")}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }); // 5 min

    res.json({ uploadUrl, fileKey, fileName, fileType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function confirmUpload(req, res) {
  try {
    const { fileKey, fileName, fileType, fileSize, folder } = req.body;

    if (!fileKey || !fileName) {
      return res.status(400).json({ error: "fileKey and fileName are required" });
    }

    const file = await File.create({
      fileName,
      fileKey,
      fileType,
      fileSize,
      folder: folder || undefined,
      owner: req.user.id,
    });

    res.status(201).json(file);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getDownloadUrl(req, res) {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
    if (!file) return res.status(404).json({ error: "File not found" });

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: file.fileKey,
    });

    const downloadUrl = await getSignedUrl(r2, command, { expiresIn: 300 });

    res.json({ downloadUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function listFiles(req, res) {
  try {
    const files = await File.find().sort({ createdAt: -1 }).populate("owner", "firstName lastName email");
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteFile(req, res) {
  try {
    const file = await File.findOne({ _id: req.params.id, owner: req.user.id });
    if (!file) return res.status(404).json({ error: "File not found" });

    await r2.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: file.fileKey,
    }));

    await file.deleteOne();
    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
