#!/usr/bin/env python3
"""Insert shared treatment page sections (Task 6) before footer."""

from pathlib import Path

TREATMENTS = {
    "dental-implants": {
        "file": "dental-implants.html",
        "comfort_subject": "Dental implants",
        "comfort_clause": "Dental implants have the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering dental implants in Essex.",
    },
    "invisalign": {
        "file": "invisalign.html",
        "comfort_subject": "Invisalign",
        "comfort_clause": "Invisalign has the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering Invisalign in Essex.",
    },
    "teeth-whitening": {
        "file": "teeth-whitening.html",
        "comfort_subject": "Teeth whitening",
        "comfort_clause": "Professional teeth whitening has the power to transform patients' smiles completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering teeth whitening in Essex.",
    },
    "hygiene-plus": {
        "file": "hygiene-plus.html",
        "comfort_subject": "Dental hygiene",
        "comfort_clause": "Expert dental hygiene has the power to transform patients' oral health completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering direct-access hygiene in Essex.",
    },
    "family-dentistry": {
        "file": "family-dentistry.html",
        "comfort_subject": "Family dentistry",
        "comfort_clause": "Family dentistry has the power to transform patients' lives completely, and Hadleigh Dental &amp; Cosmetic Centre is one of the foremost practices offering family dental care in Essex.",
    },
}

TILES = [
    ("dental-implants", "dental-implants.html", "couple", "16 / 10", "row-2", "Life-Changing Dentistry", "Dental Implants", "Couple smiling after dental implant treatment", 1400, 933),
    ("invisalign", "invisalign.html", "denture", "16 / 10", "row-2", "The Clear Braces", "Invisalign", "Invisalign clear aligner being fitted", 1400, 933),
    ("teeth-whitening", "teeth-whitening.html", "smile", "4 / 3", "row-3", "Brighter, Faster", "Teeth Whitening", "Patient showing brighter teeth after whitening treatment", 1400, 1050),
    ("family-dentistry", "family-dentistry.html", "family", "4 / 3", "row-3", "Children · Hygiene · Fillings", "Family Dentistry", "Family receiving dental care at the practice", 1400, 1050),
    ("hygiene-plus", "hygiene-plus.html", "cleaning", "4 / 3", "row-3", "The Latest in Dental Hygiene", "Hygiene Plus", "Dental hygienist performing a professional clean", 1400, 1050),
]


def tile_html(key, href, img, subhead, title, alt, w, h, current):
    if key == current:
        tag_open = f'<span class="treatment-tile" data-treatment="{key}" aria-current="page" aria-label="{title} — current page">'
        tag_close = "</span>"
        btn = '<span class="btn btn-outline-light treatment-tile-btn">You are here</span>'
    else:
        tag_open = f'<a class="treatment-tile" data-treatment="{key}" href="{href}" aria-label="{title} — {subhead}. Read more.">'
        tag_close = "</a>"
        btn = '<span class="btn btn-outline-light treatment-tile-btn">Read More</span>'

    return f"""          {tag_open}
            <picture>
              <source srcset="images/{img}.webp" type="image/webp">
              <img src="images/{img}.jpg" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
            </picture>
            <span class="treatment-tile-overlay" aria-hidden="true"></span>
            <span class="treatment-tile-content">
              <span class="treatment-tile-subhead">{subhead}</span>
              <span class="treatment-tile-title">{title}</span>
              {btn}
            </span>
          {tag_close}"""


def crosslinks_html(current):
    row2 = [t for t in TILES if t[4] == "row-2"]
    row3 = [t for t in TILES if t[4] == "row-3"]
    row2_html = "\n".join(tile_html(t[0], t[1], t[2], t[5], t[6], t[7], t[8], t[9], current) for t in row2)
    row3_html = "\n".join(tile_html(t[0], t[1], t[2], t[5], t[6], t[7], t[8], t[9], current) for t in row3)
    return f"""
  <section class="treatment-highlights treatment-crosslinks" aria-label="Other dental services" data-current="{current}">
    <div class="wrap">
      <div class="section-head reveal">
        <div class="eyebrow">Explore more</div>
        <h2>Other Dental Services</h2>
        <p>Discover more treatments available at Hadleigh Dental &amp; Cosmetic Centre.</p>
      </div>
      <div class="treatment-collage reveal">
        <div class="treatment-collage-row treatment-collage-row-2">
{row2_html}
        </div>
        <div class="treatment-collage-row treatment-collage-row-3">
{row3_html}
        </div>
      </div>
    </div>
  </section>"""


def shared_sections(current, comfort_clause):
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

  <section class="treatment-content-block" style="background:var(--bg-warm);">
    <div class="wrap">
      <div class="grid grid-2 reveal" style="gap:48px; align-items:stretch;">
        <div class="video-slot" aria-label="Video placeholder">
          <div class="video-slot-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="5,3 19,12 5,21"/></svg>
            <span class="image-slot-label">Video coming soon</span>
          </div>
        </div>
        <div class="card opening-hours-card">
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
    </div>
  </section>
{crosslinks_html(current)}

  <section class="cta-section">
    <div class="wrap">
      <div class="cta-band">
        <h2>Ready to get started?</h2>
        <p>Book a consultation and find out what's right for you &mdash; no obligation to proceed.</p>
        <div class="hero-ctas">
          <a href="contact.html" class="btn btn-primary">Book Your Consultation</a>
          <a href="tel:01702553106" class="btn btn-outline-light">Call 01702 553 106</a>
        </div>
      </div>
    </div>
  </section>
"""


def main():
    root = Path(__file__).resolve().parent.parent
    marker = "  <footer class=\"site-footer\">"

    for key, meta in TREATMENTS.items():
        path = root / meta["file"]
        html = path.read_text(encoding="utf-8")
        if "treatment-comfort-section" in html:
            print(f"Skip {path.name} — already patched")
            continue
        block = shared_sections(key, meta["comfort_clause"])
        if marker not in html:
            raise SystemExit(f"Footer marker not found in {path.name}")
        path.write_text(html.replace(marker, block + "\n" + marker, 1), encoding="utf-8")
        print(f"Patched {path.name}")


if __name__ == "__main__":
    main()
