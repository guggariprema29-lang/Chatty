/**
 * Test if Web Audio API is available
 */
export const testAudioContext = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log("✅ Web Audio API is available");
    console.log("Audio Context state:", audioContext.state);
    return true;
  } catch (error) {
    console.error("❌ Web Audio API not available:", error);
    return false;
  }
};

/**
 * Play Classic Bell sound
 */
export const playClassicBell = (volume = 0.5) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // C5 and G5 notes for pleasant bell
    osc1.frequency.value = 523.25;
    osc2.frequency.value = 783.99;
    osc1.type = "sine";
    osc2.type = "sine";

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);

    return true;
  } catch (error) {
    console.warn("Classic bell not available:", error);
    return false;
  }
};

/**
 * Play Chime sound
 */
export const playChime = (volume = 0.5) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // G4 and D5 for chime-like tone
    osc1.frequency.value = 392.0;
    osc2.frequency.value = 523.25;
    osc1.type = "sine";
    osc2.type = "sine";

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.7);
    osc2.stop(now + 0.7);

    return true;
  } catch (error) {
    console.warn("Chime not available:", error);
    return false;
  }
};

/**
 * Play Digital Beep sound
 */
export const playDigitalBeep = (volume = 0.5) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);

    osc.frequency.value = 1000; // High beep
    osc.type = "square"; // Electronic sound

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.15);

    osc.start(now);
    osc.stop(now + 0.15);

    // Second beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();

      osc2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);

      osc2.frequency.value = 800; // Lower beep
      osc2.type = "square";

      gainNode2.gain.setValueAtTime(volume, now + 0.2);
      gainNode2.gain.linearRampToValueAtTime(0, now + 0.35);

      osc2.start(now + 0.2);
      osc2.stop(now + 0.35);
    }, 150);

    return true;
  } catch (error) {
    console.warn("Digital beep not available:", error);
    return false;
  }
};

/**
 * Play Gentle Tone sound
 */
export const playGentleTone = (volume = 0.5) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // A4 and C#5 for gentle harmony
    osc1.frequency.value = 440.0;
    osc2.frequency.value = 554.37;
    osc1.type = "sine";
    osc2.type = "sine";

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1);
    osc2.stop(now + 1);

    return true;
  } catch (error) {
    console.warn("Gentle tone not available:", error);
    return false;
  }
};

/**
 * Play Alarm sound
 */
export const playAlarmSound = (volume = 0.5) => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;

    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // High harsh tones for alarm
    osc1.frequency.value = 800;
    osc2.frequency.value = 1200;
    osc1.type = "square";
    osc2.type = "square";

    gainNode.gain.setValueAtTime(volume, now);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.2);

    return true;
  } catch (error) {
    console.warn("Alarm sound not available:", error);
    return false;
  }
};

/**
 * Play selected bell sound based on preference
 */
export const playBellSoundByType = (soundType, volume = 0.5) => {
  switch (soundType) {
    case "classic":
      return playClassicBell(volume);
    case "chime":
      return playChime(volume);
    case "digital":
      return playDigitalBeep(volume);
    case "gentle":
      return playGentleTone(volume);
    case "alarm":
      return playAlarmSound(volume);
    default:
      return playClassicBell(volume);
  }
};

/**
 * Play repeating alarm with selected sound
 */
export const playAlarmBuzzer = (cycles = 4, soundType = "classic", volume = 0.5) => {
  try {
    console.log(`Playing alarm buzzer: ${cycles} cycles, type: ${soundType}, volume: ${volume}`);
    const playBuzzerSequence = (cycle = 0) => {
      if (cycle >= cycles) return;

      setTimeout(() => {
        console.log(`Buzzer cycle ${cycle + 1}/${cycles}`);
        playBellSoundByType(soundType, volume);
        setTimeout(() => {
          playBuzzerSequence(cycle + 1);
        }, 300);
      }, 0);
    };

    playBuzzerSequence();
    return true;
  } catch (error) {
    console.warn("Alarm buzzer not available:", error);
    return false;
  }
};
