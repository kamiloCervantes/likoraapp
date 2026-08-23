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
