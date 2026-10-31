#!/usr/bin/env bash
# Higgsfield'dan indirilen tur videosunu kaydırmayla sarmaya uygun hâle getirir.
#
# Kullanım:  bash scripts/prepare-video.sh indirilen-video.mp4
#
# Üretilen dosyalar (public/assets/):
#   kaya-hair-walkthrough.mp4         masaüstü, 1920px, her 4 karede bir anahtar kare
#   kaya-hair-walkthrough-mobile.mp4  mobil, 1280px, daha hafif
#   kaya-hair-walkthrough-poster.jpg  ilk kare (paylaşım görseli / yedek)
#
# Sık anahtar kare, ileri-geri sarmayı akıcı yapar. Ses kaldırılır.
set -euo pipefail

IN="${1:?Video dosyasının yolunu verin}"
OUT="$(dirname "$0")/../public/assets"
mkdir -p "$OUT"

ffmpeg -y -i "$IN" -an \
  -vf "scale=1920:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 24 -g 4 -keyint_min 4 -sc_threshold 0 \
  -movflags +faststart "$OUT/kaya-hair-walkthrough.mp4"

ffmpeg -y -i "$IN" -an \
  -vf "scale=1280:-2:flags=lanczos,format=yuv420p" \
  -c:v libx264 -preset slow -crf 25 -g 4 -keyint_min 4 -sc_threshold 0 \
  -movflags +faststart "$OUT/kaya-hair-walkthrough-mobile.mp4"

ffmpeg -y -i "$IN" -frames:v 1 -q:v 3 "$OUT/kaya-hair-walkthrough-poster.jpg"

ls -lh "$OUT"/kaya-hair-walkthrough*
