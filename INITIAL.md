You are a senior front-end engineer. Build a small, self-contained tutorial web app that runs on **GitHub Pages** (static hosting only, no backend, no build tools).

## Student profile
- Name: Claire
- School: Saratoga High School
- Friends: Lilly, Anya, Sophia

## High-level concept

The app is a **TXT (K-POP group)** themed quiz / tutorial for high-school AP Bio students. The user is a teenage girl who loves K-POP. The TXT members appear in **chat bubbles** (with their images) as if:

- they are asking the quiz questions, and  
- later reacting to the student’s answers (congratulating or encouraging them).

All logic must be in **vanilla HTML/CSS/JavaScript** (no React, no bundler, no Node server). It must be drop-in runnable via GitHub Pages: just push this repo and open `https://username.github.io/repo`.

---

## Files / structure

Create the following files:

- `index.html`
- `style.css`
- `script.js`

Assume the repo also has:

- `/images` – contains images of TXT members  
  - For example (you can assume or document these names):  
    - `/images/soobin.png`  
    - `/images/yeonjun.png`  
    - `/images/beomgyu.png`  
    - `/images/taehyun.png`  
    - `/images/hueningkai.png`
- `questions.md` – a markdown file storing the quiz questions & answers.

### Questions format (questions.md)

Design the app to parse `questions.md` in the following simple custom format (the code must implement this parser):

```md
# Cellular Respiration Quiz

Q: Which stage of cellular respiration produces the most ATP?
A) Glycolysis
B) Pyruvate oxidation
C) Citric acid cycle (Krebs)
D) Oxidative phosphorylation (ETC + chemiosmosis)
ANSWER: D
EXPLANATION: Most ATP is produced during oxidative phosphorylation via the proton gradient and ATP synthase.
---
Q: In an experiment, oxygen consumption increases while CO2 is chemically absorbed. Which process is being measured most directly?
A) Photosynthesis
B) Aerobic cellular respiration
C) Lactic acid fermentation
D) Alcoholic fermentation
ANSWER: B
EXPLANATION: Absorbing CO2 with KOH lets the respirometer track O2 consumption from aerobic respiration only.
---