function copyToClipboard(text) {
	if (navigator.clipboard && window.isSecureContext) {
		// Modern clipboard API
		return navigator.clipboard.writeText(text);
	} else {
		// Fallback for older browsers or non-HTTPS
		const textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.left = '-999999px';
		textArea.style.top = '-999999px';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();

		return new Promise((resolve, reject) => {
			try {
				document.execCommand('copy');
				textArea.remove();
				resolve();
			} catch (error) {
				textArea.remove();
				reject(error);
			}
		});
	}
}

function toggleKanjiHighlight(className, container) {
	const checkbox = container.querySelector('input[type="checkbox"]');
	checkbox.checked = !checkbox.checked;

	const elements = document.querySelectorAll('.' + className);
	elements.forEach(el => {
		if (checkbox.checked) {
			el.classList.add('highlighted');
		} else {
			el.classList.remove('highlighted');
		}
	});
}

function clearAllTempFurigana() {
	// Remove all furigana popups
	const furiganaPopups = document.querySelectorAll('.furigana-popup');
	furiganaPopups.forEach(popup => popup.remove());
}

function toggleFurigana(container) {
	const checkbox = container.querySelector('input[type="checkbox"]');
	checkbox.checked = !checkbox.checked;

	const body = document.body;
	if (checkbox.checked) {
		body.classList.remove('hidden-furigana');
	} else {
		body.classList.add('hidden-furigana');
	}

	// Clear any temporary mobile tap states when toggling furigana
	clearAllTempFurigana();
}

function showFuriganaPopup(isTouchDevice, ruby) {
	const rt = ruby.querySelector('rt');
	if (!rt) return;

	const kanjiElement = ruby.querySelector('.kanji');
	const kanjiMeaning = ruby.querySelector('.kanji_meaning');

	if (kanjiElement) {
		kanjiElement.classList.add('popup-highlight');
	}

	// Create popup
	const popup = document.createElement('div');
	popup.className = 'furigana-popup';

	const furiganaText = rt.textContent;
	const kanjiMeaningText = kanjiMeaning ? kanjiMeaning.textContent : 'No meaning available';

	// Create furigana line
	const furiganaLine = document.createElement('div');
	furiganaLine.innerHTML = `<span class="furigana-popup-label">${kanjiElement.textContent}:</span> ${furiganaText}`;

	// Create meaning container
	const meaningContainer = document.createElement('div');
	meaningContainer.innerHTML = `<span class="furigana-popup-label">1.  </span>`;

	// Process meanings
	if (kanjiMeaningText.includes(';')) {
		const meanings = kanjiMeaningText.split(';').map(m => m.trim());

		// Add first meaning inline
		meaningContainer.innerHTML += meanings[0] + ';';

		// Add additional meanings as separate lines with proper indentation
		for (let idx = 1; idx < meanings.length; idx++) {
			const meaningLine = document.createElement('div');
			meaningLine.innerHTML = `<span class="furigana-popup-label">${idx + 1}.  </span>`;
			meaningLine.innerHTML += meanings[idx] + (idx < meanings.length - 1 ? ';' : '');

			meaningContainer.appendChild(meaningLine);
		}
	} else {
		meaningContainer.innerHTML += kanjiMeaningText;
	}

	popup.appendChild(furiganaLine);
	popup.appendChild(meaningContainer);

	document.body.appendChild(popup);

	// Get zoom-aware positioning using getBoundingClientRect
	const rubyRect = ruby.getBoundingClientRect();
	const popupRect = popup.getBoundingClientRect();
	const viewportWidth = window.innerWidth;

	// Get scroll offsets to convert viewport coords to document coords
	const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

	// Convert viewport coordinates to document coordinates for absolute positioning
	const absoluteLeft = rubyRect.left + scrollLeft;
	const absoluteTop = rubyRect.top + scrollTop;

	// Calculate horizontal position with viewport edge detection
	let leftPosition = absoluteLeft + rubyRect.width / 2;
	const viewportEdgeOffset = 10;

	// Check if popup would go off screen edges (using viewport coords for comparison)
	if (rubyRect.left + rubyRect.width / 2 + popupRect.width / 2 > viewportWidth - viewportEdgeOffset) {
		leftPosition = scrollLeft + viewportWidth - popupRect.width - viewportEdgeOffset;
		popup.style.transform = 'none';
	} else if (rubyRect.left + rubyRect.width / 2 - popupRect.width / 2 < viewportEdgeOffset) {
		leftPosition = scrollLeft + viewportEdgeOffset;
		popup.style.transform = 'none';
	} else {
		// Use centered positioning
		popup.style.transform = 'translateX(-50%)';
	}

	const offset = isTouchDevice ? 10 : 5;

	// Use absolute positioning (relative to document)
	popup.style.position = 'absolute';
	popup.style.left = leftPosition + 'px';
	popup.style.top = (absoluteTop - popupRect.height - offset) + 'px';

	// Show popup
	popup.classList.add('show');
	ruby._currentPopup = popup;

	if (isTouchDevice) {
		popup._hideTimeout = setTimeout(() => {
			popup.classList.remove('show');

			if (kanjiElement) {
				kanjiElement.classList.remove('popup-highlight');
			}

			// The second 300ms delay lets the CSS animation finish before cleaning up the DOM element.
			setTimeout(() => popup.remove(), 300);
		}, 4000);
	}
}

