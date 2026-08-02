(function () {
  "use strict";

  var form = document.getElementById("calcForm");
  var dobInput = document.getElementById("dobInput");
  var formError = document.getElementById("formError");
  var result = document.getElementById("result");
  var stampWrap = document.getElementById("stampWrap");
  var fridayCountEl = document.getElementById("fridayCount");
  var ageLineEl = document.getElementById("ageLine");
  var tierTextEl = document.getElementById("tierText");
  var confettiLayer = document.getElementById("confettiLayer");
  var serialNumberEl = document.getElementById("serialNumber");
  var photoInput = document.getElementById("photoInput");
  var photoImg = document.getElementById("photoImg");
  var photoPlaceholder = document.getElementById("photoPlaceholder");
  var photoClearBtn = document.getElementById("photoClear");

  var BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

  function toBengaliDigits(value) {
    return String(value).replace(/[0-9]/g, function (d) {
      return BENGALI_DIGITS[Number(d)];
    });
  }

  function startOfDay(date) {
    var d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function countFridaysSince(dob, today) {
    var day = dob.getDay(); // 0 = Sun ... 5 = Fri, 6 = Sat
    var daysUntilFriday = (5 - day + 7) % 7;
    var firstFriday = new Date(dob);
    firstFriday.setDate(firstFriday.getDate() + daysUntilFriday);

    if (firstFriday > today) {
      return 0;
    }

    var diffMs = today - firstFriday;
    var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
  }

  function calcAge(dob, today) {
    var years = today.getFullYear() - dob.getFullYear();
    var months = today.getMonth() - dob.getMonth();
    if (today.getDate() < dob.getDate()) {
      months -= 1;
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    return { years: years, months: months };
  }

  function getTier(ageYears) {
    if (ageYears < 12) {
      return "এখনো মায়ের হাতের রান্নার বয়স — শুক্রবার মানেই বিরিয়ানি, একলা থাকার প্রশ্নই নেই!";
    }
    if (ageYears < 18) {
      return "স্কুল-কলেজের গণ্ডি পেরোচ্ছেন। শুক্রবার এখনো শুধুই একটা ছুটির দিন।";
    }
    if (ageYears < 25) {
      return "একলা শুক্রবারের আসল যাত্রা সবে শুরু হয়েছে। এখনো অনেকটা পথ বাকি।";
    }
    if (ageYears < 32) {
      return "বাসার মুরুব্বিরা ইতিমধ্যে পাত্রী খোঁজা শুরু করে দিয়েছেন, নিশ্চিত থাকুন।";
    }
    if (ageYears < 40) {
      return "আপনি এই ময়দানের একজন সিনিয়র খেলোয়াড়। অভিজ্ঞতা বলে কথা।";
    }
    return "এই সনদ এখন আপনার কাছে খাঁটি অভিজ্ঞতার প্রতীক। স্যালুট!";
  }

  function spawnConfetti() {
    var colors = ["#b4862b", "#8c1f2b", "#6b5d45", "#d8b968"];
    var pieceCount = 16;

    for (var i = 0; i < pieceCount; i++) {
      var piece = document.createElement("span");
      piece.className = "confetti-piece";

      var angle = Math.random() * Math.PI * 2;
      var distance = 90 + Math.random() * 60;
      var cx = Math.cos(angle) * distance;
      var cy = Math.sin(angle) * distance - 20;
      var rotation = Math.floor(Math.random() * 480 - 240) + "deg";
      var duration = 0.8 + Math.random() * 0.5;

      piece.style.setProperty("--cx", cx.toFixed(0) + "px");
      piece.style.setProperty("--cy", cy.toFixed(0) + "px");
      piece.style.setProperty("--cr", rotation);
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = duration.toFixed(2) + "s";

      confettiLayer.appendChild(piece);

      (function (el, life) {
        setTimeout(function () {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }, life * 1000 + 100);
      })(piece, duration);
    }
  }

  function animateCount(target) {
    var durationMs = 900;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) {
        startTime = timestamp;
      }
      var progress = Math.min((timestamp - startTime) / durationMs, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(eased * target);
      fridayCountEl.textContent = toBengaliDigits(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        fridayCountEl.textContent = toBengaliDigits(target);
      }
    }

    requestAnimationFrame(step);
  }

  function setSerialNumber() {
    var today = new Date();
    var y = today.getFullYear();
    var m = String(today.getMonth() + 1).padStart(2, "0");
    var d = String(today.getDate()).padStart(2, "0");
    serialNumberEl.textContent = "সনদ নং: " + toBengaliDigits(y + "-" + m + d);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    formError.textContent = "";

    if (!dobInput.value) {
      formError.textContent = "জন্ম তারিখ দিন প্রথমে।";
      return;
    }

    var dob = startOfDay(new Date(dobInput.value + "T00:00:00"));
    var today = startOfDay(new Date());

    if (dob > today) {
      formError.textContent = "এই তারিখ তো এখনো আসেনি! সঠিক জন্ম তারিখ দিন। 😄";
      result.classList.remove("is-visible");
      return;
    }

    var count = countFridaysSince(dob, today);
    var age = calcAge(dob, today);

    result.classList.add("is-visible");
    stampWrap.classList.remove("stamp-in");
    confettiLayer.innerHTML = "";
    void stampWrap.offsetWidth; // restart animation
    stampWrap.classList.add("stamp-in");

    animateCount(count);
    ageLineEl.textContent =
      "বর্তমান বয়স: " + toBengaliDigits(age.years) + " বছর " + toBengaliDigits(age.months) + " মাস";
    tierTextEl.textContent = getTier(age.years);

    setTimeout(spawnConfetti, 200);
  });

  photoInput.addEventListener("change", function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }
    if (!/^image\//.test(file.type)) {
      formError.textContent = "শুধু ছবি ফাইল (jpg/png/webp) দিন।";
      photoInput.value = "";
      return;
    }

    formError.textContent = "";
    var reader = new FileReader();
    reader.onload = function (loadEvent) {
      photoImg.src = loadEvent.target.result;
      photoImg.hidden = false;
      photoPlaceholder.hidden = true;
      photoClearBtn.classList.add("is-visible");
    };
    reader.readAsDataURL(file);
  });

  photoClearBtn.addEventListener("click", function () {
    photoInput.value = "";
    photoImg.src = "";
    photoImg.hidden = true;
    photoPlaceholder.hidden = false;
    photoClearBtn.classList.remove("is-visible");
  });

  var maxDate = new Date();
  dobInput.max =
    maxDate.getFullYear() +
    "-" +
    String(maxDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(maxDate.getDate()).padStart(2, "0");

  setSerialNumber();
})();
