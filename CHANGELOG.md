# Changelog

## [0.15.1](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.15.0...one-piece-api-v0.15.1) (2026-11-25)


### Bug Fixes

* **api:** make pagination order stable and ignore invalid isActive values ([012c3c0](https://github.com/akanyane/one-piece-api/commit/012c3c099330342d3b71eb048408256eb285866f))

## [0.15.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.14.0...one-piece-api-v0.15.0) (2026-11-25)


### Features

* **api:** add X-Total-Count and Link pagination headers to list endpoints ([900b44a](https://github.com/akanyane/one-piece-api/commit/900b44ac09ee73cf084b4bedb3ff6246488193d1))
* **api:** add X-Total-Count and Link pagination headers to list endpoints ([e24ad19](https://github.com/akanyane/one-piece-api/commit/e24ad190754e913c9de2eb26d9fcf7e9f0791fb1))
* **playground:** show X-Total-Count and Link page buttons in the response ([42c1c09](https://github.com/akanyane/one-piece-api/commit/42c1c0972cd7cdd397f89a01c9a372a75a70e718))

## [0.14.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.13.2...one-piece-api-v0.14.0) (2026-11-25)


### Features

* **api:** add q search to every list endpoint and detail routes for all resources ([4d37eb3](https://github.com/akanyane/one-piece-api/commit/4d37eb36a131ced30d02b60a376ab0705ead6388))
* **api:** add q search to every list endpoint and detail routes for all resources ([bad1a48](https://github.com/akanyane/one-piece-api/commit/bad1a48aa93aed69edcce1adb4bd24ec002417e7))

## [0.13.2](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.13.1...one-piece-api-v0.13.2) (2026-11-25)


### Bug Fixes

* **deps:** override minimatch to ^11.0.1 for the DoS advisory ([efd6a93](https://github.com/akanyane/one-piece-api/commit/efd6a936e0490b3e5db25e5663812a7516c4b0e6))
* **deps:** override minimatch to ^11.0.1 for the DoS advisory ([b421af1](https://github.com/akanyane/one-piece-api/commit/b421af16f4beb7b9df5628a6db026be676bea537))

## [0.13.1](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.13.0...one-piece-api-v0.13.1) (2026-11-24)


### Performance Improvements

* **db:** index foreign keys flagged by the Supabase advisor ([570c6e3](https://github.com/akanyane/one-piece-api/commit/570c6e3d1810e6d753efdc35f1026baed1285c0d))
* **db:** index foreign keys flagged by the Supabase advisor ([05d1075](https://github.com/akanyane/one-piece-api/commit/05d10758acb9735c19269e8f418d78cb606db70f))

## [0.13.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.12.0...one-piece-api-v0.13.0) (2026-11-24)


### Features

* **api:** count API usage with anonymous daily counters ([50819f5](https://github.com/akanyane/one-piece-api/commit/50819f5f691d4c6643ddaeb8f8f061461d955e86))
* **api:** count API usage with anonymous daily counters ([aceb89c](https://github.com/akanyane/one-piece-api/commit/aceb89c69b758d997da7e2e85c4e092ed95e1a95))

## [0.12.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.11.1...one-piece-api-v0.12.0) (2026-11-23)


### Features

* **api:** enable CORS and publish an OpenAPI 3.1 spec ([ed2e2ce](https://github.com/akanyane/one-piece-api/commit/ed2e2ced844d9080af3e1223d3526a4c0515ea5b))
* **api:** enable CORS and publish an OpenAPI 3.1 spec ([7ead040](https://github.com/akanyane/one-piece-api/commit/7ead040a8cbfeac0c71f35cdfe8a94fdc7dce7ac))

## [0.11.1](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.11.0...one-piece-api-v0.11.1) (2026-11-22)


### Bug Fixes

* **csp:** allow the Vercel toolbar on preview deployments ([7681292](https://github.com/akanyane/one-piece-api/commit/7681292a5162d8296e7b46c48ba17eae5b50dad3))
* **deps:** drop source-map-js override unsupported by Vercel's pnpm 9 ([2a4279d](https://github.com/akanyane/one-piece-api/commit/2a4279d6b4668343ee2d0abacd30bec9ab1e20ab))
* **security:** upgrade Next.js, add CSP, harden API params ([99116f2](https://github.com/akanyane/one-piece-api/commit/99116f289df2f4c8b2e2c5752ca35311d43138aa))
* **security:** upgrade Next.js, add CSP, harden API params ([01800e3](https://github.com/akanyane/one-piece-api/commit/01800e3a7558493b941b256b0a43aa569d569f70))

## [0.11.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.10.1...one-piece-api-v0.11.0) (2026-11-02)


### Features

* **characters:** portraits first in catalog; unique character names ([323075a](https://github.com/akanyane/one-piece-api/commit/323075af726750bce15ecc1e3e341810761a1535))
* **characters:** portraits first in catalog; unique character names ([afc0b0c](https://github.com/akanyane/one-piece-api/commit/afc0b0ca99532b7050086e609cecb383b52e5501))

## [0.10.1](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.10.0...one-piece-api-v0.10.1) (2026-11-01)


### Bug Fixes

* **images:** serve images unoptimized; label generic fruit art ([7083284](https://github.com/akanyane/one-piece-api/commit/7083284e86aa01b0dd3720ea2c40017460cedc89))
* **images:** serve images unoptimized; label generic fruit art ([bf406c3](https://github.com/akanyane/one-piece-api/commit/bf406c395004f0f258e1151412f83df46d3ad890))

## [0.10.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.9.0...one-piece-api-v0.10.0) (2026-11-01)


### Features

* **site:** devil fruit and affiliation detail pages ([388245f](https://github.com/akanyane/one-piece-api/commit/388245ffac7d95e9d9ff980da413bf8a5213ca56))
* **site:** devil fruit and affiliation detail pages ([61894e4](https://github.com/akanyane/one-piece-api/commit/61894e44d921a013037de2e17ff8cb9b6a5e0a32))

## [0.9.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.8.0...one-piece-api-v0.9.0) (2026-11-01)


### Features

* **site:** rich character profile, animated header and footer ([7d787fa](https://github.com/akanyane/one-piece-api/commit/7d787fa1d2d1bd7ec09b67008e45487a241649ea))
* **site:** rich character profile, animated header and footer ([7a1c9ce](https://github.com/akanyane/one-piece-api/commit/7a1c9ce72985f7e616159a9eccdba3687b95ca7e))
* **site:** wanted-poster cards, animated homepage and shared layout ([878683e](https://github.com/akanyane/one-piece-api/commit/878683e7c242b43bb5db8476d6fe139aff6ee151))
* **site:** wanted-poster cards, animated homepage and shared layout ([47cea25](https://github.com/akanyane/one-piece-api/commit/47cea2542da79ba1b9324ad4725a32941c5339f9))


### Bug Fixes

* **playground:** self-host JetBrains Mono to unblock Vercel build ([dda0890](https://github.com/akanyane/one-piece-api/commit/dda08906fb304df992efff1cea08f62f6b086a9d))

## [0.8.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.7.0...one-piece-api-v0.8.0) (2026-09-21)


### Features

* **docs:** align documentation and about pages with site's visual style ([468061f](https://github.com/akanyane/one-piece-api/commit/468061f3fb7be355564595fb4bc92b0786412fe0))

## [0.7.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.6.0...one-piece-api-v0.7.0) (2026-09-21)


### Features

* **playground:** add interactive API playground ([dc73842](https://github.com/akanyane/one-piece-api/commit/dc738422ad34795325183ea06abfc08579645fa6))

## [0.6.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.5.0...one-piece-api-v0.6.0) (2026-09-12)


### Features

* **affiliations:** add affiliations catalog and API endpoint ([5dd3327](https://github.com/akanyane/one-piece-api/commit/5dd33277f76723c543c4d95b92f62998723c6faf))

## [0.5.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.4.0...one-piece-api-v0.5.0) (2026-09-12)


### Features

* **devil-fruits:** lead with the romanized name on fruit cards ([f9426c7](https://github.com/akanyane/one-piece-api/commit/f9426c79f72b5e401200b1bb451c953d21810512))

## [0.4.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.3.0...one-piece-api-v0.4.0) (2026-07-27)


### Features

* improve SEO across all routes ([d051353](https://github.com/akanyane/one-piece-api/commit/d051353397275d2c40c1ec96ce522f92f68db3c6))

## [0.3.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.2.0...one-piece-api-v0.3.0) (2026-07-26)


### Features

* add ships and islands catalogs ([8f5af36](https://github.com/akanyane/one-piece-api/commit/8f5af3600dd3b6b168dd4b00419aeb69ded07ef0))

## [0.2.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.1.0...one-piece-api-v0.2.0) (2026-07-21)


### Features

* add canonical URLs to every page ([904ca7f](https://github.com/akanyane/one-piece-api/commit/904ca7f066a1eca300d38af99bfeba84c03fe177))
* add Open Graph/Twitter metadata, image alt text, and API cache headers ([c22efce](https://github.com/akanyane/one-piece-api/commit/c22efcef5c5e2a7b69365a6873a490f4d6984cec))
* cache Supabase reads, wire up dark mode, add missing loading/error states ([2ce7efc](https://github.com/akanyane/one-piece-api/commit/2ce7efc8d6f3757214bcceeb2306c4bd4a784731))
* image optimization, sitemap/robots, fix broken GitHub links, style 404 ([c26a51d](https://github.com/akanyane/one-piece-api/commit/c26a51d969579687b7e2a80a28336764181b8340))


### Bug Fixes

* balance pill button padding and add total-page context to pagination ([f1d899d](https://github.com/akanyane/one-piece-api/commit/f1d899d0c4c11e362fd51cb152eda95232bf85d2))
* give .surface-story a dark-mode counterpart ([309c3f5](https://github.com/akanyane/one-piece-api/commit/309c3f540ac40849e33fcfaffc337303d7292063))
* stop bottom-right ambient blob from adding empty scroll space ([a5f9e84](https://github.com/akanyane/one-piece-api/commit/a5f9e8458582d844b82714c46fe6fcbc023e85a3))

## [0.1.0](https://github.com/akanyane/one-piece-api/compare/one-piece-api-v0.0.1...one-piece-api-v0.1.0) (2026-07-21)


### Features

* about page ([02bc5f8](https://github.com/akanyane/one-piece-api/commit/02bc5f83d8b1a16bf3cd11621a83c643eb9542fa))
* add release automation, migrate to Base UI, and fix API bugs ([3ee33ed](https://github.com/akanyane/one-piece-api/commit/3ee33ed065eeebc7b17c852d9b3a91e344aa6839))
* initial commit ([21320bc](https://github.com/akanyane/one-piece-api/commit/21320bc1f214048942d4e0fea046d6c6a03ed815))


### Bug Fixes

* anchor character portraits to the top to avoid cropping heads ([704acb1](https://github.com/akanyane/one-piece-api/commit/704acb1bd39152283aff2db4844e8ac159b240a4))
* api data ([1f7f192](https://github.com/akanyane/one-piece-api/commit/1f7f1926dedd05690d03a0a3001f4af349f2e1b7))
* api data ([812ea84](https://github.com/akanyane/one-piece-api/commit/812ea84abc25ddf96bbcf26e9826819316ad4a1b))
* api data ([8952bb0](https://github.com/akanyane/one-piece-api/commit/8952bb0c4b2f179310c1d572067c7fbdfae9c866))
* api data ([8e47fbb](https://github.com/akanyane/one-piece-api/commit/8e47fbbef3e52f80e6c5e6994323ffed1e99d72f))
* api route logic and util functions ([30597fb](https://github.com/akanyane/one-piece-api/commit/30597fb4ac1126c711f4adf572f612c0f777aa4c))
* characters route data ([f2771f3](https://github.com/akanyane/one-piece-api/commit/f2771f3838dc22a468e5914157ac4130af87813f))
* characters route data ([cadfa08](https://github.com/akanyane/one-piece-api/commit/cadfa0882ab0fee068ef866fce1cd987a64181da))
* fs functions ([9cde8cd](https://github.com/akanyane/one-piece-api/commit/9cde8cdc1712112a367dc06d99cfd3a6e267e09f))
* lint ([8875990](https://github.com/akanyane/one-piece-api/commit/8875990cb3f81ada5cdf36c2b2d1780da47faf08))
* lock file ([ef09e3f](https://github.com/akanyane/one-piece-api/commit/ef09e3f71e4eb7aa8e8290523b84bd4096211f1b))
* node version ([84b377a](https://github.com/akanyane/one-piece-api/commit/84b377aba5de85e4d8be8d878b8b9991d4f7acd7))
* quotes ([5f9cfd7](https://github.com/akanyane/one-piece-api/commit/5f9cfd7f4e27ecff3fb7d81c96cf4c30454d30b3))
* render character portrait images on cards and detail page ([38ae08e](https://github.com/akanyane/one-piece-api/commit/38ae08e89b0e9fc402cf1febcf663c47b0657d41))
