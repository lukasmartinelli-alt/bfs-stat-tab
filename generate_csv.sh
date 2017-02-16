#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

function clear_files() {
  rm -rf energy
}

function gen_csv() {
  local file_index=./files.csv
  sed 1d "$file_index" | while IFS=, read category filename datum_column title source_url download_url; do
    mkdir -p "$category"
    local px_filename="$category/$filename.px"
    local csv_filename="$category/$filename"
    wget --quiet -O "$px_filename" "$download_url"
    iconv -t "UTF-8" -f "ISO-8859-1" "$px_filename" -o "$px_filename.utf8"
    #rm "$px_filename"
    mv "$px_filename.utf8" "$px_filename"
    px-to-csv -i "$px_filename" -o "$csv_filename" -c "$datum_column"
    rm "$px_filename"
    echo "$csv_filename"
  done
}

clear_files
gen_csv
