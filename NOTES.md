Siguientes pasos recomendados cuando desees comenzar el desarrollo:

Infraestructura local:
bash
docker compose up -d postgres redis
Instalación de Melos (solo se hace una vez en el sistema):
bash
dart pub global activate melos
Vincular paquetes Flutter/Dart con Melos:
bash
melos bootstrap
# En lugar de solo 'melos bootstrap':
dart run melos bootstrap
Ejecutar backend API / WebSockets:
bash
cd backend/api && npm install && npm run start:dev
cd backend/socket_service && npm install && npm run start:dev
Ejecutar Admin Web:
bash
cd apps/admin_web && npm install && npm run dev

2. ¿Cómo compilar y ejecutar passenger_app y driver_app?
Una vez hecho el bootstrap, compilar y ejecutar las aplicaciones se hace de forma estándar con Flutter:

Opción A: Ejecutar en emulador / dispositivo físico en modo desarrollo
Para la App de Pasajeros:

bash
cd apps/passenger_app
flutter run
Para la App de Conductores:

bash
cd apps/driver_app
flutter run
Opción B: Compilar para Producción (Release)
Android (APK o App Bundle):
bash
# Compilar APK del Pasajero
cd apps/passenger_app
flutter build apk --release
# Compilar APK del Conductor
cd apps/driver_app
flutter build apk --release
(El archivo generado quedará en apps/<app_name>/build/app/outputs/flutter-apk/app-release.apk)

iOS (IPA / Runner):
bash
cd apps/passenger_app
flutter build ipa
Opción C: Usar comandos globales con Melos desde la raíz
Desde la raíz del proyecto (likora_app/), puedes ejecutar tareas en todas las apps a la vez con los scripts definidos en 

melos.yaml
:

bash
# Analizar código de todas las apps y paquetes
melos run analyze
# Ejecutar tests de todo el monorepo
melos run test
# Limpiar build caches de todas las apps
melos run clean


subst L: \\wsl.localhost\Ubuntu-24.04\home\gatewayit\external\likora_app 
permite crear una unidad temporal para ejecutar flutter run



 Guía de Testing Local Paso a Paso
. Iniciar Base de Datos y Caché (Docker)
En la terminal de WSL:

bash
cd /home/gatewayit/external/likora_app
docker compose up -d postgres redis
Esto levantará PostgreSQL con PostGIS (puerto 5432) y Redis (puerto 6379).

2. Iniciar la API Central (backend/api)
En una pestaña de WSL:

bash
cd /home/gatewayit/external/likora_app/backend/api
npm run start:dev
La API quedará escuchando en http://localhost:3000/api/v1 con recarga en caliente y sincronización TypeORM automática.

3. Iniciar el Microservicio de WebSockets (backend/socket_service)
En otra pestaña de WSL:

bash
cd /home/gatewayit/external/likora_app/backend/socket_service
npm run start:dev
El servicio de WebSockets quedará escuchando en http://localhost:3001 conectado a Redis.

4. Iniciar el Panel Backoffice (apps/admin_web)
En otra pestaña de WSL:

bash
cd /home/gatewayit/external/likora_app/apps/admin_web
npm run dev
Accede desde tu navegador en Windows a: http://localhost:3002/admin/kyc.

5. Ejecutar la App Móvil Flutter (apps/passenger_app)
En tu terminal de PowerShell en Windows:

powershell
# 1. Asegurar la unidad virtual para evitar rutas UNC
subst L: \\wsl.localhost\Ubuntu-24.04\home\gatewayit\external\likora_app
# 2. Correr la app móvil
cd L:\apps\passenger_app
flutter run
🧪 Checklist de Pruebas de las 4 Fases
Fase	Qué Probar	Resultado Esperado
Fase 1 & 2	POST /auth/register y POST /auth/login	Emite Access Token (15m) + Refresh Token (7d) y guarda sesión en Redis/DB.
Fase 3	Probar POST /orders/checkout-test con token nuevo	Debe responder 403 Forbidden (bloqueo por no tener KYC verificado).
Fase 3	Enviar fecha de menor de edad en POST /kyc/submit	Cuenta pasa a BLOCKED_UNDERAGE y rechaza con 403 Forbidden.
Fase 4	Abrir http://localhost:3002/admin/kyc	Ver solicitudes pendientes, inspeccionar fotos con zoom/rotación y hacer clic en Aprobar.
Fase 4	En tiempo real con WebSockets	El cliente móvil recibe kyc:status_updated y desbloquea el botón de pago en el carrito de inmediato.
💡 ¿Cuándo pasar a la VPS?
Una vez que hayas verificado este circuito completo en local, el paso a la VPS será simplemente clonar, configurar tu archivo .env de producción y levantar con docker compose --profile full up -d.

Lo siguiente permite hacer puente con la api de Wsl desde el telefono

adb reverse tcp:3000 tcp:3000
adb reverse tcp:3001 tcp:3001

& "C:\Users\Gateway\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:3000 tcp:3000; & "C:\Users\Gateway\AppData\Local\Android\Sdk\platform-tools\adb.exe" reverse tcp:3001 tcp:3001
