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

function toggleDarkMode(container) {
	const checkbox = container.querySelector('input[type="checkbox"]');
	checkbox.checked = !checkbox.checked;
	const body = document.body;
	if (checkbox.checked) {
		body.classList.add('dark-mode');
	} else {
		body.classList.remove('dark-mode');
	}
}

function updateProgressBar() {
	const scrollTop = window.scrollY;
	const docHeight = document.documentElement.scrollHeight - window.innerHeight;
	const scrollPercent = (scrollTop / docHeight) * 100;
	const progressBar = document.getElementById('progress-bar');
	progressBar.style.width = `${scrollPercent}%`;
}

document.addEventListener('DOMContentLoaded', () => {
	// Set dark mode as default
	const darkModeCheckbox = document.getElementById('dark-mode-toggle');
	darkModeCheckbox.checked = true;
	document.body.classList.add('dark-mode');

	initializeBackToTop();
	backToTopVisibilityHandlers();

	// Scroll event listeners
	window.addEventListener('scroll', () => {
		updateProgressBar();
		backToTopVisibilityHandlers();
	});
});
