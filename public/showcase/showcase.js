(() => {
  const gallery=document.querySelector('#projects');
  const projects=[...document.querySelectorAll('.project')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const viewer=document.querySelector('#viewer'),frame=document.querySelector('#viewer-frame');
  const controls=[...document.querySelectorAll('.view-controls button')];
  const soundToggle=document.querySelector('#sound-toggle');
  const soundState=soundToggle?.querySelector('.sound-state');
  let active=0,mode=innerWidth<=700?'horizontal':'vertical',lastFocus,wakeImages,scrollFrame,modeAnimation,transitioning=false;
  document.body.classList.add('experience');

  function createEchoSoundSystem() {
    let ctx = null, masterGain = null, echoInput = null, isPlaying = false, wasPlayingBeforeViewer = false;
    let arpTimer = null, padOscs = [], currentChordIdx = 0, stepCount = 0;
    let lastTriggeredCue = -1, lastBeatIndex = -1;

    const chords = [
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
      [196.00, 246.94, 293.66, 329.63, 440.00], // G6/9
      [164.81, 196.00, 246.94, 293.66, 369.99], // Em7
      [130.81, 196.00, 261.63, 329.63, 392.00]  // Cmaj9
    ];
    const bassNotes = [87.31, 98.00, 82.41, 65.41]; // F2, G2, E2, C2
    const arpScale = [329.63, 392.00, 440.00, 523.25, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

    function initAudio() {
      if (ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      try {
        ctx = new AudioCtx();

        // Punchy Dynamics Compressor
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.setValueAtTime(-20, ctx.currentTime);
        comp.knee.setValueAtTime(24, ctx.currentTime);
        comp.ratio.setValueAtTime(6, ctx.currentTime);
        comp.attack.setValueAtTime(0.003, ctx.currentTime);
        comp.release.setValueAtTime(0.2, ctx.currentTime);
        comp.connect(ctx.destination);

        // High Air Presence Filter (Adds crisp refreshing sparkle)
        const airFilter = ctx.createBiquadFilter();
        airFilter.type = 'highshelf';
        airFilter.frequency.setValueAtTime(4500, ctx.currentTime);
        airFilter.gain.setValueAtTime(2.5, ctx.currentTime);
        airFilter.connect(comp);

        masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.connect(airFilter);

        // 3D Crystal Stereo Ping-Pong Delay Bus
        echoInput = ctx.createGain();
        echoInput.gain.setValueAtTime(0.55, ctx.currentTime);

        const delayL = ctx.createDelay(1.5);
        delayL.delayTime.setValueAtTime(0.26, ctx.currentTime);
        const fbL = ctx.createGain();
        fbL.gain.setValueAtTime(0.38, ctx.currentTime);
        const filterL = ctx.createBiquadFilter();
        filterL.type = 'bandpass';
        filterL.frequency.setValueAtTime(2400, ctx.currentTime);
        filterL.Q.setValueAtTime(0.8, ctx.currentTime);
        echoInput.connect(delayL);
        delayL.connect(filterL);
        filterL.connect(fbL);
        fbL.connect(delayL);

        const delayR = ctx.createDelay(1.5);
        delayR.delayTime.setValueAtTime(0.39, ctx.currentTime);
        const fbR = ctx.createGain();
        fbR.gain.setValueAtTime(0.34, ctx.currentTime);
        const filterR = ctx.createBiquadFilter();
        filterR.type = 'bandpass';
        filterR.frequency.setValueAtTime(2800, ctx.currentTime);
        filterR.Q.setValueAtTime(0.8, ctx.currentTime);
        echoInput.connect(delayR);
        delayR.connect(filterR);
        filterR.connect(fbR);
        fbR.connect(delayR);

        if (ctx.createStereoPanner) {
          const panL = ctx.createStereoPanner();
          panL.pan.setValueAtTime(-0.65, ctx.currentTime);
          filterL.connect(panL);
          panL.connect(masterGain);
          const panR = ctx.createStereoPanner();
          panR.pan.setValueAtTime(0.65, ctx.currentTime);
          filterR.connect(panR);
          panR.connect(masterGain);
        } else {
          filterL.connect(masterGain);
          filterR.connect(masterGain);
        }
      } catch (e) {
        console.warn('Audio init error:', e);
      }
    }

    function startPad() {
      if (!ctx || padOscs.length) return;
      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.08, ctx.currentTime);
      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(1100, ctx.currentTime);
      padFilter.connect(padGain);
      padGain.connect(masterGain);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      lfoGain.gain.setValueAtTime(220, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(padFilter.frequency);
      lfo.start();

      const chord = chords[0];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.detune.setValueAtTime((idx - 2) * 5, ctx.currentTime);
        osc.connect(padFilter);
        osc.start();
        padOscs.push(osc);
      });
    }

    function updatePadChord(chordIdx) {
      if (!ctx || !padOscs.length) return;
      const targetChord = chords[chordIdx % chords.length];
      const now = ctx.currentTime;
      targetChord.forEach((freq, idx) => {
        if (padOscs[idx]) {
          padOscs[idx].frequency.cancelScheduledValues(now);
          padOscs[idx].frequency.linearRampToValueAtTime(freq, now + 0.4);
        }
      });
    }

    function playCrystalBell(freq, velocity = 0.08, panPos = 0) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const voiceGain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      mod.type = 'sine';
      mod.frequency.setValueAtTime(freq * 3.5, now);
      modGain.gain.setValueAtTime(freq * 0.8, now);
      modGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      mod.connect(modGain);
      modGain.connect(osc.frequency);

      voiceGain.gain.setValueAtTime(0.0001, now);
      voiceGain.gain.exponentialRampToValueAtTime(velocity, now + 0.004);
      voiceGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

      osc.connect(voiceGain);

      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(panPos, now);
        voiceGain.connect(panner);
        panner.connect(masterGain);
      } else {
        voiceGain.connect(masterGain);
      }

      const send = ctx.createGain();
      send.gain.setValueAtTime(0.45, now);
      voiceGain.connect(send);
      send.connect(echoInput);

      osc.start(now);
      mod.start(now);
      osc.stop(now + 0.55);
      mod.stop(now + 0.55);
      osc.onended = () => {
        try { osc.disconnect(); mod.disconnect(); voiceGain.disconnect(); } catch (_) {}
      };
    }

    function playBassNote(freq, velocity = 0.12) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const bGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      bGain.gain.setValueAtTime(0.0001, now);
      bGain.gain.exponentialRampToValueAtTime(velocity, now + 0.01);
      bGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(bGain);
      bGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.42);
      osc.onended = () => {
        try { osc.disconnect(); bGain.disconnect(); } catch (_) {}
      };
    }

    function playSubPulse(freq = 65, vel = 0.15) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.6), now + 0.22);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(vel, now + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.26);
        osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch (_) {} };
      } catch (_) {}
    }

    function playSubDrop(startFreq = 85, endFreq = 40, vel = 0.22) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.38);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(vel, now + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.48);
        osc.onended = () => { try { osc.disconnect(); g.disconnect(); } catch (_) {} };
      } catch (_) {}
    }

    function playGlassChord(chordFreqs, vel = 0.15) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      chordFreqs.forEach((freq, idx) => {
        const pan = (idx % 2 === 0) ? -0.55 : 0.55;
        setTimeout(() => {
          playCrystalBell(freq * 1.5, vel * 0.85, pan);
          playCrystalBell(freq * 2, vel * 0.6, -pan);
        }, idx * 28);
      });
    }

    function playCinematicHit(cueType) {
      if (!ctx || !isPlaying || ctx.state !== 'running') return;
      if (cueType === 'trueluxe') {
        playSubDrop(90, 48, 0.22);
        playGlassChord([174.6, 220, 261.6, 329.6], 0.16);
      } else if (cueType === 'formline') {
        playSubDrop(82, 44, 0.22);
        playGlassChord([196, 246.9, 293.6, 440], 0.16);
      } else if (cueType === 'siyo-dhaago') {
        playSubDrop(88, 42, 0.24);
        playGlassChord([164.8, 196, 246.9, 330], 0.16);
      } else if (cueType === 'forge') {
        playSubDrop(75, 34, 0.32);
        playCrystalBell(110, 0.2, 0);
        playCrystalBell(220, 0.14, 0.5);
      } else if (cueType === 'pizza') {
        playSubDrop(95, 52, 0.2);
        playGlassChord([130.8, 196, 261.6, 392], 0.18);
      } else if (cueType === 'closer') {
        playSubDrop(105, 40, 0.28);
        playGlassChord([174.6, 220, 261.6, 329.6, 392], 0.22);
      }
    }

    function startGroove() {
      clearInterval(arpTimer);
      // 116 BPM 16th-note step sequencer (~129ms per step)
      arpTimer = setInterval(() => {
        if (!isPlaying || !ctx || ctx.state !== 'running') return;
        stepCount++;
        const barStep = stepCount % 16;

        if (barStep === 0) {
          currentChordIdx = (currentChordIdx + 1) % chords.length;
          updatePadChord(currentChordIdx);
        }

        if (barStep === 0 || barStep === 6 || barStep === 10) {
          playBassNote(bassNotes[currentChordIdx], barStep === 0 ? 0.14 : 0.09);
        }

        const arpPattern = [0, 2, 4, 7, 3, 5, 8, 4, 1, 3, 6, 9, 2, 5, 7, 4];
        const noteIdx = arpPattern[barStep % arpPattern.length];
        const noteFreq = arpScale[noteIdx % arpScale.length];

        const panPos = Math.sin(stepCount * 0.42) * 0.78;
        const vel = (barStep % 4 === 0) ? 0.09 : 0.055;
        playCrystalBell(noteFreq, vel, panPos);
      }, 129);
    }

    async function setPlaying(play) {
      if (play) {
        initAudio();
        if (!ctx) return;
        if (ctx.state === 'suspended') {
          try {
            await ctx.resume();
          } catch (e) {
            console.warn('Audio resume failed:', e);
          }
        }
        isPlaying = true;
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.24, now + 0.12);
        startPad();
        startGroove();
      } else {
        isPlaying = false;
        if (ctx && masterGain) {
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.setValueAtTime(masterGain.gain.value, now);
          masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        }
      }
    }

    function syncVideoTime(currentTime, duration, isPaused) {
      if (!isPlaying || !ctx || ctx.state !== 'running' || isPaused) return;

      // Sync rhythmic sub-pulses to the video tempo (~116 BPM = 0.517s per beat)
      const currentBeat = Math.floor(currentTime / 0.517);
      if (currentBeat !== lastBeatIndex && currentBeat >= 0) {
        lastBeatIndex = currentBeat;
        const beatInBar = currentBeat % 8;
        if (beatInBar === 0 || beatInBar === 4) {
          playSubPulse(currentTime >= 12.15 && currentTime < 15.35 ? 46 : 65, 0.16);
        }
        if (beatInBar % 2 === 0) {
          playCrystalBell(arpScale[(currentBeat * 2) % arpScale.length], 0.07, (beatInBar % 4 === 0 ? -0.4 : 0.4));
        }
      }

      // Check chapter cut impact cues (synced with showreel edits)
      if (currentTime >= 2.45 && lastTriggeredCue < 1) {
        lastTriggeredCue = 1;
        playCinematicHit('trueluxe');
      } else if (currentTime >= 5.70 && lastTriggeredCue < 2) {
        lastTriggeredCue = 2;
        playCinematicHit('formline');
      } else if (currentTime >= 8.90 && lastTriggeredCue < 3) {
        lastTriggeredCue = 3;
        playCinematicHit('siyo-dhaago');
      } else if (currentTime >= 12.10 && lastTriggeredCue < 4) {
        lastTriggeredCue = 4;
        playCinematicHit('forge');
      } else if (currentTime >= 15.30 && lastTriggeredCue < 5) {
        lastTriggeredCue = 5;
        playCinematicHit('pizza');
      } else if (currentTime >= 17.55 && lastTriggeredCue < 6) {
        lastTriggeredCue = 6;
        playCinematicHit('closer');
      } else if (currentTime < 1.0 && lastTriggeredCue > 0) {
        // Video looped or replayed
        lastTriggeredCue = 0;
        lastBeatIndex = -1;
      }
    }

    function resetVideoSync() {
      lastTriggeredCue = -1;
      lastBeatIndex = -1;
    }

    function triggerSlideReflection(index) {
      if (!ctx) return;
      if (ctx.state === 'suspended' && isPlaying) ctx.resume();
      if (!isPlaying || ctx.state !== 'running') return;
      const baseNote = arpScale[(index * 2) % arpScale.length];
      playCrystalBell(baseNote, 0.12, -0.75);
      setTimeout(() => playCrystalBell(baseNote * 1.5, 0.11, 0.75), 70);
      setTimeout(() => playCrystalBell(baseNote * 2, 0.09, 0.0), 140);
    }

    return {
      async toggle() {
        const willPlay = !isPlaying;
        await setPlaying(willPlay);
        return willPlay;
      },
      setPlaying,
      syncVideoTime,
      resetVideoSync,
      triggerSlideReflection,
      onViewerOpen() {
        if (isPlaying && ctx && masterGain) {
          wasPlayingBeforeViewer = true;
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
        }
      },
      onViewerClose() {
        if (wasPlayingBeforeViewer && ctx && masterGain) {
          wasPlayingBeforeViewer = false;
          const now = ctx.currentTime;
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.linearRampToValueAtTime(0.24, now + 0.7);
        }
      },
      onVisibilityChange(hidden) {
        if (!ctx || !masterGain) return;
        const now = ctx.currentTime;
        if (hidden) {
          if (isPlaying) {
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.25);
          }
        } else if (isPlaying) {
          masterGain.gain.cancelScheduledValues(now);
          masterGain.gain.linearRampToValueAtTime(0.24, now + 0.7);
        }
      }
    };
  }

  const soundSystem = createEchoSoundSystem();
  if (soundToggle) {
    soundToggle.addEventListener('click', async () => {
      const playing = await soundSystem.toggle();
      soundToggle.setAttribute('aria-pressed', String(playing));
      if (soundState) soundState.textContent = playing ? 'On' : 'Off';
      const reelSoundBtn = document.querySelector('#reel-sound-btn');
      if (reelSoundBtn) {
        reelSoundBtn.setAttribute('aria-pressed', String(playing));
        const lbl = reelSoundBtn.querySelector('.reel-sound-text');
        if (lbl) lbl.textContent = playing ? 'Sound: On' : 'Sound: Off';
      }
    });
  }
  document.addEventListener('visibilitychange', () => soundSystem.onVisibilityChange(document.hidden));

  function initShowreel() {
    const showreel = document.querySelector('#showreel');
    if (!showreel) return;
    const video = showreel.querySelector('#reel-video');
    const audioModal = document.querySelector('#audio-modal');
    const soundOnBtn = document.querySelector('#modal-sound-on');
    const soundOffBtn = document.querySelector('#modal-sound-off');
    const chapterEl = document.querySelector('#reel-chapter');
    const timeEl = document.querySelector('#reel-time');
    const progressFill = document.querySelector('#reel-progress-fill');
    const progressLive = document.querySelector('#reel-progress-live');
    const totalTimeEl = document.querySelector('#reel-total-time');
    const skipBtn = document.querySelector('#reel-skip-btn');
    const reelSoundBtn = document.querySelector('#reel-sound-btn');
    const playBtn = document.querySelector('#reel-play-btn');
    const replayBtn = document.querySelector('#replay-showreel');

    let audioEnabled = false;
    let audioConfirmed = false;
    let controlsTimer;
    function revealControls(){
      showreel.classList.remove('is-idle');
      clearTimeout(controlsTimer);
      controlsTimer=setTimeout(()=>showreel.classList.add('is-idle'),2200);
    }
    showreel.addEventListener('pointermove',revealControls,{passive:true});
    showreel.addEventListener('focusin',revealControls);

    const CHAPTERS = [
      { start: 0,    end: 2.50, title: 'ECHO11 // STUDIO REEL 2026' },
      { start: 2.50, end: 5.75, title: '01 // TRUELUXE NEPAL' },
      { start: 5.75, end: 8.95, title: '02 // FORMLINE OPTICAL' },
      { start: 8.95, end: 12.15, title: '03 // SIYO DHAGO' },
      { start: 12.15, end: 15.35, title: '04 // FORGE PERFORMANCE' },
      { start: 15.35, end: 17.60, title: '05 // PIZZASLICE' },
      { start: 17.60, end: 20.00, title: 'ECHO11 // WHAT COULD YOURS BECOME?' }
    ];

    function formatTimecode(ms) {
      const totalSec = Math.floor(ms / 1000);
      const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
      return `${m}:${s}:${cs}`;
    }

    function formatMinSec(ms) {
      const totalSec = Math.floor(ms / 1000);
      const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      return `${m}:${s}`;
    }

    async function syncSoundUI(enabled) {
      audioEnabled = enabled;
      await soundSystem.setPlaying(enabled);

      if (reelSoundBtn) {
        reelSoundBtn.setAttribute('aria-pressed', String(enabled));
        const lbl = reelSoundBtn.querySelector('.reel-sound-text');
        if (lbl) lbl.textContent = enabled ? 'Sound on' : 'Sound off';
      }
      if (soundToggle) {
        soundToggle.setAttribute('aria-pressed', String(enabled));
      }
      if (soundState) {
        soundState.textContent = enabled ? 'On' : 'Off';
      }
    }

    function hideAudioPrompt() {
      if (!audioModal) return;
      if (audioModal.open) audioModal.close();
    }

    async function handleAudioChoice(enabled) {
      if (audioConfirmed) return;
      audioConfirmed = true;
      hideAudioPrompt();
      await syncSoundUI(enabled);
      if (video && video.paused && !showreel.classList.contains('is-dismissed')) {
        video.play().catch(() => {});
      }
      if(!showreel.classList.contains('is-dismissed'))video?.focus({preventScroll:true});
      revealControls();
    }

    function dismissReel() {
      if (video) {
        video.pause();
      }
      showreel.classList.add('is-dismissed');
      clearTimeout(controlsTimer);
      hideAudioPrompt();
      if (progressFill) progressFill.style.transform = 'scaleX(1)';
      renderImages?.();
    }

    function replayReel() {
      showreel.classList.remove('is-dismissed');
      audioConfirmed = false;
      syncSoundUI(false);
      soundSystem.resetVideoSync();
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      if (progressFill) progressFill.style.transform = 'scaleX(0)';
      audioModal?.showModal();
      soundOnBtn?.focus({preventScroll:true});
    }

    soundOnBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAudioChoice(true);
    });

    soundOffBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAudioChoice(false);
    });

    skipBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissReel();
    });

    replayBtn?.addEventListener('click', replayReel);
    playBtn?.addEventListener('click',()=>{
      if(!audioConfirmed||!video)return;
      if(video.paused)video.play().catch(()=>{});else video.pause();
      revealControls();
    });
    document.querySelector('#modal-skip-reel')?.addEventListener('click',dismissReel);
    audioModal?.addEventListener('cancel',event=>{event.preventDefault();dismissReel();});

    if (reelSoundBtn) {
      reelSoundBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const next = !audioEnabled;
        await syncSoundUI(next);
        hideAudioPrompt();
      });
    }

    // Video playback initialization and progress tracking
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;

      const startPlayback = () => {
        if (audioConfirmed && !showreel.classList.contains('is-dismissed')) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              console.warn('Playback waiting for interaction:', err);
            });
          }
        }
      };

      // No autoplay: media readiness never bypasses the explicit sound choice.
      video.pause();
      const updatePlaybackUI=()=>{
        showreel.classList.toggle('is-paused',video.paused);
        if(playBtn){playBtn.textContent=video.paused?'Play':'Pause';playBtn.setAttribute('aria-label',video.paused?'Play showreel':'Pause showreel');}
      };
      video.addEventListener('play',updatePlaybackUI);
      video.addEventListener('pause',updatePlaybackUI);
      updatePlaybackUI();

      video.addEventListener('canplay', startPlayback);
      video.addEventListener('loadeddata', startPlayback);

      video.addEventListener('timeupdate', () => {
        if (!video.duration) return;
        const currentMs = video.currentTime * 1000;
        const durationMs = video.duration * 1000;
        const progress = Math.min(1, video.currentTime / video.duration);

        if (progressFill) progressFill.style.transform = `scaleX(${progress})`;
        if (progressLive) progressLive.textContent = formatMinSec(currentMs);
        if (timeEl) timeEl.textContent = formatTimecode(currentMs);
        if (totalTimeEl) totalTimeEl.textContent = formatMinSec(durationMs);

        // Synchronize audio and chapter readout directly with video playback
        soundSystem.syncVideoTime(video.currentTime, video.duration, video.paused);

        const currentChapter = CHAPTERS.find(c => video.currentTime >= c.start && video.currentTime < c.end);
        if (currentChapter && chapterEl && chapterEl.textContent !== currentChapter.title) {
          chapterEl.textContent = currentChapter.title;
        }
      });

      video.addEventListener('loadedmetadata', () => {
        if (totalTimeEl && video.duration) {
          totalTimeEl.textContent = formatMinSec(video.duration * 1000);
        }
      });

      video.addEventListener('ended', () => {
        dismissReel();
      });

      // Clicking anywhere on the showreel stage resumes if paused
      showreel.addEventListener('click', (e) => {
        if (audioConfirmed && !audioModal?.open && !e.target.closest('button') && !e.target.closest('a')) {
          if (video.paused) {
            video.play().catch(() => {});
          }
        }
      });
    }

    audioModal?.showModal();
    soundOnBtn?.focus({preventScroll:true});

    // Keyboard support: ESC skips reel, M toggles sound, SPACE toggles play/pause
    window.addEventListener('keydown', (e) => {
      if (audioModal?.open) return;
      if (e.key === 'Escape') {
        if (!showreel.classList.contains('is-dismissed')) {
          dismissReel();
        }
      } else if (e.key === 'm' || e.key === 'M') {
        if (!showreel.classList.contains('is-dismissed')) {
          syncSoundUI(!audioEnabled);
          hideAudioPrompt();
        }
      } else if (e.key === ' ' && !e.target.closest('input, textarea, button, a')) {
        if (!showreel.classList.contains('is-dismissed') && video) {
          e.preventDefault();
          if (video.paused) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      }
    });
  }
  initShowreel();
  function syncModes(){
    const mobile=innerWidth<=700;
    if((mobile&&mode==='vertical')||(!mobile&&mode==='horizontal'))mode=mobile?'horizontal':'vertical';
    document.body.classList.toggle('grid-view',mode==='grid');
    document.body.classList.toggle('horizontal-view',mode==='horizontal');
    controls.forEach(button=>{
      const name=button.id==='grid-view'?'grid':button.id==='horizontal-view'?'horizontal':'vertical';
      const unavailable=mobile?name==='vertical':name==='horizontal';
      button.hidden=unavailable;button.disabled=unavailable;
      button.setAttribute('aria-pressed',String(name===mode));
    });
  }
  syncModes();
  function renderImages(){
    const stage=document.querySelector('.stage-frame').getBoundingClientRect();
    projects.forEach(project=>{
      const image=project.querySelector('.project-image');
      if(mode==='grid'){image.style.removeProperty('clip-path');return;}
      const r=image.getBoundingClientRect();
      const top=Math.min(r.height,Math.max(0,stage.top-r.top));
      const bottom=Math.min(r.height-top,Math.max(0,r.bottom-stage.bottom));
      const left=Math.min(r.width,Math.max(0,stage.left-r.left));
      const right=Math.min(r.width-left,Math.max(0,r.right-stage.right));
      image.style.clipPath=`inset(${top}px ${right}px ${bottom}px ${left}px)`;
    });
    wakeImages?.();
  }
  function select(index,animate=true){
    if(index<0)return;
    const changed=active!==index; active=index;
    if(changed)soundSystem.triggerSlideReflection(index);
    projects.forEach((project,i)=>{
      project.classList.toggle('is-active',i===index);
      const details=project.querySelector('.project-details');
      details.inert=mode!=='grid'&&i!==index;
      if(mode!=='grid'&&i!==index)details.setAttribute('aria-hidden','true');else details.removeAttribute('aria-hidden');
      project.querySelector('.project-top').setAttribute('aria-hidden',String(mode!=='grid'&&i!==index));
    });
    const title=projects[index].querySelector('h2 a').textContent.replace('↗','').trim();
    document.querySelector('#position').textContent=String(index+1).padStart(2,'0');
    document.querySelector('#current-name').textContent=title;
    document.querySelectorAll('[data-index]').forEach(link=>{
      if(link.dataset.index===projects[index].id){
        link.setAttribute('aria-current','true');
        const rail=link.closest('.project-index');
        if(link.offsetTop<rail.scrollTop||link.offsetTop+link.offsetHeight>rail.scrollTop+rail.clientHeight)rail.scrollTo({top:Math.max(0,link.offsetTop-rail.clientHeight/2),behavior:reduced.matches?'instant':'smooth'});
      }else link.removeAttribute('aria-current');
    });
    if(changed&&animate&&!reduced.matches&&window.gsap&&mode!=='grid')gsap.fromTo(projects[index].querySelectorAll('h2,.project-lead,.project-services,.project-links'),{opacity:0,y:12},{opacity:1,y:0,duration:.55,stagger:.045,ease:'power3.out',overwrite:true});
  }
  function updateCue(){document.querySelector('.stage-cue').textContent=innerWidth<=700?(mode==='horizontal'?'Swipe sideways / Tap to explore':'Scroll / Tap to explore'):(mode==='horizontal'?'Scroll sideways / Enter to open':'Scroll to explore / Enter to open');}
  updateCue();
  function track(){
    scrollFrame=undefined;
    const horizontal=mode==='horizontal';
    const center=horizontal?innerWidth/2:innerHeight*(innerWidth<=700?.39:.5);
    let nearest=0,distance=Infinity;
    projects.forEach((project,i)=>{const r=project.querySelector('.project-image').getBoundingClientRect();const d=Math.abs((horizontal?r.left+r.width/2:r.top+r.height/2)-center);if(d<distance){distance=d;nearest=i;}});
    if(!transitioning&&nearest!==active)select(nearest);
    const extent=horizontal?gallery.scrollWidth-gallery.clientWidth:gallery.scrollHeight-gallery.clientHeight;
    const progress=extent>0?(horizontal?gallery.scrollLeft:gallery.scrollTop)/extent:0;
    document.querySelector('.reading-progress').style.transform=`scaleX(${progress})`;
    document.body.classList.toggle('at-close',extent>0&&(horizontal?gallery.scrollLeft:gallery.scrollTop)>extent-150);
    renderImages?.();
  }
  gallery.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(track);},{passive:true});
  let settleTimer;
  function settleGallery(delay=180){
    clearTimeout(settleTimer);
    if(mode==='grid')return;
    settleTimer=setTimeout(()=>{
      if(drag||transitioning||viewer.open)return;
      track();
      const closing=gallery.querySelector('.closing');
      const center=mode==='horizontal'?innerWidth/2:innerHeight/2;
      const distance=element=>{const r=element.getBoundingClientRect();return Math.abs((mode==='horizontal'?r.left+r.width/2:r.top+r.height/2)-center);};
      const target=distance(closing)<distance(projects[active])?closing:projects[active];
      align(target,reduced.matches?'instant':'smooth');
    },delay);
  }
  function moveGallery(delta){
    if(mode==='horizontal')gallery.scrollTo({left:gallery.scrollLeft+delta,behavior:'instant'});
    else gallery.scrollTo({top:gallery.scrollTop+delta,behavior:'instant'});
  }
  gallery.addEventListener('wheel',event=>{
    if(viewer.open||event.ctrlKey||event.metaKey)return;
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    const units=event.deltaMode===1?16:event.deltaMode===2?gallery.clientHeight:1;
    event.preventDefault();moveGallery(delta*units);settleGallery();
  },{passive:false});
  let drag,suppressClickUntil=0;
  gallery.addEventListener('pointerdown',event=>{
    if(mode==='grid'||viewer.open||!event.isPrimary||event.button!==0||event.target.closest('button,input,select,textarea'))return;
    clearTimeout(settleTimer);
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY,time:performance.now(),velocity:0,moved:false,axis:null};
  });
  gallery.addEventListener('pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    if(!drag.moved&&Math.hypot(event.clientX-drag.x,event.clientY-drag.y)<8)return;
    if(!drag.moved){
      drag.axis=Math.abs(event.clientX-drag.x)>=Math.abs(event.clientY-drag.y)?'x':'y';
      drag.moved=true;gallery.setPointerCapture(event.pointerId);gallery.classList.add('is-dragging');
    }
    const dx=drag.lastX-event.clientX,dy=drag.lastY-event.clientY;
    // Keep the initiating axis for the full gesture. Re-evaluating every small
    // movement makes diagonal touch gestures alternate direction and judder.
    const delta=drag.axis==='x'?dx:dy;
    const now=performance.now();drag.velocity=delta/Math.max(8,now-drag.time);
    drag.lastX=event.clientX;drag.lastY=event.clientY;drag.time=now;
    moveGallery(delta);event.preventDefault();
  });
  function finishDrag(event){
    if(!drag||event.pointerId!==drag.id)return;
    if(drag.moved){
      suppressClickUntil=performance.now()+350;
      if(event.type==='pointerup'&&!reduced.matches&&performance.now()-drag.time<80){
        const limit=(mode==='horizontal'?gallery.clientWidth:gallery.clientHeight)*.6;
        const coast=Math.max(-limit,Math.min(limit,drag.velocity*140));
        gallery.scrollTo(mode==='horizontal'?{left:gallery.scrollLeft+coast,behavior:'smooth'}:{top:gallery.scrollTop+coast,behavior:'smooth'});
      }
    }
    const moved=drag.moved;drag=undefined;
    if(gallery.hasPointerCapture(event.pointerId))gallery.releasePointerCapture(event.pointerId);
    gallery.classList.remove('is-dragging');if(moved)settleGallery(450);
  }
  gallery.addEventListener('pointerup',finishDrag);
  gallery.addEventListener('pointercancel',finishDrag);
  gallery.addEventListener('lostpointercapture',finishDrag);
  gallery.addEventListener('dragstart',event=>{if(mode!=='grid')event.preventDefault();});
  gallery.addEventListener('click',event=>{if(performance.now()<suppressClickUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
  function align(project,behavior='instant'){
    if(mode==='horizontal')gallery.scrollTo({left:project.offsetLeft+project.offsetWidth/2-gallery.clientWidth/2,behavior});
    else if(mode==='vertical')gallery.scrollTo({top:project.offsetTop+project.offsetHeight/2-gallery.clientHeight*(innerWidth<=700?.39:.5),behavior});
    else gallery.scrollTo({top:Math.max(0,project.offsetTop-110),behavior});
  }
  controls.forEach(button=>button.addEventListener('click',()=>{
    if(button.disabled||button.hidden||button.getAttribute('aria-pressed')==='true')return;
    clearTimeout(settleTimer);
    modeAnimation?.progress(1);modeAnimation?.kill();transitioning=false;projects.forEach(p=>window.gsap&&gsap.set(p.querySelector('.project-image'),{clearProps:'all'}));
    const state=window.Flip&&!reduced.matches?Flip.getState(projects.map(p=>p.querySelector('.project-image'))):null;
    mode=button.id==='grid-view'?'grid':button.id==='horizontal-view'?'horizontal':'vertical';
    document.body.classList.toggle('grid-view',mode==='grid');document.body.classList.toggle('horizontal-view',mode==='horizontal');
    controls.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));updateCue();
    projects.forEach(p=>window.gsap&&gsap.set(p.querySelectorAll('h2,.project-lead,.project-services,.project-links'),{clearProps:'all'}));
    align(projects[active]);select(active,false);
    if(state){transitioning=true;modeAnimation=Flip.from(state,{duration:.9,ease:'power3.inOut',scale:true,prune:true,onUpdate:()=>renderImages?.(),onComplete:()=>{transitioning=false;track();renderImages?.();}});}
    track();renderImages?.();
  }));
  document.querySelectorAll('[data-index]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();const project=document.getElementById(link.dataset.index);align(project,reduced.matches?'instant':'smooth');
    history.replaceState(null,'','#'+project.id);
  }));
  document.addEventListener('keydown',event=>{
    if(document.querySelector('#audio-modal')?.open)return;
    const showreel = document.querySelector('#showreel');
    if(showreel && !showreel.classList.contains('is-dismissed')){
      if(event.key==='Escape'){
        event.preventDefault();
        showreel.querySelector('#reel-skip-btn')?.click();
        return;
      }
      return;
    }
    if(viewer.open||event.altKey||event.metaKey||event.ctrlKey||event.target.closest('input,textarea,select,[contenteditable]'))return;
    if(event.key==='m'||event.key==='M'){event.preventDefault();soundToggle?.click();return;}
    if(event.key==='Enter'&&(event.target===gallery||event.target===document.body)){event.preventDefault();projects[active].querySelector('.project-image').click();return;}
    if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft','PageDown','PageUp','Home','End'].includes(event.key)){
      event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?projects.length-1:Math.max(0,Math.min(projects.length-1,active+(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)?-1:1)));
      align(projects[index],reduced.matches?'instant':'smooth');
    }
  });
  gallery.addEventListener('focusin',event=>{const project=event.target.closest('.project');if(project&&mode!=='grid'){const index=projects.indexOf(project);if(index!==active){align(project);select(index,false);}}});
  document.querySelectorAll('[data-preview]').forEach(button=>button.addEventListener('click',event=>{
    if(event.metaKey||event.ctrlKey)return;
    event.preventDefault();lastFocus=button;
    soundSystem.onViewerOpen();
    viewer.classList.toggle('viewer--mobile',innerWidth<=700);
    document.querySelectorAll('[data-device]').forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.device===(innerWidth<=700?'mobile':'desktop'))));
    document.querySelector('#viewer-name').textContent=button.dataset.name+' / Live website';
    document.querySelector('#viewer-open').href=button.dataset.preview;frame.title=button.dataset.name+' live website';frame.src=button.dataset.preview;
    viewer.showModal();document.querySelector('#viewer-close').focus();
  }));
  document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>{
    viewer.classList.toggle('viewer--mobile',button.dataset.device==='mobile');document.querySelectorAll('[data-device]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  }));
  document.querySelector('#viewer-close').addEventListener('click',()=>viewer.close());
  viewer.addEventListener('close',()=>{soundSystem.onViewerClose();frame.src='about:blank';lastFocus?.focus({preventScroll:true});renderImages?.();});
  const initial=projects.find(p=>'#'+p.id===location.hash)||projects[0];
  select(projects.indexOf(initial),false);
  document.fonts.ready.then(()=>{align(initial);track();});
  window.addEventListener('resize',()=>{clearTimeout(settleTimer);modeAnimation?.progress(1);modeAnimation?.kill();transitioning=false;projects.forEach(p=>window.gsap&&gsap.set(p.querySelector('.project-image'),{clearProps:'all'}));syncModes();updateCue();align(projects[active]);select(active,false);track();});
  if(window.gsap&&window.Flip)gsap.registerPlugin(Flip);
  // The DOM gallery remains fully functional when WebGL cannot initialize.
  import('/showcase/showcase-webgl.js').then(module=>module.mountGallery({gallery,projects,reduced,getMode:()=>mode})).then(wake=>{wakeImages=wake;renderImages();}).catch(()=>{});
})();
