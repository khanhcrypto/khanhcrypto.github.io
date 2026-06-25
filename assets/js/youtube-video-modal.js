/**
 * Full-page YouTube player modal (div overlay). Opens on elements with
 * `data-youtube-modal` + `data-youtube-id` (+ optional `data-video-title`).
 * Ported from https://github.com/S0ul3r/S0ul3r.github.io (src/features/youtube-video-modal.js).
 */
(function () {
  function buildEmbedUrl(videoId) {
    var params = new URLSearchParams({
      autoplay: '1',
      mute: '0',
      playsinline: '1',
      rel: '0',
      modestbranding: '1',
    });
    return 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) + '?' + params.toString();
  }

  function ensureModalShell() {
    var existing = document.getElementById('youtube-video-modal');
    if (existing) return existing;

    var root = document.createElement('div');
    root.id = 'youtube-video-modal';
    root.className = 'video-modal';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-hidden', 'true');
    root.setAttribute('aria-labelledby', 'youtube-video-modal-heading');
    root.innerHTML =
      '<div class="video-modal__backdrop" aria-hidden="true"></div>' +
      '<div class="video-modal__panel">' +
      '<button type="button" class="video-modal__close" aria-label="Close video"><span aria-hidden="true">&times;</span></button>' +
      '<h2 id="youtube-video-modal-heading" class="video-modal__heading">Video</h2>' +
      '<div class="video-modal__frame">' +
      '<iframe id="youtube-video-modal-iframe" class="video-modal__iframe" title="Video player" allowfullscreen ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
      'referrerpolicy="strict-origin-when-cross-origin"></iframe>' +
      '</div>' +
      '</div>';
    document.body.appendChild(root);
    return root;
  }

  function init() {
    var root = ensureModalShell();
    var backdrop = root.querySelector('.video-modal__backdrop');
    var closeBtn = root.querySelector('.video-modal__close');
    var iframe = document.getElementById('youtube-video-modal-iframe');
    var heading = document.getElementById('youtube-video-modal-heading');

    if (!backdrop || !closeBtn || !iframe || !heading) return;

    var previousFocus = null;

    function close() {
      iframe.removeAttribute('src');
      iframe.title = 'Video player';
      heading.textContent = 'Video';
      root.classList.remove('is-open');
      root.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('video-modal-open');
      if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
      previousFocus = null;
    }

    function open(videoId, title) {
      if (!videoId) return;
      previousFocus = document.activeElement;
      iframe.src = buildEmbedUrl(videoId);
      iframe.title = title;
      heading.textContent = title;
      root.classList.add('is-open');
      root.setAttribute('aria-hidden', 'false');
      document.body.classList.add('video-modal-open');
      closeBtn.focus();
    }

    document.addEventListener(
      'click',
      function (e) {
        var trigger = e.target.closest('[data-youtube-modal]');
        if (!trigger || !trigger.dataset.youtubeId) return;
        e.preventDefault();
        e.stopPropagation();
        open(trigger.dataset.youtubeId, (trigger.dataset.videoTitle || '').trim() || 'Video');
      },
      true
    );

    document.addEventListener(
      'keydown',
      function (e) {
        if (!root.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
      },
      true
    );

    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
