# Target2Plan

One page for Shafiul Islam's MS thesis at the University of Washington: from a room program and
two performance targets, view quality (QVCI) and acoustic quality (AQI), to zone assignments,
connectivity graphs and schematic floor plans. https://shafiarch.github.io/works_Target2Plan/

The tool itself: https://shafiarch.github.io/Target2Plan/ (source: ShafiArch/Target2Plan).

## Publish

Settings, Pages, Build and deployment: Deploy from a branch, `main`, folder `/ (root)`.
No build step; `.nojekyll` makes GitHub serve the files as they are.

## What is where

| What | Where |
| --- | --- |
| The page | `index.html`, `assets/style.css`, `assets/site.js` |
| Pictures the page shows (`-l` opens on click, `-n` is the Night copy) | `img/` |
| Paper figures, exported at 4x from the Paper Figure Studio | `source/figures/` |
| The README gallery of ShafiArch/Target2Plan (GIFs, gallery.json) and a print resolution still of the plan mosaic | `source/gallery/` |
| The script that makes `img/` | `tools/build_img.py` (Pillow, numpy) |

Sections: targets, zones, learning, graph to plan (the four gallery apartments animated, plan
and graph side by side, then all four at one scale), results, the web app, credits. Pictures made
on white become transparent copies, with dark ink for Trace and Clay and light ink for Night;
the GIFs become animated WebP with the same timing.

## Credits

Shafiul Islam (author, developer, researcher); Tomás Méndez Echenagucia, thesis supervisor;
Mohammad Tabatabaei Manesh, thesis committee member.

## Rules

- No em dashes or en dashes in text, code comments or docs.
- Commits are authored and committed as Shafiul Islam
  (`145989139+ShafiArch@users.noreply.github.com`), with no co-author lines.
- Whenever `assets/style.css` or `assets/site.js` changes, raise `?v=N` on both tags in `index.html`.
