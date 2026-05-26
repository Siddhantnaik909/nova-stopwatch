# NOVA Stopwatch - Modern Web Application

A feature-rich stopwatch application with timer, pomodoro, focus mode, lap tracking, and more.

GitHub: https://github.com/Siddhantnaik909/nova-stopwatch

## Features

- ⏱️ **Stopwatch** - Classic time tracking with centisecond precision
- ⏲️ **Timer** - Countdown timer with audio alarm
- 🍅 **Pomodoro** - Work/break cycles for productivity
- 🎯 **Focus Mode** - Fullscreen immersive timing experience
- 📊 **Lap Tracking** - Record and view lap times
- 🔔 **Alarms** - Visual and audio notifications
- ⌨️ **Keyboard Shortcuts** - Fast control without mouse
- 📱 **Responsive Design** - Works on desktop, tablet, mobile
- 💾 **History Export** - Save and export session data
- 🎨 **Modern UI** - Clean, minimalist interface with smooth animations

## Getting Started

### Prerequisites
- Node.js 18+ (for development tools)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.6+ (for dev server alternative)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Siddhantnaik909/nova-stopwatch.git
   cd nova-stopwatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Opens server on `http://localhost:8000`

### Without npm
Run Python's built-in server:
```bash
python -m http.server 8000
```

### Static HTML Deployment
The project can be deployed as a static site because it uses only `index.html`, `app.js`, and `style.css`.

- Copy the project folder to any static host
- Open `index.html` in a browser for a local preview
- Use GitHub Pages, Netlify, or Vercel for easy hosting

## Project Structure

```
├── index.html       - Main HTML with UI structure
├── app.js          - Application logic (strict mode)
├── style.css       - Styling and animations
├── package.json    - npm configuration
├── .eslintrc.json  - ESLint rules
├── .prettierrc.json - Code formatting
└── README.md       - This file
```

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start dev server on port 8000 |
| `npm run dev` | Same as start |
| `npm run lint` | Check code with ESLint |
| `npm run format` | Auto-format code with Prettier |
| `npm run build` | Run build process |

## Architecture

### Stopwatch Logic
- IIFE (Immediately Invoked Function Expression) for encapsulation
- Strict mode for better error detection
- Timer loop using `requestAnimationFrame` for smooth updates
- State machine for Stopwatch/Timer/Pomodoro modes
- Utility functions for time formatting and calculations

### UI Components
- **Focus Mode Overlay** - Fullscreen timer display
- **Alarm Overlay** - Alert when timer ends
- **Shortcuts Panel** - Keyboard shortcut reference
- **Settings Panel** - Configuration options
- **History Tab** - View past sessions
- **Mini Widget** - Compact timer display

### DOM Selectors
All UI elements use ID-based selectors (e.g., `#focus-overlay`, `#alarm-overlay`).

## Keyboard Shortcuts

- `Space` - Start/Pause
- `R` - Reset
- `L` - Record Lap
- `F` - Focus Mode
- `H` - Show History
- `S` - Settings
- `?` - Show Shortcuts

## Code Quality

- **ESLint** - Enforces consistent code style
- **Prettier** - Auto-formats code
- **Strict Mode** - Catches common mistakes
- **Modern JS** - ES2021+ features

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- No external framework dependencies
- Optimized animation loops
- Minimal DOM manipulation
- Efficient event listeners
- Local storage for persistence

## Development Tips

1. **Check code quality**
   ```bash
   npm run lint
   ```

2. **Format before commit**
   ```bash
   npm run format
   ```

3. **Use browser DevTools**
   - Inspect elements with Elements panel
   - Debug with Sources panel
   - Monitor performance with Performance tab

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - See LICENSE file for details

## Contact & Support

- Issues: [GitHub Issues](https://github.com/yourusername/nova-stopwatch/issues)
- Email: your.email@example.com

---

**Happy timing! ⏱️**
