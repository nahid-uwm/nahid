const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);

// Custom Cursor - Instant Real-time Movement
const cursor = document.querySelector('.custom-cursor');

if (!isTouchDevice && !prefersReducedMotion) {
    document.addEventListener('mousemove', (e) => {
        // Use transform for hardware acceleration and instant updates
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    // Cursor hover effects
    document.addEventListener('mouseover', (e) => {
        if (e.target.matches('button, a, .gear-item')) {
            cursor.classList.add('cursor-hover');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.matches('button, a, .gear-item')) {
            cursor.classList.remove('cursor-hover');
        }
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('cursor-click');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor-click');
    });
} else if (cursor) {
    cursor.style.display = 'none';
}

// Starfield
function createStarfield() {
    const starfield = document.getElementById('starfield');
    if (!starfield || prefersReducedMotion) return;

    const numStars = 200;
    const stars = [];
    let mouseX = -1000;
    let mouseY = -1000;

    // Star color temperature palette
    function randomStarColor() {
        const r = Math.random() * 100;
        if (r < 30) return '#cce8ff'; // hot blue-white
        if (r < 80) return '#ffffff'; // white
        return '#ffe4b0';             // warm yellow
    }

    // Create stars with type classification
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        const initialX = Math.random() * 100;
        const initialY = Math.random() * 100;
        star.style.left = initialX + '%';
        star.style.top  = initialY + '%';

        // 60% normal, 30% twinkler, 10% giant
        const roll = Math.random();
        let type, size, baseOpacity, color;

        if (roll < 0.60) {
            type        = 'normal';
            size        = Math.random() * 1.5 + 0.5;
            baseOpacity = Math.random() * 0.2 + 0.15;
            color       = randomStarColor();
        } else if (roll < 0.90) {
            type        = 'twinkler';
            size        = Math.random() * 1.5 + 0.5;
            baseOpacity = 0; // driven by sine wave
            color       = randomStarColor();
        } else {
            type        = 'giant';
            size        = Math.random() * 2 + 2.5;
            baseOpacity = Math.random() * 0.3 + 0.4;
            color       = '#ffe4b0';
        }

        star.style.width      = size + 'px';
        star.style.height     = size + 'px';
        star.style.background = color;
        star.style.opacity    = baseOpacity;

        starfield.appendChild(star);

        stars.push({
            element:      star,
            x:            initialX,
            y:            initialY,
            type,
            size,
            baseOpacity,
            color,
            twinkleSpeed: Math.random() * 0.0015 + 0.0005,
            twinklePhase: Math.random() * Math.PI * 2,
            pulseSpeed:   Math.random() * 0.0008 + 0.0003,
            pulsePhase:   Math.random() * Math.PI * 2,
            alive:        true,
        });
    }

    // Track mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // --- CLICK SHOCKWAVE ---
    let shockwave = null;
    document.addEventListener('mousedown', (e) => {
        if (isTouchDevice) return;
        shockwave = { x: e.clientX, y: e.clientY, time: performance.now() };

        // Visual ripple ring
        const ring = document.createElement('div');
        ring.style.cssText = [
            `position:fixed`,
            `left:${e.clientX}px`,
            `top:${e.clientY}px`,
            `width:4px`,
            `height:4px`,
            `border-radius:50%`,
            `border:1px solid rgba(34,211,238,0.35)`,
            `box-shadow:0 0 8px 2px rgba(34,211,238,0.12)`,
            `transform:translate(-50%,-50%) scale(1)`,
            `animation:click-wave 0.7s ease-out forwards`,
            `pointer-events:none`,
            `z-index:9998`,
        ].join(';');
        document.body.appendChild(ring);
        setTimeout(() => ring.remove(), 750);
    });

    // --- 3D SUPERNOVA ---
    function triggerSupernova() {
        const candidates = stars.filter(s => {
            if (!s.alive) return false;
            const sx = (s.x / 100) * window.innerWidth;
            const sy = (s.y / 100) * window.innerHeight;
            return Math.hypot(mouseX - sx, mouseY - sy) > 200;
        });
        if (!candidates.length) return;

        const star = candidates[Math.floor(Math.random() * candidates.length)];
        star.alive = false;
        const el = star.element;

        // Bloom bright white
        el.style.transition = 'width 0.2s, height 0.2s, opacity 0.15s, box-shadow 0.15s, background 0.1s';
        el.style.width      = '8px';
        el.style.height     = '8px';
        el.style.opacity    = '1';
        el.style.background = '#ffffff';
        el.style.boxShadow  = '0 0 14px rgba(255,255,255,0.9), 0 0 28px rgba(34,211,238,0.5)';

        // 3D supernova container with perspective
        const nova = document.createElement('div');
        nova.style.cssText = `position:absolute;left:${star.x}%;top:${star.y}%;width:0;height:0;pointer-events:none;z-index:1;perspective:300px;transform-style:preserve-3d;`;

        // Core glow — radial gradient that expands then fades
        const core = document.createElement('div');
        core.className = 'supernova-core';
        nova.appendChild(core);

        // Ring A — main cyan ring, tilted 65° for 3D ellipse
        const ringA = document.createElement('div');
        ringA.className = 'supernova-ring-a';
        nova.appendChild(ringA);

        // Ring B — pink accent ring, different tilt, slight delay
        const ringB = document.createElement('div');
        ringB.className = 'supernova-ring-b';
        nova.appendChild(ringB);

        starfield.appendChild(nova);

        // Collapse star
        setTimeout(() => {
            el.style.transition = 'all 0.5s ease';
            el.style.opacity    = '0';
            el.style.width      = '1px';
            el.style.height     = '1px';
            el.style.boxShadow  = 'none';
        }, 250);

        // Cleanup
        setTimeout(() => nova.remove(), 1600);

        // Respawn at a new position
        setTimeout(() => {
            star.x = Math.random() * 100;
            star.y = Math.random() * 100;
            el.style.left       = star.x + '%';
            el.style.top        = star.y + '%';
            el.style.width      = star.size + 'px';
            el.style.height     = star.size + 'px';
            el.style.background = star.color;
            el.style.boxShadow  = 'none';
            el.style.transition = 'opacity 1.2s ease';
            el.style.opacity    = star.type === 'twinkler' ? '0' : String(star.baseOpacity);
            star.alive = true;
        }, 1700);

        setTimeout(triggerSupernova, 8000 + Math.random() * 7000);
    }
    setTimeout(triggerSupernova, 6000 + Math.random() * 4000);

    // --- SHOOTING STARS (top-left → bottom-right) ---
    function createShootingStar() {
        const el  = document.createElement('div');
        const sx  = 5  + Math.random() * 50;   // spawn in left half
        const sy  = 3  + Math.random() * 35;   // spawn in upper third
        const len = 90 + Math.random() * 70;
        el.style.cssText = [
            `position:absolute`,
            `left:${sx}%`,
            `top:${sy}%`,
            `width:${len}px`,
            `height:1.5px`,
            // Gradient: transparent tail (left) → bright head (right)
            `background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.25) 30%,rgba(255,255,255,0.95) 100%)`,
            `border-radius:2px`,
            `transform:rotate(35deg)`,
            `opacity:0`,
            `animation:shooting-star-anim 0.8s ease-out forwards`,
            `pointer-events:none`,
            `z-index:1`,
        ].join(';');
        starfield.appendChild(el);
        setTimeout(() => el.remove(), 900);
        setTimeout(createShootingStar, 20000 + Math.random() * 25000);
    }
    setTimeout(createShootingStar, 9000 + Math.random() * 8000);

    // --- ANIMATION LOOP ---
    const SHOCKWAVE_DURATION = 700;
    const SHOCKWAVE_MAX_RADIUS = 350;
    const SHOCKWAVE_RING_WIDTH = 60;

    function animate(timestamp) {
        const W = window.innerWidth;
        const H = window.innerHeight;
        const repulsionRadius = 170;

        // Expire old shockwave
        if (shockwave && timestamp - shockwave.time > SHOCKWAVE_DURATION) {
            shockwave = null;
        }

        stars.forEach(star => {
            if (!star.alive) return;

            const sx   = (star.x / 100) * W;
            const sy   = (star.y / 100) * H;
            const dx   = mouseX - sx;
            const dy   = mouseY - sy;
            const dist = Math.hypot(dx, dy);

            let moveX = 0, moveY = 0;
            let isRepulsed = false;

            // Blackhole gravity-lens repulsion
            if (dist < repulsionRadius && dist > 0) {
                isRepulsed = true;
                const force = Math.pow(1 - dist / repulsionRadius, 2);
                const angle = Math.atan2(dy, dx);

                // Radial push + tangential arc (gravitational lensing)
                moveX = Math.cos(angle) * force * -65 + (-Math.sin(angle) * force * 14);
                moveY = Math.sin(angle) * force * -65 + ( Math.cos(angle) * force * 14);

                // Directional motion-blur trail pointing toward cursor
                const trailX = Math.cos(angle) * force * 12;
                const trailY = Math.sin(angle) * force * 12;

                star.element.style.opacity    = '1';
                star.element.style.background = '#22d3ee';
                star.element.style.boxShadow  =
                    `0 0 ${(8 * force).toFixed(1)}px rgba(34,211,238,0.9),` +
                    `${trailX.toFixed(1)}px ${trailY.toFixed(1)}px ${(6 * force).toFixed(1)}px rgba(34,211,238,0.35)`;
            }

            // Click-shockwave displacement (additive)
            if (shockwave) {
                const elapsed  = timestamp - shockwave.time;
                const progress = elapsed / SHOCKWAVE_DURATION;
                const waveR    = SHOCKWAVE_MAX_RADIUS * progress;
                const sdx      = sx - shockwave.x;
                const sdy      = sy - shockwave.y;
                const sdist    = Math.hypot(sdx, sdy);

                if (sdist > 0 && Math.abs(sdist - waveR) < SHOCKWAVE_RING_WIDTH) {
                    const proximity = 1 - Math.abs(sdist - waveR) / SHOCKWAVE_RING_WIDTH;
                    const sforce    = proximity * (1 - progress);
                    const sangle    = Math.atan2(sdy, sdx);
                    moveX += Math.cos(sangle) * sforce * 25;
                    moveY += Math.sin(sangle) * sforce * 25;
                }
            }

            star.element.style.transform = `translate(${moveX}px,${moveY}px)`;

            // Idle star behaviour (only when not being repulsed by cursor)
            if (!isRepulsed) {
                star.element.style.background = star.color;

                if (star.type === 'twinkler') {
                    const t = 0.1 + 0.28 * (0.5 + 0.5 * Math.sin(timestamp * star.twinkleSpeed + star.twinklePhase));
                    star.element.style.opacity   = String(t);
                    star.element.style.boxShadow = 'none';
                } else if (star.type === 'giant') {
                    const pulse = star.baseOpacity + 0.18 * Math.sin(timestamp * star.pulseSpeed + star.pulsePhase);
                    const gi    = 0.25 + 0.25 * Math.sin(timestamp * star.pulseSpeed + star.pulsePhase);
                    star.element.style.opacity   = String(Math.max(0, Math.min(1, pulse)));
                    star.element.style.boxShadow = `0 0 ${(3 + 3 * gi).toFixed(1)}px rgba(255,228,176,${(gi * 0.7).toFixed(2)})`;
                } else {
                    star.element.style.opacity   = String(star.baseOpacity);
                    star.element.style.boxShadow = 'none';
                }
            }
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

// Mobile Menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');

function toggleMobileMenu() {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    mobileOverlay.classList.toggle('open');

    // Prevent body scroll when menu is open
    if (mobileMenu.classList.contains('open')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', toggleMobileMenu);

// Setup close menu button
const closeMenuBtn = document.getElementById('closeMenuBtn');
if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', closeMobileMenu);
}

// Close mobile menu when clicking overlay
mobileOverlay.addEventListener('click', closeMobileMenu);

// Close mobile menu when clicking links
document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Close mobile menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
    }
});

// Smooth scrolling
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
    });
}

