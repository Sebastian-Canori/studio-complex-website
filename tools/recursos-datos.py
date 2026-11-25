# Recursos gratis del blog (lead magnets). Los usan:
#   - tools/armar-recursos.py: arma la página de cada recurso y agrega la caja
#     del recurso a las notas que lo nombran ("recurso" en blog-notas.py).
#   - tools/armar-blog.py: la misma caja, cuando se regeneran todas las notas.
# Para sumar un recurso: agregar un bloque acá, su archivo en assets/recursos/
# y la clave en SC_RECURSOS de assets/mail/recurso-form.php.

RECURSOS = {
    "checklist-tienda-online": {
        "pagina": "recurso-checklist-tienda-online.html",
        "archivo": "assets/recursos/checklist-tienda-online.pdf",
        "titulo": "Checklist: tu tienda online lista para vender",
        "titulo_seo": "Checklist gratis para tu tienda online | Studio Complex",
        "desc": "34 puntos para revisar tu tienda en Tiendanube, Shopify o WooCommerce antes de lanzar o cuando las ventas no arrancan. Descargalo gratis.",
        "bajada": "34 puntos para revisar antes de lanzar o cuando las ventas no arrancan. Sirve para Tiendanube, Shopify y WooCommerce.",
        "formato": "PDF de 2 páginas",
        "boton": "Quiero el checklist",
        # Caja dentro de las notas
        "caja": "¿Tu tienda está lista para vender?",
        "caja_sub": "Descargá gratis el checklist de 34 puntos para revisar tu tienda.",
        "caja_boton": "Descargar el checklist",
        "secciones": [
            ("Todo a tu nombre", "Plataforma, dominio, medios de cobro y accesos de medición."),
            ("Catálogo que se entiende", "Fotos, nombres, descripciones, variantes y categorías."),
            ("Cobrar sin fricción", "Pagos probados, cuotas visibles y mails de compra con tu marca."),
            ("Envíos claros", "Costo en el carrito, plazos escritos y retiro en local."),
            ("Confianza y lo que pide la ley", "Botón de arrepentimiento, Defensa del Consumidor y Data Fiscal."),
            ("Medir desde el primer día", "Compras en Analytics, Search Console, píxel de Meta y UTM."),
            ("Que Google te encuentre", "Títulos, direcciones, imágenes y redirecciones."),
            ("Atención y seguimiento", "Respuestas rápidas, carritos abandonados y consultas anotadas."),
            ("Antes de lanzar", "Prueba desde el celular, compra de alguien de afuera y plan de lanzamiento."),
        ],
        "notas": ["cuanto-cuesta-una-tienda-online", "tiendanube-shopify-o-woocommerce", "vender-cursos-online-con-acceso-automatico"],
    },
}


def caja_nota(clave, slug_nota):
    """Caja que va dentro de la nota, antes de la del servicio."""
    r = RECURSOS[clave]
    return f'''                <aside class="sc-nota-recurso">
                  <div>
                    <span class="sc-sv-eyebrow">Recurso gratis</span>
                    <p>{r['caja']}<span>{r['caja_sub']}</span></p>
                  </div>
                  <a class="sc-sv-btn primario" href="{r['pagina']}?desde={slug_nota}">{r['caja_boton']} <i class="tji-arrow-right-2" aria-hidden="true"></i></a>
                </aside>
'''
