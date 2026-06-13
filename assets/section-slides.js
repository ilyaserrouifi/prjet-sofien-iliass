(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var container = document.querySelector('.container');
    if (!container || container.dataset.noSlideMode === 'true') return;

    var originalPrev = container.querySelector('.btn-prev');
    var originalNext = container.querySelector('.btn-next');
    var children = Array.from(container.children).filter(function (node) {
      return !node.classList || !node.classList.contains('btn-nav');
    });
    if (children.length < 2) return;

    document.body.classList.add('slide-mode');
    container.classList.add('slide-deck');

    var groups = [];
    var currentGroup = [];
    children.forEach(function (node, index) {
      var startsNew = node.tagName === 'H2' || (index > 0 && node.classList && node.classList.contains('chapitre-badge'));
      if (startsNew && currentGroup.length) {
        groups.push(currentGroup);
        currentGroup = [];
      }
      currentGroup.push(node);
    });
    if (currentGroup.length) groups.push(currentGroup);

    container.innerHTML = '';
    var slides = groups.map(function (group, index) {
      var slide = document.createElement('section');
      slide.className = 'slide-section';
      slide.setAttribute('aria-label', 'Slide ' + (index + 1));
      group.forEach(function (node) { slide.appendChild(node); });
      container.appendChild(slide);
      return slide;
    });

    var panel = document.createElement('nav');
    panel.className = 'slide-nav-panel';
    panel.innerHTML = '<button class="slide-control" type="button" data-slide-prev>← Précédent</button><span class="slide-counter" data-slide-counter></span><button class="slide-control" type="button" data-slide-next>Suivant →</button><span class="slide-hint">End/→ ou clic droit = suivant</span>';
    document.body.appendChild(panel);

    var progress = document.createElement('div');
    progress.className = 'slide-progress-track';
    progress.innerHTML = '<div class="slide-progress-bar" data-slide-progress></div>';
    document.body.appendChild(progress);

    var prevButton = panel.querySelector('[data-slide-prev]');
    var nextButton = panel.querySelector('[data-slide-next]');
    var counter = panel.querySelector('[data-slide-counter]');
    var progressBar = progress.querySelector('[data-slide-progress]');
    var current = 0;

    function goToPage(link) {
      if (link && link.getAttribute('href')) window.location.href = link.getAttribute('href');
    }

    function show(index) {
      var previous = current;
      current = Math.max(0, Math.min(index, slides.length - 1));
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
        slide.classList.toggle('is-leaving-left', slideIndex < current);
      });
      prevButton.disabled = current === 0 && !originalPrev;
      nextButton.disabled = current === slides.length - 1 && !originalNext;
      counter.textContent = (current + 1) + ' / ' + slides.length;
      progressBar.style.width = (((current + 1) / slides.length) * 100) + '%';
      if (previous !== current) history.replaceState(null, '', '#slide-' + (current + 1));
    }

    function next() {
      if (current < slides.length - 1) show(current + 1);
      else goToPage(originalNext);
    }

    function prev() {
      if (current > 0) show(current - 1);
      else goToPage(originalPrev);
    }

    prevButton.addEventListener('click', prev);
    nextButton.addEventListener('click', next);
    document.addEventListener('contextmenu', function (event) {
      event.preventDefault();
      next();
    }, { capture: true });
    document.addEventListener('keydown', function (event) {
      var nextKeys = ['ArrowRight', 'PageDown', ' ', 'Enter', 'End', 'n', 'N'];
      var prevKeys = ['ArrowLeft', 'PageUp', 'Backspace', 'Home', 'p', 'P'];
      if (nextKeys.indexOf(event.key) !== -1 || event.code === 'End') {
        event.preventDefault();
        next();
      } else if (prevKeys.indexOf(event.key) !== -1 || event.code === 'Home') {
        event.preventDefault();
        prev();
      }
    }, { capture: true });

    var hashMatch = window.location.hash.match(/slide-(\d+)/);
    show(hashMatch ? Number(hashMatch[1]) - 1 : 0);
    document.body.tabIndex = -1;
    document.body.focus();
  });
})();
