import { OpenVidu } from 'openvidu-browser';
import axios from 'axios';
import React, { Component } from 'react';
import UserVideoComponent from './UserVideoComponent';

// 애플리케이션 서버 URL 설정
const APPLICATION_SERVER_URL = process.env.NODE_ENV === 'production' ? '' : 'https://localhost:8443/';

class App extends Component {
    constructor(props) {
        super(props);

        // 초기 상태 설정
        this.state = {
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            session: undefined,
            mainStreamManager: undefined,
            publisher: undefined,
            subscribers: [],
        };

        // 함수들을 현재 컴포넌트의 컨텍스트에 바인딩
        this.joinSession = this.joinSession.bind(this);
        this.leaveSession = this.leaveSession.bind(this);
        this.switchCamera = this.switchCamera.bind(this);
        this.handleChangeSessionId = this.handleChangeSessionId.bind(this);
        this.handleChangeUserName = this.handleChangeUserName.bind(this);
        this.handleMainVideoStream = this.handleMainVideoStream.bind(this);
        this.onbeforeunload = this.onbeforeunload.bind(this);
    }

    // 컴포넌트가 마운트될 때 이벤트 리스너 추가
    componentDidMount() {
        window.addEventListener('beforeunload', this.onbeforeunload);
    }

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.onbeforeunload);
    }

    // 페이지가 닫힐 때 세션을 나가는 함수
    onbeforeunload(event) {
        this.leaveSession();
    }

    // 세션 ID를 변경하는 함수
    handleChangeSessionId(e) {
        this.setState({ mySessionId: e.target.value });
    }

    // 사용자 이름을 변경하는 함수
    handleChangeUserName(e) {
        this.setState({ myUserName: e.target.value });
    }

    // 주 비디오 스트림을 처리하는 함수
    handleMainVideoStream(stream) {
        if (this.state.mainStreamManager !== stream) {
            this.setState({ mainStreamManager: stream });
        }
    }

    // 구독자 삭제 함수
    deleteSubscriber(streamManager) {
        let subscribers = this.state.subscribers;
        let index = subscribers.indexOf(streamManager, 0);
        if (index > -1) {
            subscribers.splice(index, 1);
            this.setState({ subscribers: subscribers });
        }
    }

    // 세션에 참가하는 함수
    joinSession() {
        // OpenVidu 객체 초기화
        this.OV = new OpenVidu();

        // 세션 초기화 및 이벤트 설정
        this.setState({ session: this.OV.initSession() }, () => {
            var mySession = this.state.session;

            // 스트림이 생성될 때의 이벤트 처리
            mySession.on('streamCreated', (event) => {
                var subscriber = mySession.subscribe(event.stream, undefined);
                var subscribers = this.state.subscribers;
                subscribers.push(subscriber);
                this.setState({ subscribers: subscribers });
            });

            // 스트림이 삭제될 때의 이벤트 처리
            mySession.on('streamDestroyed', (event) => {
                this.deleteSubscriber(event.stream.streamManager);
            });

            // 예외가 발생할 때의 이벤트 처리
            mySession.on('exception', (exception) => {
                console.warn(exception);
            });

            // 토큰을 얻어와 세션에 연결
            this.getToken().then((token) => {
                mySession.connect(token, { clientData: this.state.myUserName })
                    .then(async () => {
                        // 여기서 카메라 스트림을 가져오고 스트림을 발행
                        let publisher = await this.OV.initPublisherAsync(undefined, {
                            audioSource: false,
                            videoSource: undefined,
                            publishAudio: false,
                            publishVideo: true,
                            resolution: '640x480',
                            frameRate: 30,
                            insertMode: 'APPEND',
                            mirror: false,
                        });

                        mySession.publish(publisher);

                        var devices = await this.OV.getDevices();
                        var videoDevices = devices.filter(device => device.kind === 'videoinput');
                        var currentVideoDeviceId = publisher.stream.getMediaStream().getVideoTracks()[0].getSettings().deviceId;
                        var currentVideoDevice = videoDevices.find(device => device.deviceId === currentVideoDeviceId);

                        this.setState({
                            currentVideoDevice: currentVideoDevice,
                            mainStreamManager: publisher,
                            publisher: publisher,
                        });
                    })
                    .catch((error) => {
                        console.log('There was an error connecting to the session:', error.code, error.message);
                    });
            });
        });
    }

    // 세션을 나가는 함수
    leaveSession() {
        const mySession = this.state.session;
        if (mySession) {
            mySession.disconnect();
        }

        this.OV = null;
        this.setState({
            session: undefined,
            subscribers: [],
            mySessionId: 'SessionA',
            myUserName: 'Participant' + Math.floor(Math.random() * 100),
            mainStreamManager: undefined,
            publisher: undefined
        });
    }

    // 카메라를 전환하는 함수
    async switchCamera() {
        try {
            const devices = await this.OV.getDevices()
            var videoDevices = devices.filter(device => device.kind === 'videoinput');

            if (videoDevices && videoDevices.length > 1) {
                var newVideoDevice = videoDevices.filter(device => device.deviceId !== this.state.currentVideoDevice.deviceId)

                if (newVideoDevice.length > 0) {
                    var newPublisher = this.OV.initPublisher(undefined, {
                        videoSource: newVideoDevice[0].deviceId,
                        publishAudio: true,
                        publishVideo: true,
                        mirror: true
                    });

                    await this.state.session.unpublish(this.state.mainStreamManager)
                    await this.state.session.publish(newPublisher)
                    this.setState({
                        currentVideoDevice: newVideoDevice[0],
                        mainStreamManager: newPublisher,
                        publisher: newPublisher,
                    });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    // 화면 렌더링 함수
    render() {
        const mySessionId = this.state.mySessionId;
        const myUserName = this.state.myUserName;

        return (
            <div className="container">
                {/* 세션이 정의되지 않았을 경우 Join 화면 표시 */}
                {this.state.session === undefined ? (
                    <div id="join">
                        <div id="join-dialog" className="jumbotron vertical-center">
                            <h1> Join a video session </h1>
                            <form className="form-group" onSubmit={this.joinSession}>
                                <p>
                                    <label>Participant: </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="userName"
                                        value={myUserName}
                                        onChange={this.handleChangeUserName}
                                        required
                                    />
                                </p>
                                <p>
                                    <label> Session: </label>
                                    <input
                                        className="form-control"
                                        type="text"
                                        id="sessionId"
                                        value={mySessionId}
                                        onChange={this.handleChangeSessionId}
                                        required
                                    />
                                </p>
                                <p className="text-center">
                                    <input className="btn btn-lg btn-success" name="commit" type="submit" value="JOIN" />
                                </p>
                            </form>
                        </div>
                    </div>
                ) : null}

                {/* 세션이 정의되었을 경우 세션 화면 표시 */}
                {this.state.session !== undefined ? (
                    <div id="session">
                        <div id="session-header">
                            <h1 id="session-title">{mySessionId}</h1>
                            <input
                                className="btn btn-large btn-danger"
                                type="button"
                                id="buttonLeaveSession"
                                onClick={this.leaveSession}
                                value="Leave session"
                            />
                            <input
                                className="btn btn-large btn-success"
                                type="button"
                                id="buttonSwitchCamera"
                                onClick={this.switchCamera}
                                value="Switch Camera"
                            />
                        </div>

                        {/* 주 스트림 화면
                        {this.state.mainStreamManager !== undefined ? (
                            <div id="main-video" className="col-md-6">
                                <UserVideoComponent streamManager={this.state.mainStreamManager} />
                            </div>
                        ) : null} */}
                        <div id="video-container" className="col-md-6">
                            {/* 발행자 스트림 화면 */}
                            {this.state.publisher !== undefined ? (
                                <div className="stream-container col-md-6 col-xs-6" onClick={() => this.handleMainVideoStream(this.state.publisher)}>
                                    <UserVideoComponent streamManager={this.state.publisher} />
                                </div>
                            ) : null}
                            {/* 구독자 스트림 화면 */}
                            {this.state.subscribers.map((sub, i) => (
                                <div key={sub.id} className="stream-container col-md-6 col-xs-6" onClick={() => this.handleMainVideoStream(sub)}>
                                    <span>{sub.id}</span>
                                    <UserVideoComponent streamManager={sub} />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }

    // OpenVidu 서버에서 토큰을 얻어오는 함수
    async getToken() {
        const sessionId = await this.createSession(this.state.mySessionId);
        return await this.createToken(sessionId);
    }

    // 세션을 생성하는 함수
    async createSession(sessionId) {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions', { customSessionId: sessionId }, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // 세션 ID 반환
    }

    // 토큰을 생성하는 함수
    async createToken(sessionId) {
        const response = await axios.post(APPLICATION_SERVER_URL + 'api/sessions/' + sessionId + '/connections', {}, {
            headers: { 'Content-Type': 'application/json', },
        });
        return response.data; // 토큰 반환
    }
}

export default App;