// Progress dots
const progressDots = document.querySelectorAll('.progress-dot');
const sections = document.querySelectorAll('section[id]');

progressDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const sectionId = dot.dataset.section;
        scrollToSection(sectionId);
    });
});

// Update active progress dot on scroll
function updateProgressDots() {
    const scrollPosition = window.scrollY + 100;

    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            progressDots.forEach(dot => dot.classList.remove('active'));
            progressDots[index]?.classList.add('active');
        }
    });
}

// Throttle scroll events for better performance
let isUpdatingProgress = false;
window.addEventListener('scroll', () => {
    if (!isUpdatingProgress) {
        window.requestAnimationFrame(() => {
            updateProgressDots();
            isUpdatingProgress = false;
        });
        isUpdatingProgress = true;
    }
}, { passive: true });

// Tooltips
const tooltip = document.getElementById('tooltip');
const gearItems = document.querySelectorAll('.gear-item');

gearItems.forEach(item => {
    item.addEventListener('mouseenter', (e) => {
        const tooltipText = item.dataset.tooltip;
        tooltip.textContent = tooltipText;
        tooltip.classList.add('show');

        const rect = item.getBoundingClientRect();
        const rawLeft = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
        tooltip.style.left = Math.max(8, Math.min(rawLeft, window.innerWidth - tooltip.offsetWidth - 8)) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    });

    item.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
    });
});



