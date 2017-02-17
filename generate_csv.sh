#!/bin/bash
set -o errexit
set -o pipefail
set -o nounset

#readonly CONVERTER="node --max_old_space_size=4096 --optimize_for_size --max_executable_size=4096 --stack_size=4096 $(which px-to-csv)"
readonly CONVERTER="node --max_old_space_size=2048 $(which px-to-csv)"

function gen_csv() {
  local file_index=./files.csv
  sed 1d "$file_index" | while IFS=, read category filename datum_column source_url download_url title; do
    mkdir -p "$category"
    local px_filename="$category/$filename.px"
    local csv_filename="$category/$filename"
    if [ ! -f "$csv_filename" ]; then
      wget --quiet -O "$px_filename" "$download_url"
      iconv -t "UTF-8" -f "ISO-8859-1" "$px_filename" -o "$px_filename.utf8"
      mv "$px_filename.utf8" "$px_filename"
      timeout 120 $CONVERTER -i "$px_filename" -o "$csv_filename" -c "$datum_column"
      rm "$px_filename"
      echo "$csv_filename"
    fi
  done
}

gen_csv
