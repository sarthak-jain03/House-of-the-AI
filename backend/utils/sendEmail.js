import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"House of the AI" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <h2>Email Verification Code</h2>
        <p>Enter the following OTP to complete your signup:</p>
        <h1 style="color:#4CAF50; font-size:32px;">${otp}</h1>
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
