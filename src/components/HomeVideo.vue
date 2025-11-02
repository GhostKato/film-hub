<template>
  <div class="video-container">
    <video
      src="@/assets/videos/intro.mp4"
      autoplay
      muted
      loop
      playsinline
      class="intro-video"
    ></video>
  </div>
</template>

<style scoped>
.video-container {
  position: absolute;
  top: 44%;
  left: 49%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate(-49%, -50%);
  z-index: 15;
}
.intro-video {
  width: 335px;
  height: 140px;
  object-fit: cover;
  overflow: hidden;
}
@media (min-width: 768px) {
  .intro-video {
    width: 450px;
    height: 200px;
  }
  .main-title {
    font-size: 40px;
  }
}
@media (min-width: 1080px) {
  .intro-video {
    width: 400px;
    height: 170px;
  }
}
@media (min-width: 2160px) {
  .intro-video {
    width: 525px;
    height: 230px;
  }
}
</style>
