// Maps scroll position to CSS variables. CSS does all the visual work, so
// scrolling back up reverses every effect automatically.
(() => {
  const root = document.documentElement;
  const clock = document.getElementById('clock');
  const fmt = new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata'
  });
  const showTime = () => { clock.textContent = fmt.format(new Date()) + ' IST'; };
  showTime();
  setInterval(showTime, 30000);

  // Visitors who prefer reduced motion get the calm, static layout
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stages = [...document.querySelectorAll('[data-stage]')];
  const links = [...document.querySelectorAll('nav a[href^="#"]:not(.logo)')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href')));
  const clamp = v => Math.min(1, Math.max(0, v));

  // About text: wrap each word so it can light up on its own
  const reveal = document.querySelector('.reveal');
  const words = reveal.textContent.trim().split(/\s+/);
  reveal.innerHTML = words.map((w, i) => `<span style="--i:${i}">${w}</span>`).join(' ');
  reveal.style.setProperty('--n', words.length);

  // Skills: measure where each card rests so it can start from the centre of the grid
  const grid = document.querySelector('.cards');
  const placeCards = () => {
    [...grid.children].forEach((card, i) => {
      const dx = grid.clientWidth / 2 - (card.offsetLeft + card.offsetWidth / 2);
      const dy = grid.clientHeight / 2 - (card.offsetTop + card.offsetHeight / 2) + (i - 2) * 4;
      card.style.setProperty('--dx', dx + 'px');
      card.style.setProperty('--dy', dy + 'px');
    });
  };

  let queued = false;
  const update = () => {
    queued = false;
    const vh = innerHeight;
    stages.forEach(s => {
      const r = s.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      s.style.setProperty('--p', p.toFixed(4));
      s.style.setProperty('--k', (1 - Math.abs(2 * p - 1)).toFixed(4));
      s.style.setProperty('--e', Math.min(1, p * 1.5).toFixed(4));
    });
    root.style.setProperty('--scroll', clamp(scrollY / Math.max(1, document.body.scrollHeight - vh)).toFixed(4));
    links.forEach((a, i) => {
      const r = targets[i].getBoundingClientRect();
      a.classList.toggle('on', r.top <= vh * .5 && r.bottom > vh * .5);
    });
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };

  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { placeCards(); queue(); });
  addEventListener('load', () => { placeCards(); update(); });
  placeCards();
  update();
})();