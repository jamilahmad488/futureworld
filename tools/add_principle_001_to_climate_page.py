from pathlib import Path

p = Path("pages/climate.html")
text = p.read_text(encoding="utf-8")

section_id = 'id="climate-principles"'

insert = """
<section class="page-section climate-principles" id="climate-principles">
  <div class="section-title">
    <p>FutureWorld Climate Intelligence Principles</p>
    <h2>The core pillars for climate understanding, AI integration and field action</h2>
  </div>

  <div class="signal-list">
    <a class="signal" href="../content/climate/principles/historical-climate-literacy/">
      <h3>#001 Historical Climate Literacy</h3>
      <p>Understand how climate science, global governance, climate finance, the Paris Agreement, COP process, GCF and SDGs evolved into today’s climate action and implementation framework.</p>
      <span>Open Principle #001</span>
    </a>
  </div>
</section>
"""

if section_id in text:
    print("Climate principles section already exists. No duplicate inserted.")
else:
    idx = text.find("Climate Library")
    if idx == -1:
        raise SystemExit("Climate Library marker not found in pages/climate.html.")

    section_start = text.rfind("<section", 0, idx)
    if section_start == -1:
        raise SystemExit("Could not find the Climate Library section start.")

    text = text[:section_start] + insert + "\n" + text[section_start:]
    p.write_text(text, encoding="utf-8")
    print("Inserted Climate Intelligence Principles section above Climate Library.")
