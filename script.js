const root = document.documentElement;
const body = document.body;
const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav__link")];
const revealItems = [...document.querySelectorAll("[data-reveal]")];
const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
const faqItems = [...document.querySelectorAll(".faq-item")];
const modal = document.querySelector(".gallery-modal");
const modalImage = document.querySelector(".gallery-modal__image");
const modalTitle = document.querySelector(".gallery-modal__title");
const modalText = document.querySelector(".gallery-modal__text");
const modalCloseTriggers = [...document.querySelectorAll("[data-modal-close]")];
const portfolioCards = [...document.querySelectorAll(".portfolio-card[data-modal-image]")];
const reviewTrack = document.querySelector(".reviews__track");
const reviewCards = [...document.querySelectorAll(".review-card")];
const reviewsDots = document.querySelector(".reviews__dots");
const reviewPrev = document.querySelector("[data-review-prev]");
const reviewNext = document.querySelector("[data-review-next]");
const mobileBookButton = document.querySelector(".mobile-book");
const heroPrimaryButton = document.querySelector(".hero .button--primary");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeModalTrigger = null;
let reviewIndex = 0;
let reviewTimer = null;
let rafId = null;
let pointerX = 0;
let pointerY = 0;

const setHeaderState = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

const closeMenu = () => {
  if (!header || !navToggle) return;
  header.classList.remove("is-nav-open");
  navToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
};

const openMenu = () => {
  if (!header || !navToggle) return;
  header.classList.add("is-nav-open");
  navToggle.setAttribute("aria-expanded", "true");
  body.classList.add("menu-open");
};

const toggleMenu = () => {
  if (!header) return;
  const isOpen = header.classList.contains("is-nav-open");
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
};

const scrollToTarget = (targetId) => {
  const target = document.getElementById(targetId);
  if (!target) return;

  const headerHeight = header ? header.offsetHeight : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

  window.scrollTo({
    top,
    behavior: reduceMotion.matches ? "auto" : "smooth",
  });
};

const revealOnScroll = () => {
  revealItems.forEach((item) => {
    const delay = Number(item.dataset.delay || 0);
    item.style.transitionDelay = `${delay}s`;
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
};

const setActiveNav = () => {
  if (!navLinks.length || !("IntersectionObserver" in window)) return;

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = `#${entry.target.id}`;
        const link = navLinks.find((item) => item.getAttribute("href") === id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((item) => item.classList.remove("is-active"));
          link.classList.add("is-active");
        }
      });
    },
    {
      threshold: 0.45,
      rootMargin: "-30% 0px -40% 0px",
    }
  );

  sections.forEach((section) => navObserver.observe(section));
};

const updateParallax = () => {
  if (!parallaxItems.length) return;

  const x = (pointerX / window.innerWidth - 0.5) * 2;
  const y = (pointerY / window.innerHeight - 0.5) * 2;

  parallaxItems.forEach((item) => {
    const depth = Number(item.dataset.depth || 10);
    const translateX = x * depth;
    const translateY = y * depth * 0.75;
    item.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
  });

  rafId = null;
};

const setupParallax = () => {
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  if (reduceMotion.matches || !hasFinePointer || !parallaxItems.length) return;

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;

    if (!rafId) {
      rafId = window.requestAnimationFrame(updateParallax);
    }
  });
};

const openModal = (card) => {
  if (!modal || !modalImage || !modalTitle || !modalText) return;

  activeModalTrigger = card;
  modalImage.src = card.dataset.modalImage || "";
  modalImage.alt = `Увеличенный просмотр: ${card.dataset.modalTitle || "работа"}`;
  modalTitle.textContent = card.dataset.modalTitle || "";
  modalText.textContent = card.dataset.modalText || "";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
};

const closeModal = () => {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  body.classList.remove("modal-open");

  window.setTimeout(() => {
    if (!modal.classList.contains("is-open")) {
      modalImage.src = "";
    }
  }, 250);

  if (activeModalTrigger) {
    activeModalTrigger.focus();
    activeModalTrigger = null;
  }
};

const setupModal = () => {
  portfolioCards.forEach((card) => {
    card.addEventListener("click", () => openModal(card));
  });

  modalCloseTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closeModal);
  });
};

const setReviewPosition = (index) => {
  if (!reviewTrack || !reviewCards.length) return;

  reviewIndex = (index + reviewCards.length) % reviewCards.length;
  reviewTrack.style.transform = `translateX(-${reviewIndex * 100}%)`;

  const dots = [...reviewsDots.querySelectorAll(".reviews__dot")];
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === reviewIndex);
  });
};

