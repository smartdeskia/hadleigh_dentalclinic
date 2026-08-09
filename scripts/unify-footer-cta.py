#!/usr/bin/env python3
"""Standardize pre-footer CTA band and sitewide footer across all HTML pages."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PRE_FOOTER_CTA = """
  <section class="pre-footer-cta">
    <div class="wrap">
      <a href="contact.html" class="btn btn-primary">Go to Full Contact Page</a>
    </div>
  </section>
"""

FOOTER = """
  <footer class="site-footer">
    <div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="footer-logo">Hadleigh Dental &amp; Cosmetic Centre</div>
          <p class="footer-tagline">Full-service general, cosmetic and specialist dentistry in Hadleigh, Essex — clinical excellence with a genuinely comfortable patient experience.</p>
        </div>
        <div class="footer-col">
          <h5>Treatments</h5>
          <ul>
            <li><a href="general-dentistry.html">General Dentistry</a></li>
            <li><a href="cosmetic-dentistry.html">Cosmetic Dentistry</a></li>
            <li><a href="cosmetic-treatments.html">Cosmetic Treatments</a></li>
            <li><a href="new-patients.html">New Patients</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Practice</h5>
          <ul>
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About &amp; Team</a></li>
            <li><a href="about.html#pricing">Price List</a></li>
            <li><a href="about.html#finance">0% Finance</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Get in Touch</h5>
          <div class="footer-hours">
            <div><span>Mon&ndash;Fri</span><span>9:00&ndash;18:00</span></div>
            <div><span>Saturday</span><span>Occasional</span></div>
            <div><span>Sunday</span><span>Closed</span></div>
          </div>
          <ul class="footer-contact-details">
            <li><a href="tel:01702553106">01702 553 106</a></li>
            <li><a href="mailto:info@hdp.me.uk">info@hdp.me.uk</a></li>
            <li><a href="https://maps.google.com/?q=279+London+Road,+Hadleigh,+Essex,+SS7+2BN" target="_blank" rel="noopener">279 London Road, Hadleigh, Essex, SS7 2BN</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Hadleigh Dental &amp; Cosmetic Centre. All rights reserved.</span>
        <span><a href="#">Privacy Policy</a> &middot; <a href="#">Complaints Procedure</a></span>
      </div>
    </div>
  </footer>
"""

ABOUT_BUTTON = """
      <div class="text-center" style="margin-top:36px;">
        <a href="contact.html" class="btn btn-primary">Go to Full Contact Page</a>
      </div>"""

PRE_FOOTER_PATTERNS = [
    re.compile(
        r"\n  <section class=\"cta-section\">.*?(?=\n  <footer class=\"site-footer\">)",
        re.DOTALL,
    ),
    re.compile(
        r"\n  <section class=\"treatment-content-block treatment-book-cta\">.*?(?=\n  <footer class=\"site-footer\">)",
        re.DOTALL,
    ),
    re.compile(
        r"\n  <section class=\"pre-footer-cta\">.*?(?=\n  <footer class=\"site-footer\">)",
        re.DOTALL,
    ),
]

FOOTER_PATTERN = re.compile(r"<footer class=\"site-footer\">.*?</footer>", re.DOTALL)


def patch_file(path: Path, include_pre_footer: bool):
    html = path.read_text(encoding="utf-8")
    if path.name == "about.html":
        html = html.replace(ABOUT_BUTTON, "")

    for pattern in PRE_FOOTER_PATTERNS:
        html = pattern.sub("", html)

    replacement = (PRE_FOOTER_CTA if include_pre_footer else "") + FOOTER
    html, count = FOOTER_PATTERN.subn(replacement.strip(), html, count=1)
    if count != 1:
        raise SystemExit(f"Could not replace footer in {path.name}")

    path.write_text(html, encoding="utf-8")
    print(f"Patched {path.name}")


def main():
    for path in sorted(ROOT.glob("*.html")):
        patch_file(path, include_pre_footer=False)


if __name__ == "__main__":
    main()
