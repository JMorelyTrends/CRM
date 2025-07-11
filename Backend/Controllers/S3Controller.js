const express = require('express');
const {  PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto=require("crypto")
const { execSync } = require("child_process");
const fs = require("fs");
const pathModule = require("path");
const s3 = require("../utils/s3_connect")

exports.presignedurl=async(req,res)=>{
 
  const {filename,filetype}=req.body;

   const Fname= `${Date.now()}-${crypto.randomUUID()}`;
  
    const key = `CRM_images/${Date.now()}_${Fname}.jpg`;

    const params={
        Bucket:"morleytrends",
        Key:key,
        ContentType: 'jpg',
    }
   try{ 
    const command = new PutObjectCommand(params);
 
    const url = await getSignedUrl(s3, command, { expiresIn: 120 }); // 120 seconds validity
   
    res.json({ url,Fname });
}
    catch(err)
    {
        res.status(400).json({ message: err.message });
    }
}

exports.backupDatabase = async (req, res) => {
    const filename = "CRM_Dump";
    const BUCKET = "morleytrends";
    const backupDir = pathModule.join(__dirname, '../backups');
    const filePath = pathModule.join(backupDir, filename);
  
    try {
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
        console.log(`✅ [Backup] Created backup directory at: ${backupDir}`);
      }
  
      console.log(`⏳ [Backup] Starting mongodump to: ${filePath}`);
      execSync(`mongodump --uri="${process.env.MONGO_URI}" --archive=${filePath} --gzip`);
      console.log(`✅ [Backup] mongodump completed successfully.`);
  
      const content = fs.createReadStream(filePath);
      const key = `DB_backup/${filename}`;
      const params = {
        Bucket: BUCKET,
        Key: key,
        Body: content,
        ContentType: "application/gzip",
      };
  
      console.log(`☁️  [Backup] Uploading backup to s3://${BUCKET}/${key}`);
      await s3.send(new PutObjectCommand(params));
      console.log(`✅ [Backup] Uploaded backup to s3://${BUCKET}/${key}`);
  
      fs.unlinkSync(filePath);
      console.log(`🧹 [Backup] Deleted local backup file: ${filePath}`);
  
      res.status(200).json({ message: `✅ Backup uploaded to s3://${BUCKET}/${key} and local file deleted.` });
    } catch (err) {
      console.error(`❌ [Backup] Failed to upload to S3:`, err);
      res.status(500).json({ message: "❌ Failed to upload to S3", error: err.message });
    }
  };
  