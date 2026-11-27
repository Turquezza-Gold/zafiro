# Zafiro · Finanzas privadas

App personal para registrar gastos, controlar tarjetas y ver tu ahorro. Hecha para iPhone.

- **Privada:** tus datos se guardan solo en tu iPhone. No hay cuentas, login ni servidor, y la app tiene bloqueado conectarse a otros sitios.
- **Gratis:** se publica en GitHub Pages. No usa Supabase, Vercel ni nada que cobre.
- **Funciona sin internet** una vez instalada.

**Dirección de la app:** https://turquezza-gold.github.io/zafiro/

---

## 1. Instalar en el iPhone

1. Abre la dirección de arriba en **Safari** (tiene que ser Safari).
2. Toca el botón **Compartir** (el cuadrado con la flecha hacia arriba).
3. Baja y toca **«Agregar a inicio»**.
4. Toca **Agregar**. Aparecerá el ícono de la gema azul **Zafiro** en tu pantalla de inicio.
5. Ábrela siempre desde ese ícono: se abre a pantalla completa, sin la barra de Safari.

> Importante: usa siempre el ícono de inicio. Los datos de la app instalada son distintos de los que veas si la abres dentro de Safari.

## 2. Qué cargar primero

En **Ajustes** (botón de arriba a la derecha):

1. **BCP y Efectivo:** cuánto tienes hoy.
2. **Cada tarjeta:** deuda total actual, límite, día de corte y día de pago (y el pago mínimo si lo tienes).
3. **Plin:** elige de qué cuenta sale el dinero (hoy BBVA; si pasa a Banbif, agrega esa cuenta y cámbiala).
4. **Parámetros:** tipo de cambio (para sumar lo que está en dólares) y tu ahorro mensual.
5. **Meta del departamento:** ya viene con S/ 15,500 de cuota inicial; puedes editarla en Planes.

## 3. Registrar un gasto

- Toca **+ Gasto** (botón azul grande).
- En el campo de dictado toca el **micrófono del teclado** y di, por ejemplo: *«almuerzo 12 soles Yape»*.
- La app llena monto, cuenta y descripción. **Revisa y corrige** antes de tocar **Guardar**: nada se guarda sin que lo confirmes.
- Si falta la cuenta o la categoría, queda como **«Por confirmar»**.
- Si fue **pagado por la empresa**, activa ese interruptor: va a una lista aparte y no cuenta en tu ahorro.
- Diners: si compras en soles y te cargan en dólares, anota también el monto en US$.

## 4. Respaldo (hazlo cada semana)

1. **Ajustes → Exportar.**
2. En el menú del iPhone elige **«Guardar en Archivos» → iCloud Drive** (por ejemplo, una carpeta «Zafiro»).
3. Se guardan dos archivos: `.json` (para restaurar) y `.csv` (para abrir en Excel o Numbers).
4. Para restaurar: **Ajustes → Importar** y eliges el `.json`.

Si pasan más de 7 días sin exportar, la app muestra un aviso.

## 5. Probar con datos de ejemplo

**Ajustes → Datos de ejemplo → Cargar ejemplo.** Son datos ficticios (`ejemplo.json`).
Cuando termines, toca **Borrar ejemplo**: tus cuentas vuelven a como estaban.

---

## Para quien mantiene el código

- HTML, CSS y JavaScript puros. Sin frameworks ni build.
- Archivos: `index.html`, `app.js`, `styles.css`, `manifest.webmanifest`, `sw.js`, `icon-180.png`, `icon-512.png`, `ejemplo.json`.
- Datos en `localStorage` con la clave `zafiro.v1`. El repositorio contiene **solo código**: nunca subas un respaldo `.json` real.
- Al publicar cambios, sube el número de `CACHE` en `sw.js` (por ejemplo `zafiro-v2`) para que el iPhone descargue la nueva versión.
- Probar en la Mac: `python3 -m http.server 8080` dentro de la carpeta y abrir `http://localhost:8080`.
