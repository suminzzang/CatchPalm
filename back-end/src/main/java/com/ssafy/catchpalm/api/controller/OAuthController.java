package com.ssafy.catchpalm.api.controller;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.AuthorizationCodeTokenRequest;
import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleTokenResponse;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.ssafy.catchpalm.api.response.UserLoginPostRes;
import com.ssafy.catchpalm.api.service.UserService;
import com.ssafy.catchpalm.common.util.JwtTokenUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;

/**
 * OAuth2 인증 관련 API 요청 처리를 위한 컨트롤러 정의.
 */
@Api(value = "Oauth2 API", tags = {"OAuth."})
@SuppressWarnings("deprecation")
@RestController
@RequestMapping("/api/v1/oauth2")
public class OAuthController {

    @Value("${server.back.url}")
    private String serverBackUrl;

    @Value("${server.front.url}")
    private String serverFrontUrl;

    @Value("${google.client.id}")
    private String clientId;

    @Value("${google.client.secret}")
    private String clientSecret;

    private GoogleAuthorizationCodeFlow flow;

    @Autowired
    UserService userService;

    @GetMapping("/authorization/google")
    @ApiOperation(value = "구글 로그인 주소 반환", notes = "구글계정으로 로그인 버튼을 위한 url을 String으로 반환한다")
    public String googleLogin() {
        try {
            GoogleClientSecrets secrets = new GoogleClientSecrets()
                    .setWeb(new GoogleClientSecrets.Details()
                            .setClientId(clientId)
                            .setClientSecret(clientSecret));

            flow = new GoogleAuthorizationCodeFlow.Builder(
                    new NetHttpTransport(),
                    JacksonFactory.getDefaultInstance(),
                    secrets,
                    Arrays.asList("profile", "email")
            ).build();

            AuthorizationCodeRequestUrl authorizationUrl =
		        flow.newAuthorizationUrl().setRedirectUri("https://"+ serverBackUrl +"/api/v1/oauth2/callback");


            return "redirect:" + authorizationUrl+"&prompt=select_account";
        } catch (Exception e) {
            throw new RuntimeException("google login error");
        }
    }

    @GetMapping("/callback")
    @ApiOperation(value = "구글 로그인 실행", notes = "구글계정으로 로그인 또는 회원가입을 실행한다.")
    public void googleCallback(@RequestParam("code") String code,HttpServletResponse response) {
        try {
            TokenResponse tokenResponse =
		        flow.newTokenRequest(code).setRedirectUri("https://"+ serverBackUrl +"/api/v1/oauth2/callback").execute();

            GoogleTokenResponse googleTokenResponse = (GoogleTokenResponse) tokenResponse;
            GoogleIdToken idToken = googleTokenResponse.parseIdToken();
            GoogleIdToken.Payload payload = idToken.getPayload();

            String userId = "google:"+payload.getEmail();
            String refreshToken = JwtTokenUtil.getRefreshToken(userId);

            // 증복된 아이디가 없는 경우에
            if(!userService.isDuplicatedUserId(userId)){
                // 회원가입을 진행하고
                userService.createOauthGoogleUser(userId);
                userService.randomNickname(userId);
            }
            // 로그인을 했으므로 refresh Token 발급
            userService.updateRefreshToken(userId, refreshToken);

            // accessToken을 body에 담아서 보내준다.
            String accessToken = JwtTokenUtil.getToken(userId);
            response.sendRedirect("https://"+ serverFrontUrl +"?token=" + accessToken);

        } catch (Exception e) {
            e.printStackTrace();  // 이 부분을 추가하여 실제 발생한 예외 정보를 출력
            throw new RuntimeException("google login error");
        }
    }
}