function getCleanJapaneseText(element) {
	const clone = element.cloneNode(true);
	const furiganaElements = clone.querySelectorAll('rt, rp, .kanji_meaning');
	furiganaElements.forEach(el => el.remove());
	return clone.textContent.trim();
}

function speakJapanese(jpSentenceElement, speakerButton) {
	const cleanText = getCleanJapaneseText(jpSentenceElement);

	if ('speechSynthesis' in window) {
		speechSynthesis.cancel(); // Stop any current speech

		// Re-enable all speaker buttons first (in case another was disabled)
		const allSpeakerButtons = document.querySelectorAll('.speaker-btn');
		allSpeakerButtons.forEach(btn => {
			btn.disabled = false;
			btn.style.opacity = '1';
			btn.style.cursor = 'pointer';
		});

		// Disable the clicked button
		speakerButton.disabled = true;
		speakerButton.style.opacity = '0.5';
		speakerButton.style.cursor = 'not-allowed';

		const utterance = new SpeechSynthesisUtterance(cleanText);
		utterance.lang = 'ja-JP';
		utterance.rate = 0.9;
		utterance.pitch = 1.0;

		// Re-enable button when speech ends or errors
		const enableButton = () => {
			speakerButton.disabled = false;
			speakerButton.style.opacity = '1';
			speakerButton.style.cursor = 'pointer';
		};

		utterance.onend = enableButton;
		utterance.onerror = enableButton;

		// Function to set voice once voices are available
		const setVoice = () => {
			const voices = speechSynthesis.getVoices();
			console.log('Available Japanese voices:');
			voices.forEach((voice, index) => {
				if (voice.lang.startsWith('ja')) {
					console.log(`${index}: ${voice.name} ${voice.lang}`);
				}
			});

			// Priority order: female Japanese voice -> male Japanese voice (Hattori) -> any Japanese voice -> default
			let selectedVoice = voices.find(voice =>
					voice.lang.startsWith('ja') &&
					(voice.name.toLowerCase().includes('female') ||
							voice.name.toLowerCase().includes('woman') ||
							voice.name.toLowerCase().includes('kyoko') ||
							voice.name.toLowerCase().includes('otoya'))
			);

			if (!selectedVoice) {
				selectedVoice = voices.find(voice => voice.lang.startsWith('ja'));
			}

			if (selectedVoice) {
				utterance.voice = selectedVoice;
			}

			speechSynthesis.speak(utterance);
		};

		// Check if voices are already loaded
		const voices = speechSynthesis.getVoices();
		if (voices.length > 0) {
			setVoice();
		} else {
			// Wait for voices to be loaded
			speechSynthesis.addEventListener('voiceschanged', setVoice, { once: true });
		}
	} else {
		alert('Speech synthesis not supported in this browser');
	}
}

function speakerButtonHandlers() {
	const speakerButtons = document.querySelectorAll('.speaker-btn');
	speakerButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			const wrapper = btn.closest('.sentence-wrapper');
			const jpSentence = wrapper.querySelector('.jp-sentence');
			speakJapanese(jpSentence, btn);
		});
	});
}

