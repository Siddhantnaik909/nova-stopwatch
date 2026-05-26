# NOVA Stopwatch

A modern static stopwatch web app built with only HTML, CSS, and JavaScript. It works directly on GitHub Pages without Node.js, npm, a backend server, or a build step.

[Live Preview](https://siddhantnaik909.github.io/nova-stopwatch/) | [GitHub Repository](https://github.com/Siddhantnaik909/nova-stopwatch) | [Report an Issue](https://github.com/Siddhantnaik909/nova-stopwatch/issues)

## Live Preview

Try the app here:

https://siddhantnaik909.github.io/nova-stopwatch/

## Features

- Stopwatch with centisecond precision
- Countdown timer with audio and visual alarm feedback
- Pomodoro mode for focus and break sessions
- Fullscreen focus mode
- Lap tracking and session history
- Mini widget mode
- CSV and JSON export
- Keyboard shortcuts
- Responsive design for desktop, tablet, and mobile
- Six themes: Cyber Gold, Neon Blue, Matrix Green, Crimson Red, Vaporwave, and Midnight Eclipse
- Smooth CSS animations and animated progress rings
- No backend and no framework dependency

## Animations

The interface includes polished static-site animations:

- Animated timing rings
- Smooth mode transitions
- Focus overlay animation
- Alarm glow feedback
- Button hover and press states
- Modal open and close transitions
- Theme-aware motion effects

## Project Files

Only the core static app files are required:

```text
.
|-- index.html    App layout and HTML structure
|-- style.css     Styling, responsive layout, themes, and animations
`-- app.js        Stopwatch, timer, Pomodoro, laps, history, and UI logic
```

Extra documentation files such as `README.md`, `LICENSE`, and GitHub templates do not affect the live app.

## Run Locally

No installation is required. Open `index.html` directly in a browser.

For a local static preview, you can use any simple static server, but it is optional.

## GitHub Pages Deployment

This project is ready for GitHub Pages because it is fully static.

1. Push the repository to GitHub.
2. Open the repository settings.
3. Go to Pages.
4. Select the branch that contains `index.html`.
5. Save the Pages settings.
6. Open `https://siddhantnaik909.github.io/nova-stopwatch/`.

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `Space` | Start or pause |
| `L` | Record lap |
| `R` | Reset |
| `T` | Cycle theme |
| `F` | Enter focus mode |
| `M` | Toggle mini widget |
| `?` | Show shortcuts |
| `Esc` | Close overlays |

## Browser Support

- Chrome and Edge
- Firefox
- Safari
- iOS Safari
- Chrome for Android

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Author

Created by [Siddhant Naik](https://github.com/Siddhantnaik909).