// Download CV buttons
function setupDownloadButton(btnId) {
    const btn = document.getElementById(btnId);

    btn.addEventListener('click', () => {
        // Create and download placeholder PDF
        const link = document.createElement('a');
        link.href = 'data:application/pdf;base64,JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL091dGxpbmVzIDIgMCBSCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PAovVHlwZSAvT3V0bGluZXMKL0NvdW50IDAKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9Db3VudCAxCi9LaWRzIFs0IDAgUl0KPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA5IDAgUgo+Pgo+PgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooTUQgTkFISUQgSEFTQU4gLSBDVikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovTmFtZSAvRjEKL0Jhc2VGb250IC9IZWx2ZXRpY2EKL0VuY29kaW5nIC9XaW5BbnNpRW5jb2RpbmcKPj4KZW5kb2JqCnhyZWYKMCA3CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDE3NyAwMDAwMCBuIAowMDAwMDAwMzY0IDAwMDAwIG4gCjAwMDAwMDA0NTggMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA3Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1NjUKJSVFT0Y=';
        link.download = 'MD_Nahid_Hasan_CV.pdf';
        link.click();
    });
}

// Setup both download buttons
setupDownloadButton('downloadCV');
setupDownloadButton('downloadCV2');

// Contact form
// Check if contact form exists before adding listener to avoid errors if it's missing (though it seems to be missing in the HTML provided, or I missed it. I'll include it as in the original)
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Message sent! (This is a demo - EmailJS integration would handle actual sending)');
    });
}

