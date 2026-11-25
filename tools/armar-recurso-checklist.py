# Arma el PDF del recurso "Checklist: tu tienda online lista para vender".
# Correr desde la raíz del repo (necesita reportlab):
#   python3 tools/armar-recurso-checklist.py
# Salida: assets/recursos/checklist-tienda-online.pdf
#
# Reglas de contenido (las mismas del blog): nada de precios, solo cosas que
# se pueden comprobar, y lenguaje de dueño de negocio.
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader, simpleSplit

SALIDA = "assets/recursos/checklist-tienda-online.pdf"
LOGO = "assets/images/logos/primary-logo.png"

# DejaVu trae acentos y eñes; Figtree no viene instalada en todas las máquinas.
for nombre, archivo in (("Texto", "DejaVuSans.ttf"), ("Negrita", "DejaVuSans-Bold.ttf")):
    for carpeta in ("/usr/share/fonts/truetype/dejavu", "/Library/Fonts", os.path.expanduser("~/Library/Fonts")):
        ruta = os.path.join(carpeta, archivo)
        if os.path.exists(ruta):
            pdfmetrics.registerFont(TTFont(nombre, ruta))
            break
    else:
        raise SystemExit(f"Falta la fuente {archivo} (instalá DejaVu Sans)")

NOCHE = HexColor("#07090c")
NARANJA = HexColor("#F2801E")
CIAN = HexColor("#22D3EE")
TINTA = HexColor("#0f1720")
GRIS = HexColor("#4d5866")
LINEA = HexColor("#e2e7ee")

SECCIONES = [
    ("1. Todo a tu nombre", [
        "La cuenta de la plataforma (Tiendanube, Shopify o WooCommerce) está a tu nombre, no al de quien la armó.",
        "El dominio está registrado a tu nombre y sabés cuándo vence.",
        "Los medios de cobro (Mercado Pago u otros) están en tu cuenta y te llegan los avisos de venta.",
        "Tenés acceso de administrador a Google Analytics y a Search Console.",
    ]),
    ("2. Catálogo que se entiende", [
        "Las fotos tienen el mismo fondo, la misma luz y el mismo encuadre.",
        "Cada producto tiene un nombre claro, como lo buscaría tu cliente.",
        "La descripción responde lo que te preguntan por WhatsApp: medidas, materiales, talles, uso.",
        "Las variantes (talle, color) y el stock están cargados y se actualizan.",
        "Las categorías tienen como mucho dos niveles y nombres que se entienden sin explicación.",
    ]),
    ("3. Cobrar sin fricción", [
        "Hiciste una compra real de punta a punta con cada medio de pago.",
        "Las cuotas y los descuentos por transferencia se ven en la ficha del producto, no solo al pagar.",
        "El mail de confirmación de compra llega con tu marca y dice qué pasa después.",
    ]),
    ("4. Envíos claros", [
        "El costo de envío se calcula en el carrito con el código postal, antes de pedir datos.",
        "Los plazos de entrega están escritos en la ficha y en el checkout.",
        "Si tenés local, ofrecés retiro y está explicado dónde y en qué horario.",
        "Sabés cómo vas a embalar y despachar un pedido el mismo día que entra.",
    ]),
    ("5. Confianza y lo que pide la ley", [
        "El botón de arrepentimiento está visible, como exige la normativa argentina para comercio electrónico.",
        "El enlace a Defensa del Consumidor y el formulario de Data Fiscal están en el pie.",
        "Hay una página de cambios y devoluciones escrita en lenguaje simple.",
        "WhatsApp, mail y horarios de atención están a la vista en todas las páginas.",
    ]),
    ("6. Medir desde el primer día", [
        "Google Analytics registra las compras, no solo las visitas.",
        "Search Console tiene el sitemap enviado y no muestra errores de indexación.",
        "El píxel de Meta está instalado si vas a pautar en Instagram o Facebook.",
        "Los links que compartís en redes llevan parámetros UTM para saber de dónde llega cada venta.",
    ]),
    ("7. Que Google te encuentre", [
        "Cada categoría y cada producto importante tiene su título y su descripción para Google.",
        "Las direcciones de las páginas son cortas y legibles (/remeras-algodon, no /prod?id=123).",
        "Las imágenes son livianas y tienen texto alternativo.",
        "Si venís de otra tienda, las direcciones viejas redirigen a las nuevas.",
    ]),
    ("8. Atención y seguimiento", [
        "Tenés respuestas rápidas guardadas para las cinco preguntas más comunes.",
        "Alguien revisa los carritos abandonados y les escribe en el día.",
        "Cada consulta queda anotada con su origen y su estado hasta que compra o se descarta.",
    ]),
    ("9. Antes de lanzar", [
        "Recorriste la tienda entera desde el celular, de la portada al pago.",
        "Le pediste a alguien de afuera que compre sin ayuda y anotaste dónde dudó.",
        "Tenés un plan para las primeras dos semanas: a quién avisás, qué publicás y cuánto pautás.",
    ]),
]

TOTAL = sum(len(i) for _, i in SECCIONES)
W, H = A4
M = 46  # margen


