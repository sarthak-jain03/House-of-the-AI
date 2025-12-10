import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,    
        pass: process.env.MAIL_PASS,     
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family:Arial; line-height:1.5;">
          <h2>Email Verification</h2>
          <p>Your OTP for verifying your account is:</p>
          <h1 style="font-size:32px; letter-spacing:3px;">${otp}</h1>
          <p>This OTP expires in <strong>10 minutes</strong>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent to:", email);

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Could not send OTP. Please try again.");
  }
};
