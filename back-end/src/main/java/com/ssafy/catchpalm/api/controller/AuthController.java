package com.ssafy.catchpalm.api.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.ssafy.catchpalm.api.request.UserLoginPostReq;
import com.ssafy.catchpalm.api.response.UserLoginPostRes;
import com.ssafy.catchpalm.api.service.UserService;
import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.common.util.JwtTokenUtil;
import com.ssafy.catchpalm.db.entity.User;
import com.ssafy.catchpalm.db.repository.UserRepositorySupport;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponses;
import io.swagger.annotations.ApiResponse;
import org.springframework.web.servlet.view.RedirectView;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * 인증 관련 API 요청 처리를 위한 컨트롤러 정의.
 */
@Api(value = "인증 API", tags = {"Auth."})
@RestController
@RequestMapping("/api/v1/auth")
public class  AuthController {

	@Value("${server.back.url}")
	private String serverBackUrl;

	@Value("${server.front.url}")
	private String serverFrontUrl;

	@Autowired
	UserService userService;

	@Autowired
	PasswordEncoder passwordEncoder;

	@PostMapping(value="/login")
	@ApiOperation(value = "로그인", notes = "<strong>아이디와 패스워드</strong>를 통해 로그인 한다.")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공", response = UserLoginPostRes.class),
			@ApiResponse(code = 401, message = "인증 실패", response = BaseResponseBody.class),
			@ApiResponse(code = 500, message = "사용자 없음", response = BaseResponseBody.class)
	})
	public ResponseEntity<UserLoginPostRes> login(@RequestBody @ApiParam(value="로그인 정보", required = true) UserLoginPostReq loginInfo) throws Exception {
		String userId = "local:"+loginInfo.getUserId();
		String password = loginInfo.getPassword();
		String refreshToken = JwtTokenUtil.getRefreshToken(userId);
		User user = userService.getUserByUserId(userId);
		userService.updateRefreshToken(userId, refreshToken);
		// 로그인 요청한 유저로부터 입력된 패스워드 와 디비에 저장된 유저의 암호화된 패스워드가 같은지 확인.(유효한 패스워드인지 여부 확인)
		if(user.getEmailVerified()==0){
			return ResponseEntity.status(401).body(UserLoginPostRes.of(401, "Email is not verified or Google or Naver account",null));
		}
		else if(passwordEncoder.matches(password, user.getPassword())) {
			// 유효한 패스워드가 맞는 경우, 로그인 성공으로 응답.(액세스 토큰을 포함하여 응답값 전달)
			return ResponseEntity.ok(UserLoginPostRes.of(200, "Success", JwtTokenUtil.getToken(userId)));
		}
		// 유효하지 않는 패스워드인 경우, 로그인 실패로 응답.
		return ResponseEntity.status(401).body(UserLoginPostRes.of(401, "Invalid Password", null));
	}

	@GetMapping("/verifyEmail")
	@ApiOperation(value = "이메일 인증", notes = "<strong>이메일 인증 토큰</strong>을 통해서 이메일 인증을 한다..")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공", response = UserLoginPostRes.class),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "토큰 오류 - 인증만료 등")
	})
	public ResponseEntity verifyEmail(@RequestParam("token") @ApiParam(value="이메일 토큰", required = true) String emailVerificationToken) throws Exception {
		String decodedToken = emailVerificationToken.replace("%2B", "+");
		User user = userService.getUserByVerificationToken(decodedToken);

		// 프론트 https로 변경되면 변경해야함
		//String address = "http://"+serverAddress+":3000";
		//String address = "https://"+serverAddress;
		String address = "https://i9c206.p.ssafy.io";


		URI redirectUrl = new URI("https://" + serverFrontUrl); // Your redirect URL here
		HttpHeaders httpHeaders = new HttpHeaders();
		httpHeaders.setLocation(redirectUrl);

		if (user != null) {
			if(user.getEmailVerified() == 1){
				return new ResponseEntity<>(UserLoginPostRes.of(200, "Aleady verified email so find password"),httpHeaders, HttpStatus.SEE_OTHER);
			}
			user.setEmailVerified(1);
			userService.updateUser(user);

			return new ResponseEntity<>(UserLoginPostRes.of(200, "Success"), httpHeaders, HttpStatus.SEE_OTHER);
		} else {
			return ResponseEntity.status(404).body(UserLoginPostRes.of(404, "failed - User not found or token expired"));
		}
	}
}
