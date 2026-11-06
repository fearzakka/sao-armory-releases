import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile


class BundleTest(unittest.TestCase):
    def test_verified_app_with_two_library_checkpoints_and_repeatable_zip(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            base = root / "base.zip"
            with zipfile.ZipFile(base, "w") as archive:
                archive.writestr("Armory/Armory.exe", b"test binary")
                archive.writestr("Armory/resources/app/package.json", '{"name":"sao-armory","version":"1.2.3"}')
                archive.writestr("Armory/vow-package.json", '{"version":"1.2.3","schema":1,"files":[]}')
            seed = root / "seed"
            for index, folder in enumerate([seed, seed / "checkpoints" / ("snapshot-" + "a" * 32)]):
                folder.mkdir(parents=True)
                for name in ["manifest.json"] + [c + ".json.gz" for c in "0123456789abcdef"]:
                    (folder / name).write_bytes(f"{index}:{name}".encode())
            command = [sys.executable, str(Path(__file__).with_name("bundle.py")), str(base)]
            output = root / "out.zip"
            subprocess.run([*command, str(output), str(seed), "1.2.3"], check=True)
            first = output.read_bytes()
            with zipfile.ZipFile(output) as archive:
                self.assertEqual(archive.read("Armory/Armory.exe"), b"test binary")
                entries = json.loads(archive.read("Armory/vow-package.json"))["files"]
                self.assertEqual(len(entries), 34)
                for entry in entries:
                    self.assertEqual(hashlib.sha256(archive.read("Armory/" + entry["path"])).hexdigest(), entry["sha256"])
            subprocess.run([*command, str(output), str(seed), "1.2.3"], check=True)
            self.assertEqual(output.read_bytes(), first)
            (seed / "private.json").write_text("private")
            self.assertNotEqual(subprocess.run([*command, str(output), str(seed), "1.2.3"], capture_output=True).returncode, 0)
