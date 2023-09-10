package com.ssafy.catchpalm.api.controller;

import com.ssafy.catchpalm.api.request.UserModifyPostReq;
import com.ssafy.catchpalm.api.request.UserUserIdPostReq;
import com.ssafy.catchpalm.api.response.EmailVerifiedPostRes;
import com.ssafy.catchpalm.api.response.UserDuplicatedPostRes;
import com.ssafy.catchpalm.api.service.EmailService;
import com.ssafy.catchpalm.common.util.AESUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.ssafy.catchpalm.api.request.UserLoginPostReq;
import com.ssafy.catchpalm.api.request.UserRegisterPostReq;
import com.ssafy.catchpalm.api.response.UserLoginPostRes;
import com.ssafy.catchpalm.api.response.UserRes;
import com.ssafy.catchpalm.api.service.UserService;
import com.ssafy.catchpalm.common.auth.SsafyUserDetails;
import com.ssafy.catchpalm.common.model.response.BaseResponseBody;
import com.ssafy.catchpalm.common.util.JwtTokenUtil;
import com.ssafy.catchpalm.db.entity.User;
import com.ssafy.catchpalm.db.repository.UserRepositorySupport;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import springfox.documentation.annotations.ApiIgnore;

import javax.sql.DataSource;
import java.sql.Blob;
import java.sql.Connection;
import java.util.Base64;
import java.util.UUID;

/**
 * 유저 관련 API 요청 처리를 위한 컨트롤러 정의.
 */
@Api(value = "유저 API", tags = {"User"})
@RestController
@RequestMapping("/api/v1/users")
public class UserController {
	
	@Autowired
	UserService userService;

	@Autowired
	EmailService emailService;

	@Autowired
	private DataSource dataSource;

	@Autowired
	PasswordEncoder passwordEncoder;
	
	@PostMapping()
	@ApiOperation(value = "회원 가입", notes = "<strong>아이디와 패스워드</strong>를 통해 회원가입 한다.") 
    @ApiResponses({
        @ApiResponse(code = 200, message = "성공"),
        @ApiResponse(code = 401, message = "인증 실패"),
        @ApiResponse(code = 404, message = "사용자 없음"),
        @ApiResponse(code = 500, message = "서버 오류")
    })
	public ResponseEntity<? extends BaseResponseBody> register(
			@RequestBody @ApiParam(value="회원가입 정보", required = true) UserRegisterPostReq registerInfo) throws Exception {
		
		// 실제 유저 Id로 이메일을 보내야 하기 때문에 따로 userId 저장
		String userId = registerInfo.getUserId();
		// 자체 회원가입이기 때문에 db에는 local을 붙여서 저장
		registerInfo.setUserId("local:"+registerInfo.getUserId());
		User user = userService.createUser(registerInfo);
		userService.randomNickname(user.getUserId());

		// 유저 인증을 위한 이메일을 보낸다.
		emailService.sendVerificationEmail(userId,user.getEmailVerificationToken());
		
		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}
	
	@DeleteMapping("/logout")
	@ApiOperation(value = "로그아웃", notes = "로그인한 회원을 로그아웃 시킨다. header에 accessToken을 입력해야 한다." +
			"\n 예시 Authorization Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.e ..." +
			"{\n" +
			"\t\"timestamp\": 1690788467793,\n" +
			"\t\"status\": 401,\n" +
			"\t\"error\": \"TokenExpiredException\",\n" +
			"\t\"message\": \"The Token has expired on Mon Jul 31 16:27:12 KST 2023.\",\n" +
			"\t\"path\": \"/api/v1/users/me\"\n" +
			"} Access 토큰이 만료되었다면 이런 응답이 오게된다. 토큰을 요구하는 모든 요청에 해당한다.")
    @ApiResponses({
        @ApiResponse(code = 200, message = "성공"),
        @ApiResponse(code = 401, message = "인증 실패"),
        @ApiResponse(code = 500, message = "서버 오류 - 사용자 없음")
    })
	public ResponseEntity<? extends BaseResponseBody> logout(@ApiIgnore Authentication authentication) throws Exception {
		/**
		 * 요청 헤더 액세스 토큰이 포함된 경우에만 실행되는 인증 처리이후, 리턴되는 인증 정보 객체(authentication) 통해서 요청한 유저 식별.
		 * 액세스 토큰이 없이 요청하는 경우, 403 에러({"error": "Forbidden", "message": "Access Denied"}) 발생.
		 */
		// Spring security를 거치기 위해서 userDetails로 접근
		SsafyUserDetails userDetails = (SsafyUserDetails)authentication.getDetails();
		// userId를 얻어서
		String userId = userDetails.getUsername();
		// 로그아웃을 진행한다.
		userService.logoutUser(userId);

		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}

