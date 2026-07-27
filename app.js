(() => {
  const toolMeta = {
    earthquake: { title: 'Earthquake Heatmap Converter', panel: 'earthquakeTool' },
    coordinates: { title: 'Flourish Coordinates Converter', panel: 'coordinatesTool' }
  };
  const navItems = [...document.querySelectorAll('.nav-item')];
  const pageTitle = document.getElementById('pageTitle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('mobileOverlay');

  function closeMobileNav() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }

  function showTool(name) {
    const selected = toolMeta[name];
    if (!selected) return;
    navItems.forEach(item => item.classList.toggle('active', item.dataset.tool === name));
    Object.values(toolMeta).forEach(meta => {
      document.getElementById(meta.panel).classList.toggle('active', meta === selected);
    });
    pageTitle.textContent = selected.title;
    history.replaceState(null, '', `#${name}`);
    closeMobileNav();
  }

  navItems.forEach(item => item.addEventListener('click', () => showTool(item.dataset.tool)));
  document.getElementById('menuButton').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', closeMobileNav);

  const initial = location.hash.replace('#', '');
  if (toolMeta[initial]) showTool(initial);
})();
