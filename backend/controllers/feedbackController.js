import Feedback from "../models/feedback.model.js";
import brevo from "@getbrevo/brevo";

export const submitFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // 1. Save feedback to DB
    await Feedback.create({ name, email, message });

    // 2. Send email via Brevo
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = `New Feedback from ${name}`;
    sendSmtpEmail.sender = { name: "House of the AI", email: process.env.FEEDBACK_TO_EMAIL };
    sendSmtpEmail.to = [{ email: process.env.FEEDBACK_TO_EMAIL }];
    sendSmtpEmail.replyTo = { email: email }; // You can reply directly
    sendSmtpEmail.htmlContent = `
      <h2>New Feedback Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return res.json({ success: true, message: "Feedback sent successfully!" });

  } catch (err) {
    console.error("Feedback Error:", err);
    return res.status(500).json({ success: false, message: "Unable to send feedback." });
  }
};
