#!/usr/bin/env python3
"""Task 6 scope correction: full sections on implants/invisalign only."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

FULL_PAGES = {
    "dental-implants.html": (
        "Dental implants have the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering dental implants in Essex.",
        "whether dental implants are right for you",
    ),
    "invisalign.html": (
        "Invisalign has the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering Invisalign in Essex.",
        "whether Invisalign is right for you",
    ),
}

CTA_ONLY_PAGES = [
    "teeth-whitening.html",
    "hygiene-plus.html",
    "family-dentistry.html",
]


def full_tail(comfort_clause: str, cta_detail: str) -> str:
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
          <p>Our spacious and modern practice is designed to be as comfortable and welcoming as possible. Judging from the positive feedback we receive from our satisfied patients, it seems to be working. Why not pay us a visit and see for yourself? {comfort_clause}</p>
        </div>
      </div>
    </div>
  </section>

  <section>
    <div class="treatment-video-strip full-bleed">
      <!-- TODO: replace VIDEO_ID with real Vimeo ID once available -->
      <iframe
        class="treatment-vimeo-embed"
        src="https://player.vimeo.com/video/VIDEO_ID?title=0&amp;byline=0&amp;portrait=0"
        title="Hadleigh Dental &amp; Cosmetic Centre practice video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
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


def cta_only_tail() -> str:
    return """
  <section class="treatment-content-block treatment-book-cta">
    <div class="wrap">
      <div class="reveal" style="text-align:center; padding:8px 0 16px;">
        <a href="contact.html" class="btn btn-primary">Book Now</a>
      </div>
    </div>
  </section>
"""


def patch_file(path: Path, replacement: str):
    html = path.read_text(encoding="utf-8")
    pattern = r"\n  <section class=\"treatment-content-block treatment-comfort-section\">.*?(?=\n  <footer class=\"site-footer\">)"
    if not re.search(pattern, html, flags=re.DOTALL):
        # CTA-only pages might still have comfort section from prior patch
        pattern = r"\n  <section class=\"treatment-content-block treatment-comfort-section\">.*?(?=\n  <footer class=\"site-footer\">)"
    new_html, count = re.subn(pattern, replacement, html, count=1, flags=re.DOTALL)
    if count != 1:
        raise SystemExit(f"Could not patch tail in {path.name}")
    path.write_text(new_html, encoding="utf-8")
    print(f"Patched {path.name}")


def main():
    for filename, (comfort, cta_detail) in FULL_PAGES.items():
        patch_file(ROOT / filename, full_tail(comfort, cta_detail))
    for filename in CTA_ONLY_PAGES:
        patch_file(ROOT / filename, cta_only_tail())


if __name__ == "__main__":
    main()
