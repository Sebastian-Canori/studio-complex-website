#!/usr/bin/env python3
"""Compara el repo con lo que sirve studiocomplex.com.ar (solo lectura).

Baja cada .html, .txt y .xml versionado de la raiz y compara su hash con el
archivo local. Sirve para saber si el repo y produccion estan alineados antes
de mergear o de publicar. No sube nada ni toca el servidor.

    python3 tools/comparar-con-produccion.py

Sale con codigo 1 si hay diferencias. El .htaccess no se puede leer por web
(el servidor lo protege), asi que no entra en la comparacion.
"""
import hashlib, random, subprocess, sys, urllib.request

BASE = "https://studiocomplex.com.ar/"
archivos = [f for f in subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=True).stdout.split()
            if "/" not in f and f.endswith((".html", ".txt", ".xml"))]
distintos, ausentes = [], []
for f in sorted(archivos):
    try:
        req = urllib.request.Request(f"{BASE}{f}?x={random.randint(1, 10**9)}", headers={"User-Agent": "comparar-con-produccion"})
        vivo = urllib.request.urlopen(req, timeout=30).read()
    except Exception as e:
        ausentes.append((f, str(e)[:60])); continue
    if hashlib.md5(vivo).hexdigest() != hashlib.md5(open(f, "rb").read()).hexdigest():
        distintos.append(f)
print(f"{len(archivos)} archivos versionados: {len(archivos) - len(distintos) - len(ausentes)} iguales a produccion")
for f in distintos: print("  DIFIERE :", f)
for f, e in ausentes: print("  NO ESTA EN VIVO:", f, "-", e)
sys.exit(1 if distintos or ausentes else 0)