const resetReviewTimer = () => {
  if (reviewTimer) {
    window.clearInterval(reviewTimer);
  }

  if (reduceMotion.matches || reviewCards.length < 2) return;

  reviewTimer = window.setInterval(() => {
    setReviewPosition(reviewIndex + 1);
  }, 6500);
};

const setupReviews = () => {
  if (!reviewTrack || !reviewCards.length || !reviewsDots) return;

  reviewCards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "reviews__dot";
    dot.setAttribute("aria-label", `Перейти к отзыву ${index + 1}`);
    dot.addEventListener("click", () => {
      setReviewPosition(index);
      resetReviewTimer();
    });
    reviewsDots.append(dot);
  });

  reviewPrev?.addEventListener("click", () => {
    setReviewPosition(reviewIndex - 1);
    resetReviewTimer();
  });

  reviewNext?.addEventListener("click", () => {
    setReviewPosition(reviewIndex + 1);
    resetReviewTimer();
  });

  document.querySelector(".reviews__slider")?.addEventListener("mouseenter", () => {
    if (reviewTimer) {
      window.clearInterval(reviewTimer);
    }
  });

  document.querySelector(".reviews__slider")?.addEventListener("mouseleave", resetReviewTimer);

  setReviewPosition(0);
  resetReviewTimer();
};

const setupFaq = () => {
  faqItems.forEach((item) => {
    const button = item.querySelector(".faq-item__question");
    const answer = item.querySelector(".faq-item__answer");
    if (!button || !answer) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");

      faqItems.forEach((faqItem) => {
        const faqButton = faqItem.querySelector(".faq-item__question");
        const faqAnswer = faqItem.querySelector(".faq-item__answer");
        if (!faqButton || !faqAnswer) return;

        faqItem.classList.remove("is-open");
        faqButton.setAttribute("aria-expanded", "false");
        faqAnswer.style.maxHeight = "0px";
        faqAnswer.style.paddingBottom = "0px";
      });

      if (isOpen) return;

      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      answer.style.paddingBottom = "1.2rem";
      answer.style.maxHeight = `${answer.scrollHeight + 24}px`;
    });
  });
};

const setupAnchors = () => {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("a");
    if (!trigger) return;

    const scrollTarget = trigger.dataset.scrollTarget;
    const href = trigger.getAttribute("href");

    if (scrollTarget) {
      event.preventDefault();
      scrollToTarget(scrollTarget);
      closeMenu();
      return;
    }

    if (href === "#") {
      event.preventDefault();
      return;
    }

    if (href && href.startsWith("#")) {
      event.preventDefault();
      scrollToTarget(href.slice(1));
      closeMenu();
    }
  });
};

const setupMobileBookVisibility = () => {
  if (!mobileBookButton || !heroPrimaryButton || !("IntersectionObserver" in window)) return;

  const mobileQuery = window.matchMedia("(max-width: 61.9375rem)");

  const syncVisibility = (isHeroButtonVisible) => {
    if (!mobileQuery.matches) {
      mobileBookButton.classList.remove("is-hidden");
      return;
    }

    mobileBookButton.classList.toggle("is-hidden", isHeroButtonVisible);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      syncVisibility(Boolean(entry?.isIntersecting));
    },
    {
      threshold: 0.35,
    }
  );

  observer.observe(heroPrimaryButton);

  const handleViewportChange = () => {
    if (!mobileQuery.matches) {
      mobileBookButton.classList.remove("is-hidden");
      return;
    }

    const rect = heroPrimaryButton.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    syncVisibility(isVisible);
  };

  handleViewportChange();
  mobileQuery.addEventListener("change", handleViewportChange);
};

navToggle?.addEventListener("click", toggleMenu);

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 992) {
    closeMenu();
  }
});

document.addEventListener("click", (event) => {
  if (!header?.classList.contains("is-nav-open")) return;
  if (event.target instanceof Node && !header.contains(event.target)) {
    closeMenu();
  }
});

window.addEventListener("scroll", setHeaderState, { passive: true });

document.addEventListener("visibilitychange", () => {
  if (document.hidden && reviewTimer) {
    window.clearInterval(reviewTimer);
  } else if (!document.hidden) {
    resetReviewTimer();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
    closeModal();
  }
});

setHeaderState();
revealOnScroll();
setActiveNav();
setupParallax();
setupModal();
setupReviews();
setupFaq();
setupAnchors();
setupMobileBookVisibility();
