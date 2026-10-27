#!/usr/bin/env python3
"""Creates the Airtable base "Reclutamiento Studio Complex" (tables Postulaciones and Perfiles).

Usage:   python3 tools/airtable-crear-base.py <workspaceId>     (workspaceId starts with "wsp")
Token:   read from the macOS Keychain (service airtable-studiocomplex); never printed.
Output:  the new base ID (put it in assets/mail/airtable-config.php on the server).
"""
import json
import subprocess
import sys
import urllib.request

API = "https://api.airtable.com/v0/meta/bases"


def token():
    out = subprocess.run(["security", "find-generic-password", "-s", "airtable-studiocomplex", "-w"],
                         capture_output=True, text=True)
    if out.returncode != 0 or not out.stdout.strip():
        sys.exit("No hay token en el llavero (servicio airtable-studiocomplex).")
    return out.stdout.strip()


def text(name, long=False):
    return {"name": name, "type": "multilineText" if long else "singleLineText"}


def select(name, options, colors=None):
    return {"name": name, "type": "singleSelect",
            "options": {"choices": [{"name": o} for o in options]}}


postulaciones = {
    "name": "Postulaciones",
    "description": "Etapa 1 de la búsqueda de closers: un registro por envío de la landing.",
    "fields": [
        {"name": "Email", "type": "email"},  # primary field
        text("Nombre"),
        {"name": "WhatsApp", "type": "phoneNumber"},
        text("Ciudad y país"),
        {"name": "Perfil", "type": "url"},
        select("Años cerrando ventas", ["Menos de 1 año", "De 1 a 3 años", "Más de 3 años"]),
        select("Disponibilidad", ["Media jornada", "Jornada completa"]),
        select("Vendió a pymes", ["Sí, servicios digitales", "Sí, otros servicios o productos", "Todavía no"]),
        text("Experiencia", long=True),
        {"name": "Pasa corte", "type": "checkbox", "options": {"icon": "check", "color": "greenBright"}},
        select("Estado", ["Nuevo", "En revisión", "Entrevista", "Seleccionado", "Descartado"]),
        {"name": "Puntaje", "type": "rating", "options": {"icon": "star", "max": 5, "color": "yellowBright"}},
        text("Notas internas", long=True),
        {"name": "Fecha de envío", "type": "dateTime",
         "options": {"dateFormat": {"name": "european"}, "timeFormat": {"name": "24hour"},
                     "timeZone": "America/Argentina/Buenos_Aires"}},
    ],
}

perfiles = {
    "name": "Perfiles",
    "description": "Etapa 2: formulario de perfil y video. Se vincula a Postulaciones por email.",
    "fields": [
        {"name": "Email", "type": "email"},  # primary field
        text("Día típico", long=True),
        text("Cómo se define", long=True),
        text("Experiencia comercial", long=True),
        text("Recomendaciones", long=True),
        text("Libros", long=True),
        text("Cursos", long=True),
        text("Curso con más resultado", long=True),
        text("Motivación", long=True),
        text("Motivación a largo plazo", long=True),
        text("Ocupación"),
        text("Ingreso actual (USD)"),
        text("Éxito", long=True),
        {"name": "Video", "type": "url"},
        {"name": "Sin postulación previa", "type": "checkbox", "options": {"icon": "check", "color": "redBright"}},
        {"name": "Fecha de envío", "type": "dateTime",
         "options": {"dateFormat": {"name": "european"}, "timeFormat": {"name": "24hour"},
                     "timeZone": "America/Argentina/Buenos_Aires"}},
    ],
}


def call(method, url, body, tok):
    req = urllib.request.Request(url, data=json.dumps(body).encode() if body is not None else None, method=method,
                                 headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Airtable respondió {e.code}: {e.read().decode()[:400]}")


def main():
    if len(sys.argv) != 2 or not sys.argv[1].startswith("wsp"):
        sys.exit(__doc__)
    tok = token()
    base = call("POST", API, {"name": "Reclutamiento Studio Complex", "workspaceId": sys.argv[1],
                              "tables": [postulaciones]}, tok)
    base_id = base["id"]
    post_id = base["tables"][0]["id"]
    perf = call("POST", f"{API}/{base_id}/tables", perfiles, tok)
    # Link Perfiles -> Postulaciones (created after both tables exist).
    call("POST", f"{API}/{base_id}/tables/{perf['id']}/fields",
         {"name": "Postulación", "type": "multipleRecordLinks",
          "options": {"linkedTableId": post_id}}, tok)
    print("Base creada:", base_id)
    print("Postulaciones:", post_id, "| Perfiles:", perf["id"])


if __name__ == "__main__":
    main()
