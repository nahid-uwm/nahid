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

    // Create stars
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';

        // Random position
        const initialX = Math.random() * 100;
        const initialY = Math.random() * 100;

        star.style.left = initialX + '%';
        star.style.top = initialY + '%';

        // Random size for variety
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';

        // Random animation delay for twinkling if we add it later
        star.style.animationDelay = Math.random() * 3 + 's';

        starfield.appendChild(star);

        stars.push({
            element: star,
            x: initialX, // percentage
            y: initialY  // percentage
        });
    }

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animation loop
    function animate() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const repulsionRadius = 150;

        stars.forEach(star => {
            // Convert percentage to pixels for calculation
            const starX = (star.x / 100) * width;
            const starY = (star.y / 100) * height;

            const dx = mouseX - starX;
            const dy = mouseY - starY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < repulsionRadius) {
                // Calculate repulsion force (stronger when closer)
                const force = (repulsionRadius - distance) / repulsionRadius;
                const angle = Math.atan2(dy, dx);

                // Repel away from cursor
                // Max displacement of 50px
                const moveX = Math.cos(angle) * force * -50;
                const moveY = Math.sin(angle) * force * -50;

                star.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
                star.element.style.opacity = 1;
                // Cyan glow
                star.element.style.boxShadow = `0 0 ${10 * force}px rgba(34, 211, 238, 0.8)`;
            } else {
                // Reset to original state
                star.element.style.transform = 'translate(0, 0)';
                star.element.style.opacity = 0.3;
                star.element.style.boxShadow = 'none';
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
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
        tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
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
