# JLPT Reading Practice

The app is essentially a comprehensive digital reading companion for JLPT students, offering multiple ways
to interact with Japanese text while providing the scaffolding needed for language learning through features
like pronunciation guides, translations, and audio support.

## Core Features

### Reading Practice Content

- Contains reading passages organized by JLPT levels (N5 and N4 sentences)
- Each sentence includes Japanese text with furigana (pronunciation guides) above kanji characters
- English translations are provided but hidden by default

### Interactive Ruby/Furigana System

- Clickable kanji characters that show both pronunciation (furigana) and English meanings in popup tooltips
- Furigana can be toggled on/off globally for reading comprehension practice
- On touch devices, tapping kanji automatically copies it to clipboard
- Desktop users can hover over kanji for instant popup display

### Audio Features

- Text-to-speech functionality with speaker buttons for each sentence
- Prioritizes Japanese voices (female voices preferred, with fallback options)
- Prevents multiple simultaneous audio playback

### Translation System

- Toggle buttons to reveal/hide English translations for each sentence
- Translations appear in timed popups (4 seconds) then auto-hide
- Only one translation can be displayed at a time

### Visual Customization

- Kanji highlighting - option to highlight all kanji characters for easier identification
- Dark mode toggle for comfortable reading in low light
- Responsive design that adapts to mobile, tablet, and desktop screens

### User Experience Enhancements

- Sidebar navigation between different JLPT levels
- Reading progress bar at the top of the page
- Smooth scrolling behavior that closes popups automatically
- Custom checkboxes with visual feedback
- Clean, readable typography optimized for Japanese text

## Technical Highlights

- Mobile-first design with touch-optimized interactions
- Accessibility considerations with proper semantic markup
- Performance optimized with efficient event handling
- Cross-browser compatibility including fallbacks for older browsers
- No external dependencies - everything is self-contained
