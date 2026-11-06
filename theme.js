/* Shared dark / light theme toggle.
   Applies the saved theme before paint (loaded in <head>) and wires every
   [data-theme-toggle] button. Stores only the UI theme preference. */
(function () {
  'use strict';
  var KEY = 'sdr-theme';

  var SUN_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var MOON_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* ignore */ }
  }
  function apply(value) {
    document.documentElement.setAttribute('data-theme', value);
  }

  apply(read() === 'light' ? 'light' : 'dark');

  function current() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function toggle() {
    var next = current() === 'light' ? 'dark' : 'light';
    apply(next);
    save(next);
    refresh();
    return next;
  }
  function refresh() {
    var light = current() === 'light';
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].innerHTML = (light ? MOON_ICON + ' <span>Dark mode</span>' : SUN_ICON + ' <span>Light mode</span>');
      btns[i].setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    }
  }

  window.SDRTheme = { current: current, toggle: toggle };

  document.addEventListener('DOMContentLoaded', function () {
    var btns = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener('click', toggle);
    }
    refresh();
  });
})();
