# Adam S. Goler, PhD — Personal Website

The personal site of **Adam S. Goler, PhD**: physicist, pilot, flight instructor, and ML engineer.
Projects, writing, and free flight-planning tools.

🌐 **Live at [adamgoler.phd](https://adamgoler.phd)**

A fast, dependency-free static site (HTML, CSS, vanilla JavaScript) hosted on GitHub Pages.

## Pages

- **Home** (`index.html`): who I am, what I'm working on now, recent writing, and a short about.
- **Projects** (`portfolio.html`): things I've built, for work and for fun.
- **Tools** (`calculator.html`, `js/tools.js`): general flight-planning calculators. Climb gradient
  planner, gradient quick check, time/speed/distance, fuel, wind components, density altitude.
- **Cessna 172S** (`c172s.html`, `js/calculator.js`, `js/c172s.js`): short-field takeoff and cruise
  from POH data, with an abort checkpoint and a printable pre-takeoff briefing.
- **Cessna 310Q** (`c310q.html`, `js/c310q.js`): takeoff planner with accelerate-stop margin,
  single-engine climb gradient, and a printable takeoff briefing. POH chart values are entered by
  the pilot.
- **Writing** (`blog.html` + `blog-*.html`): aviation, physics, and code, with MathJax.
- **CV** (`cv.html`): full curriculum vitae.
- **Contact** (`contact.html`): contact form (via Getform).

Every calculator has a short explainer covering what it answers, the math, and its limits.

## Photos

Photo spots are "slots" that show a labeled placeholder until a real photo exists.
See [`images/README.md`](images/README.md) for the list of file names.

## Tech

- HTML5, CSS3 (CSS Grid & Flexbox, design tokens via CSS custom properties in `styles.css`)
- Vanilla JavaScript (ES6+) — `script.js` for site-wide interactivity (mobile nav, form
  validation, smooth scrolling); `js/calculator.js`, `js/tools.js`, `js/c172s.js`, `js/c310q.js` for the calculators
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
├── portfolio.html          # Projects
├── calculator.html         # Tools hub (general calculators)
├── c172s.html              # Cessna 172S takeoff + cruise, briefing
├── c310q.html              # Cessna 310Q takeoff planner, briefing
├── blog.html               # Writing index
├── blog-*.html             # Individual posts
├── cv.html                 # Curriculum vitae
├── contact.html            # Contact
├── styles.css              # Site-wide styles
├── script.js               # Site-wide JavaScript
├── js/
│   ├── calculator.js       # 172S tables + climb gradient math
│   ├── tools.js            # General calculators
│   ├── c172s.js            # 172S margins + briefing
│   └── c310q.js            # 310Q margins + briefing
├── images/                 # Photos (see images/README.md)
├── CNAME                   # Custom domain (adamgoler.phd)
└── README.md               # This file
```

## License

© Adam S. Goler. All rights reserved.

## Contact

Use the [contact form](https://adamgoler.phd/contact.html), or connect on
[LinkedIn](https://www.linkedin.com/in/asgoler/).
