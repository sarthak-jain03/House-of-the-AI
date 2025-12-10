import SibApiV3Sdk from "sib-api-v3-sdk";

export const sendOTPEmail = async (email, otp) => {
  try {
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

    const tranEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

    await tranEmailApi.sendTransacEmail({
      sender: { email: process.env.SENDER_EMAIL, name: "House of the AI" },
      to: [{ email }],
      subject: "Your OTP Verification Code",
      htmlContent: `
        <h2>Email Verification Code</h2>
        <p>Enter the following OTP to complete your signup:</p>
        <h1 style="color:#4CAF50; font-size:32px;">${otp}</h1>
        <p>This OTP expires in <strong>10 minutes</strong>.</p>
      `,
    });

    console.log("OTP sent successfully");

  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Could not send OTP. Please try again.");
  }
};
