#!/bin/bash
# LUX FINISH — free CPU finishing pass for Dream Maker / production clips.
# Gentle denoise + detail recovery + colour grade + clean phone/web encode (faststart).
# Usage: lux-finish.sh <input.mp4> <output.mp4>
set -e
IN="$1"; OUT="$2"
ffmpeg -y -v error -i "$IN" \
  -vf "hqdn3d=1.2:1.2:3:3,unsharp=5:5:0.55:5:5:0.0,eq=contrast=1.06:saturation=1.10:brightness=0.01" \
  -c:v libx264 -crf 21 -maxrate 3500k -bufsize 7000k -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart "$OUT"
echo "FINISHED: $OUT"
