import Folder from "../models/Folder.js"
// listFolders, createFolder
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