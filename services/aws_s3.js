const {open} = require('fs/promises');
const path = require('path');
const {s3} = require('./index');

const bucketName = process.env.S3_BUCKET_NAME;

exports.uploadFile = async (filename, uploadPath) => {
  const filepath = path.join(process.cwd(), 'public/uploads', filename)
  const fd = await open(filepath, 'r');
  const fileStream = fd.createReadStream();
  const uploadParams = {
    Bucket: bucketName,
    Key: uploadPath + filename,
    Body: fileStream
  };
  const data = await s3.upload(uploadParams).promise();
  return data;
}

exports.deleteFile = async fileKey => {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileKey
  }
  const data = await s3.deleteObject(deleteParams).promise();
  return data;
}