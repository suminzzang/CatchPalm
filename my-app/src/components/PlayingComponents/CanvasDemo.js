import React, { useRef, useEffect } from "react"; // React와 useRef Hook을 가져옵니다.

export default function CanvasDemo() {
  const videoRef = useRef(null); // useRef Hook을 사용하여 비디오 요소에 대한 참조를 만듭니다.

  const handleStartStreaming = async () => {
    // 웹캠 비디오 스트림을 시작하는 비동기 함수를 선언합니다.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      }); // 사용자의 웹캠에서 비디오 스트림을 가져옵니다.
      videoRef.current.srcObject = stream; // 가져온 스트림을 비디오 요소의 srcObject에 할당합니다.
    } catch (error) {
      // 에러를 캐치하고 콘솔에 로그를 출력합니다.
      console.error(error);
    }
  };

  // 페이지가 로드된 후에 handleStartStreaming 함수를 호출하는 함수입니다.
  useEffect(() => {
    handleStartStreaming();
  }, []);

  // 컴포넌트가 렌더링하는 JSX를 반환합니다.
  return (
    <React.Fragment>
      {/* 비디오 요소 - 이 요소는 숨겨져 있으며, 웹캠의 비디오 스트림이 이 요소로 출력됩니다. */}
      <video
        hidden
        ref={videoRef}
        id="video_in"
        autoPlay
        style={{ transform: "scaleX(-1)" }}
      >
        {" "}
      </video>
      {/* 캔버스 요소 - 이 요소에는 비디오 스트림이 렌더링됩니다. */}
      <canvas
        id="video_out"
        width={640}
        height={480}
        style={{ transform: "scaleX(-1)" }}
      >
        {" "}
      </canvas>
    </React.Fragment>
  );
}