	@PostMapping("/delete")
	@ApiOperation(value = "회원 탈퇴", notes = "회원을 회원탈퇴 시킨다.. header에 accessToken을 입력해야 한다." +
			"\n 예시 Authorization Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.e ...")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 500, message = "서버 오류 - 사용자 없음")
	})
	public ResponseEntity<? extends BaseResponseBody> delete(@ApiIgnore Authentication authentication) throws Exception {
		/**
		 * 요청 헤더 액세스 토큰이 포함된 경우에만 실행되는 인증 처리이후, 리턴되는 인증 정보 객체(authentication) 통해서 요청한 유저 식별.
		 * 액세스 토큰이 없이 요청하는 경우, 403 에러({"error": "Forbidden", "message": "Access Denied"}) 발생.
		 */
		// Spring security를 거치기 위해서 userDetails로 접근
		SsafyUserDetails userDetails = (SsafyUserDetails)authentication.getDetails();
		// userId를 얻어서
		String userId = userDetails.getUsername();
		User user = userService.getUserByUserId(userId);
		userService.deleteUser(userId);

		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}

	@GetMapping("/me")
	@ApiOperation(value = "회원 본인 정보 조회", notes = "로그인한 회원 본인의 정보를 응답한다. header에 accessToken을 입력해야 한다." +
			"\n 예시 Authorization Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.e ...")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 500, message = "서버 오류 - 사용자 없음")
	})
	public ResponseEntity<UserRes> getUserInfo(@ApiIgnore Authentication authentication) {
		/**
		 * 요청 헤더 액세스 토큰이 포함된 경우에만 실행되는 인증 처리이후, 리턴되는 인증 정보 객체(authentication) 통해서 요청한 유저 식별.
		 * 액세스 토큰이 없이 요청하는 경우, 403 에러({"error": "Forbidden", "message": "Access Denied"}) 발생.
		 */
		// 위의 logout 과정과 동일
		SsafyUserDetails userDetails = (SsafyUserDetails)authentication.getDetails();
		String userId = userDetails.getUsername();
		User user = userService.getUserByUserId(userId);
		System.out.println(user.getProfileImg());
		return ResponseEntity.status(200).body(UserRes.of(user));
	}


	@PatchMapping("/modify")
	@ApiOperation(value = "회원 본인 정보 수정", notes = "로그인한 회원 본인의 정보를 수정한다. header에 accessToken을 입력해야 한다."+
			"\n 정보 수정할 값에만 null이 아닌 값을 넣으면 수정이 됩니다. Header 예시 Authorization Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.e ..." +
			"\n 이미지 파일은 byte[] bytes = Files.readAllBytes(Paths.get(\"path/to/your/image.jpg\"));\n" +
			"        String encoded = Base64.getEncoder().encodeToString(bytes); 이런식으로 이미지 파일을 bytes로 읽은 뒤 BASE64로 인코딩을 하여 전송한다.")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 500, message = "서버 오류 - 사용자 없음")
	})
	public ResponseEntity<? extends BaseResponseBody> modifyUserInfo(@ApiIgnore Authentication authentication, @RequestBody @ApiParam(value="수정할 유저 정보", required = true) UserModifyPostReq userModifyInfo) throws Exception {
		/**
		 * 요청 헤더 액세스 토큰이 포함된 경우에만 실행되는 인증 처리이후, 리턴되는 인증 정보 객체(authentication) 통해서 요청한 유저 식별.
		 * 액세스 토큰이 없이 요청하는 경우, 403 에러({"error": "Forbidden", "message": "Access Denied"}) 발생.
		 */
		SsafyUserDetails userDetails = (SsafyUserDetails)authentication.getDetails();
		String userId = userDetails.getUsername();
		User user = userService.getUserByUserId(userId);
		if(userModifyInfo.getNickname() != ""){ // 값이 있으면
			if(userService.isDuplicatedNickname(userModifyInfo.getNickname()) && !(userModifyInfo.getNickname().equals(user.getNickname()))){ // 중복인지 조사한 다음에
				return ResponseEntity.status(403).body(BaseResponseBody.of(403, "Nickname is duplicated"));
			}
			// 중복이 아니라면 닉네임 수정
			user.setNickname(userModifyInfo.getNickname());
		}
		if (userModifyInfo.getAge() != "") { // age에 값이 있다면
			// age 수정
			user.setAge(Integer.parseInt(userModifyInfo.getAge()));
		}
		if (userModifyInfo.getPassword() != "") { // password에 값이 있다면
			// password 수정
			user.setPassword(passwordEncoder.encode(userModifyInfo.getPassword()));
		}
		if (userModifyInfo.getSex() != "") { //sex에 값이 있다면
			// sex 수정
			user.setSex(Integer.parseInt(userModifyInfo.getSex()));
		}
		if (userModifyInfo.getProfileImg() != null && !userModifyInfo.getProfileImg().isEmpty()) {

			String base64Data = userModifyInfo.getProfileImg().split(",")[1];
			byte[] bytes = Base64.getDecoder().decode(base64Data);
			// Get a connection and create a Blob
			try (Connection connection = dataSource.getConnection()) {
				Blob blob = connection.createBlob();
				blob.setBytes(1, bytes);

				// Now you can set the blob in your entity
				user.setProfileImg(blob);
			}
		}
		if (userModifyInfo.getProfileMusic()!= "") { //Music에 값이 있다면
			// music 수정
			user.setProfileMusic(userModifyInfo.getProfileMusic());
		}
		if (userModifyInfo.getSynk() != "") { //synk 값이 있다면
			// synk 수정
			user.setSynk(Double.parseDouble(userModifyInfo.getSynk()));
		}
		if (userModifyInfo.getGameSound() != "") { //sex에 값이 있다면
			// sex 수정
			user.setGameSound(Double.parseDouble(userModifyInfo.getGameSound()));
		}
		if (userModifyInfo.getEffectSound() != "") { //sex에 값이 있다면
			// sex 수정
			user.setEffectSound(Double.parseDouble(userModifyInfo.getEffectSound()));
		}
		if (userModifyInfo.getBackSound() != "") { //sex에 값이 있다면
			// sex 수정
			user.setBackSound(Double.parseDouble(userModifyInfo.getBackSound()));
		}
		if (userModifyInfo.getIsCam() != "") { //sex에 값이 있다면
			// sex 수정
			user.setIsCam(Integer.parseInt(userModifyInfo.getIsCam()));
		}
		// 위의 정보를 종합해서 user의 정보를 수정한다.
		userService.updateUser(user);

		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}



	@PutMapping("/resendemail")
	@ApiOperation(value = "메일 재전송", notes = "<strong>메일</strong>을 재전송 한다.. ex) catchpalm@gmail.com")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공"),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 403, message = "인증된 이메일"),
			@ApiResponse(code = 500, message = "이메일 전송 오류 보통 사용자 없음")
	})
	public ResponseEntity<? extends BaseResponseBody> reSendEmail(
			@RequestBody @ApiParam(value="유저 Id 정보", required = true) UserUserIdPostReq userIdInfo) throws Exception {

		//임의로 리턴된 User 인스턴스. 현재 코드는 회원 가입 성공 여부만 판단하기 때문에 굳이 Insert 된 유저 정보를 응답하지 않음.
		User user = userService.getUserByUserId("local:"+userIdInfo.getUserId());
		userService.reSendEmail("local:"+userIdInfo.getUserId());
		emailService.sendVerificationEmail(userIdInfo.getUserId(),user.getEmailVerificationToken());
		if(user.getEmailVerified() == 1){
			return ResponseEntity.status(200).body(BaseResponseBody.of(200, "already verified email so must use authentication"));
		}

		return ResponseEntity.status(200).body(BaseResponseBody.of(200, "Success"));
	}

	@PostMapping("/duplicated/userId")
	@ApiOperation(value = "아이디 중복검사", notes = "<strong>아이디</strong>를 통해서 중복검사를 한다. \n 자체 회원가입을 하는 local:계정에서만 가능하다.")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공", response = UserDuplicatedPostRes.class),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버,토큰 오류 - 인증만료 등")
	})
	public ResponseEntity<? extends BaseResponseBody> isDuplicatedUserId(@RequestBody @ApiParam(value="유저 Id 정보", required = true) UserUserIdPostReq userIdInfo) throws Exception {
		String userId = "local:"+userIdInfo.getUserId();
		if(userId == null){
			return ResponseEntity.status(401).body(UserDuplicatedPostRes.of(401, "failed - userId is required"));
		}
		boolean isDuplicated = userService.isDuplicatedUserId(userId);
		User user = userService.getUserByUserId2(userId);
		if(user == null){
			return ResponseEntity.ok(UserDuplicatedPostRes.of(200, "Success",false));
		}
		int verified = user.getEmailVerified();
		if(verified == 0){
			isDuplicated = false;
		}
		return ResponseEntity.ok(UserDuplicatedPostRes.of(200, "Success",isDuplicated));
	}

	@GetMapping("/duplicated")
	@ApiOperation(value = "닉네임 중복검사", notes = "<strong>닉네임</strong>를 통해서 중복검사를 한다.")
	@ApiResponses({
			@ApiResponse(code = 200, message = "성공", response = UserDuplicatedPostRes.class),
			@ApiResponse(code = 401, message = "인증 실패"),
			@ApiResponse(code = 404, message = "사용자 없음"),
			@ApiResponse(code = 500, message = "서버,토큰 오류 - 인증만료 등")
	})
	public ResponseEntity<UserDuplicatedPostRes> isDuplicatedNickname(@RequestParam("nickname") @ApiParam(value="유저 닉네임", required = true) String nickname) throws Exception {
		boolean isDuplicated = userService.isDuplicatedNickname(nickname);
		return ResponseEntity.ok(UserDuplicatedPostRes.of(200, "Success",isDuplicated));
	}

}
