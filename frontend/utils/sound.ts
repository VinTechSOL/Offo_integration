let audio: HTMLAudioElement | null = null;
let unlocked = false;

export const playNotificationSound = () => {
  if (!audio) {
    audio = new Audio("/assets/sounds/notifyuser.mp3");
    audio.volume = 0.8;
  }

  audio.currentTime = 0;

  audio.play().catch((err) => {
    console.log("Sound blocked by browser autoplay policy", err);
  });
};