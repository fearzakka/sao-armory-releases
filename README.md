# Vanguard of War downloads

Windows app releases and sanitized shared game knowledge for Vanguard of War.

Download page: https://supernova-sao-guide.netlify.app. It uses the permanent GitHub Latest download link; app releases do not require a Netlify deployment. Minecraft account verification and guild approval are required.

## App release retention

Publishing a new app release runs **Keep latest app and two previous releases**. It verifies the newest ZIP's GitHub digest against its release manifest and checksums, then retains the three newest public stable app releases. Older app releases, their tags and superseded app drafts are removed. Future drafts and prereleases are retained. Incomplete or mismatched newest downloads stop cleanup.

This rule applies only to version-tagged app releases containing SAO-Armory-Windows-x64.zip. Shared-data snapshots are excluded because later snapshots may reference earlier data assets.

## Shared discovery publisher

GitHub Actions checks guild database storage twice an hour. At 850 MB it archives pending public item and merchant discoveries and their pictures in ordered checkpoints. It rebuilds the approved Windows download and verifies its published bytes and SHA-256 before the guild service clears the corresponding queue entries. Interrupted checks can resume. Members, rank permissions, shared private content and attribution stay in the guild service. Daily traffic is measured separately from storage.

Large files use GitHub Releases. Workflows use standard public-repository GitHub Actions runners, without paid runners, caches or Actions artifact storage. Keep Netlify and Cloudflare on their Free plans. Service quotas can interrupt availability; this repository does not configure paid upgrades or recharges.
