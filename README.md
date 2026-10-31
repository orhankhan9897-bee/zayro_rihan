# ZAYRO RACING — Created by Rihan

A browser-based WebGL racing game. This release keeps the existing 4.0 gameplay and adds a player-friendly Daily Happiness Gift.

## New in 4.1
- Claim a free daily gift of 300–700 Race Credits from the garage.
- A consecutive-day login streak adds +100 credits per day, capped at a +500 credit bonus.
- The gift can be claimed once per local calendar day; claim status and streak are saved on this device.
- Updated visible game branding to ZAYRO RACING.

## Start the game (Windows)
1. Extract the ZIP.
2. Open the `ZAYRO_RACING` folder.
3. Double-click `Start ZAYRO RACING.bat`.
4. Keep the terminal window open while playing.

Requires a modern browser with WebGL (Chrome or Edge recommended). Progress is stored locally in the browser.


## Driver save backup
- Export your career, credits, upgrades, cars, settings and daily-gift streak from the garage.
- Import that JSON save on another browser or PC to continue your profile.
- Import replaces the current local game save after confirmation. Keep the exported JSON somewhere safe.

## Personal best ghost racer
- Race against the fastest saved run for each stage and event.
- A cyan ghost car replays the best racing line, and the timer panel shows whether you are ahead or behind.
- Ghost runs save locally and are included in exported driver backups.


## Mobile controls update
- **Keyboard / Arrow Keys**: for PC keyboard play.
- **Touch Buttons**: on-screen left/right, gas, brake, reverse and nitro buttons.
- **Touch Steering**: virtual steering wheel plus on-screen pedals.
- Phones default to Touch Buttons on first visit. Select another profile in the garage at any time; the choice is saved in that browser.

For QR-code play, the QR code must point to a URL your phone can access (such as a deployed HTTPS site or your PC's LAN IP). `127.0.0.1`/`localhost` only opens the game on the same device.


## Ultra graphics upgrade
The renderer now includes richer directional/ambient lighting, metallic clear-coat highlights, Fresnel edge reflections, more detailed asphalt variation, stronger wet-road sheen in rain, refined headlights and atmospheric depth. In the garage, choose **GRAPHICS QUALITY → ULTRA** for the sharpest rendering. If the game becomes slow on a phone or older PC, choose **BALANCED** or **PERFORMANCE**. These are real-time WebGL visual effects and are not ray tracing.

## ZAYRO PRO PACK (v5.0)
- **Driver level & XP** with ranks from Rookie to Icon; each level-up pays Race Credits.
- **15 achievements** and **3 daily challenges** (garage panels), all with credit rewards.
- **Speed FX**: speed lines, nitro vignette and a red warning pulse after 2 crashes.
- **Live callouts** for near misses, combos, slipstream and 200/250/300 km/h.
- **Run report** after every race, with a skill-score credit bonus.
- **Shortcuts**: `P` pause, `F` fullscreen, `M` music. The race auto-pauses if you switch tabs.
- Progress is saved locally and included in driver-save export/import.

## ZAYRO REALISM PACK (v7.0) — GTA-style look & feel
- **New lighting shader**: procedural sky with sun glow and moving clouds, stars and moon at night, warm sun-scatter fog, filmic colour grade.
- **Realistic car paint**: real sky/sun reflections and Fresnel edge shine on bodywork and glass; glowing tail/brake/head lights at night.
- **Realistic roads**: lane lines fixed (they were sunk under the asphalt), polished tyre tracks, oil stains, cracks, asphalt grain, wet puddles with rain ripples, street-lamp light pools at night, lit windows on buildings.
- **Weather in the shader**: night and rain are now true lighting (not a CSS filter), so they look sharper and run faster.
- **GTA-style gameplay layer** (Open City): wanted stars, police fleet that chases and rams, BUSTED / WASTED / MISSION PASSED screens, circular radar, cash HUD, handbrake drifting (SPACE), horn (H), radio stations (B), police siren.
- **GTA-style camera**: smooth lagging chase camera that swings behind the car and pulls back with speed.
- Select GRAPHICS QUALITY → ULTRA for the best result.

## ZAYRO CARS (v8.0) — smooth hypercar bodies
- All cars (yours, traffic, rivals, police, ghost) now use smooth, curved lofted bodies instead of stacked cubes: glass canopy, body-colour roof panel, wide rear haunches, mesh grille, diffuser, twin exhausts and a wing per model.
- Brake/tail lights and headlights glow; **blue nitro flames** shoot from the exhausts when boosting.
- Five different designs, one per stage car. Paint colours still work.
- Cockpit camera (press C) keeps the old model because it contains the interior.
