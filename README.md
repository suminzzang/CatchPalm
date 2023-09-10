# CatchPalm - 손으로 리듬을 잡아라!
![image](/uploads/b3b8e6b0d33f350b50090cb42dd6c4d6/image.png)
## 소개 및 시연 영상

## 개요
VR게임의 시대! 그런데 VR기기 너무 비싸고 불편하지 않나요? 웹캠만 있으면 간편하게 즐길 수 있는 유사 VR 리듬게임 CatchPalm으로 즐겨보세요

## Why?
비디오를 이용한 게임을 구상 중 BeatSaber에서 영감을 받아 손모양을 인식해서 즐길 수 있는 리듬게임을 구상했습니다.

## 주요 서비스 화면

### 게임 실행 화면
![게임실행화면](/uploads/9860b76ec4be6c7b4638bf1de1cbf494/게임실행화면.gif)
### 대기방
![대기방](/uploads/bd2a1ba71e856218202edeebbfc2f4a0/대기방.gif)
### 결과창
![결과창](/uploads/dc295827d0ac71cba5328909423a1d3e/결과창.gif)
### 랭킹 창
![랭킹창](/uploads/3afec457adb570dd5650e011bd790728/랭킹창.gif)
#### 더 자세한 정보는 https://lab.ssafy.com/s09-webmobile1-sub2/S09P12C206/-/blob/master/scenario-details.md 에서!

---

## 주요 기능
---
서비스 설명 : 아무나 VR기기 없이 즐길 수 있는 유사 VR리듬게임

주요 기능 :
- MediaPipe를 통한 실시간 손모양 인식을 통한 리듬게임
- WebRTC를 활용한 친구들 끼리의 동시 화상 진행
- 랭킹 시스템을 통한 사용자들 끼리의 승부욕 증진

## 개발 환경
### BackEnd
- Intellij
- Spring Boot 2.4.5
- Spring Boot JPA
- Spring Security
- Java 17
- AWS EC2
- Mysql
- WebSocket
- OAuth
### FrontEnd
- Visual Studio Code
- React 18.2.0
- Material-UI 
- MediaPipe 0.10.0
- nodejs 18
### WebRTC
- OpenVidu 2.19.0
### CI/CD
- AWS EC2
- Docker
- NginX
- GitLab

## 서비스 아키텍처

## 기술 상세
- MediaPipe
  - 현재 사용자의 웹캠 화면에 나오는 손 정보를 분석하여 화면에 띄운 후, 손을 펼쳤을 때 중앙이라고 할 수 있는 중지손가락 관절이 시작되는 부분의 손의 좌표를 인식합니다. Json데이터를 받아와 화면에 원을 생성하고 생성된 원의 좌표와 손의 좌표가 일치할 때 타이밍이 맞게 손 모양을 입력했을 시에, 타이밍에 따라 점수를 차등획득 하도록 하였습니다.
- WebSocket
  - 게임 대기방을 WebSocket을 활용하여 통신이 되도록 하여 사용자들 끼리의 채팅을 구현하였습니다. 방의 최대 인원은 4명으로 세팅 하였으며 방장을 제외한 모든 사람들이 Ready버튼을 누르면 모두가 해당 사용자가 Ready를 했음을 인식 할 수 있고, 모든 사용자가 Ready상태가 되어야 게임이 시작될 수 있도록 구성했습니다. 그 후 게임 시작이 된다면 WebSocket은 종료되고 WebRTC로 넘어가게 됩니다.
- WebRTC (Openvidu)
  - WebSocket환경에서 게임 시작을 한 뒤 WebRTC환경으로 들어오게 됩니다. 하지만 게임 중에 사용자들이 얼굴이 서로에게 보이는 것은 불쾌할 수 있다고 생각하여 원하는 사람들(EX. 친구들과 게임을 하는 사람들)은 우측에 버튼을 눌러 WebRTC화상 환경에 접속할 수 있도록 구성했습니다.
- 배포
  - Docker, NginX, Jenkins를 이용하여 Git에서 코드를 가져와 Build후 배포하는 자동배포를 구현하였습니다. BackEnd와 FrontEnd를 Docker를 활용하여 배포하였습니다.

## 협업 툴
- Git
- Jira
- Mattermost
- Discord

## 요구사항 정의서
![image](/uploads/5b79fcf3490948ac721ac5e13c1ea85d/image.png)
![image](/uploads/14b8ae3e622d16289031963fca965dea/image.png)

## ER Diagram
![image](/uploads/373466011e559dcfcf3d367167bf51b6/image.png)
![image](/uploads/d213e0a9c736d478a899096ea0c6a518/image.png)

## EC2 포트 정리
|Port|내용|
|------|---|
|443|HTTPS|
|80|HTTP(HTTPS 로 Redirect)|
|4443|Openvidu|
|3306|MySQL|
|8080|Spring Boot Docker Container|
|3000|React Docker Container|


## 팀원 역할
1. 이재진(팀장, 백엔드1) - AWS Docker(FrontEnd, BackEnd), NginX, OpenVidu 서버 구축, BackEnd, FrontEnd 코드 병합 및 디버깅, 프로젝트 배포 관리 
2. 이수민(백엔드2) - [BE]JAVA jpa entity 객체 구현, 유저 관련 api 구현, 게임 관련 api 구현, openVidu api구현, JWT 구현, 이메일 인증서비스 구현, 구글 로그인 구현 / [FE] 랭킹페이지 구현, 결과 페이지 구현, 마이페이지 구현, 로그인 페이지 ui 구현, 회원가입 페이지 ui 구현 
3. 손민우(백엔드3) - [BE]JAVA jpa entity 객체 구현. 게임 대기방 관련 api 구현. 게임 대기방 웹 소켓 연결 및 api 구현. / [FE] 게임 대기방 웹 소켓 연결, 구독설정 및 전체적인 기능 구현&연결. 게임 대기방 페이지 구현. 프로필 사진 업로드 기능 구현. [ETC] UCC 촬영 보조. 게임 DATA(json) base_model 제작.
4. 홍경환(프론트엔드1) - MediaPipe를 활용한 리듬 게임 전체 구현, 게임플레이 페이지 디자인 구현, webRTC OpenVidu 라이브러리를 이용하여 게임 멀티플레이시 화상연결, 튜토리얼 페이지 구현
5. 임채상(프론트엔드2) - 메인페이지 UI 제작, 프로젝트 로고 제작, 튜토리얼 페이지 제작, 유저관련 API 연결, 유저관련 에러 예외 처리, 중간발표 PPT 제작, 중간발표, 최종발표 PPT 제작, 최종발표, UCC제작, 기능소개 영상 제작
6. 임준환(프론트엔드3) - 게임 로비화면에서의 게임방 리스트, 게임방 생성 등 게임 로비화면 구성. 게임방 관련 API 연결. 방 검색 기능, 엑세스 토큰 갱신시 새로운 토큰 발급 처리. 게임 플레이시 강제로 닫거나, url 변경 시 방 없어지는 예외처리. 중간발표 ppt 제작, 최종 발표 ucc 촬영 보조.
