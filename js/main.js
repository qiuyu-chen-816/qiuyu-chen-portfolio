(function () {
  const body = document.body;
  const loader = document.getElementById("loader");
  const header = document.getElementById("siteHeader");
  const nav = document.getElementById("nav");
  const menuToggle = document.getElementById("menuToggle");
  const reelFrame = document.getElementById("reelFrame");
  const playBtn = document.getElementById("playBtn");
  const lightbox = document.getElementById("lightbox");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxEmpty = document.getElementById("lightboxEmpty");
  const video = document.getElementById("reelVideo");
  const imageLightbox = document.getElementById("imageLightbox");
  const imageLightboxClose = document.getElementById("imageLightboxClose");
  const imageStage = document.getElementById("imageStage");
  const imageCaption = document.getElementById("imageCaption");
  const imageCounter = document.getElementById("imageCounter");
  const imagePrev = document.getElementById("imagePrev");
  const imageNext = document.getElementById("imageNext");
  const contactModal = document.getElementById("contactModal");
  const contactModalClose = document.getElementById("contactModalClose");
  const contactModalBody = document.getElementById("contactModalBody");
  let galleryItems = [];
  let galleryIndex = 0;

  // Intro loader
  function hideLoader() {
    loader.classList.add("is-hidden");
    window.setTimeout(() => loader.remove(), 700);
  }

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 350);
  } else {
    window.addEventListener("load", () => window.setTimeout(hideLoader, 350), { once: true });
  }

  // Header background on scroll
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  function closeMenu() {
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    body.style.overflow = "";
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    body.style.overflow = isOpen ? "hidden" : "";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  });

  // Scroll reveal
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealItems.forEach((item, index) => {
      const siblings = item.parentElement ? item.parentElement.querySelectorAll(".reveal") : [];
      const siblingIndex = Array.from(siblings).indexOf(item);
      item.style.transitionDelay = `${(siblingIndex % 4) * 80}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("in"));
  }

  // Video lightbox
  function showEmptyState() {
    lightboxEmpty.style.display = "flex";
    video.style.display = "none";
  }

  function showVideo() {
    lightboxEmpty.style.display = "none";
    video.style.display = "block";
  }

  function openLightbox(src) {
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
    video.pause();
    video.removeAttribute("src");
    video.load();
    showEmptyState();

    // If the user has added a reel file, it will replace the empty state.
    video.addEventListener("loadedmetadata", () => {
      showVideo();
      video.play().catch(() => {});
    }, { once: true });

    video.addEventListener(
      "error",
      () => {
        showEmptyState();
      },
      { once: true }
    );

    video.src = src.replace(/\.mp4$/i, ".webm");
    video.load();
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
    video.pause();
  }

  document.querySelectorAll(".video-open").forEach((card) => {
    card.addEventListener("click", () => {
      openLightbox(card.dataset.videoSrc);
    });
  });

  // Use the actual video as the card cover whenever the browser can show its first frame.
  document.querySelectorAll(".video-card").forEach((card) => {
    if (card.classList.contains("gif-card")) return;
    const media = card.querySelector(".video-card-media");
    if (!media || !card.dataset.videoSrc) return;
    const thumb = document.createElement("video");
    thumb.className = "video-thumb";
    thumb.muted = true;
    thumb.playsInline = true;
    thumb.preload = "metadata";
    thumb.src = card.dataset.videoSrc.replace(/\.mp4$/i, ".webm");
    thumb.setAttribute("aria-hidden", "true");
    thumb.setAttribute("disablepictureinpicture", "");
    media.appendChild(thumb);
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  // Image gallery lightbox
  function showGalleryImage() {
    const item = galleryItems[galleryIndex];
    if (!item) return;
    imageStage.src = item.dataset.src;
    imageStage.alt = item.dataset.caption || "作品大图";
    imageCaption.textContent = item.dataset.caption || "";
    imageCounter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
    imagePrev.style.visibility = galleryItems.length > 1 ? "visible" : "hidden";
    imageNext.style.visibility = galleryItems.length > 1 ? "visible" : "hidden";
  }

  function openImageGallery(trigger) {
    const group = trigger.dataset.group;
    galleryItems = Array.from(
      document.querySelectorAll(`.gallery-open[data-group="${group}"]:not(.is-clone)`)
    );
    galleryIndex = Number(trigger.dataset.index) || 0;
    if (galleryIndex < 0 || galleryIndex >= galleryItems.length) galleryIndex = 0;

    imageLightbox.classList.add("is-open");
    imageLightbox.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
    showGalleryImage();
  }

  function closeImageGallery() {
    imageLightbox.classList.remove("is-open");
    imageLightbox.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
    imageStage.removeAttribute("src");
  }

  function stepGallery(direction) {
    if (!galleryItems.length) return;
    galleryIndex = (galleryIndex + direction + galleryItems.length) % galleryItems.length;
    showGalleryImage();
  }

  // Duplicate scrolling galleries for a seamless loop.
  document.querySelectorAll(".gallery-scroll-track").forEach((track) => {
    Array.from(track.children).forEach((item) => {
      const clone = item.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("is-clone");
      clone.dataset.clone = "true";
      track.appendChild(clone);
    });
  });

  document.querySelectorAll(".gallery-open").forEach((trigger) => {
    trigger.addEventListener("click", () => openImageGallery(trigger));
  });

  imageLightboxClose.addEventListener("click", closeImageGallery);
  imagePrev.addEventListener("click", () => stepGallery(-1));
  imageNext.addEventListener("click", () => stepGallery(1));

  imageLightbox.addEventListener("click", (event) => {
    if (event.target === imageLightbox) {
      closeImageGallery();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!imageLightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeImageGallery();
    }
    if (event.key === "ArrowLeft") {
      stepGallery(-1);
    }
    if (event.key === "ArrowRight") {
      stepGallery(1);
    }
  });

  // Contact modal
  function openContactModal(kind) {
    if (kind === "wechat") {
      contactModalBody.innerHTML =
        '<img src="assets/wechat-qr.jpg" alt="微信二维码" /><p>微信二维码</p>';
    } else if (kind === "xiaohongshu") {
      contactModalBody.innerHTML =
        '<img src="assets/xiaohongshu-qr.jpg" alt="小红书二维码" /><p>小红书二维码</p>';
    } else if (kind === "phone") {
      contactModalBody.innerHTML =
        '<p class="phone-number">13186029956</p><p>电话</p>';
    }
    contactModal.classList.add("is-open");
    contactModal.setAttribute("aria-hidden", "false");
    body.style.overflow = "hidden";
  }

  function closeContactModal() {
    contactModal.classList.remove("is-open");
    contactModal.setAttribute("aria-hidden", "true");
    body.style.overflow = "";
    contactModalBody.innerHTML = "";
  }

  document.querySelectorAll(".contact-link").forEach((button) => {
    button.addEventListener("click", () => openContactModal(button.dataset.contact));
  });

  contactModalClose.addEventListener("click", closeContactModal);
  contactModal.addEventListener("click", (event) => {
    if (event.target === contactModal) {
      closeContactModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && contactModal.classList.contains("is-open")) {
      closeContactModal();
    }
  });
})();