def cabecera(c, pagina):
    c.setFillColor(NOCHE)
    alto = 150 if pagina == 1 else 54
    c.rect(0, H - alto, W, alto, stroke=0, fill=1)
    c.setFillColor(NARANJA)
    c.rect(0, H - alto, W * 0.42, 4, stroke=0, fill=1)
    c.setFillColor(CIAN)
    c.rect(W * 0.42, H - alto, W * 0.58, 4, stroke=0, fill=1)
    if os.path.exists(LOGO):
        lh = 22 if pagina == 1 else 18
        base = H - (40 if pagina == 1 else 36)
        c.drawImage(ImageReader(LOGO), M, base, width=lh, height=lh, mask="auto")
        c.setFillColor(white)
        c.setFont("Negrita", 12 if pagina == 1 else 10.5)
        c.drawString(M + lh + 8, base + lh * 0.3, "Studio Complex")
    if pagina == 1:
        c.setFillColor(white)
        c.setFont("Negrita", 24)
        c.drawString(M, H - 84, "Tu tienda online, lista para vender")
        c.setFont("Texto", 11.5)
        c.setFillColor(HexColor("#c9d2dc"))
        c.drawString(M, H - 106, f"{TOTAL} puntos para revisar antes de lanzar o cuando las ventas no arrancan.")
        c.drawString(M, H - 122, "Sirve para Tiendanube, Shopify y WooCommerce. Tildá lo que ya tenés resuelto.")
    else:
        c.setFillColor(HexColor("#c9d2dc"))
        c.setFont("Texto", 9.5)
        c.drawRightString(W - M, H - 32, "Checklist: tu tienda online lista para vender")


def pie(c, pagina):
    c.setStrokeColor(LINEA)
    c.line(M, 40, W - M, 40)
    c.setFillColor(GRIS)
    c.setFont("Texto", 8.5)
    c.drawString(M, 27, "Studio Complex · studiocomplex.com.ar · hola@studiocomplex.com.ar · WhatsApp +54 9 11 5336-2945")
    c.drawRightString(W - M, 27, str(pagina))


def armar():
    os.makedirs(os.path.dirname(SALIDA), exist_ok=True)
    c = canvas.Canvas(SALIDA, pagesize=A4)
    c.setTitle("Checklist: tu tienda online lista para vender")
    c.setAuthor("Studio Complex")
    c.setSubject(f"{TOTAL} puntos para revisar una tienda online antes de lanzar")
    pagina = 1
    cabecera(c, pagina)
    y = H - 180
    ancho_texto = W - 2 * M - 22

    for titulo, items in SECCIONES:
        alto_seccion = 26 + sum(13 * len(simpleSplit(t, "Texto", 10, ancho_texto)) + 7 for t in items)
        if y - alto_seccion < 70:
            pie(c, pagina)
            c.showPage()
            pagina += 1
            cabecera(c, pagina)
            y = H - 90
        c.setFillColor(TINTA)
        c.setFont("Negrita", 13)
        c.drawString(M, y, titulo)
        y -= 20
        for t in items:
            lineas = simpleSplit(t, "Texto", 10, ancho_texto)
            c.setStrokeColor(NARANJA)
            c.setLineWidth(1.2)
            c.roundRect(M, y - 2.5, 11, 11, 2, stroke=1, fill=0)
            c.setFillColor(TINTA)
            c.setFont("Texto", 10)
            for i, linea in enumerate(lineas):
                c.drawString(M + 22, y - i * 13, linea)
            y -= 13 * len(lineas) + 7
        y -= 10

    # Cierre
    if y < 170:
        pie(c, pagina)
        c.showPage()
        pagina += 1
        cabecera(c, pagina)
        y = H - 90
    caja = 104
    c.setFillColor(HexColor("#fdf1e6"))
    c.roundRect(M, y - caja, W - 2 * M, caja, 10, stroke=0, fill=1)
    c.setFillColor(TINTA)
    c.setFont("Negrita", 13)
    c.drawString(M + 18, y - 28, "¿Te quedaron más de cinco sin tildar?")
    c.setFont("Texto", 10)
    texto = ("No hace falta resolver todo junto: empezá por cobros, envíos y medición. "
             "Si querés, lo miramos juntos en una reunión de 30 minutos y te decimos por dónde empezar.")
    for i, linea in enumerate(simpleSplit(texto, "Texto", 10, W - 2 * M - 36)):
        c.drawString(M + 18, y - 48 - i * 13, linea)
    c.setFillColor(NARANJA)
    c.setFont("Negrita", 10.5)
    url = "studiocomplex.com.ar/agenda.html"
    c.drawString(M + 18, y - caja + 18, "Agendá en " + url)
    c.linkURL("https://studiocomplex.com.ar/agenda.html?utm_source=recurso&utm_medium=pdf&utm_campaign=checklist-tienda-online",
              (M + 18, y - caja + 12, M + 260, y - caja + 30), relative=0)
    pie(c, pagina)
    c.save()
    total = sum(len(i) for _, i in SECCIONES)
    print(f"listo: {SALIDA} ({pagina} páginas, {total} puntos)")


if __name__ == "__main__":
    armar()
