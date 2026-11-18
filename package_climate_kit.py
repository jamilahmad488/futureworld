import zipfile
from pathlib import Path

# Define source directory and output zip path
src_dir = Path("D:/AI_Project/Digital_Products/fwi-climate-carbon-kit")
output_zip = Path("D:/AI_Project/Digital_Products/fwi-climate-carbon-kit-v1.0.zip")

# Ensure source directory exists
if not src_dir.exists():
    src_dir.mkdir(parents=True, exist_ok=True)
    # Create sample placeholder files if none exist yet
    (src_dir / "tool_1_offset_calc.py").write_text("# FWI Tool 1: Carbon Offset Calculator\nprint('Running Offset Calculator...')\n")
    (src_dir / "tool_2_vcm_parser.py").write_text("# FWI Tool 2: VCM Parser\nprint('Parsing VCM Data...')\n")
    (src_dir / "tool_3_ppp_generator.py").write_text("# FWI Tool 3: PPP Framework Generator\nprint('Generating PPP Framework...')\n")
    (src_dir / "README.md").write_text("# Future World Intelligence: Climate & Carbon Edition v1.0\nProfessional Python automation suite for climate workers and carbon market analysts.\n")

# Create the zip archive
with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for file_path in src_dir.rglob('*'):
        if file_path.is_file():
            zipf.write(file_path, file_path.relative_to(src_dir.parent))

print(f"Successfully packaged toolkit into: {output_zip}")
