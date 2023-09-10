package com.ssafy.catchpalm.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service("EmailService")
public class EmailServiceImpl implements EmailService {

    @Value("${server.back.url}")
    private String serverBackUrl;

    private final JavaMailSender emailSender;
    @Value("${spring.mail.username}")
    private String adminEmail;

    @Autowired
    public EmailServiceImpl(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Override
    public void sendVerificationEmail(String userEmail, String emailVerificationToken) throws MessagingException {
        String encodedToken = emailVerificationToken.replace("+", "%2B");
        String verificationUrl = "https://"+ serverBackUrl +"/api/v1/auth/verifyEmail?token=" + encodedToken;
        String buttonHtml = "<a href=\"" + verificationUrl + "\" style=\"background-color: #4CAF50; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer;\">Verify Email</a>";
        // Call your method to send an email, passing the verification URL.
        MimeMessage message = emailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");
        helper.setFrom(adminEmail); // 여기에는 실제 발신 이메일 주소를 입력해야 합니다.
        helper.setTo(userEmail);
        helper.setSubject("Email Verification");
        helper.setText("Please click the following button to verify your email: <br/>" + buttonHtml, true);
        emailSender.send(message);
    }
}
