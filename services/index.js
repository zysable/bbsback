const AWS = require('aws-sdk');
AWS.config.update({region: process.env.AWS_REGION});

const config = {
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
};

const s3 = new AWS.S3({...config, apiVersion: '2006-03-01'});

const aws_ses = new AWS.SES({...config, apiVersion: '2010-12-01'});

module.exports = {
  s3,
  aws_ses
}