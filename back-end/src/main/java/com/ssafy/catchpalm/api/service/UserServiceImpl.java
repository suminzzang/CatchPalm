package com.ssafy.catchpalm.api.service;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.ssafy.catchpalm.common.util.AESUtil;
import com.ssafy.catchpalm.common.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ssafy.catchpalm.api.request.UserRegisterPostReq;
import com.ssafy.catchpalm.db.entity.User;
import com.ssafy.catchpalm.db.repository.UserRepository;
import com.ssafy.catchpalm.db.repository.UserRepositorySupport;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 *	유저 관련 비즈니스 로직 처리를 위한 서비스 구현 정의.
 */
@Service("userService")
public class UserServiceImpl implements UserService {
	@Autowired
	UserRepository userRepository;
	
	@Autowired
	UserRepositorySupport userRepositorySupport;
	
	@Autowired
	PasswordEncoder passwordEncoder;
	
	@Override
	public User createUser(UserRegisterPostReq userRegisterInfo) throws Exception {
		// db에 저장될  user_id ex) local:catchpalm@gmail.com
		String userId = userRegisterInfo.getUserId();
		// 이메일을 보낼 user_id ex) catchpalm@gmail.com
		Optional<User> optionalUser =userRepository.findByUserId(userId);
		User user = null;

		if(optionalUser.isPresent()){
			user = optionalUser.get();
			// do something with userCheck
			if(user.getEmailVerified() == 1){
				throw new RuntimeException("Already registed userId");
			}
		} else {
			// handle the case where no User was found
			user = new User();
			user.setUserId(userId);
		}
		// 보안을 위해서 유저 패스워드 암호화 하여 디비에 저장.
		user.setPassword(passwordEncoder.encode(userRegisterInfo.getPassword()));
		// email 인증토큰 생성
		user.setAge(Integer.parseInt(userRegisterInfo.getAge()));
		user.setSex(Integer.parseInt(userRegisterInfo.getSex()));
		String emailVerificationToken = JwtTokenUtil.getEmailToken(userId);
		// email 인증토큰을 암호화하여 저장
		user.setEmailVerificationToken(AESUtil.encrypt(emailVerificationToken));
		return userRepository.save(user);
	}

	@Override
	public User createOauthGoogleUser(String userId) throws Exception {
			// handle the case where no User was found
		User user = new User();
		user.setUserId(userId);
		user.setEmailVerified(1);
		// 보안을 위해서 유저 패스워드 암호화 하여 디비에 저장.
		String emailVerificationToken = JwtTokenUtil.getEmailToken(userId);
		// email 인증토큰을 암호화하여 저장
		user.setEmailVerificationToken(AESUtil.encrypt(emailVerificationToken));
		return userRepository.save(user);
	}

	@Override
	public void randomNickname(String userId) throws Exception{
		User user = getUserByUserId(userId);
		user.setNickname("catchpalm@"+user.getUserNumber());
		userRepository.save(user);
	}

	@Override
	public void updateRefreshToken(String userId, String refreshToken) throws Exception {
		User user = getUserByUserId(userId);
		// refresh Token을 암호화
		String encryptedRefreshToken = AESUtil.encrypt(refreshToken);
		user.setRefreshToken(encryptedRefreshToken);
		userRepository.save(user);
	}

	@Override
	public void logoutUser(String userId) throws Exception{
		User user = getUserByUserId(userId);
		user.setRefreshToken(null);
		userRepository.save(user);
	}


	@Override
	public void updateUser(User user) throws  Exception{
		userRepository.save(user);
	}

	@Override
	public void reSendEmail(String userId) throws Exception{
		User user = getUserByUserId(userId);
		String emailVerificationToken = JwtTokenUtil.getEmailToken(userId);
		user.setEmailVerificationToken(AESUtil.encrypt(emailVerificationToken));
		userRepository.save(user);
	}

	@Override
	public User getUserByUserId(String userId) {
		// 디비에 유저 정보 조회 (userId 를 통한 조회).
		Optional<User> optionalUser = userRepository.findByUserId(userId);

		if(!optionalUser.isPresent()){
			throw new RuntimeException("User not found");
		}
		User user = optionalUser.get();
		return user;
	}

	@Override
	public User getUserByUserId2(String userId) {
		// 디비에 유저 정보 조회 (userId 를 통한 조회).
		Optional<User> optionalUser = userRepository.findByUserId(userId);

		if(!optionalUser.isPresent()){
			return null;
		}
		User user = optionalUser.get();
		return user;
	}


	@Override
	public String getRefreshTokenByUserId(String userId) throws Exception {
		User user = getUserByUserId(userId);
		String decryptRefreshToken = AESUtil.decrypt(user.getRefreshToken());
		return decryptRefreshToken;
	}


	@Override
	public User getUserByVerificationToken(String emailVerificationToken) throws Exception{
		emailVerificationToken = AESUtil.decrypt(emailVerificationToken);
		DecodedJWT decodedJWT = JwtTokenUtil.decodedJWT(emailVerificationToken);
		String typ = decodedJWT.getClaim("typ").asString();
		if(!"EmailVerificationToken".equals(typ)){
			throw new BadCredentialsException("Invalid token type: " + typ);
		}
		User user = getUserByUserId(decodedJWT.getSubject());
		return user;
	}

	@Override
	public boolean isDuplicatedUserId(String userId) throws Exception{
		return userRepository.existsByUserId(userId);
	}

	@Override
	public boolean isDuplicatedNickname(String userNickname) throws Exception{
		return userRepository.existsByNickname(userNickname);
	}


	@Override
	public void deleteUser(String userId){
		User user = getUserByUserId(userId);
		System.out.println(user.getEmailVerified());
		user.setEmailVerified(0);
		userRepository.save(user);
		System.out.println(user.getEmailVerified());
	}

}
