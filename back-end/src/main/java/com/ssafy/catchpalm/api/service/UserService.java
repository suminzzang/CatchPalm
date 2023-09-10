package com.ssafy.catchpalm.api.service;

import com.ssafy.catchpalm.api.request.UserRegisterPostReq;
import com.ssafy.catchpalm.db.entity.User;

/**
 *	유저 관련 비즈니스 로직 처리를 위한 서비스 인터페이스 정의.
 */
public interface UserService {
	User createUser(UserRegisterPostReq userRegisterInfo) throws Exception;

	void logoutUser(String userId) throws Exception;

	void updateUser(User user) throws  Exception;

	void reSendEmail(String userId) throws Exception;

	User getUserByUserId(String userId);

	User createOauthGoogleUser(String userId) throws Exception;

	void randomNickname(String userId) throws Exception;

	void updateRefreshToken(String userId, String refreshToken) throws Exception;


	User getUserByUserId2(String userId);

	String getRefreshTokenByUserId(String userId) throws Exception;

    User getUserByVerificationToken(String token) throws Exception;

	boolean isDuplicatedUserId(String userId) throws Exception;

	boolean isDuplicatedNickname(String userNickname) throws Exception;

    void deleteUser(String userId);
}
