# NOVA Stopwatch

<p align="center">
  <img alt="NOVA Stopwatch banner" src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:0f172a,45:0d9488,100:f97316&text=NOVA%20Stopwatch&fontColor=ffffff&fontSize=48&fontAlignY=38&desc=Static%20HTML%20CSS%20JavaScript%20Timer%20App&descAlignY=58&animation=fadeIn">
</p>

<p align="center">
  <img alt="Animated app description" src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=22&duration=2200&pause=700&color=14B8A6&center=true&vCenter=true&width=760&lines=Stopwatch+%2B+Timer+%2B+Pomodoro;Animated+progress+rings+and+smooth+controls;Works+on+GitHub+Pages+with+no+backend">
</p>

A modern static stopwatch web app built with only HTML, CSS, and JavaScript. It works directly on GitHub Pages without Node.js, npm, a backend server, or a build step.

<p align="center">
  <a href="https://siddhantnaik909.github.io/nova-stopwatch/">
    <img alt="Live Preview" src="https://img.shields.io/badge/Live%20Preview-Open%20App-2ea44f?style=for-the-badge">
  </a>
  <a href="https://github.com/Siddhantnaik909/nova-stopwatch">
    <img alt="GitHub Repository" src="https://img.shields.io/badge/GitHub-Repository-24292f?style=for-the-badge&logo=github">
  </a>
  <a href="https://github.com/Siddhantnaik909/nova-stopwatch/issues">
    <img alt="Report an Issue" src="https://img.shields.io/badge/Report-Issue-d73a49?style=for-the-badge">
  </a>
</p>

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
- CSV, JSON, and PNG export
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

These animations are generated with CSS and browser-native JavaScript only, so they work on GitHub Pages without any server-side code.

## Working Buttons

Main app controls are wired in `app.js`:

| Button | What it does |
| --- | --- |
| Start / Pause | Starts and pauses the active stopwatch, timer, or Pomodoro session |
| Lap | Records stopwatch laps |
| Reset | Resets the active mode |
| Timer presets | Sets quick countdown durations |
| Theme buttons | Switch visual themes |
| Focus mode | Opens the fullscreen focus overlay |
| Mini widget | Opens the compact floating timer |
| History | Opens saved sessions |
| CSV / JSON / PNG | Exports lap data and a visual PNG summary |

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
