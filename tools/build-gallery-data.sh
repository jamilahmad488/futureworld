#!/usr/bin/env bash
set -euo pipefail

out="assets/gallery/gallery-data.js"
tmp="$(mktemp)"

esc() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > "$tmp" <<'JS'
window.FWI_GALLERY = [
JS

add_items() {
  local dir="$1"
  local category="$2"

  [ -d "$dir" ] || return 0

  find "$dir" -maxdepth 1 -type f \( \
    -iname "*.png" -o \
    -iname "*.jpg" -o \
    -iname "*.jpeg" -o \
    -iname "*.webp" -o \
    -iname "*.svg" -o \
    -iname "*.gif" \
  \) | sort | while IFS= read -r f; do
    src="../${f#./}"
    base="$(basename "$f")"
    caption="${base%.*}"
    caption="$(echo "$caption" | sed -E 's/[-_]+/ /g; s/[[:space:]]+/ /g')"

    printf '  {"src":"%s","category":"%s","title":"%s","caption":"%s"},\n' \
      "$(esc "$src")" \
      "$(esc "$category")" \
      "$(esc "$caption")" \
      "$(esc "$caption")" >> "$tmp"
  done
}

add_items "assets/gallery/climate-action" "Climate Action"
add_items "assets/gallery/forestry-restoration" "Forestry & Restoration"
add_items "assets/gallery/community-mobilization" "Community Mobilization"
add_items "assets/gallery/maps-dashboards" "Maps & Dashboards"
add_items "assets/gallery/courses-learning" "Courses & Learning"
add_items "assets/gallery/events-campaigns" "Events & Campaigns"
add_items "assets/gallery/futureworld-media" "FutureWorld Media"

cat >> "$tmp" <<'JS'
];
JS

mv "$tmp" "$out"
echo "Generated $out"
