package com.ssafy.catchpalm.common.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.*;

import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

import static com.google.common.collect.Lists.newArrayList;

/**
 * jwt 토큰 유틸 정의.
 */
@Component
public class JwtTokenUtil {
    private static String secretKey;
    private static Integer expirationTime;
    private static Integer refreshExpirationTime;
    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";
    public static final String ISSUER = "ssafy.com";
    
    @Autowired
	public JwtTokenUtil(@Value("${jwt.secret}") String secretKey, @Value("${jwt.expiration}") Integer expirationTime,
        @Value("${jwt.refresh.expiration}") Integer refreshExpirationTime) {
		this.secretKey = secretKey;
		this.expirationTime = expirationTime;
        this.refreshExpirationTime = refreshExpirationTime;
	}
    
	public void setExpirationTime() {
    		//JwtTokenUtil.expirationTime = Integer.parseInt(expirationTime);
    		JwtTokenUtil.expirationTime = expirationTime;
	}

	public static JWTVerifier getVerifier() {
        return JWT
                .require(Algorithm.HMAC512(secretKey.getBytes(StandardCharsets.UTF_8)))
                .withIssuer(ISSUER)
                .build();
    }
    
    public static String getToken(String userId) {
    		Date expires = JwtTokenUtil.getTokenExpiration(expirationTime);
        return JWT.create()
                .withSubject(userId)
                .withExpiresAt(expires)
                .withIssuer(ISSUER)
                .withClaim("typ", "AccessToken")
                .withIssuedAt(Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()))
                .sign(Algorithm.HMAC512(secretKey.getBytes(StandardCharsets.UTF_8)));
    }

    public static String getToken(Instant expires, String userId) {
        return JWT.create()
                .withSubject(userId)
                .withExpiresAt(Date.from(expires))
                .withIssuer(ISSUER)
                .withIssuedAt(Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()))
                .sign(Algorithm.HMAC512(secretKey.getBytes(StandardCharsets.UTF_8)));
    }

    public static String getRefreshToken(String userId) {
        return JWT.create()
                .withSubject(userId)
                .withIssuer(ISSUER)
                .withClaim("typ", "RefreshToken")
                .withIssuedAt(Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()))
                .sign(Algorithm.HMAC512(secretKey.getBytes(StandardCharsets.UTF_8)));
    }

    public static String getEmailToken(String userId) {
        Date expires = JwtTokenUtil.getTokenExpiration(expirationTime);
        return JWT.create()
                .withSubject(userId)
                .withExpiresAt(expires)
                .withIssuer(ISSUER)
                .withClaim("typ", "EmailVerificationToken")
                .withIssuedAt(Date.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()))
                .sign(Algorithm.HMAC512(secretKey.getBytes(StandardCharsets.UTF_8)));
    }

    public static String renewAccessTokenWithRefreshToken(String refreshToken, String userId) {
        try {
            // refreshToken의 검증
            DecodedJWT jwt = decodedJWT(refreshToken);

            if (!jwt.getSubject().equals(userId)) {
                throw new JWTVerificationException("User ID does not match");
            } else if(!jwt.getClaim("typ").asString().equals("RefreshToken") ){
                throw new JWTVerificationException("Token type does not match");
            }

            // 새로운 accessToken 생성
            String newAccessToken = getToken(userId);
            return newAccessToken;
        } catch (JWTVerificationException ex) {
            throw ex;
        }
    }

    public static DecodedJWT decodedJWT(String token){
        JWTVerifier verifier = JwtTokenUtil.getVerifier();
        JwtTokenUtil.handleError(token);
        DecodedJWT decodedJWT = verifier.verify(token.replace(JwtTokenUtil.TOKEN_PREFIX, ""));
        return decodedJWT;
    }


    public static Date getTokenExpiration(int expirationTime) {
    		Date now = new Date();
    		return new Date(now.getTime() + expirationTime);
    }

    public static Date getRefreshTokenExpiration(int refreshExpirationTime) {
        Date now = new Date();
        return new Date(now.getTime() + refreshExpirationTime);
    }

    public static void handleError(String token) {
        JWTVerifier verifier = getVerifier();

        try {
            verifier.verify(token.replace(TOKEN_PREFIX, ""));
        } catch (AlgorithmMismatchException ex) {
            throw ex;
        } catch (InvalidClaimException ex) {
            throw ex;
        } catch (SignatureGenerationException ex) {
            throw ex;
        } catch (SignatureVerificationException ex) {
            throw ex;
        } catch (TokenExpiredException ex) {
            throw ex;
        } catch (JWTCreationException ex) {
            throw ex;
        } catch (JWTDecodeException ex) {
            throw ex;
        } catch (JWTVerificationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw ex;
        }
    }

    public static void handleError(JWTVerifier verifier, String token) {
        try {
            verifier.verify(token.replace(TOKEN_PREFIX, ""));
        } catch (AlgorithmMismatchException ex) {
            throw ex;
        } catch (InvalidClaimException ex) {
            throw ex;
        } catch (SignatureGenerationException ex) {
            throw ex;
        } catch (SignatureVerificationException ex) {
            throw ex;
        } catch (TokenExpiredException ex) {
            throw ex;
        } catch (JWTCreationException ex) {
            throw ex;
        } catch (JWTDecodeException ex) {
            throw ex;
        } catch (JWTVerificationException ex) {
            throw ex;
        } catch (Exception ex) {
            throw ex;
        }
    }
}
