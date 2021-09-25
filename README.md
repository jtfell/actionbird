# Borealis

An experiment in running an auto-rebuilding data-driven CMS entirely on Github Actions / Github Pages.

It consumes BoM cyclone warnings to re-build the static Next.js site every half hour.

## TODOs

- [] BoM consumer lib (borrow from DS until its open sourced)
- [] Scrape task
- Make the Cyclone page prettier
  - [] Can we get some description text from somewhere on the BoM server? May need to get GML + CAP
  - [] Updated time
  - [] Dates / Predictions drawn on map
  - [] Improved colours / styles on map
    - Switch to https://www.thunderforest.com/maps/atlas/ or other option here: https://switch2osm.org/providers/
  - [] Affected areas list (from where? Helpful content for page + SEO)
- [] Make it public and enable GH pages
- [] Connect to `https://microsco.pics/` domain (eg. https://microsco.pics/cyclone/AU202021_11U)
  - Registered until ~April (end of cyclone season)
- [] SEO optimisation

## How it works

- Github Action (`Scrape`) runs every half-hour that:
  - Gets all the active cyclones from the BoM FTP - need consumer lib
  - Archives any inactive cyclones (separate folder)
  - Transforms each active one into CyclonePath form
  - Writes to `date.json` and `current.json` in folder `data/cyclones/ID`
  - Commits to the `main` branch

- Github Action (`Deploy`) that is run on each commit to `main`, and after each successful
  run of the `Scrape` task that:
  - Builds a static version of the site (`next build && next export`) from the data in `data/cyclones`
  - Writes it to the `gh-pages` branch (`gh-pages -d out`)

### Local Dev

Use `npm run dev` for auto-hotreloading of the next app.

Use `npm run scape` for running the BoM scraper.

