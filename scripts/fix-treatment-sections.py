#!/usr/bin/env python3
"""Apply revised Task 6: remove crosslinks, consolidate CTA, separate hours/video."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

PAGES = {
    "dental-implants.html": "whether dental implants are right for you",
    "invisalign.html": "whether Invisalign is right for you",
    "teeth-whitening.html": "which whitening option is right for you",
    "hygiene-plus.html": "about booking a hygiene appointment",
    "family-dentistry.html": "about family dentistry at our practice",
}


def comfort_clause(filename):
    clauses = {
        "dental-implants.html": "Dental implants have the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering dental implants in Essex.",
        "invisalign.html": "Invisalign has the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering Invisalign in Essex.",
        "teeth-whitening.html": "Professional teeth whitening has the power to transform patients' smiles completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering teeth whitening in Essex.",
        "hygiene-plus.html": "Expert dental hygiene has the power to transform patients' oral health completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering direct-access hygiene in Essex.",
        "family-dentistry.html": "Family dentistry has the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering family dental care in Essex.",
    }
    return clauses[filename]


def tail_sections(filename, cta_detail):
    return f"""
  <section class="treatment-content-block treatment-comfort-section">
    <div class="wrap">
      <div class="grid grid-2 reveal" style="align-items:center; gap:48px;">
        <div class="image-slot image-slot-wide">
          <img src="images/hero.jpg" alt="The welcoming reception and treatment rooms at Hadleigh Dental &amp; Cosmetic Centre" width="1400" height="933" loading="lazy" decoding="async">
        </div>
        <div>
          <div class="eyebrow">Your comfort</div>
          <h2>Making Your Visit Comfortable</h2>
          <p>Our spacious and modern practice is designed to be as comfortable and welcoming as possible. Judging from the positive feedback we receive from our satisfied patients, it seems to be working. Why not pay us a visit and see for yourself? {comfort_clause(filename)}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="treatment-content-block treatment-opening-hours" style="background:var(--bg-warm);">
    <div class="wrap">
      <div class="card opening-hours-card reveal" style="max-width:560px; margin:0 auto;">
        <div class="eyebrow">Opening hours</div>
        <h3>When we're here</h3>
        <div class="footer-hours">
          <div><span>Mon&ndash;Fri</span><span>9:00&ndash;18:00</span></div>
          <div><span>Saturday</span><span>Occasional</span></div>
          <div><span>Sunday</span><span>Closed</span></div>
        </div>
        <p style="margin-top:20px; font-size:0.92rem; color:var(--text-muted); margin-bottom:0;">Call <a href="tel:01702553106">01702 553 106</a> to confirm Saturday availability.</p>
      </div>
    </div>
  </section>

  <section class="treatment-content-block">
    <div class="wrap" style="max-width:820px;">
      <div class="video-slot reveal" aria-label="Video placeholder">
        <div class="video-slot-inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg>
          <span class="image-slot-label">Video coming soon</span>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-section">
    <div class="wrap">
      <div class="cta-band">
        <h2>Got questions? Book your consultation</h2>
        <p>Speak to our team about {cta_detail} &mdash; no obligation to proceed.</p>
        <div class="hero-ctas">
          <a href="tel:01702553106" class="btn btn-primary">Call 01702 553 106</a>
          <a href="contact.html" class="btn btn-outline-light">Book Online</a>
        </div>
      </div>
    </div>
  </section>
"""


def patch_file(path: Path, cta_detail: str):
    html = path.read_text(encoding="utf-8")

    # Remove mid-page CTA bands (keep none until we add the final one)
    html = re.sub(
        r"\n  <section class=\"cta-section\">.*?</section>",
        "",
        html,
        flags=re.DOTALL,
    )

    # Remove cross-link grid
    html = re.sub(
        r"\n  <section class=\"treatment-highlights treatment-crosslinks\".*?</section>",
        "",
        html,
        flags=re.DOTALL,
    )

    # Remove old comfort + paired video/hours block if present
    html = re.sub(
        r"\n  <section class=\"treatment-content-block treatment-comfort-section\">.*?(?=\n  <footer class=\"site-footer\">)",
        tail_sections(path.name, cta_detail),
        html,
        flags=re.DOTALL,
    )

    # Remove inline book button on invisalign steps
    html = re.sub(
        r"\n      <div class=\"text-center reveal\" style=\"margin-top:40px;\">\n        <a href=\"contact\.html\" class=\"btn btn-primary\">Book an Invisalign Consultation</a>\n      </div>",
        "",
        html,
    )

    path.write_text(html, encoding="utf-8")
    print(f"Patched {path.name}")


def main():
    for filename, cta_detail in PAGES.items():
        patch_file(ROOT / filename, cta_detail)


if __name__ == "__main__":
    main()
