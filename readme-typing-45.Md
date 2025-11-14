# Typing Speed Test v45 - Technical Reference

## Quick Start
- **Entry Point**: `index.php` (PHP 5.6 compatible)
- **Core Logic**: `index45.js` (App object)
- **Levels**: `index45-level{1-5}.json`
- **Styling**: `index45.css`
- **External Dep**: `joe-helper-v1.js` (localStorage wrapper, toast notifications)

---

## Application Flow

### Initialization
1. `DOMContentLoaded` → `App.init()`
2. `init()` calls:
   - `loadLevel()` - Fetches `index45-level{currentLevel}.json`
   - `setupEventListeners()` - Binds input/button handlers
   - `loadHistory()` - Displays top 5 results from localStorage

### Typing Session
1. User types → `input` event → `checkInput(value)`
2. First keystroke → `startTimer()` (if `startTime === null`)
3. `checkInput()`:
   - Compares each char: `inputChars[i] === currentText[i]`
   - Applies CSS classes: `.correct`, `.incorrect`, `.current`
   - Updates `errors`, `totalChars`, `charIndex`
   - Calls `updateStats()` (WPM, accuracy)
4. On completion → `complete()`:
   - Calculates final stats
   - `saveResult()` → localStorage (`typingResults` key)
   - Auto-advances level after 2s
   - Resets state

### Reset Flow
- `reset()` → Clears timer, resets counters, clears input, re-renders text

---

## Core Functions

### App Object Methods

**`init()`**
- Entry point. Loads level, sets up events, loads history.

**`loadLevel()`**
- Async fetch: `index45-level${currentLevel}.json`
- Sets `currentText` from JSON `text` field
- Calls `renderText()`
- Error: `JoeHelper.toast('Failed to load level', 'error')`

**`renderText()`**
- Splits `currentText` by spaces → words
- Each word → spans with `.char` class
- First char gets `.current` class
- Each char has `data-index` attribute
- Wraps words in `.word` spans

**`checkInput(inputValue)`**
- Core validation logic
- Compares `inputValue.split('')` vs `currentText` char-by-char
- Updates DOM classes: `.correct` (green), `.incorrect` (red), `.current` (blue pulse)
- Tracks `errors` (mismatches), `totalChars` (input length)
- Calls `updateStats()` on each keystroke
- If `inputValue === currentText` → `complete()`

**`startTimer()`**
- Sets `startTime = Date.now()`
- Interval (100ms) updates `#timer` element
- Format: `elapsed + 's'`

**`updateStats()`**
- WPM: `(charIndex / 5) / (timeElapsed / 60)`
- Accuracy: `((totalChars - errors) / totalChars) * 100`
- Updates `#wpm`, `#accuracy` DOM elements

**`complete()`**
- Stops timer (`clearInterval`)
- Final WPM/accuracy calculation
- `saveResult()` → localStorage
- Toast: `JoeHelper.toast('Complete! ${wpm} WPM, ${accuracy}% accuracy', 'success')`
- Auto-advance: `currentLevel++`, `loadLevel()`, `reset()` (after 2s)

**`saveResult(wpm, accuracy)`**
- Reads `JoeHelper.getItem('typingResults')` → JSON parse
- Pushes: `{wpm, accuracy, date: Date.now(), level: currentLevel}`
- Sorts by WPM (desc), keeps top 10
- Saves: `JoeHelper.setItem('typingResults', JSON.stringify(results), 24*365)`
- Calls `loadHistory()`

**`loadHistory()`**
- Reads localStorage `typingResults`
- Renders top 5 to `#historyList`
- Format: `#${rank} Level ${level} | ${wpm} WPM | ${accuracy}% accuracy`

**`clearStats()`**
- Confirms → `JoeHelper.removeItem('typingResults')`
- Refreshes history display

**`reset()`**
- Clears timer interval
- Resets: `startTime=null`, `charIndex=0`, `errors=0`, `totalChars=0`
- Clears `#inputArea` value
- Resets DOM: timer='0.0s', wpm='0', accuracy='100%'
- Re-renders text

---

## Data Structures

### Level JSON Format
```json
{
    "level": 1,
    "difficulty": "easy|medium|hard",
    "text": "Full text to type..."
}
```

### localStorage Key: `typingResults`
```json
[
    {
        "wpm": 65,
        "accuracy": 98,
        "date": 1234567890,
        "level": 1
    }
]
```

### App State Variables
- `currentText`: String from JSON
- `currentLevel`: Number (1-5)
- `startTime`: Timestamp or null
- `timerInterval`: Interval ID or null
- `charIndex`: Current position
- `errors`: Mismatch count
- `totalChars`: Total typed chars

---

## CLI Operations

### Adding/Editing Levels

**Create new level file:**
```bash
# Windows (PowerShell)
New-Item -Path "index45-level6.json" -ItemType File
# Or use editor
notepad index45-level6.json
```

**Edit existing level:**
```bash
# Windows
notepad index45-level1.json
# Or VS Code
code index45-level1.json
```

**JSON template:**
```json
{
    "level": 6,
    "difficulty": "hard",
    "text": "Your text here..."
}
```

**Update JS to support new level:**
- No changes needed if level auto-advances
- To set max level, add check in `complete()`:
```javascript
if (this.currentLevel > 5) {
    this.currentLevel = 1; // Loop back
}
```

