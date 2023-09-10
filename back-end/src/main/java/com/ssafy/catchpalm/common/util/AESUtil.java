package com.ssafy.catchpalm.common.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.security.Key;
import java.util.Base64;

@Component
public class AESUtil {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES";
    private static String secretKey;  // 16 characters

    @Autowired
    public AESUtil(@Value("${refresh.secret}") String secretKey) {
        this.secretKey = secretKey;
    }

    public static String encrypt(String value) throws Exception {
        byte[] decodedKey = Base64.getDecoder().decode(secretKey);
        SecretKey originalKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, originalKey);

        byte[] encryptedValueBytes = cipher.doFinal(value.getBytes());

        return Base64.getEncoder().encodeToString(encryptedValueBytes);
    }

    public static String decrypt(String encryptedValue) throws Exception {
        byte[] decodedKey = Base64.getDecoder().decode(secretKey);
        SecretKey originalKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, originalKey);

        byte[] decryptedValueBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedValue));

        return new String(decryptedValueBytes);
    }
}