const express = require('express');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto=require("crypto")
const s3 = new S3Client({
    region: 'eu-north-1', 
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

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