# Likora Monorepo

Arquitectura monorepo para la plataforma de movilidad y logística **Likora**.

## Estructura del Proyecto

```text
likora_app/
├── apps/
│   ├── passenger_app/          # Flutter: App móvil para pasajeros y clientes
│   ├── driver_app/             # Flutter: App móvil para conductores
│   └── admin_web/              # Next.js / React: Panel de control administrativo
│
├── backend/
│   ├── api/                    # NestJS REST API (Autenticación, Viajes, Pagos, PostGIS)
│   ├── socket_service/         # NestJS WebSockets + Redis Pub/Sub para Geolocalización
│   └── Dockerfile              # Contenedorización multi-servicio
│
├── packages/                   # Paquetes y librerías compartidas Dart / Flutter
│   ├── core_models/            # Modelos de dominio puros (User, Trip, Driver, Location)
│   ├── shared_ui/              # Design System, tema y componentes visuales Flutter
│   └── realtime_client/        # Cliente de tracking y WebSockets para Flutter
│
├── docker-compose.yml          # PostgreSQL + PostGIS, Redis y orquestación local
└── melos.yaml                  # Configuración de Monorepo con Melos
```

## Requisitos Previos

- [Flutter SDK](https://flutter.dev) (>= 3.0.0)
- [Melos](https://melos.invertase.dev) (`dart pub global activate melos`)
- [Node.js](https://nodejs.org) (>= 20.x)
- [Docker](https://www.docker.com) y [Docker Compose](https://docs.docker.com/compose/)

## Inicio Rápido

### 1. Levantar Infraestructura Local (Base de Datos y Redis)
```bash
docker compose up -d postgres redis
```

### 2. Gestionar Paquetes Flutter con Melos
```bash
# Bootstrap y enlazar paquetes compartidos
melos bootstrap

# Ejecutar análisis
melos run analyze
```

### 3. Backend API & Socket Service
```bash
# API NestJS
cd backend/api && npm install && npm run start:dev

# Socket Service NestJS
cd backend/socket_service && npm install && npm run start:dev
```

### 4. Admin Web (Next.js)
```bash
cd apps/admin_web && npm install && npm run dev
```