// Navigation links (using event delegation for better performance)
document.addEventListener('click', (e) => {
    const link = e.target.closest('nav a[href^="#"]');
    if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        scrollToSection(targetId);
    }
});

// Centralized Image Error Handling
document.addEventListener('error', function (e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        const img = e.target;
        const parent = img.parentElement;
        if (parent && parent.classList.contains('aspect-[3/2]')) {
            let emoji = '🖼️'; // Default
            const src = img.src.toLowerCase();
            if (src.includes('evaluating') || src.includes('walking')) emoji = '🚶‍♂️';
            else if (src.includes('blind') || src.includes('driver')) emoji = '🚛';
            else if (src.includes('shore')) emoji = '🌊';
            else if (src.includes('saber')) emoji = '⚔️';
            else if (src.includes('accessible')) emoji = '♿';
            else if (src.includes('bimanual')) emoji = '🤏';
            else if (src.includes('climb')) emoji = '🧗‍♂️';
            else if (src.includes('slicing')) emoji = '🔪';
            else if (src.includes('shooting')) emoji = '🎯';
            else if (src.includes('breathing')) emoji = '🧘‍♂️';
            else if (src.includes('eating')) emoji = '🍎';
            else if (src.includes('painting')) emoji = '🎨';
            else if (src.includes('hex')) emoji = '🔬';

            parent.innerHTML = `<span class="text-4xl">${emoji}</span>`;
        }
    }
}, true); // Use capture phase to catch non-bubbling error events

// Initialize
createStarfield();
updateProgressDots();

// YouTube Video Lazy Load
window.loadVideo = function (element, videoId) {
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    // Adding rel=0 and origin parameters can sometimes help with playback restrictions
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.title = 'YouTube video player';
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    element.innerHTML = '';
    element.appendChild(iframe);
    element.onclick = null;
    element.classList.remove('cursor-pointer');
}
// YouTube Videos Scroll
const videoContainer = document.getElementById('videoContainer');
const scrollLeftBtn = document.getElementById('scrollLeft');
const scrollRightBtn = document.getElementById('scrollRight');

if (videoContainer && scrollLeftBtn && scrollRightBtn) {
    scrollLeftBtn.addEventListener('click', () => {
        const cardWidth = videoContainer.querySelector('.hud-card').offsetWidth;
        const gap = 24; // 6 * 4px (tailwind gap-6)
        videoContainer.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', () => {
        const cardWidth = videoContainer.querySelector('.hud-card').offsetWidth;
        const gap = 24;
        videoContainer.scrollBy({ left: (cardWidth + gap), behavior: 'smooth' });
    });
}

// ============================================================
// SECTION ENTRY ANIMATIONS (staggered fade-up on scroll)
// ============================================================
(function () {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.hud-card');

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const card = entry.target;
            const delay = Number(card.dataset.entryDelay || 0);

            setTimeout(() => {
                card.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
                card.style.opacity    = '1';
                card.style.transform  = 'translateY(0)';

                // After entrance finishes, restore the default card transition
                // so hover effects (translateY(-5px)) work normally again
                setTimeout(() => {
                    card.style.transition = '';
                    card.style.transform  = '';
                }, 700);
            }, delay);

            io.unobserve(card);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

    cards.forEach((card, i) => {
        card.style.opacity         = '0';
        card.style.transform       = 'translateY(24px)';
        card.dataset.entryDelay    = String((i % 4) * 90); // stagger up to ~270ms
        io.observe(card);
    });

    // Attach card-image class to all aspect-ratio image wrappers inside cards
    // so the CSS zoom + cyan tint overlay applies automatically
    cards.forEach(card => {
        const wrap = card.querySelector('[class*="aspect-"]');
        if (wrap) wrap.classList.add('card-image');
    });
})();
