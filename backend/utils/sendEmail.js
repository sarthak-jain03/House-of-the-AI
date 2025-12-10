import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,  
      pass: process.env.MAIL_PASS,   
    },
  });

    const mailOptions = {
      from: `"House of the AI" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <h2>Email Verification Code</h2>
        <p>Enter the following OTP to complete your signup:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("OTP sent to:", email);

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Could not send OTP. Please try again.");
  }
};