### Debugging via Browser Console

**Access App object:**
```javascript
// In browser console
App.currentLevel = 1;  // Change level
App.reset();           // Reset session
App.loadLevel();       // Reload current level
```

**Inspect localStorage:**
```javascript
// View results
JSON.parse(localStorage.getItem('typingResults') || '[]')

// Clear results
localStorage.removeItem('typingResults')

// Set test data
localStorage.setItem('typingResults', JSON.stringify([
    {wpm: 100, accuracy: 99, date: Date.now(), level: 1}
]))
```

**Debug state:**
```javascript
// Check current state
console.log({
    level: App.currentLevel,
    text: App.currentText,
    errors: App.errors,
    charIndex: App.charIndex
})
```

**Force completion:**
```javascript
// Simulate completion
App.complete()
```

**Test error handling:**
```javascript
// Simulate fetch error
App.currentLevel = 999;
App.loadLevel(); // Should show error toast
```

### CLI Script Example (PowerShell)

**`edit-level.ps1`:**
```powershell
param(
    [int]$Level,
    [string]$Text,
    [string]$Difficulty = "medium"
)

$file = "index45-level$Level.json"
$json = @{
    level = $Level
    difficulty = $Difficulty
    text = $Text
} | ConvertTo-Json

Set-Content -Path $file -Value $json
Write-Host "Updated $file"
```

**Usage:**
```powershell
.\edit-level.ps1 -Level 1 -Text "New text here" -Difficulty "easy"
```

**`debug-level.ps1`:**
```powershell
param([int]$Level = 1)

$file = "index45-level$Level.json"
if (Test-Path $file) {
    $content = Get-Content $file | ConvertFrom-Json
    Write-Host "Level: $($content.level)"
    Write-Host "Difficulty: $($content.difficulty)"
    Write-Host "Text length: $($content.text.Length) chars"
    Write-Host "Word count: $($content.text.Split(' ').Length)"
    Write-Host "Text preview: $($content.text.Substring(0, [Math]::Min(50, $content.text.Length)))..."
} else {
    Write-Host "File not found: $file"
}
```

**Usage:**
```powershell
.\debug-level.ps1 -Level 1
```

---

## DOM Elements

| ID/Class | Purpose |
|----------|---------|
| `#wpm` | Words per minute display |
| `#accuracy` | Accuracy percentage |
| `#timer` | Elapsed time (seconds) |
| `#textDisplay` | Rendered text with char spans |
| `#inputArea` | User input textarea |
| `#resetBtn` | Reset button |
| `#clearStatsBtn` | Clear localStorage button |
| `#historyList` | Top 5 results container |
| `.char` | Individual character span |
| `.char.correct` | Correctly typed (green) |
| `.char.incorrect` | Incorrectly typed (red) |
| `.char.current` | Current position (blue pulse) |
| `.word` | Word wrapper span |

---

## CSS Classes & States

**Character States:**
- `.char` - Base character span
- `.char.correct` - `color: var(--success)` (green)
- `.char.incorrect` - `color: var(--error)` + red background (red)
- `.char.current` - `background: var(--accent)` + pulse animation (blue)

**CSS Variables:**
- `--bg-primary`: `#0d1117` (dark background)
- `--bg-secondary`: `#161b22` (card background)
- `--accent`: `#2f81f7` (blue)
- `--success`: `#3fb950` (green)
- `--error`: `#f85149` (red)

---

## JoeHelper API

**`JoeHelper.getItem(key)`**
- Returns localStorage value or null

**`JoeHelper.setItem(key, value, hours)`**
- Sets localStorage with optional expiration (hours)

**`JoeHelper.removeItem(key)`**
- Removes localStorage key

**`JoeHelper.toast(message, type)`**
- Shows toast notification
- Types: `'success'`, `'error'`

---

## Common Issues & Fixes

**Level not loading:**
- Check JSON syntax (valid JSON)
- Verify file exists: `index45-level{N}.json`
- Check browser console for fetch errors

**Stats not updating:**
- Verify `startTime` is set (timer started)
- Check `updateStats()` is called in `checkInput()`

**History not showing:**
- Check localStorage: `localStorage.getItem('typingResults')`
- Verify JSON format in localStorage

**Text not rendering:**
- Check `currentText` is set after `loadLevel()`
- Verify `renderText()` is called
- Inspect `#textDisplay` DOM

**Auto-advance not working:**
- Check `complete()` is called when text matches
- Verify `currentLevel++` and `loadLevel()` sequence

---

## File Structure

```
typing/
├── index.php              # HTML entry point
├── index45.js            # Core App logic
├── index45.css           # Styles
├── index45-level1.json   # Level 1 text
├── index45-level2.json   # Level 2 text
├── index45-level3.json   # Level 3 text
├── index45-level4.json   # Level 4 text
└── index45-level5.json   # Level 5 text
```

---

## Quick Reference

**Reset app state:**
```javascript
App.reset()
```

**Change level:**
```javascript
App.currentLevel = 2; App.loadLevel()
```

**Clear all data:**
```javascript
localStorage.removeItem('typingResults')
```

**View current text:**
```javascript
App.currentText
```

**Force reload:**
```javascript
App.loadLevel()
```

