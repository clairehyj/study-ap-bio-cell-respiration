# AP Bio Study with TXT! 💙

A fun, interactive quiz application for studying AP Biology Cellular Respiration with TXT (Tomorrow X Together) K-POP group members as your study buddies!

## 🌟 Features

- **TXT K-POP Theme**: Study with your favorite idols - Soobin, Yeonjun, Beomgyu, Taehyun, and Hueningkai
- **Chat Bubble Interface**: Questions and responses appear as chat messages from TXT members
- **Interactive Quiz**: 15 challenging AP Biology questions about cellular respiration
- **Personalized Experience**: Designed for Claire from Saratoga High School
- **Encouraging Feedback**: Get motivational messages from TXT members based on your answers
- **Progress Tracking**: Visual progress bar and score display
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Results Summary**: See your final score with reactions from all TXT members

## 📚 Student Profile

- **Name**: Claire
- **School**: Saratoga High School
- **Study Buddies**: Lilly, Anya, Sophia

## 🚀 Quick Start

### Local Testing
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Click "Start Quiz" to begin studying!

### GitHub Pages Deployment
1. Push this repository to GitHub
2. Go to Settings → Pages in your repository
3. Select "Deploy from a branch" as source
4. Choose "main" branch and "/ (root)" folder
5. Save and wait for deployment
6. Access your quiz at: `https://[your-username].github.io/[repo-name]/`

## 📁 File Structure

```
study-ap-bio-cell-respiration/
├── index.html          # Main HTML file
├── style.css           # K-POP themed styles
├── script.js           # Quiz logic and interactions
├── questions.csv       # Quiz questions database (editable!)
├── messages.csv        # TXT member messages (customizable!)
├── questions.md        # Original questions in markdown format
├── images/             # TXT member photos
└── README.md          # This file
```

## 🎮 How to Use

1. **Start the Quiz**: Click the "Start Quiz" button with sparkle animation
2. **Read Questions**: TXT members will ask you cellular respiration questions
3. **Select Answer**: Click on one of the four options (A, B, C, or D)
4. **Submit Answer**: Click "Submit Answer" to see if you're correct
5. **Get Feedback**: Receive encouraging messages from TXT members
6. **Continue**: Click "Next Question" to proceed
7. **View Results**: See your final score and celebration from all TXT members

## 🎨 Design Features

- **Teenage-Friendly Aesthetic**: Modern, colorful design with gradients
- **Rounded Corners**: Soft, friendly appearance on all elements
- **TXT Colors**: Each member has their signature color
- **Smooth Animations**: Fade-in effects and transitions
- **Mobile Responsive**: Optimized for all screen sizes

## 🧬 Quiz Topics

The quiz covers key AP Biology cellular respiration concepts:
- Glycolysis
- Pyruvate oxidation
- Citric acid cycle (Krebs cycle)
- Oxidative phosphorylation
- ATP production
- Fermentation
- Cellular respiration regulation

## 📝 Adding/Editing Content

### Adding New Questions (questions.csv)
Easy to edit in any spreadsheet app (Excel, Google Sheets) or text editor!

**CSV Format:**
```csv
Question,Option A,Option B,Option C,Option D,Correct Answer,Explanation
"Your question here","First option","Second option","Third option","Fourth option","A/B/C/D","Explanation text"
```

**Tips for editing questions.csv:**
- Open in Excel or Google Sheets for easiest editing
- Each row is one question
- Use quotes around text that contains commas
- Correct Answer must be A, B, C, or D
- Keep explanations educational and encouraging

### Customizing TXT Messages (messages.csv)
Personalize what TXT members say!

**CSV Format:**
```csv
Member,Type,Message
Soobin,correct,"Your encouraging message here!"
```

**Message Types:**
- `correct` - When answer is right
- `incorrect` - When answer is wrong
- `welcome` - Start of quiz greetings
- `complete_high` - Score ≥90%
- `complete_medium` - Score 70-89%
- `complete_low` - Score <70%

**Members:** Soobin, Yeonjun, Beomgyu, Taehyun, Hueningkai

## 💡 Technical Details

- **Pure Vanilla Stack**: HTML, CSS, and JavaScript (no frameworks)
- **Static Hosting**: Works perfectly on GitHub Pages
- **No Backend Required**: All logic runs client-side
- **CSV Parser**: Custom CSV parser for easy content management
- **Flexible Content**: Questions and messages easily customizable via CSV files

## 🤝 Credits

Created for Claire and her study buddies at Saratoga High School. Fighting! 💪📚

---

*Made with 💙 for AP Bio students who love K-POP*