// Principal audio logic: try local file first, fallback to YouTube muted autoplay.
// Provide UI to toggle play/pause and mute/unmute.
// Also add gentle auto-highlight animation for cards (small parallax on hover).

document.addEventListener('DOMContentLoaded', ()=> {
  const local = document.getElementById('localAudio');
  const playToggle = document.getElementById('playToggle');
  const muteToggle = document.getElementById('muteToggle');
  const ytFrame = document.getElementById('ytframe');

  // State
  let usingLocal = false;

  // Try to play local audio first (if file exists)
  function tryLocalPlay(){
    if(!local) return Promise.reject();
    // if src not found, play() will likely reject; we catch it.
    local.volume = 0.45;
    return local.play().then(()=>{
      usingLocal = true;
      showPlayingUI(true);
    }).catch((e)=>{
      usingLocal = false;
      showPlayingUI(false);
      return Promise.reject(e);
    });
  }

  // If local fails, we keep the youtube iframe autoplay muted (already set in src).
  // The user can unmute with the UI button (this will unmute local if available or show instruction).
  function showPlayingUI(isPlaying){
    if(isPlaying){
      playToggle.textContent = '⏸️';
    } else {
      playToggle.textContent = '▶️';
    }
  }

  // attempt local play on load
  tryLocalPlay().catch(()=> {
    // do nothing — fallback to YT muted autoplay is already running in iframe
    showPlayingUI(false);
  });

  // Play/pause toggle
  playToggle.addEventListener('click', ()=>{
    if(usingLocal && !local.paused){
      local.pause();
      showPlayingUI(false);
    } else if(usingLocal && local.paused){
      local.play().catch(()=>{});
      showPlayingUI(true);
    } else {
      // no local; try to unmute/play local if present
      if(local && local.src){
        local.play().then(()=>{ usingLocal = true; showPlayingUI(true); }).catch(()=>{ showPlayingUI(false); });
      } else {
        // inform user: YouTube-muted is playing; to hear audio press Unmute
        // simulate play UI change
        showPlayingUI(true);
      }
    }
  });

  // Mute/unmute logic
  muteToggle.addEventListener('click', ()=>{
    if(usingLocal){
      local.muted = !local.muted;
      muteToggle.textContent = local.muted ? '🔈' : '🔊';
    } else {
      // For YouTube iframe we can't programmatically unmute due browser policy,
      // but we can instruct the user to press the play button or tap the page.
      // Toggle icon for UX
      if(muteToggle.textContent === '🔊'){ muteToggle.textContent = '🔈'; }
      else { muteToggle.textContent = '🔊'; }
      // also attempt to play local if exists
      if(local && local.src){
        local.play().then(()=>{ usingLocal = true; showPlayingUI(true); }).catch(()=>{});
      }
    }
  });

  // If user interacts anywhere (click), try to resume local audio or unmute
  window.addEventListener('click', ()=> {
    if(local && local.src && local.paused){
      local.play().then(()=>{ usingLocal = true; showPlayingUI(true); }).catch(()=>{});
    }
  }, { once: false });

  // small card hover effect via JS (add class when hovered) - fallback mostly CSS
  const cards = document.querySelectorAll('.card');
  cards.forEach(c => {
    c.addEventListener('mouseenter', ()=> c.classList.add('hovering'));
    c.addEventListener('mouseleave', ()=> c.classList.remove('hovering'));
  });
});
