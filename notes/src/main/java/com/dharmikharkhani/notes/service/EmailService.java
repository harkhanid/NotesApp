package com.dharmikharkhani.notes.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.dharmikharkhani.notes.auth.model.User;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import java.io.IOException;

@Service
public class EmailService {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${sendgrid.api.key:}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email:noreply@notesapp.com}")
    private String fromEmail;

    @Value("${sendgrid.from.name:NotesApp}")
    private String fromName;

    public void sendVerificationEmail(User user, String token) throws IOException {
        String verificationUrl = frontendUrl + "/verify-email?token=" + token;
        String subject = "Verify Your NotesApp Account";
        String htmlContent = buildVerificationEmailTemplate(user.getName(), verificationUrl);

        sendEmail(user.getEmail(), subject, htmlContent);
    }

    public void sendPasswordResetEmail(User user, String token) throws IOException {
        String resetUrl = frontendUrl + "/resetpassword?token=" + token;
        String subject = "Reset Your NotesApp Password";
        String htmlContent = buildPasswordResetEmailTemplate(user.getName(), resetUrl);

        sendEmail(user.getEmail(), subject, htmlContent);
    }

    private void sendEmail(String to, String subject, String htmlContent) throws IOException {
        // Check if SendGrid is configured
        if (sendGridApiKey == null || sendGridApiKey.trim().isEmpty()) {
            System.out.println("⚠️  SendGrid not configured - Email would be sent to: " + to);
            System.out.println("   Subject: " + subject);
            System.out.println("   (Set SENDGRID_API_KEY environment variable to enable email sending)");
            return; // Skip sending in development mode
        }

        Email from = new Email(fromEmail, fromName);
        Email toEmail = new Email(to);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sg.api(request);

        if (response.getStatusCode() >= 400) {
            throw new IOException("Failed to send email. Status: " + response.getStatusCode() +
                                  ", Body: " + response.getBody());
        }
    }

    private String buildVerificationEmailTemplate(String userName, String verificationUrl) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }" +
                "        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }" +
                "        .header { background-color: #4A90E2; padding: 30px 20px; text-align: center; color: #ffffff; }" +
                "        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }" +
                "        .content { background-color: #ffffff; padding: 30px; }" +
                "        .button { display: inline-block; padding: 12px 30px; background-color: #4A90E2; color: #ffffff !important; border: none; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
                "        .footer { text-align: center; padding: 20px; background-color: #f9f9f9; font-size: 12px; color: #999; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class=\"container\">" +
                "        <div class=\"header\">" +
                "            <h1>NotesApp</h1>" +
                "        </div>" +
                "        <div class=\"content\">" +
                "            <h2 style=\"color: #4A90E2; margin-top: 0;\">Welcome to NotesApp!</h2>" +
                "            <p>Hi " + userName + ",</p>" +
                "            <p>Thank you for signing up for NotesApp! To complete your registration, please verify your email address by clicking the button below:</p>" +
                "            <div style=\"text-align: center;\">" +
                "                <a href=\"" + verificationUrl + "\" class=\"button\" style=\"color: #ffffff; text-decoration: none;\">Verify Email Address</a>" +
                "            </div>" +
                "            <p>Or copy and paste this link into your browser:</p>" +
                "            <p style=\"word-break: break-all; color: #4A90E2; background-color: #f0f8ff; padding: 10px; border-radius: 4px; font-size: 14px;\">" + verificationUrl + "</p>" +
                "            <p style=\"background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0;\"><strong>⏰ This link will expire in 1 hour.</strong></p>" +
                "            <p>If you didn't create an account with NotesApp, you can safely ignore this email.</p>" +
                "            <p>Best regards,<br>The NotesApp Team</p>" +
                "        </div>" +
                "        <div class=\"footer\">" +
                "            <p>&copy; 2024 NotesApp. All rights reserved.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    private String buildPasswordResetEmailTemplate(String userName, String resetUrl) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset=\"UTF-8\">" +
                "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }" +
                "        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }" +
                "        .header { background-color: #E94B3C; padding: 30px 20px; text-align: center; color: #ffffff; }" +
                "        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }" +
                "        .content { background-color: #ffffff; padding: 30px; }" +
                "        .button { display: inline-block; padding: 12px 30px; border: none; background-color: #E94B3C; color: #ffffff !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }" +
                "        .footer { text-align: center; padding: 20px; background-color: #f9f9f9; font-size: 12px; color: #999; }" +
                "        .warning { background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 10px; margin: 15px 0; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class=\"container\">" +
                "        <div class=\"header\">" +
                "            <h1>NotesApp</h1>" +
                "        </div>" +
                "        <div class=\"content\">" +
                "            <h2 style=\"color: #E94B3C; margin-top: 0;\">Password Reset Request</h2>" +
                "            <p>Hi " + userName + ",</p>" +
                "            <p>We received a request to reset your NotesApp password. Click the button below to create a new password:</p>" +
                "            <div style=\"text-align: center;\">" +
                "                <a href=\"" + resetUrl + "\" class=\"button\" style=\"color: #ffffff; text-decoration: none;\">Reset Password</a>" +
                "            </div>" +
                "            <p>Or copy and paste this link into your browser:</p>" +
                "            <p style=\"word-break: break-all; color: #E94B3C; background-color: #ffebee; padding: 10px; border-radius: 4px; font-size: 14px;\">" + resetUrl + "</p>" +
                "            <div class=\"warning\">" +
                "                <p style=\"margin: 0;\"><strong>⏰ This link will expire in 1 hour.</strong></p>" +
                "            </div>" +
                "            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>" +
                "            <p>For security reasons, we recommend choosing a strong, unique password.</p>" +
                "            <p>Best regards,<br>The NotesApp Team</p>" +
                "        </div>" +
                "        <div class=\"footer\">" +
                "            <p>&copy; 2024 NotesApp. All rights reserved.</p>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }
}
