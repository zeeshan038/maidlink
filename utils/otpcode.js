require("dotenv").config();
const https = require("follow-redirects").https;

const sendOTP = (phone) => {
  return new Promise((resolve, reject) => {
    const otp = Math.floor(100000 + Math.random() * 900000);

    var options = {
      method: "POST",
      hostname: "api.infobip.com",
      path: "/sms/2/text/advanced",
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      maxRedirects: 20,
    };

    var reqSms = https.request(options, function (resSms) {
      var chunks = [];

      resSms.on("data", function (chunk) {
        chunks.push(chunk);
      });

      resSms.on("end", function () {
        var body = Buffer.concat(chunks);
        console.log("Infobip Response:", body.toString());
        resolve({ success: true, otp }); 
      });

      resSms.on("error", function (error) {
        console.error("Error:", error);
        reject({ success: false, message: "Failed to send OTP" });
      });
    });

    var postData = JSON.stringify({
      messages: [
        {
          destinations: [{ to: phone }],
          from: "maidlink",
          text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
        },
      ],
    });

    reqSms.write(postData);
    reqSms.end();
  });
};

module.exports = sendOTP;
