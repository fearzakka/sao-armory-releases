import hashlib
import json
import pathlib
import re
import shutil
import sys
import zipfile

source, target, seed_dir, version = sys.argv[1:]
seed = pathlib.Path(seed_dir)
expected = {"manifest.json", *(f"{c}.json.gz" for c in "0123456789abcdef")}
if {p.name for p in seed.iterdir() if p.is_file()} != expected:
    raise ValueError("Unexpected seed files")

# Stable timestamps make a resumed publication produce the identical ZIP and receipt.
def entry(name):
    return zipfile.ZipInfo(name, date_time=(2026, 1, 1, 0, 0, 0))

with zipfile.ZipFile(source) as original, zipfile.ZipFile(target, "w") as result:
    names = original.namelist()
    packages = [n for n in names if n.endswith("/resources/app/package.json")]
    if len(packages) != 1 or len(names) != len(set(names)):
        raise ValueError("Invalid app package layout")
    root = packages[0].split("/")[0]
    metadata = json.loads(original.read(packages[0]))
    if metadata.get("name") != "sao-armory" or metadata.get("version") != version:
        raise ValueError("Unexpected approved app")
    index_name = root + "/vow-package.json"
    index = json.loads(original.read(index_name))
    if index["version"] != version:
        raise ValueError("Unexpected package manifest version")
    for info in original.infolist():
        name = info.filename
        if not name.startswith(root + "/") or "\\" in name or ".." in name.split("/") or ":" in name or "/resources/app/seed/" in name:
            raise ValueError("Unsafe path or pre-existing seed")
        if name != index_name:
            with original.open(info) as src, result.open(info, "w") as dst:
                shutil.copyfileobj(src, dst, 1024 * 1024)
    for p in sorted(seed.rglob("*")):
        if not p.is_file():
            continue
        parts = p.relative_to(seed).parts
        if p.name not in expected or (len(parts) != 1 and (len(parts) != 3 or parts[0] != "checkpoints" or not re.fullmatch("snapshot-[a-f0-9]{32}", parts[1]))):
            raise ValueError("Unexpected checkpoint path")
        relative = "resources/app/seed/" + p.relative_to(seed).as_posix()
        data = p.read_bytes()
        result.writestr(entry(root + "/" + relative), data, compress_type=zipfile.ZIP_DEFLATED)
        index["files"].append({"path": relative, "sha256": hashlib.sha256(data).hexdigest()})
    result.writestr(entry(index_name), json.dumps(index, separators=(",", ":")), compress_type=zipfile.ZIP_DEFLATED)
