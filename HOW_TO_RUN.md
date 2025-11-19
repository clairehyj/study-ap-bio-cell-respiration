# How to Run the AP Bio Quiz App

## Option 1: Use Python Server (Recommended)
This allows CSV files to load properly with all questions.

1. Open Terminal/Command Prompt
2. Navigate to this folder:
   ```bash
   cd /path/to/study-ap-bio-cell-respiration
   ```
3. Run the Python server:
   ```bash
   python3 start-server.py
   ```
4. Open your browser and go to:
   ```
   http://localhost:8000
   ```

## Option 2: Open Directly in Browser
The app will work with fallback questions (5 questions instead of 20).

1. Simply double-click `index.html`
2. The quiz will load with sample questions

## Option 3: GitHub Pages
Upload to GitHub and enable Pages for full functionality.

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Enable GitHub Pages
4. Access at: `https://[username].github.io/[repo-name]/`

## Troubleshooting

### "Loading questions..." stays forever
- You're likely opening the file directly (file://)
- Use Option 1 (Python server) instead

### Console shows CORS errors
- This is normal when opening files directly
- The app will use fallback questions automatically

### Want to edit questions?
- Edit `questions.csv` in Excel or any text editor
- Edit `messages.csv` to customize TXT member messages

## Features Working in Each Mode

| Feature | Direct Open | Python Server | GitHub Pages |
|---------|------------|---------------|--------------|
| Basic Quiz | ✅ (5 questions) | ✅ (all questions) | ✅ (all questions) |
| TXT Messages | ✅ | ✅ | ✅ |
| Scoring | ✅ | ✅ | ✅ |
| CSV Loading | ❌ | ✅ | ✅ |
| Add Questions | ❌ | ✅ | ✅ |