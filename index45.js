const App = {
    currentText: '',
    currentLevel: 1,
    startTime: null,
    timerInterval: null,
    charIndex: 0,
    errors: 0,
    totalChars: 0,
    lastResult: null,
    maxLevel: 5,
    unlockThreshold: 80, // 80% accuracy required to unlock next level
    levelData: null, // Will store level metadata

    init() {
        console.log('App.init() called');
        this.loadLevelData();
        this.loadLevel();
        this.setupEventListeners();
        this.loadHistory();
    },

    loadLevelData() {
        // Define level metadata
        this.levelData = {
            1: { name: 'Beginner', difficulty: 'easy', icon: 'star' },
            2: { name: 'Intermediate', difficulty: 'medium', icon: 'target' },
            3: { name: 'Advanced', difficulty: 'medium', icon: 'zap' },
            4: { name: 'Expert', difficulty: 'hard', icon: 'flame' },
            5: { name: 'Master', difficulty: 'hard', icon: 'crown' }
        };
    },

    async loadLevel(levelNum) {
        console.log('loadLevel() called with levelNum:', levelNum);
        if (levelNum !== undefined) {
            this.currentLevel = levelNum;
        }
        
        if (!this.isLevelUnlocked(this.currentLevel)) {
            console.warn('Level', this.currentLevel, 'is locked');
            if (typeof JoeHelper !== 'undefined' && JoeHelper.toast) {
                JoeHelper.toast('Level is locked. Complete previous level with 80%+ accuracy to unlock.', 'error');
            }
            return;
        }
        
        try {
            const timestamp = Date.now();
            const url = `index45-level${this.currentLevel}.json?t=${timestamp}`;
            console.log('Fetching level from:', url);
            const response = await fetch(url);
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch: ' + response.status);
            }
            const data = await response.json();
            console.log('Level data loaded:', data);
            this.currentText = data.text;
            this.renderText();
        } catch (e) {
            console.error('Error loading level:', e);
            if (typeof JoeHelper !== 'undefined' && JoeHelper.toast) {
                JoeHelper.toast('Failed to load level', 'error');
            } else {
                console.error('JoeHelper not available for toast notification');
            }
        }
    },

    renderText() {
        const display = document.getElementById('textDisplay');
        let charIndex = 0;
        const chars = this.currentText.split('');
        let html = '';
        let currentWord = '';
        let wordStartIndex = 0;
        
        chars.forEach((char, i) => {
            if (char === ' ') {
                // Close current word if exists
                if (currentWord.length > 0) {
                    html += '<span class="word">';
                    for (let j = 0; j < currentWord.length; j++) {
                        const index = wordStartIndex + j;
                        html += `<span class="char ${index === 0 ? 'current' : ''}" data-index="${index}">${currentWord[j]}</span>`;
                    }
                    html += '</span>';
                    currentWord = '';
                }
                // Add space as a char element
                html += `<span class="char space ${charIndex === 0 ? 'current' : ''}" data-index="${charIndex}">&nbsp;</span>`;
                charIndex++;
            } else {
                if (currentWord.length === 0) {
                    wordStartIndex = charIndex;
                }
                currentWord += char;
                charIndex++;
            }
        });
        
        // Close last word if exists
        if (currentWord.length > 0) {
            html += '<span class="word">';
            for (let j = 0; j < currentWord.length; j++) {
                const index = wordStartIndex + j;
                html += `<span class="char ${index === 0 ? 'current' : ''}" data-index="${index}">${currentWord[j]}</span>`;
            }
            html += '</span>';
        }
        
        display.innerHTML = html;
    },

    setupEventListeners() {
        const input = document.getElementById('inputArea');
        
        input.addEventListener('input', (e) => {
            if (!this.startTime) {
                this.startTimer();
            }
            this.checkInput(e.target.value);
        });

        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('shareBtn').addEventListener('click', () => this.showShareModal('result'));
        document.getElementById('shareHistoryBtn').addEventListener('click', () => this.showShareModal('history'));
        document.getElementById('clearStatsBtn').addEventListener('click', () => this.clearStats());
        document.getElementById('selectLevelBtn').addEventListener('click', () => this.showLevelModal());
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideLevelModal());
        document.getElementById('closeShareModalBtn').addEventListener('click', () => this.hideShareModal());
        
        // Close modal on background click
        document.getElementById('levelModal').addEventListener('click', (e) => {
            if (e.target.id === 'levelModal') {
                this.hideLevelModal();
            }
        });
        
        document.getElementById('shareModal').addEventListener('click', (e) => {
            if (e.target.id === 'shareModal') {
                this.hideShareModal();
            }
        });
        
        // Platform share buttons
        document.querySelectorAll('.share-btn[data-platform]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const platform = this.getAttribute('data-platform');
                App.shareToPlatform(platform);
            });
        });
    },

    checkInput(inputValue) {
        const chars = document.querySelectorAll('.char');
        const inputChars = inputValue.split('');
        
        this.charIndex = inputChars.length;
        this.totalChars = inputChars.length;
        this.errors = 0;

        chars.forEach((char, i) => {
            char.classList.remove('correct', 'incorrect', 'current');
            
            if (i < inputChars.length) {
                if (inputChars[i] === this.currentText[i]) {
                    char.classList.add('correct');
                } else {
                    char.classList.add('incorrect');
                    char.setAttribute('data-typed', inputChars[i]);
                    this.errors++;
                }
            } else if (i === inputChars.length) {
                char.classList.add('current');
            }
        });

        this.updateStats();

        if (inputValue.length === this.currentText.length) {
            this.complete();
        }
    },

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
            document.getElementById('timer').textContent = elapsed + 's';
        }, 100);
    },

    updateStats() {
        if (!this.startTime) return;

        const timeElapsed = (Date.now() - this.startTime) / 1000 / 60;
        // Prevent division by very small numbers that cause inflated WPM
        if (timeElapsed < 0.001) {
            document.getElementById('wpm').textContent = '0';
            return;
        }
        const words = this.charIndex / 5;
        const wpm = Math.round(words / timeElapsed) || 0;
        const accuracy = this.totalChars > 0 
            ? Math.round(((this.totalChars - this.errors) / this.totalChars) * 100) 
            : 100;

        document.getElementById('wpm').textContent = wpm;
        document.getElementById('accuracy').textContent = accuracy + '%';
    },

    complete() {
        clearInterval(this.timerInterval);
        
        let timeElapsed = (Date.now() - this.startTime) / 1000 / 60;
        // Prevent division by very small numbers that cause inflated WPM
        if (timeElapsed < 0.001) {
            timeElapsed = 0.001; // Use minimum time to prevent inflated results
        }
        const words = this.currentText.length / 5;
        const wpm = Math.round(words / timeElapsed);
        const accuracy = Math.round(((this.totalChars - this.errors) / this.totalChars) * 100);

        // Store last result for sharing
        this.lastResult = { wpm: wpm, accuracy: accuracy, level: this.currentLevel };
        
        this.saveResult(wpm, accuracy);
        
        // Unlock next level if accuracy threshold met
        if (accuracy >= this.unlockThreshold && this.currentLevel < this.maxLevel) {
            this.unlockLevel(this.currentLevel + 1);
        }
        
        JoeHelper.toast(`Complete! ${wpm} WPM, ${accuracy}% accuracy`, 'success');
        
        // Trigger confetti celebration
        if (typeof JSConfetti !== 'undefined') {
            const jsConfetti = new JSConfetti();
            jsConfetti.addConfetti();
        }
        
        setTimeout(() => {
            // Only auto-advance if next level is unlocked
            if (this.currentLevel < this.maxLevel && this.isLevelUnlocked(this.currentLevel + 1)) {
                this.currentLevel++;
                this.loadLevel();
                this.reset();
            } else {
                // Stay on current level if next is locked
                this.reset();
            }
        }, 2000);
    },

    saveResult(wpm, accuracy) {
        const results = JSON.parse(JoeHelper.getItem('typingResults') || '[]');
        results.push({
            wpm,
            accuracy,
            date: Date.now(),
            level: this.currentLevel
        });
        results.sort((a, b) => b.wpm - a.wpm);
        JoeHelper.setItem('typingResults', JSON.stringify(results.slice(0, 10)), 24 * 365);
        this.loadHistory();
    },

    loadHistory() {
        const results = JSON.parse(JoeHelper.getItem('typingResults') || '[]');
        const historyList = document.getElementById('historyList');
        const shareHistoryBtn = document.getElementById('shareHistoryBtn');
        
        if (results.length === 0) {
            historyList.innerHTML = '<div class="history-empty">Complete a typing test to see your results here.</div>';
            if (shareHistoryBtn) {
                shareHistoryBtn.style.display = 'none';
            }
            return;
        }

        if (shareHistoryBtn) {
            shareHistoryBtn.style.display = 'inline-flex';
        }

        historyList.innerHTML = results.slice(0, 5).map((result, i) => `
            <div class="history-item">
                <span>#${i + 1} Level ${result.level}</span>
                <span>
                    <span class="wpm-badge">${result.wpm} WPM</span>
                    <span style="color: var(--text-secondary); margin-left: 15px;">${result.accuracy}% accuracy</span>
                </span>
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },


    shareToPlatform(platform) {
        const shareText = this.currentShareText || '';
        const shareTitle = this.currentShareTitle || 'Typing Speed Test Results';
        const shareUrl = 'https://typing.kyd.net/r?ref-detail-here';
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(shareUrl);
        
        let shareWindow = null;
        
        switch(platform) {
            case 'twitter':
                shareWindow = window.open(
                    `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
                    'twitter-share',
                    'width=550,height=420'
                );
                break;
                
            case 'facebook':
                shareWindow = window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
                    'facebook-share',
                    'width=550,height=420'
                );
                break;
                
            case 'linkedin':
                shareWindow = window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
                    'linkedin-share',
                    'width=550,height=420'
                );
                break;
                
            case 'instagram':
                // Instagram doesn't support direct web sharing, so copy to clipboard
                this.copyToClipboard(shareText + ' ' + shareUrl);
                JoeHelper.toast('Text copied! Paste it in your Instagram post.', 'success');
                return;
                
            case 'copy':
                this.copyToClipboard(shareText + ' ' + shareUrl);
                JoeHelper.toast('Results copied to clipboard!', 'success');
                this.hideShareModal();
                return;
                
            default:
                JoeHelper.toast('Unknown platform', 'error');
                return;
        }
        
        if (shareWindow) {
            // Close modal after opening share window
            setTimeout(() => {
                this.hideShareModal();
            }, 300);
        }
    },

    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            JoeHelper.toast('Failed to copy', 'error');
        }
        document.body.removeChild(textarea);
    },

    clearStats() {
        if (confirm('Clear all saved results?')) {
            JoeHelper.removeItem('typingResults');
            this.loadHistory();
            JoeHelper.toast('Stats cleared', 'success');
        }
    },

    reset() {
        clearInterval(this.timerInterval);
        this.startTime = null;
        this.charIndex = 0;
        this.errors = 0;
        this.totalChars = 0;
        
        document.getElementById('inputArea').value = '';
        document.getElementById('timer').textContent = '0.0s';
        document.getElementById('wpm').textContent = '0';
        document.getElementById('accuracy').textContent = '100%';
        
        this.renderText();
    },

    // Level selection and unlock functions
    isLevelUnlocked(level) {
        console.log('isLevelUnlocked called for level:', level);
        if (level === 1) {
            console.log('Level 1 is always unlocked');
            return true; // First level always unlocked
        }
        
        if (typeof JoeHelper === 'undefined' || !JoeHelper.getItem) {
            console.error('JoeHelper not available in isLevelUnlocked');
            return false;
        }
        
        const unlocked = JSON.parse(JoeHelper.getItem('unlockedLevels') || '[]');
        console.log('Unlocked levels:', unlocked);
        const isUnlocked = unlocked.indexOf(level) !== -1;
        console.log('Level', level, 'unlocked:', isUnlocked);
        return isUnlocked;
    },

    unlockLevel(level) {
        if (level === 1) return; // Level 1 is always unlocked
        
        const unlocked = JSON.parse(JoeHelper.getItem('unlockedLevels') || '[]');
        if (unlocked.indexOf(level) === -1) {
            unlocked.push(level);
            unlocked.sort(function(a, b) { return a - b; });
            JoeHelper.setItem('unlockedLevels', JSON.stringify(unlocked), 24 * 365);
            JoeHelper.toast(`Level ${level} unlocked!`, 'success');
        }
    },

    showLevelModal() {
        const modal = document.getElementById('levelModal');
        modal.classList.add('active');
        this.renderLevelList();
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    hideLevelModal() {
        const modal = document.getElementById('levelModal');
        modal.classList.remove('active');
    },

    async renderLevelList() {
        const levelList = document.getElementById('levelList');
        let html = '';
        
        for (let i = 1; i <= this.maxLevel; i++) {
            const isUnlocked = this.isLevelUnlocked(i);
            const isActive = i === this.currentLevel;
            const levelInfo = this.levelData[i] || { name: `Level ${i}`, difficulty: 'medium', icon: 'circle' };
            
            // Get best result for this level
            const results = JSON.parse(JoeHelper.getItem('typingResults') || '[]');
            const levelResults = results.filter(function(r) { return r.level === i; });
            let bestResult = null;
            if (levelResults.length > 0) {
                // Sort by WPM descending and get the best
                levelResults.sort(function(a, b) { return b.wpm - a.wpm; });
                bestResult = levelResults[0];
            }
            
            let requirementText = '';
            if (i === 1) {
                requirementText = 'Start here!';
            } else if (isUnlocked) {
                requirementText = 'Unlocked';
            } else {
                requirementText = `Requires ${this.unlockThreshold}% accuracy on Level ${i - 1}`;
            }
            
            html += `
                <div class="level-card ${isUnlocked ? '' : 'locked'} ${isActive ? 'active' : ''}" 
                     data-level="${i}" ${isUnlocked ? 'onclick="App.selectLevel(' + i + ')"' : ''}>
                    <div class="level-card-header">
                        <div class="level-card-title">
                            <i data-lucide="${levelInfo.icon}"></i>
                            <span>Level ${i}: ${levelInfo.name}</span>
                        </div>
                        <span class="level-card-badge ${isUnlocked ? 'unlocked' : 'locked'}">
                            <i data-lucide="${isUnlocked ? 'unlock' : 'lock'}"></i>
                            ${isUnlocked ? 'Unlocked' : 'Locked'}
                        </span>
                    </div>
                    <div class="level-card-info">
                        <span>
                            <i data-lucide="gauge"></i>
                            ${levelInfo.difficulty}
                        </span>
                        ${bestResult ? `
                            <span>
                                <i data-lucide="trophy"></i>
                                Best: ${bestResult.wpm} WPM, ${bestResult.accuracy}%
                            </span>
                        ` : ''}
                    </div>
                    <div class="level-card-requirement">
                        ${requirementText}
                    </div>
                </div>
            `;
        }
        
        levelList.innerHTML = html;
    },

    selectLevel(level) {
        if (!this.isLevelUnlocked(level)) {
            JoeHelper.toast('This level is locked', 'error');
            return;
        }
        
        this.hideLevelModal();
        this.loadLevel(level);
        this.reset();
    },

    showShareModal(type) {
        const modal = document.getElementById('shareModal');
        const shareText = document.getElementById('shareText');
        const qrContainer = document.getElementById('qrCodeContainer');
        const results = JSON.parse(JoeHelper.getItem('typingResults') || '[]');
        
        let shareContent = '';
        let shareTitle = '';
        let shareUrl = 'https://typing.kyd.net/r?ref-detail-here';
        
        if (type === 'history') {
            if (results.length === 0) {
                JoeHelper.toast('No results to share yet', 'error');
                return;
            }
            const topResults = results.slice(0, 5);
            shareContent = 'My Top Typing Speed Results:\n\n';
            topResults.forEach(function(result, i) {
                shareContent += `#${i + 1} Level ${result.level}: ${result.wpm} WPM, ${result.accuracy}% accuracy\n`;
            });
            shareContent += '\nTry the typing test at https://typing.kyd.net/r?ref-detail-here';
            shareTitle = 'My Typing Speed Test Results';
        } else if (type === 'result' && this.lastResult) {
            shareContent = `I just completed a typing test: ${this.lastResult.wpm} WPM with ${this.lastResult.accuracy}% accuracy on Level ${this.lastResult.level}! Try it at https://typing.kyd.net/r?ref-detail-here`;
            shareTitle = 'Typing Speed Test Results';
        } else if (results.length > 0) {
            const best = results[0];
            shareContent = `My best typing speed: ${best.wpm} WPM with ${best.accuracy}% accuracy on Level ${best.level}! Try it at https://typing.kyd.net/r?ref-detail-here`;
            shareTitle = 'My Best Typing Speed';
        } else {
            JoeHelper.toast('No results to share yet', 'error');
            return;
        }
        
        // Store share data for shareToPlatform function
        this.currentShareText = shareContent;
        this.currentShareTitle = shareTitle;
        
        shareText.textContent = shareContent;
        
        // Generate QR code - wait for library to load if needed
        var self = this;
        var attempts = 0;
        var maxAttempts = 10;
        
        function generateQRCode() {
            attempts++;
            // Check for QRCode library (official npm qrcode package uses toCanvas API)
            if (typeof QRCode !== 'undefined' && typeof QRCode.toCanvas === 'function') {
                qrContainer.innerHTML = '';
                var canvas = document.createElement('canvas');
                qrContainer.appendChild(canvas);
                
                try {
                    // Official qrcode npm package uses: QRCode.toCanvas(canvas, text, options, callback)
                    QRCode.toCanvas(canvas, shareUrl, {
                        width: 200,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#ffffff'
                        }
                    }, function(error) {
                        if (error) {
                            console.error('QR code generation error:', error);
                            qrContainer.innerHTML = '<p style="color: var(--text-secondary);">QR code unavailable</p>';
                        }
                    });
                } catch (error) {
                    console.error('QR code generation error:', error);
                    qrContainer.innerHTML = '<p style="color: var(--text-secondary);">QR code unavailable</p>';
                }
            } else if (attempts < maxAttempts) {
                // Wait a bit and try again if library is still loading
                setTimeout(function() {
                    generateQRCode();
                }, 300);
            } else {
                // Library failed to load after multiple attempts
                qrContainer.innerHTML = '<p style="color: var(--text-secondary);">QR code library not loaded. Please refresh the page.</p>';
            }
        }
        generateQRCode();
        
        modal.classList.add('active');
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    hideShareModal() {
        const modal = document.getElementById('shareModal');
        modal.classList.remove('active');
    },

};

function initializeApp() {
    console.log('Initializing App...');
    console.log('JoeHelper available:', typeof JoeHelper !== 'undefined');
    console.log('Document ready state:', document.readyState);
    
    // Wait for JoeHelper if not available yet
    if (typeof JoeHelper === 'undefined') {
        console.log('Waiting for JoeHelper to load...');
        setTimeout(initializeApp, 50);
        return;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired, initializing App');
            App.init();
        });
    } else {
        console.log('DOM already loaded, initializing App immediately');
        App.init();
    }
}

initializeApp();

