//package com.ssafy.catchpalm.api.service;
//
//import com.ssafy.catchpalm.common.util.AESUtil;
//import com.ssafy.catchpalm.common.util.JwtTokenUtil;
//import com.ssafy.catchpalm.db.entity.User;
//import com.ssafy.catchpalm.db.repository.UserRepository;
//import net.minidev.json.JSONUtil;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
//import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
//import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
//import org.springframework.security.oauth2.core.user.OAuth2User;
//import org.springframework.stereotype.Service;
//
//import java.util.Collections;
//import java.util.Optional;
//
//// http://localhost:8080/oauth2/authorization/google 여기로 구글 로그인
//@Service
//public class CustomOAuth2UserService extends DefaultOAuth2UserService {
//
//    @Autowired
//    UserRepository userRepository;
//    @Autowired
//    UserService userService;
//    @Override
//    public OAuth2User loadUser(OAuth2UserRequest userRequest)  {
//        OAuth2User oAuth2User = super.loadUser(userRequest);
//        String provider = userRequest.getClientRegistration().getRegistrationId(); // 서비스 제공자 이름
//        String providerId = oAuth2User.getAttribute("sub"); // 서비스 제공자에서 사용자를 식별하는 ID
//        String email = oAuth2User.getAttribute("email"); // 사용자 이메일
//        String name = oAuth2User.getAttribute("name"); // 사용자 이름
//
//        System.out.println(email);
//        System.out.println(name);
//        System.out.println(providerId);
//        System.out.println(provider);
//
//        Optional<User> optionalUser =userRepository.findByUserId(email);
//        User user = null;
//
//        if(optionalUser.isPresent()){
//            user = optionalUser.get();
//        } else {
//            // handle the case where no User was found
//            user = new User();
//            user.setUserId(email);
//            user.setEmailVerified(1);
//            String emailVerificationToken = JwtTokenUtil.getEmailToken(email);
//            // email 인증토큰을 암호화하여 저장
//            try {
//                user.setEmailVerificationToken(AESUtil.encrypt(emailVerificationToken));
//            } catch (Exception e) {
//                throw new RuntimeException(e);
//            }
//            userRepository.save(user);
//        }
//
//        oAuth2User = new DefaultOAuth2User(
//                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
//                oAuth2User.getAttributes(),
//                "name" // 사용자의 이름에 해당하는 필드를 지정
//        );
//
//        System.out.println("OAuth2User attributes: " + oAuth2User.getAttributes());
//        System.out.println("OAuth2User authorities: " + oAuth2User.getAuthorities());
//        System.out.println("OAuth2User name: " + oAuth2User.getName());
//
//        return new DefaultOAuth2User(
//                Collections.singleton(new SimpleGrantedAuthority("ROLE_USER")),
//                oAuth2User.getAttributes(),
//                "name"// 사용자의 이름에 해당하는 필드를 지정
//
//        );
//    }
//}