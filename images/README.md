# Images

Photos used on the site. Each one is resized to 1200 px or less and saved
without camera or GPS metadata. The full-size originals live in
`photo-resources/`, which git ignores.

| File | Used on | Shows |
|---|---|---|
| me-cockpit-smile.jpg | Home hero | Adam grinning in the left seat (low-res) |
| panel-twin.jpg | Home "Now", Projects, Tools (310Q) | Twin panel in cruise |
| strut-clouds.jpg | Home "Now" (NTSB research) | Sun over a cloud deck |
| fuel-sample.jpg | Home "Now", Projects (Compendium) | Fuel sample on preflight (low-res) |
| cockpit-mountains.jpg | Home "Now", Projects (tools) | Over the cowling at snowy mountains |
| me-cockpit.jpg | Home gallery | Adam flying above clouds (low-res) |
| ham-radio.jpg | Home gallery | Portable ham radio |
| marines-trail.jpg | Home gallery | Mountain training trail sign |
| red-rock.jpg | Home gallery, Tools (172S) | Red rock under a wing strut |
| me-taildragger.jpg, f16.jpg, c152.jpg, ramp-handshake.jpg, summit-climb.jpg | Home gallery | People shots |
| sf-peaks.jpg, wing-clouds.jpg, lowwing-clouds.jpg, clouds-desert.jpg, night-lights.jpg, boneyard-747.jpg, haystack-rock.jpg, fuji.jpg, graz.jpg | Home gallery | Views from the air and travel |

To add a photo, resize it first (for example `sips -Z 1200 in.jpg --out images/name.jpg`)
and add a `<figure>` to the `.photo-gallery` on the home page (with `width`/`height`), or a `<figure class="photo-slot">` with an `<img>` where you want it.
`object-position` on the `<img>` moves the crop.
