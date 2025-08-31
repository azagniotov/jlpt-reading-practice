// Common functions shared between pages

function scrollToTop() {
	window.scrollTo({top: 0, behavior: 'smooth'});
}

function backToTopVisibilityHandlers() {
	const backToTopButton = document.getElementById('backToTop');
	const scrollPosition = window.scrollY;
	const windowHeight = window.innerHeight;
	// Show after scrolling 4 screen heights
	const percentageThreshold = windowHeight * 4.0;
	if (scrollPosition > percentageThreshold) {
		backToTopButton.classList.add('show');
	} else {
		backToTopButton.classList.remove('show');
	}
}

function initializeBackToTop() {
	const backToTopButton = document.getElementById('backToTop');
	// Use touchstart for immediate response on mobile
	backToTopButton.addEventListener('touchstart', function(e) {
		e.preventDefault();
		e.stopPropagation();
		scrollToTop();
	}, { passive: false });
	// Fallback for desktop and other devices
	backToTopButton.addEventListener('click', function(e) {
		e.preventDefault();
		e.stopPropagation();
		scrollToTop();
	});
}

function updateThemeIcon() {
	const icon = document.getElementById('theme-icon');
	const isDark = document.body.classList.contains('dark-mode');
	icon.textContent = isDark ? '🌙' : '☀️';
}

function toggleDarkMode(container) {
	const checkbox = container.querySelector('input[type="checkbox"]');
	checkbox.checked = !checkbox.checked;
	const body = document.body;
	if (checkbox.checked) {
		body.classList.add('dark-mode');
	} else {
		body.classList.remove('dark-mode');
	}
	updateThemeIcon()
}

function updateProgressBar() {
	const scrollTop = window.scrollY;
	const docHeight = document.documentElement.scrollHeight - window.innerHeight;
	const scrollPercent = (scrollTop / docHeight) * 100;
	const progressBar = document.getElementById('progress-bar');
	progressBar.style.width = `${scrollPercent}%`;
}

function fixStickyActiveStates() {
	const buttons = document.querySelectorAll(
			'.theme-toggle, .kanji-toggle, .furigana-toggle, .back-to-top'
	);

	buttons.forEach((btn) => {
		btn.addEventListener('touchend', () => {
			btn.blur(); // force blur to cancel active state
		});
	});
}

document.addEventListener('DOMContentLoaded', () => {
	initializeBackToTop();
	backToTopVisibilityHandlers();
	updateThemeIcon();
	fixStickyActiveStates();

	// Fix for iOS Safari: enable :active styles
	document.addEventListener('touchstart', () => {}, true);

	// Scroll event listeners
	window.addEventListener('scroll', () => {
		updateProgressBar();
		backToTopVisibilityHandlers();
	});
});
