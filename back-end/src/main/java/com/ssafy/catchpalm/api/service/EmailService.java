package com.ssafy.catchpalm.api.service;

import javax.mail.MessagingException;
import java.io.UnsupportedEncodingException;

public interface EmailService {

    void sendVerificationEmail(String userEmail, String emailVerificationToken) throws MessagingException, UnsupportedEncodingException;
}
