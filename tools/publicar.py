#!/usr/bin/env python3
"""Publica el sitio en studiocomplex.com.ar (hosting Turbonube, cPanel).

Sube por FTPS solo lo que cambió desde la última publicación (según git),
en tandas por una misma conexión, así tarda segundos y no minutos.

    python3 tools/publicar.py          # solo lo que cambió
    python3 tools/publicar.py --todo   # todo el sitio
    python3 tools/publicar.py --solo a.html b.jpg   # solo esos archivos
    python3 tools/publicar.py --ver    # lista lo que subiría, sin subir

Con --solo no se toca .publicado y, tras subir, se compara el SHA-256 de cada
archivo contra lo que sirve https://studiocomplex.com.ar.

La última publicación se anota en .publicado (fuera de git). La clave vive
en el Llavero de macOS (servicio "ftp-studiocomplex"), nunca en archivos.
El servidor exige TLS 1.2: con 1.3 los archivos de +14 KB fallan con 451.
Si tocaste CSS o JS, corré antes tools/version-assets.py y commiteá: se
sube lo que está en git, para que el repo y el servidor sean lo mismo.
"""
import hashlib
import os
import urllib.request
import subprocess
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = "cumulonimbus.turbonube.com"
USUARIO = "ftproot@studiocomplex.com.ar"
SERVICIO = "ftp-studiocomplex"
EXTRA = [".htaccess", "robots.txt", "sitemap.xml"]
EXCLUIR = ("tools/", "assets/sass/", "assets/mail/", ".git", "README")
MARCA = os.path.join(RAIZ, ".publicado")
TANDA = 30


def git(*args):
    return subprocess.run(["git", *args], cwd=RAIZ, capture_output=True, text=True, check=True).stdout


def publicable(f):
    return not f.startswith(EXCLUIR) and not f.endswith(".md") and f != ".gitignore" and os.path.isfile(os.path.join(RAIZ, f))


def local(f):
    return hashlib.sha256(open(os.path.join(RAIZ, f), "rb").read()).hexdigest()


def remoto(f):
    req = urllib.request.Request("https://studiocomplex.com.ar/%s?v=%s" % (f, os.urandom(4).hex()),
                                 headers={"User-Agent": "sc-publicar", "Cache-Control": "no-cache"})
    try:
        return hashlib.sha256(urllib.request.urlopen(req, timeout=20).read()).hexdigest()
    except Exception:
        return None


def main():
    if git("status", "--porcelain").strip():
        sys.exit("Hay cambios sin commitear. Commiteá antes de publicar (se sube lo que está en git).")
    actual = git("rev-parse", "HEAD").strip()
    solo = "--solo" in sys.argv
    todo = "--todo" in sys.argv or (not solo and not os.path.exists(MARCA))
    if solo:
        archivos = [a for a in sys.argv[sys.argv.index("--solo") + 1:] if not a.startswith("--")]
        faltan = [f for f in archivos if not publicable(f)]
        if faltan:
            sys.exit("No se pueden publicar: " + ", ".join(faltan))
    elif todo:
        archivos = git("ls-files").split() + EXTRA
    else:
        previo = open(MARCA).read().strip()
        archivos = git("diff", "--name-only", previo, actual).split()
    archivos = sorted({f for f in archivos if publicable(f)})
    if not archivos:
        print("No hay cambios para publicar.")
        return
    if "--ver" in sys.argv:
        print("Subiría %d archivos:" % len(archivos))
        print("\n".join("  " + f for f in archivos))
        return

    clave = subprocess.run(["security", "find-generic-password", "-s", SERVICIO, "-a", USUARIO, "-w"],
                           capture_output=True, text=True).stdout.strip()
    if not clave:
        sys.exit("No encontré la clave en el Llavero (servicio %s)." % SERVICIO)
    netrc = tempfile.NamedTemporaryFile("w", delete=False)
    os.chmod(netrc.name, 0o600)
    netrc.write("machine %s login %s password %s\n" % (HOST, USUARIO, clave))
    netrc.close()
    errores = []
    try:
        for i in range(0, len(archivos), TANDA):
            cmd = ["curl", "-sS", "--ssl-reqd", "--tls-max", "1.2", "--ftp-create-dirs", "--netrc-file", netrc.name]
            for f in archivos[i:i + TANDA]:
                cmd += ["-T", os.path.join(RAIZ, f), "ftp://%s/public_html/%s" % (HOST, f)]
            r = subprocess.run(cmd, capture_output=True, text=True)
            if r.returncode != 0:
                errores.append(r.stderr.strip()[:200])
    finally:
        os.unlink(netrc.name)
    if errores:
        sys.exit("Errores al subir:\n" + "\n".join(errores))
    if solo:
        malos = [f for f in archivos if remoto(f) != local(f)]
        if malos:
            sys.exit("El servidor no coincide con el local en: " + ", ".join(malos))
        print("Verificado (SHA-256): %d archivos coinciden con el servidor." % len(archivos))
    else:
        open(MARCA, "w").write(actual + "\n")
    print("Publicados %d archivos en https://studiocomplex.com.ar" % len(archivos))
    for f in archivos[:15]:
        print("  " + f)
    if len(archivos) > 15:
        print("  … y %d más" % (len(archivos) - 15))


if __name__ == "__main__":
    main()
