# Contenido de las notas del blog de Studio Complex.
# Cada nota: slug, categoría, servicio relacionado, título, bajada, minutos
# de lectura, portada (clave para el generador) y cuerpo en HTML simple
# (h2, p, ul, blockquote). El armado de las páginas lo hace armar-blog.py.

NOTAS = [
{
"slug": "lanzar-producto-o-servicio-con-marca-personal",
"cat": "Marca personal",
"serv": ("servicio-desarrollo-web.html", "Desarrollo Web"),
"titulo": "Cómo lanzar un producto o un servicio con tu marca personal",
"bajada": "Un curso, una mentoría o una consultoría necesitan más que seguidores. Estos son los pasos, en orden, para pasar de la audiencia a las ventas.",
"min": 6,
"portada": "marca",
"fecha": ("2026-10-06", "6 oct 2026"),
"cuerpo": """
<p><b>Respuesta corta:</b> para lanzar algo con tu marca personal necesitás cinco cosas, en este orden: una oferta que se entienda en una frase, una página propia que la explique, una forma de medir qué funciona, tráfico que no dependa de una sola red social y un seguimiento de cada consulta. Las redes traen atención. La web es donde esa atención se convierte en venta.</p>

<h2>1. Una oferta que se entienda en una frase</h2>
<p>Antes de pensar en diseño o en anuncios, escribí en una línea qué vendés, para quién y qué cambia en esa persona después de comprarte. "Mentoría de ocho semanas para que un diseñador consiga sus primeros clientes" funciona. "Acompañamiento integral de crecimiento profesional" no le dice nada a nadie. Si la frase no sale clara, ningún sitio la va a arreglar.</p>

<h2>2. Una página propia, no el link de la bio</h2>
<p>Un link con ocho botones obliga a elegir antes de entender. Lo que convierte es una página que cuente, en este orden: qué es, para quién es, qué incluye, cuánto cuesta o cómo se accede, y un único botón para dar el siguiente paso. Cuando el contenido ya está definido, una página así se puede tener lista en 48 horas. Lo que más demora no es la web: es decidir la oferta.</p>

<h2>3. Tu nombre y tu dominio, que son tuyos</h2>
<p>Una marca personal vive de que te encuentren por tu nombre. Registrá el dominio con tu nombre o el de tu proyecto, y armá la web para que, al buscarte en Google, aparezca primero tu sitio y no un perfil que no controlás. Un sitio bien armado también le explica a los buscadores y a las herramientas de IA quién sos, qué ofrecés y dónde trabajás, y eso suma para que te recomienden.</p>

<h2>4. Medir desde el primer día</h2>
<p>Si lanzás sin medir, no vas a saber cuál publicación trajo consultas ni cuánto costó cada una. Alcanza con saber cuántas personas llegan a la página, cuántas tocan el botón de WhatsApp o completan el formulario, y desde dónde vinieron. Con eso, la segunda semana ya decidís con datos y no por intuición.</p>

<h2>5. Tráfico que no dependa de un algoritmo</h2>
<p>Publicar contenido ayuda, pero un cambio en la red social puede dejarte sin alcance de un día para el otro. Combiná tres fuentes: contenido orgánico, una pauta chica en Meta o Google que lleve directo a tu página, y una lista de contactos propia (email o WhatsApp) para volver a hablarles. Para un lanzamiento, una pauta acotada y bien medida suele dar más información que meses de publicaciones.</p>

<h2>6. Responder rápido y dar seguimiento</h2>
<p>En servicios y mentorías, la venta casi siempre se cierra por conversación. Quien escribe y no recibe respuesta en el día, compra en otro lado. Dejá un único canal de contacto, respondé con un mensaje que ordene los próximos pasos y anotá cada consulta con su origen y su estado. Es un trabajo simple, pero es donde más ventas se pierden.</p>

<h2>Errores que vemos seguido</h2>
<ul>
<li>Lanzar sin página propia y mandar todo a mensajes directos.</li>
<li>Explicar la trayectoria y no el resultado que consigue el cliente.</li>
<li>Pagar anuncios sin haber definido qué se mide.</li>
<li>Tener tres ofertas distintas en la misma página.</li>
<li>No contestar las consultas fuera del horario de trabajo.</li>
</ul>

<blockquote>Tu marca personal consigue que te presten atención. Tu sitio consigue que esa atención termine en una venta.</blockquote>

<h2>Por dónde empezar esta semana</h2>
<p>Escribí la oferta en una frase, definí el único botón que querés que la gente toque y armá la página alrededor de eso. Todo lo demás (anuncios, contenido, automatizaciones) se apoya en esa base. Si querés que la armemos juntos, la web, el posicionamiento y las campañas son justo lo que hacemos.</p>
"""
},
{
"slug": "senales-web-necesita-redisenio",
"cat": "Desarrollo web",
"serv": ("servicio-desarrollo-web.html", "Desarrollo Web"),
"titulo": "Cinco señales de que tu web ya no está a la altura de tu empresa",
"bajada": "La empresa creció, cambió lo que vende y hasta el equipo es otro. Si la web sigue igual que hace años, está contando una historia que ya no es la tuya.",
"min": 5,
"portada": "web",
"cuerpo": """
<p>Casi nadie rediseña su sitio porque se aburrió del color. Se rediseña porque el sitio empezó a jugar en contra: el cliente llega, no entiende qué hacés o no encuentra cómo escribirte, y se va a la competencia sin que te enteres. Estas son las cinco señales que más vemos.</p>

<h2>1. Tus vendedores mandan el PDF en vez del link</h2>
<p>Si cuando un cliente pide información tu equipo prefiere mandar una presentación o un catálogo en PDF, es porque la web no explica bien lo que vendés. El sitio tendría que ser lo primero que compartís, no lo que evitás compartir.</p>

<h2>2. En el teléfono se ve chico, lento o desarmado</h2>
<p>La mayoría de las visitas llegan desde el celular, muchas veces con datos móviles. Abrí tu sitio en tu teléfono, fuera del wifi de la oficina, y contá cuánto tarda en mostrar algo útil. Si tenés que hacer zoom para leer o el botón de contacto queda escondido, el sitio está pensado para una pantalla que tu cliente no usa.</p>

<h2>3. Para cambiar un precio o una foto tenés que llamar a alguien</h2>
<p>Una web que no podés actualizar vos envejece rápido. Si cada cambio depende de un proveedor que tarda una semana, el sitio termina con precios viejos, servicios que ya no das y novedades de hace dos años.</p>

<h2>4. No sabés cuántas consultas trae por mes</h2>
<p>Si no tenés medido cuántas personas tocan el botón de WhatsApp o completan el formulario, no podés saber si la web funciona. Y lo que no se mide no se mejora: cualquier decisión sobre el sitio pasa a ser una cuestión de gusto.</p>

<h2>5. La web habla de la empresa y no del cliente</h2>
<p>"Somos una empresa líder con años de trayectoria" no le dice nada al que busca resolver un problema. El que entra quiere saber tres cosas en pocos segundos: qué hacés, si es para él y cómo empezar. Si la primera pantalla no responde eso, el resto del sitio no importa.</p>

<blockquote>Una buena web no se mide por lo linda que es. Se mide por cuántas personas terminan escribiéndote.</blockquote>

<h2>Qué hacer si te reconociste en dos o más</h2>
<p>No siempre hace falta tirar todo y empezar de cero. A veces alcanza con reordenar el contenido, acelerar la carga y dejar el contacto siempre a mano. Otras veces conviene migrar a otra plataforma. Lo primero es mirar el sitio con datos: qué páginas se visitan, desde dónde llegan y dónde se van.</p>
"""
},
{
"slug": "tiendanube-shopify-o-woocommerce",
"cat": "Tiendas online",
"serv": ("servicio-tiendas-online.html", "Tiendas Online"),
"titulo": "Tiendanube, Shopify o WooCommerce: cómo elegir la plataforma de tu tienda",
"bajada": "Las tres sirven para vender online. La diferencia está en cuánto pagás por mes, en qué países vendés y en quién va a manejar la tienda todos los días.",
"min": 6,
"portada": "tiendas",
"cuerpo": """
<p>La pregunta que más nos hacen antes de armar una tienda es cuál plataforma conviene. No hay una respuesta única, pero sí hay tres preguntas que la ordenan: dónde vendés, cuántos productos tenés y quién va a cargar los pedidos y los precios.</p>

<h2>Tiendanube: rápida de arrancar y pensada para la región</h2>
<p>Tiene integrados los medios de pago y de envío que se usan en Latinoamérica, y el panel es simple para cualquier persona del equipo. Es la opción más directa si vendés en un solo país y querés salir a vender rápido. Cuando necesitás algo que la plataforma no trae, se puede programar a medida sobre el tema.</p>

<h2>Shopify: muy completa, con miles de aplicaciones</h2>
<p>Brilla cuando vendés en varios países o en varias monedas, o cuando necesitás funciones avanzadas que resuelve una aplicación de su tienda. Tiene un costo mensual más alto y varias funciones se pagan aparte, así que conviene hacer bien la cuenta antes de elegirla.</p>

<h2>WooCommerce: la tienda dentro de WordPress</h2>
<p>No tiene abono de plataforma: pagás el alojamiento y los complementos que uses. Es muy flexible para catálogos con reglas propias, como precios mayoristas o productos a medida, y se integra con el contenido de un sitio WordPress. A cambio, necesita más mantenimiento técnico.</p>

<h2>Las preguntas que ordenan la decisión</h2>
<ul>
<li><strong>¿En cuántos países vendés?</strong> Uno solo: Tiendanube o WooCommerce. Varios: Shopify.</li>
<li><strong>¿Quién la va a manejar?</strong> Si es alguien sin perfil técnico, conviene la plataforma más simple.</li>
<li><strong>¿Tu catálogo tiene reglas especiales?</strong> Mayorista, cotización o productos configurables suelen pedir WooCommerce o desarrollo a medida.</li>
<li><strong>¿Cuánto podés pagar por mes?</strong> Sumá el abono, las comisiones por venta y las aplicaciones que vas a necesitar.</li>
</ul>

<blockquote>La mejor plataforma es la que tu equipo va a poder manejar solo, sin depender de nadie para subir un producto.</blockquote>

<h2>Si ya tenés tienda y te queda chica</h2>
<p>Mudarse de plataforma es posible sin empezar de cero: se pasan productos, fotos y categorías, y se redirigen las direcciones viejas para no perder lo que ya tenías posicionado en Google. La clave es tener la tienda nueva lista antes de apagar la vieja.</p>
"""
},
{
"slug": "seo-tecnico-antes-que-el-contenido",
"cat": "SEO",
"serv": ("servicio-seo-tecnico.html", "SEO Técnico"),
"titulo": "Por qué el SEO técnico va antes que escribir notas para Google",
"bajada": "Publicar contenido en un sitio que Google no puede leer bien es como imprimir folletos y dejarlos en un cajón. Primero se ordena la casa.",
"min": 5,
"portada": "seo",
"cuerpo": """
<p>Cuando alguien quiere aparecer en Google, lo primero que suele hacer es escribir notas para un blog. No está mal, pero si el sitio tiene problemas técnicos, esas notas no van a rendir. El SEO técnico es lo que le permite a Google encontrar, entender y mostrar tu sitio.</p>

<h2>Que Google encuentre todas tus páginas</h2>
<p>Es más común de lo que parece: páginas importantes que Google nunca indexó porque no tienen enlaces internos, porque quedaron bloqueadas por error o porque el sitio no tiene un mapa ordenado. En Search Console se ve qué páginas están en Google y cuáles no, y por qué.</p>

<h2>Que entienda de qué trata cada una</h2>
<p>Cada página necesita su propio título y su propia descripción, escritos como busca tu cliente. Si diez páginas tienen el mismo título, Google no sabe cuál mostrar y termina sin mostrar ninguna.</p>

<h2>Que cargue rápido</h2>
<p>Google tiene en cuenta la velocidad, sobre todo en el teléfono. Imágenes pesadas, fuentes de más y complementos que nadie usa son los sospechosos de siempre. Medir con PageSpeed Insights antes y después de cada cambio muestra qué mejoró.</p>

<h2>Que sepa qué tipo de negocio sos</h2>
<p>Los datos estructurados son un código invisible para el visitante que le dice a Google qué es tu empresa, dónde atiende y qué preguntas responde. Además de ayudar en los resultados, hoy también los leen los asistentes de inteligencia artificial cuando alguien les pregunta por un proveedor.</p>

<blockquote>El contenido trae visitas. El SEO técnico hace que esas visitas puedan llegar.</blockquote>

<h2>El orden que recomendamos</h2>
<ul>
<li>Auditoría técnica: qué está frenando al sitio y en qué orden resolverlo.</li>
<li>Arreglos de base: indexación, títulos, velocidad y datos estructurados.</li>
<li>Recién después, contenido nuevo para las búsquedas que traen clientes.</li>
</ul>
<p>El SEO lleva tiempo, y desconfiá de quien te garantice el primer puesto: el orden lo decide Google. Lo que sí se puede asegurar es que tu sitio cumpla todo lo que Google pide.</p>
"""
},
{
"slug": "antes-de-invertir-en-google-ads",
"cat": "Publicidad",
"serv": ("servicio-campanas-ads.html", "Campañas de Ads"),
"titulo": "Antes de poner un peso en Google Ads, dejá medido esto",
"bajada": "Una campaña sin medición gasta igual que una medida. La diferencia es que a fin de mes no sabés qué te trajo, y no tenés cómo mejorarla.",
"min": 4,
"portada": "ads",
"cuerpo": """
<p>Crear una campaña en Google Ads lleva unos minutos. Lo que lleva más trabajo, y es lo que decide si la plata rinde, es preparar todo lo que va alrededor. Esta es la lista que revisamos antes de lanzar cualquier campaña.</p>

<h2>1. Qué cuenta como resultado</h2>
<p>Definí qué acción querés que haga el visitante: escribir por WhatsApp, completar un formulario, llamar o comprar. Cada una se mide distinto, y si no está medida, Google optimiza a ciegas y te trae clics en lugar de clientes.</p>

<h2>2. La medición funcionando de verdad</h2>
<p>No alcanza con instalar la etiqueta. Hay que hacer una prueba: tocar el botón de WhatsApp, mandar el formulario, hacer una compra, y verificar que cada conversión llegue a la cuenta. Es el paso que más se saltea y el que más plata ahorra.</p>

<h2>3. Las búsquedas que no querés pagar</h2>
<p>Si vendés un servicio, no querés pagar por alguien que buscó "gratis", "curso" o "empleo". Esas palabras negativas se cargan antes de salir y se revisan todas las semanas mirando qué buscó realmente la gente que hizo clic.</p>

<h2>4. La página a la que llega el clic</h2>
<p>El anuncio promete algo; la página tiene que cumplirlo en la primera pantalla. Si el anuncio habla de un producto y el clic lleva al inicio del sitio, el visitante tiene que buscar de nuevo, y muchos no lo hacen.</p>

<h2>5. Dónde y cuándo aparecer</h2>
<p>Si atendés en una zona, limitá la campaña a esa zona. Si solo respondés en horario comercial, pensá si te conviene aparecer a las tres de la mañana.</p>

<blockquote>Cada peso que va a una campaña medida deja un dato. Cada peso que va a una campaña sin medir se va.</blockquote>

<h2>Y después del lanzamiento</h2>
<p>Las campañas mejoran mucho entre el primer y el tercer mes, a medida que acumulan datos. Revisar búsquedas, anuncios y presupuesto cada semana es lo que convierte una campaña que gasta en una que vende.</p>
"""
},
{
"slug": "repartir-consultas-whatsapp-entre-asesores",
"cat": "Automatización",
"serv": ("servicio-automatizacion-leads.html", "Automatización de Leads"),
"titulo": "Cómo repartir las consultas de WhatsApp entre tu equipo sin pagar la API",
"bajada": "Si todas las consultas le llegan a la misma persona, o cada asesor tiene su botón y nadie sabe cuántas atiende el otro, hay una forma más ordenada de hacerlo.",
"min": 5,
"portada": "auto",
"cuerpo": """
<p>Un problema que vemos seguido en empresas con equipo comercial: el botón de WhatsApp de la web lleva a un solo número, y esa persona se satura. O al revés, hay un botón por asesor, el visitante elige al azar y la carga queda despareja. En los dos casos se pierden consultas.</p>

<h2>La idea: un repartidor en el medio</h2>
<p>En lugar de que el botón lleve a un número fijo, lleva a un pequeño sistema que decide a quién le toca la consulta y abre el chat con esa persona. El visitante no nota la diferencia: toca el botón y le aparece el WhatsApp de un asesor, como siempre.</p>

<h2>Cómo decide a quién le toca</h2>
<ul>
<li><strong>Por turno:</strong> la primera consulta al asesor 1, la segunda al 2, y así.</li>
<li><strong>Por zona o por producto:</strong> según desde qué página llegó el visitante.</li>
<li><strong>Por horario:</strong> solo entre los asesores que están trabajando en ese momento.</li>
</ul>

<h2>No hace falta la API de WhatsApp</h2>
<p>La API oficial sirve para que un sistema responda mensajes en automático dentro del chat. Para repartir consultas no hace falta: el repartidor funciona con los WhatsApp comunes de cada asesor.</p>

<h2>El registro que se arma solo</h2>
<p>Cada vez que alguien toca el botón, el repartidor anota en una planilla la fecha, a qué asesor le tocó y desde qué página llegó. Si el visitante vino de un anuncio, también guarda de qué campaña. Con eso, a fin de mes sabés cuántas consultas entraron, cómo se repartieron y qué inversión las trajo.</p>

<blockquote>Una consulta que espera dos horas ya le escribió a tu competencia. Repartirlas bien es la forma más barata de vender más.</blockquote>

<h2>Por dónde empezar</h2>
<p>Contá cuántos botones de WhatsApp tiene tu sitio y a qué números llevan. Si son varios y nadie sabe cuántas consultas entran por cada uno, ese es el primer lugar para ordenar.</p>
"""
},
{
"slug": "ventas-que-se-pierden-despues-del-presupuesto",
"cat": "Ventas",
"serv": ("servicio-cierre-de-ventas.html", "Cierre de Ventas"),
"titulo": "Las ventas que se pierden después de mandar el presupuesto",
"bajada": "El cliente pidió precio, se lo mandaste y no contestó más. Casi nunca es un no: es una venta que nadie volvió a buscar.",
"min": 4,
"portada": "cierre",
"cuerpo": """
<p>Pasa en todos los rubros. Llega una consulta, se arma el presupuesto con dedicación, se manda, y después silencio. El vendedor supone que el cliente no está interesado y pasa a la siguiente. En muchos casos, el cliente simplemente se distrajo, estaba comparando o esperaba que alguien le volviera a escribir.</p>

<h2>Por qué no se hace el seguimiento</h2>
<p>No es falta de ganas. Es que el seguimiento depende de la memoria de cada vendedor. Con diez presupuestos abiertos se puede; con cincuenta, algunos se caen. Y los que se caen no avisan.</p>

<h2>Tres cosas que cambian el resultado</h2>
<ul>
<li><strong>Cada presupuesto con una próxima fecha.</strong> Cuando se manda, se agenda cuándo volver a escribir.</li>
<li><strong>Mensajes pensados de antemano.</strong> El segundo contacto no es "¿pudiste ver el presupuesto?", sino algo que aporte: una duda frecuente resuelta, una foto del trabajo, un plazo de entrega.</li>
<li><strong>Un lugar donde se ve todo.</strong> Un tablero con cada oportunidad por etapa muestra qué está trabado y a quién hay que escribir hoy.</li>
</ul>

<h2>Registrar por qué se pierde</h2>
<p>Cuando una venta no se da, anotar el motivo cambia todo: precio, plazo, se fue a la competencia, no contestó. A los pocos meses aparece un patrón, y ahí se sabe si hay que mejorar la oferta o el seguimiento.</p>

<blockquote>El que pidió un presupuesto casi nunca dice que no. Deja de contestar. Con un segundo y un tercer mensaje a tiempo, una parte de esas ventas vuelve.</blockquote>

<h2>No hace falta un sistema caro para empezar</h2>
<p>Para un equipo chico, una planilla bien armada con recordatorios alcanza. Cuando el volumen crece, conviene un CRM configurado con las etapas de tu venta. Lo importante no es la herramienta, sino que el seguimiento deje de depender de la memoria.</p>
"""
},
]
