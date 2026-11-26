'use strict';
window.Projects = (() => {
  // Repository descriptions, README files and visibility checked on 2026-11-22.
  const groups = ['systems', 'research', 'applications', 'web'];
  // name, repository slug, category, documented status, English description, optional website
  const projects = [
    ['Orfreon', 'Orfreon', 'systems', 'planned', 'A planned experimental exokernel intended as a shared foundation for several operating systems.', 'https://orfreon.meoy.top/'],
    ['Evavind OS', 'Evavind-OS', 'systems', 'planned', 'A general-purpose Linux-based desktop OS in early planning and research.'],
    ['Liberpony OS', 'Liberpony-OS', 'systems', 'planned', 'A planned open-source pony-themed operating system based on Orfreon.'],
    ['Glivand OS', 'Glivand-OS', 'systems', null, 'The repository is private. Its public description, license and development progress could not be verified.'],
    ['Liberums', 'Liberums', 'research', 'maintenance', 'A C11/i686 research and teaching exokernel. v1.0.0 establishes the educational baseline after major feature development.'],
    ['Kernseed OS', 'Kernseed_OS', 'research', 'archived', 'An educational x86-64 monolithic OS written in C and assembly. Completed, with no regular maintenance planned.'],
    ['HoofTTY', 'HoofTTY', 'research', 'beta', 'A pony-inspired, text-first hobby OS based on Kernseed OS, with its own kernel and shell.', '/projects/hooftty/'],
    ['LinuxLibOS', 'LinuxLibOS', 'research', null, 'An independent i686 Ring 3 Library OS for Liberums that explores restricted execution of static Linux i386 ELF32 binaries.'],
    ['Aelthuvor', 'Aelthuvor', 'research', null, 'An independent C11/i686 Ring 3 Library OS and application SDK for Liberums.'],
    ['Aelthoren', 'Aelthoren', 'applications', 'discontinued', 'An experimental Gecko-based browser exploring lightweight, private, account-free design.'],
    ['liberFPS', 'liberFPS', 'applications', null, 'An offline single-player FPS sandbox built with Godot and GDScript, with a playable training range.'],
    ['Evan Windproof Website', 'Evan-Windproof.github.io', 'web', null, 'A personal technology blog, open source project index and the Evavind mock desktop.', 'https://evanwindproof.top/'],
    ['Orfreon Website', 'Orfreon-Website', 'web', 'preview', 'A trilingual static website prototype introducing the plans for Orfreon.', 'https://orfreon.meoy.top/']
  ];
  const labels = {
    projectFilter: 'Filter by category',
    projectAll: 'All',
    systems: 'Operating Systems',
    research: 'Kernel & Research',
    applications: 'Applications & Tools',
    web: 'Web Projects',
    planned: 'Planned',
    maintenance: 'Maintenance',
    archived: 'Completed and archived',
    beta: 'Experimental beta',
    discontinued: 'Proof of concept complete · maintenance discontinued',
    preview: 'Prototype preview',
    projectWebsite: 'Website'
  };
  Object.assign(window.EvavindLocales.en, labels);
  projects.forEach(([, repo, , , description]) => {
    window.EvavindLocales.en[`projectDesc:${repo}`] = description;
  });

  const external = 'target="_blank" rel="noopener noreferrer"';
  function card([name, repo, group, status, , website]) {
    const {text} = I18n;
    const isHoofTTY = repo === 'HoofTTY';
    const offsite = website && !website.startsWith('/');
    return `<article class="card project-card${isHoofTTY ? ' project-card-hooftty' : ''}">
      ${text(group, 'span', 'tag')}
      <h3>${isHoofTTY ? `<a href="${website}"><span aria-hidden="true">&gt;_ </span>${name}</a>` : name}</h3>
      ${text(`projectDesc:${repo}`, 'p')}
      ${status ? text(status, 'p', 'project-status') : ''}
      <div class="project-links">
        <a href="https://github.com/Evan-Windproof/${repo}" ${external}>GitHub ↗</a>
        ${website ? `<a href="${website}"${offsite ? ` ${external}` : ''}>${text('projectWebsite')}${offsite ? ' ↗' : ''}</a>` : ''}
      </div>
    </article>`;
  }

  function markup() {
    const {text, t} = I18n;
    return `<div class="project-showcase">
      ${text('projectsTitle', 'h2')}
      <label class="project-filter">${text('projectFilter')}
        <select data-project-filter>
          <option value="" data-i18n="projectAll">${t('projectAll')}</option>
          ${groups.map(group => `<option value="${group}" data-i18n="${group}">${t(group)}</option>`).join('')}
        </select>
      </label>
      <p><a href="https://github.com/Evan-Windproof?tab=repositories" ${external}>${text('repos')}</a></p>
      ${groups.map(group => `<section data-project-group="${group}">
        ${text(group, 'h3')}
        <div class="cards">${projects.filter(project => project[2] === group).map(card).join('')}</div>
      </section>`).join('')}
    </div>`;
  }

  document.addEventListener('change', event => {
    const filter = event.target.closest('[data-project-filter]');
    if (!filter) return;
    for (const section of filter.closest('.project-showcase').querySelectorAll('[data-project-group]')) {
      section.hidden = Boolean(filter.value && filter.value !== section.dataset.projectGroup);
    }
  });

  return { markup };
})();
