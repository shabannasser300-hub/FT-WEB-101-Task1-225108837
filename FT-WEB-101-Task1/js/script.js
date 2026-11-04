// ---------- Current Year ----------
var yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ---------- Light / Dark Mode Toggle ----------
var themeToggle = document.getElementById("themeToggle");
var themeText = document.getElementById("themeText");

function updateThemeUI(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (themeText) {
    themeText.textContent = theme === "dark" ? "Light" : "Dark";
  }
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
  }
}

function getInitialTheme() {
  var saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

var currentTheme = getInitialTheme();
updateThemeUI(currentTheme);

if (themeToggle) {
  themeToggle.addEventListener("click", function () {
    currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", currentTheme);
    updateThemeUI(currentTheme);
  });
}

if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function (e) {
    if (!localStorage.getItem("theme")) {
      currentTheme = e.matches ? "dark" : "light";
      updateThemeUI(currentTheme);
    }
  });
}

// ---------- Scroll Progress Bar ----------
var bar = document.getElementById("progress");
window.addEventListener("scroll", function () {
  var h = document.documentElement.scrollHeight - window.innerHeight;
  if (bar) {
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  }
}, { passive: true });

// ---------- Active Section & Navigation Indicator ----------
var cur = document.getElementById("cur");
var navLinks = document.querySelectorAll(".nav a");
var sections = document.querySelectorAll("section[data-n]");

if ("IntersectionObserver" in window) {
  var counter = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        if (cur) cur.textContent = en.target.dataset.n;
        var id = en.target.getAttribute("id");
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, { rootMargin: "-35% 0px -50% 0px" });

  sections.forEach(function (s) { counter.observe(s); });
}

// ---------- Copy Student ID ----------
var copyBtn = document.getElementById("copyId");
if (copyBtn) {
  copyBtn.addEventListener("click", function () {
    var msg = document.getElementById("copyMsg");
    var idToCopy = "225108837";
    function done(ok) {
      if (msg) {
        msg.textContent = ok ? "✓ Copied: " + idToCopy : "ID: " + idToCopy;
        setTimeout(function () { msg.textContent = ""; }, 3000);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(idToCopy).then(function () { done(true); }, function () { done(false); });
    } else {
      try {
        var input = document.createElement("input");
        input.value = idToCopy;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        done(true);
      } catch (e) {
        done(false);
      }
    }
  });
}

// ---------- Segmented Skill Meters ----------
var skills = [
  { name: "HTML", level: 8 },
  { name: "CSS", level: 7 },
  { name: "JavaScript", level: 6 },
  { name: "Problem solving", level: 8 }
];
var meters = document.getElementById("meters");
var filled = false;

if (meters) {
  skills.forEach(function (s) {
    var m = document.createElement("div");
    m.className = "meter";
    var segs = "";
    for (var i = 0; i < 10; i++) segs += "<i></i>";
    m.innerHTML = "<b>" + s.name + '</b><div class="segs" role="img" aria-label="' + s.name + " " + s.level + ' out of 10">' + segs + "</div><output>0/10</output>";
    meters.appendChild(m);
    s.el = m;
  });

  function fillMeters() {
    if (filled) return;
    filled = true;
    skills.forEach(function (s, idx) {
      var cells = s.el.querySelectorAll("i");
      var out = s.el.querySelector("output");
      for (var i = 0; i < s.level; i++) {
        (function (n) {
          setTimeout(function () {
            if (cells[n]) cells[n].classList.add("on");
            if (out) out.textContent = (n + 1) + "/10";
          }, idx * 120 + n * 70);
        })(i);
      }
    });
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) {
        fillMeters();
        obs.disconnect();
      }
    }, { threshold: 0.25 }).observe(meters);
  } else {
    fillMeters();
  }
}

// ---------- Projects Modal Dialog ----------
var projects = [
  { title: "Personal profile page", tag: "Web", text: "This page: split-screen layout, scroll progress, section counter, segmented skill meters, light & night mode, and a validated form." },
  { title: "Your next web project", tag: "Web", text: "Replace this text with a project from your training." },
  { title: "University program", tag: "Other", text: "Replace this text with a program you wrote in a course." }
];
var dlg = document.getElementById("dlg");
var plist = document.getElementById("plist");

if (plist && dlg) {
  projects.forEach(function (p) {
    var li = document.createElement("li");
    li.innerHTML = '<button type="button">' + p.title + "<small>" + p.tag + "</small></button>";
    li.querySelector("button").addEventListener("click", function () {
      var t = document.getElementById("dlgTitle");
      var txt = document.getElementById("dlgText");
      if (t) t.textContent = p.title;
      if (txt) txt.textContent = p.text;
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
    });
    plist.appendChild(li);
  });

  var dlgClose = document.getElementById("dlgClose");
  if (dlgClose) {
    dlgClose.addEventListener("click", function () {
      if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
    });
  }

  // Close dialog when clicking backdrop outside dialog content
  dlg.addEventListener("click", function (e) {
    var rect = dlg.getBoundingClientRect();
    var isInDialog = (
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
    }
  });
}

// ---------- Contact Form Validation ----------
var contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = document.getElementById("name");
    var emailEl = document.getElementById("email");
    var msgEl = document.getElementById("message");

    var name = nameEl ? nameEl.value.trim() : "";
    var email = emailEl ? emailEl.value.trim() : "";
    var msg = msgEl ? msgEl.value.trim() : "";

    var ok = true;
    function check(cond, id, text) {
      var errEl = document.getElementById(id);
      if (errEl) errEl.textContent = cond ? "" : text;
      if (!cond) ok = false;
    }

    check(name.length >= 2, "nameErr", "Please enter your name (min 2 characters).");
    check(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "emailErr", "Please enter a valid email address.");
    check(msg.length >= 10, "msgErr", "Message must be at least 10 characters.");

    var formMsg = document.getElementById("formMsg");
    if (ok) {
      if (formMsg) {
        formMsg.textContent = "✓ Thanks, " + name + "! Your message is ready.";
        formMsg.className = "success";
      }
      this.reset();
      setTimeout(function () {
        if (formMsg) {
          formMsg.textContent = "";
          formMsg.className = "";
        }
      }, 5000);
    } else {
      if (formMsg) {
        formMsg.textContent = "";
        formMsg.className = "";
      }
    }
  });
}
