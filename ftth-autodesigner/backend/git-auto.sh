#!/bin/bash
# Script otomatis git add + commit + push

if [ -z "$1" ]; then
  echo "❌ Harap masukkan pesan commit."
  echo "👉 Contoh: ./git-auto.sh \"update frontend lockfile\""
  exit 1
fi

# Tambah semua perubahan
git add .

# Commit dengan pesan dari argumen pertama
git commit -m "$1"

# Push ke branch saat ini
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin $BRANCH

echo "✅ Selesai! Perubahan sudah di-push ke branch '$BRANCH'."