function translateButtonHandlers(isTouchDevice) {
	const translationButtons = document.querySelectorAll('.translate-btn');

	translationButtons.forEach((btn) => {
		btn.addEventListener('click', () => {
			// Don't do anything if button is disabled
			if (btn.disabled) return;

			// Close any existing translation popup and re-enable its button
			const existingPopups = document.querySelectorAll('.translation-popup.show');
			existingPopups.forEach(existingPopup => {
				// Clear timeout for existing popup
				if (existingPopup._fadeTimeout) {
					clearTimeout(existingPopup._fadeTimeout);
				}

				// Hide existing popup
				existingPopup.classList.remove('show');

				// Re-enable the button associated with this popup
				const existingWrapper = existingPopup.closest('.sentence-wrapper');
				const existingBtn = existingWrapper.querySelector('.translate-btn');

				existingBtn.disabled = false;
				existingBtn.style.opacity = '1';
				existingBtn.style.cursor = 'pointer';
			});

			const parentLi = btn.closest('li');
			const allLis = Array.from(parentLi.parentElement.children);
			const index = allLis.indexOf(parentLi);
			const translation = allLis[index + 1]?.textContent || 'Translation not found';
			const wrapper = btn.closest('.sentence-wrapper');
			const popup = wrapper.querySelector('.translation-popup');

			// Clear existing timeout if any
			if (popup._fadeTimeout) {
				clearTimeout(popup._fadeTimeout);
			}
			// Disable the button and show visual feedback
			btn.disabled = true;
			btn.style.opacity = '0.5';
			btn.style.cursor = 'not-allowed';

			// Set translation text
			popup.textContent = translation;
			popup.classList.add('show');

			// Hide popup and re-enable button after a few seconds
			popup._fadeTimeout = setTimeout(() => {
				popup.classList.remove('show');
				// Re-enable button after popup fade animation completes
				setTimeout(() => {
					btn.disabled = false;
					btn.style.opacity = '1';
					btn.style.cursor = 'pointer';
					// The second 100ms delay lets the CSS animation finish before enabling up the DOM element.
				}, 100);
			}, 4000);
		});
	});

	if (isTouchDevice) {
		window.addEventListener('scroll', function() {
			// Clear translation popups
			const translationPopups = document.querySelectorAll('.translation-popup.show');
			translationPopups.forEach(popup => {
				if (popup._fadeTimeout) {
					clearTimeout(popup._fadeTimeout);
				}
				popup.classList.remove('show');
			});

			// Re-enable all translate buttons (in case another was disabled)
			const allTranslateButtons = document.querySelectorAll('.translate-btn');
			allTranslateButtons.forEach(btn => {
				btn.disabled = false;
				btn.style.opacity = '1';
				btn.style.cursor = 'pointer';
			});
		});
	}
}

function individualKanjiFuriganaPopupHandlers(isTouchDevice) {
	const rubies = document.querySelectorAll('ruby');
	rubies.forEach(ruby => {
		const kanjiElement = ruby.querySelector('.kanji');
		const kanjiText = kanjiElement.textContent;

		if (isTouchDevice) {
			ruby.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopPropagation();

				// Close any existing popup and remove its highlight before showing new one
				const existingPopups = document.querySelectorAll('.furigana-popup');
				existingPopups.forEach(existingPopup => {
					if (existingPopup._hideTimeout) {
						clearTimeout(existingPopup._hideTimeout);
					}
					existingPopup.classList.remove('show');
					existingPopup.remove();
				});

				// Remove highlight from all kanji
				const allKanji = document.querySelectorAll('.kanji.popup-highlight');
				allKanji.forEach(kanji => {
					kanji.classList.remove('popup-highlight');
				});

				// Clear references from all ruby elements
				const allRubies = document.querySelectorAll('ruby');
				allRubies.forEach(rubyEl => {
					if (rubyEl._currentPopup) {
						delete rubyEl._currentPopup;
					}
				});

				// Copy kanji to clipboard (click is a proper user gesture)
				copyToClipboard(kanjiText).then(() => {
					console.log('Copied to clipboard:', kanjiText);
				}).catch(err => {
					console.error('Failed to copy:', err);
				});

				// Show new popup
				showFuriganaPopup(isTouchDevice, ruby);
			});
		}
		else {
			// On desktop, use click instead of mouseenter for clipboard
			ruby.addEventListener('click', function (e) {
				e.preventDefault();
				e.stopPropagation();

				// Copy kanji to clipboard
				copyToClipboard(kanjiText).then(() => {
					console.log('Copied to clipboard:', kanjiText);
				}).catch(err => {
					console.error('Failed to copy:', err);
				});
			});

			ruby.addEventListener('mouseenter', function () {
				showFuriganaPopup(isTouchDevice, ruby);
			});

			ruby.addEventListener('mouseleave', function () {
				const popup = ruby._currentPopup;
				const kanjiElement = ruby.querySelector('.kanji');

				if (popup) {
					popup.classList.remove('show');

					if (kanjiElement) {
						kanjiElement.classList.remove('popup-highlight');
					}
					setTimeout(() => popup.remove(), 300);
				}
				if (popup._hideTimeout) {
					clearTimeout(popup._hideTimeout);
					delete ruby._currentPopup;
				}
			});
		}
	});

	if (isTouchDevice) {
		window.addEventListener('scroll', function() {
			// Clear furigana popups and remove highlights
			const furiganaPopups = document.querySelectorAll('.furigana-popup');
			furiganaPopups.forEach(popup => {
				if (popup._hideTimeout) {
					clearTimeout(popup._hideTimeout);
				}
				popup.classList.remove('show');
				setTimeout(() => popup.remove(), 100);
			});

			// Clear references from ruby elements and remove highlights
			const rubies = document.querySelectorAll('ruby');
			rubies.forEach(ruby => {
				const kanjiElement = ruby.querySelector('.kanji');
				if (kanjiElement) {
					kanjiElement.classList.remove('popup-highlight');
				}
				if (ruby._currentPopup) {
					delete ruby._currentPopup;
				}
			});
		});
	}
}
