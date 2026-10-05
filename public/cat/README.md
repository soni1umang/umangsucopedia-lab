# Resident cat assets

The resident cat component expects these two files in `public/cat/`:

- `cat-walk-alpha.apng` — 15 fps transparent walking animation
- `cat-idle.png` — transparent idle frame

These assets are generated from the supplied green-screen cat clip with chroma-key background removal.

If the assets are missing, the component will render no visible cat until they are added.
