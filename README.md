# Typing Speed Test

A free, open-source typing speed test application to measure your WPM (words per minute) and typing accuracy. Practice typing with 5 difficulty levels and track your progress over time.

![Typing Speed Test](https://img.shields.io/badge/version-45-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- ⚡ **Real-time WPM calculation** - See your typing speed as you type
- 🎯 **Accuracy tracking** - Monitor your typing accuracy percentage
- 📊 **5 difficulty levels** - From beginner to master level challenges
- 📈 **Progress history** - Track your top 5 results automatically
- 🎨 **Modern UI** - Clean, dark-themed interface
- 💾 **Local storage** - No registration required, data saved locally
- 📱 **Responsive design** - Works on desktop and mobile devices
- 🔄 **Auto-advance** - Automatically moves to next level after completion

## Quick Start

1. Clone or download this repository
2. Place files in your web server directory (PHP 5.6+ compatible)
3. Open `index.php` in your browser
4. Start typing!

## Requirements

- PHP 5.6 or higher (for cache busting)
- Modern web browser with JavaScript enabled
- Web server (Apache, Nginx, or PHP built-in server)

## Installation

### Using PHP Built-in Server

```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Using Apache/Nginx

Simply place the files in your web root directory and access via your domain.

## Usage

1. **Start typing** - The timer begins automatically on your first keystroke
2. **Track your progress** - Watch your WPM and accuracy update in real-time
3. **Complete the test** - Finish typing the entire text to see your final score
4. **View history** - Check your top 5 results in the history section
5. **Select levels** - Choose from 5 difficulty levels to practice
6. **Share results** - Share your typing results with friends

## Project Structure

```
typing/
├── index.php              # Main HTML entry point
├── index45.js            # Core application logic
├── index45.css           # Styles and themes
├── index45-level1.json   # Level 1 text content
├── index45-level2.json   # Level 2 text content
├── index45-level3.json   # Level 3 text content
├── index45-level4.json   # Level 4 text content
├── index45-level5.json   # Level 5 text content
├── LICENSE               # MIT License
└── README.md             # This file
```

## Customization

### Adding New Levels

Create a new JSON file following this format:

```json
{
    "level": 6,
    "difficulty": "hard",
    "text": "Your custom text here..."
}
```

### Modifying Styles

Edit `index45.css` to customize colors, fonts, and layout.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Contributions are welcome! Feel free to:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## About This Project

This project was built to demonstrate what's possible with AI-assisted coding. The entire application was developed using **[Cursor](https://cursor.sh)** in **Auto mode** with the basic **$20/month Pro subscription**. 

The goal is to show others that you don't need expensive AI tools or extensive coding experience to build functional, polished web applications. With the right AI coding assistant and clear communication, anyone can bring their ideas to life.

**Tech Stack:**
- Cursor AI (Auto mode) - Primary development tool
- Vanilla JavaScript - No frameworks required
- PHP 5.6+ - Simple server-side cache busting
- Modern CSS - Custom styling with CSS variables

If you're interested in AI-assisted development, this project serves as a real-world example of what you can accomplish with accessible AI coding tools.

## Author

**joefaron**

- GitHub: [@joefaron](https://github.com/joefaron)

## Acknowledgments

- Built with vanilla JavaScript (no frameworks required)
- Uses [Lucide Icons](https://lucide.dev/) for beautiful icons
- Inspired by the need for a simple, free typing test tool
- Developed with [Cursor AI](https://cursor.sh) to showcase AI-assisted coding capabilities

---

Made with ❤️ for the typing community

