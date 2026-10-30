import json, pathlib, shutil, sys, zipfile
source, target, seed, version = sys.argv[1:]
with zipfile.ZipFile(source) as archive:
    packages = [p for p in archive.namelist() if p.replace('\\', '/').endswith('/resources/app/package.json')]
    if len(packages) != 1:
        raise ValueError('Expected one app package')
    root = packages[0].replace('\\', '/').split('/')[0]
    package = json.loads(archive.read(packages[0]))
    if package['name'] != 'sao-armory' or package['version'] != version:
        raise ValueError('Unexpected app package')
    for name in archive.namelist():
        name = name.replace('\\', '/')
        if not name.startswith(root + '/') or '\\' in name or '..' in name.split('/') or ':' in name:
            raise ValueError('Unsafe app archive path')
shutil.copyfile(source, target)
with zipfile.ZipFile(target, 'a', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
    if any('/resources/app/seed/' in n for n in archive.namelist()):
        raise ValueError('Publish a base app ZIP without a previous seed')
    for file in pathlib.Path(seed).iterdir():
        archive.write(file, root + '/resources/app/seed/' + file.name)
print('App bundled with verified shared library.')
