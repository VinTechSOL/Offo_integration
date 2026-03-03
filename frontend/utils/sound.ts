let audio: HTMLAudioElement | null = null;
let unlocked = false;



// 🔓 Unlock audio after first user interaction
export const unlockAudio = () => {
  if (unlocked) return;

  audio = new Audio("/assets/sounds/notifyuser.mp3");
  audio.volume = 0.8;

  // Play silently once to unlock
  audio.play().then(() => {
    audio?.pause();
    audio!.currentTime = 0;
    unlocked = true;
  }).catch(() => {});
};


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