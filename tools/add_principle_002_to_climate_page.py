from pathlib import Path

p = Path("pages/climate.html")
text = p.read_text(encoding="utf-8")

card = """
    <a class="signal" href="../content/climate/principles/climate-cycles-human-forcing/">
      <h3>#002 Climate Cycles and Human Forcing</h3>
      <p>Explain natural climate cycles while clearly distinguishing them from today's rapid human-driven warming caused mainly by greenhouse-gas emissions.</p>
      <span>Open Principle #002</span>
    </a>
"""

if "climate-cycles-human-forcing" in text:
    print("Principle #002 already exists on the Climate page. No duplicate inserted.")
else:
    marker = "#001 Historical Climate Literacy"
    pos = text.find(marker)
    if pos == -1:
        raise SystemExit("Could not find Principle #001 card. Please check pages/climate.html.")

    card_end = text.find("</a>", pos)
    if card_end == -1:
        raise SystemExit("Could not find end of Principle #001 card.")

    card_end += len("</a>")
    text = text[:card_end] + "\n" + card + text[card_end:]

    p.write_text(text, encoding="utf-8")
    print("Inserted Principle #002 card after Principle #001 on the Climate page.")
