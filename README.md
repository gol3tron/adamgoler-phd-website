# Adam S. Goler, PhD — Personal Website

The personal and professional site of **Adam S. Goler, PhD** — independent data science,
applied-AI, and quantitative-analysis consultant, and FAA Certified Flight Instructor.

🌐 **Live at [adamgoler.phd](https://adamgoler.phd)**

A fast, dependency-free static site (HTML, CSS, vanilla JavaScript) hosted on GitHub Pages.

## Pages

- **Home** (`index.html`) — Positioning and an overview of consulting services: data science &
  applied AI, quantitative analysis & modeling, and flight instruction.
- **Portfolio** (`portfolio.html`, unlinked) — Selected work, including a production LLM
  assistant, predictive-maintenance ML, the Performance Calculator, the
  [CFI Compendium](https://gol3tron.github.io/cfi-compendium/), and published physics research.
- **CV** (`cv.html`) — Full curriculum vitae: experience, categorized skills, publications, and
  education.
- **Performance Calculator** (`calculator.html`, `js/calculator.js`) — An interactive Cessna 172S
  takeoff, climb, and cruise performance calculator built from POH data, as an aid to flight
  instruction and planning.
- **Blog** (`blog.html` + `blog-*.html`) — Writing on aviation, physics, and technology, with
  MathJax-rendered derivations.
- **Contact** (`contact.html`) — Contact form (via Getform) and links for consulting and flight
  instruction inquiries.

## Tech

- HTML5, CSS3 (CSS Grid & Flexbox, design tokens via CSS custom properties in `styles.css`)
- Vanilla JavaScript (ES6+) — `script.js` for site-wide interactivity (mobile nav, form
  validation, smooth scrolling); `js/calculator.js` for the performance calculator
- [MathJax](https://www.mathjax.org/) for typeset equations in blog posts
- No frameworks, no build step

## Local development

No build tools required. Serve the folder with any static server:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve
```

Then open <http://localhost:8000>. (Opening `index.html` directly in a browser also works.)

## Deployment

The site is served by **GitHub Pages** from the `main` branch (root folder) and mapped to the
custom domain **adamgoler.phd** via the `CNAME` file and DNS records pointing at GitHub Pages.
Pushing to `main` publishes automatically.

## File structure

```
adamgoler-phd-website/
├── index.html              # Home
├── portfolio.html          # Portfolio
├── cv.html                 # Curriculum vitae
├── calculator.html         # Cessna 172S performance calculator
├── blog.html               # Blog index
├── blog-*.html             # Individual blog posts
├── contact.html            # Contact
├── styles.css              # Site-wide styles
├── script.js               # Site-wide JavaScript
├── js/
│   └── calculator.js       # Performance calculator logic
├── CNAME                   # Custom domain (adamgoler.phd)
└── README.md               # This file
```

## License

© Adam S. Goler. All rights reserved.

## Contact

Use the [contact form](https://adamgoler.phd/contact.html), or connect on
[LinkedIn](https://www.linkedin.com/in/asgoler/).
