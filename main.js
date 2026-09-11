/*
 * KO'S LOADED FRIES — main.js
 *
 * This site has NO backend and NO contact form, by design. There's no
 * online ordering for this business — contact is phone and social only
 * (see contact.html). Nothing here submits data anywhere; it's all
 * client-side UI behaviour: nav, smooth scroll, scroll reveal, and a
 * copy-to-clipboard helper for the email address.
 */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* -----------------------------------------------------------------
     Mobile nav toggle — accessible, keyboard operable, focus-trapping
     ----------------------------------------------------------------- */
  function initNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-nav]");
    var scrim = document.querySelector("[data-nav-scrim]");
    if (!toggle || !nav) return;

    var focusableSelector =
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function openNav() {
      nav.dataset.open = "true";
      toggle.setAttribute("aria-expanded", "true");
      if (scrim) scrim.dataset.open = "true";
      document.body.style.overflow = "hidden";
      var focusables = nav.querySelectorAll(focusableSelector);
      if (focusables.length) focusables[0].focus();
      document.addEventListener("keydown", onKeydown);
      document.addEventListener("click", onOutsideClick, true);
    }

    function closeNav(returnFocus) {
      nav.dataset.open = "false";
      toggle.setAttribute("aria-expanded", "false");
      if (scrim) scrim.dataset.open = "false";
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("click", onOutsideClick, true);
      if (returnFocus) toggle.focus();
    }

    function onOutsideClick(e) {
      if (!nav.contains(e.target) && e.target !== toggle) {
        closeNav(false);
      }
    }

    function onKeydown(e) {
      if (e.key === "Escape") {
        closeNav(true);
        return;
      }
      if (e.key === "Tab") {
        var focusables = Array.prototype.slice.call(
          nav.querySelectorAll(focusableSelector)
        );
        if (!focusables.length) return;
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.dataset.open === "true";
      if (isOpen) {
        closeNav(true);
      } else {
        openNav();
      }
    });

    if (scrim) {
      scrim.addEventListener("click", function () {
        closeNav(false);
      });
    }

    // Close the mobile menu automatically if the viewport grows past
    // the breakpoint while it's open.
    var mq = window.matchMedia("(min-width: 761px)");
    mq.addEventListener("change", function (e) {
      if (e.matches) closeNav(false);
    });
  }

  /* -----------------------------------------------------------------
     Active nav-link highlighting based on current page
     ----------------------------------------------------------------- */
  function initActiveNav() {
    var links = document.querySelectorAll("[data-nav] a");
    var current = window.location.pathname.split("/").pop() || "index.html";
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === current || (current === "" && href === "index.html")) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  /* -----------------------------------------------------------------
     Smooth scroll for on-page anchors
     ----------------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href").slice(1);
        if (!id) return;
        var target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    });
  }

  /* -----------------------------------------------------------------
     Scroll-triggered reveal — content is visible by default in CSS,
     this just adds the "punch in" motion when supported and allowed.
     ----------------------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------------
     Copy-to-clipboard for the email address, with a small confirmation
     ----------------------------------------------------------------- */
  function initEmailCopy() {
    var copyButtons = document.querySelectorAll("[data-copy-email]");
    copyButtons.forEach(function (btn) {
      var email = btn.getAttribute("data-copy-email");
      var feedback = document.querySelector(
        btn.getAttribute("data-copy-feedback") || ""
      );
      btn.addEventListener("click", function (e) {
        if (!navigator.clipboard) return; // mailto link still works fine
        e.preventDefault();
        navigator.clipboard
          .writeText(email)
          .then(function () {
            if (feedback) {
              feedback.textContent = "Email copied — " + email;
              window.setTimeout(function () {
                feedback.textContent = "";
              }, 4000);
            }
          })
          .catch(function () {
            // Clipboard blocked — fall back to the mailto link behaviour.
            window.location.href = "mailto:" + email;
          });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initActiveNav();
    initSmoothScroll();
    initReveal();
    initEmailCopy();
  });
})();
