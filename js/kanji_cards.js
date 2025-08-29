function initializeCards() {
	document.querySelectorAll('.kanji-card').forEach(card => {
		card.addEventListener('click', function () {
			const readings = this.querySelector('.readings');
			const hint = this.querySelector('.expand-hint');
			if (readings.classList.contains('show')) {
				readings.classList.remove('show');
				hint.textContent = 'Tap to see readings';
				this.classList.remove('expanded');
			}
			else {
				// Close other expanded cards
				document.querySelectorAll('.kanji-card.expanded').forEach(otherCard => {
					if (otherCard !== this) {
						otherCard.querySelector('.readings').classList.remove('show');
						otherCard.querySelector('.expand-hint').textContent = 'Tap to see readings';
						otherCard.classList.remove('expanded');
					}
				});
				readings.classList.add('show');
				hint.textContent = 'Tap to hide readings';
				this.classList.add('expanded');
			}
		});
	});
}

// Search functionality
function initializeSearch() {
	const searchInput = document.getElementById('searchInput');
	const cardsGrid = document.getElementById('cardsGrid');
	const noResults = document.getElementById('noResults');
	searchInput.addEventListener('input', function () {
		const searchTerm = this.value.toLowerCase().trim();
		const cards = document.querySelectorAll('.kanji-card');
		let visibleCount = 0;
		cards.forEach(card => {
			const searchData = card.getAttribute('data-search').toLowerCase();
			if (searchTerm === '' || searchData.includes(searchTerm)) {
				card.style.display = 'block';
				visibleCount++;
			}
			else {
				card.style.display = 'none';
			}
		});
		if (visibleCount === 0 && searchTerm !== '') {
			noResults.style.display = 'block';
		}
		else {
			noResults.style.display = 'none';
		}
	});
}
