const {aws_ses} = require('./index');

module.exports = options => {
  return new Promise((resolve, reject) => {
    const {html, textMsg, toAddresses, sourceEmail, ccAddresses, bccAddresses, subject, replyToAddresses} = options;
    const params = {
      Destination: { /* required */
        BccAddresses: bccAddresses,
        CcAddresses: ccAddresses,
        ToAddresses: toAddresses
      },
      Message: { /* required */
        Body: { /* required */
          Html: {
            Charset: "UTF-8",
            Data: html
          },
          Text: {
            Charset: "UTF-8",
            Data: textMsg
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: subject
        }
      },
      Source: sourceEmail, /* required */
      ReplyToAddresses: replyToAddresses,
    };
    const sendPromise = aws_ses.sendEmail(params).promise();

// Handle promise's fulfilled/rejected states
    sendPromise.then(
      function (data) {
        resolve({code: 0, msg: data.MessageId});
      }).catch(
      function (err) {
        reject({code: 1, msg: err.stack});
      });
  });
};