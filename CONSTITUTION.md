# Constitución del Proyecto TANKU ("Nido - Experiencia de Regalos Interactivos")

1. **Stack & Módulos**:
   - **Backend**: NestJS modular (`src/gifts`, `src/payments`, `src/ai`, `src/products`, `src/prisma`, `src/common`), TypeScript estricto.
   - **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, `socket.io-client`, `lucide-react`, `canvas-confetti`.
   - **Base de Datos & ORM**: PostgreSQL 16 con Prisma ORM.

2. **Metodología SDD (Specification-Driven Development)**:
   - Todo desarrollo o cambio funcional debe partir de la especificación técnica en [SDD.md](file:///d:/proyectos%20propios/tanku/SDD.md) y de la documentación en [docs/](file:///d:/proyectos%20propios/tanku/docs).
   - Prohibido codificar endpoints, modelos o interfaces sin haber definido primero su contrato y caso de uso.

3. **Capas & SRP (Single Responsibility Principle)**:
   - Flujo estricto en Backend: Controlador HTTP / WebSocket Gateway -> DTO (`class-validator`) -> Servicio de Dominio -> Prisma Client.
   - Flujo estricto en Frontend: Páginas de App Router (`app/`) -> Componentes Modulares de Presentación (`components/`) -> Hooks de Lógica y WebSockets (`hooks/`) -> Servicios de Cliente HTTP (`services/`).
   - Prohibido mezclar lógica de orquestación de sockets o persistencia dentro de componentes visuales.

4. **Tipado Estricto**:
   - Prohibido el uso de `any`, `unknown` sin guarda de tipos y `Promise<any>`.
   - Todas las entidades, payloads de Socket.io y DTOs deben tener contratos fuertemente tipados.

5. **Persistencia & Prisma ORM**:
   - Toda interacción con la base de datos se realiza a través de `PrismaService`.
   - Prohibido ejecutar Raw SQL no parametrizado (`$queryRawUnsafe`). Todos los modelos deben reflejarse fielmente en [schema.prisma](file:///d:/proyectos%20propios/tanku/backend/prisma/schema.prisma).

6. **Arquitectura en Tiempo Real (Socket.io)**:
   - Toda interacción colaborativa (cambio de estado de pago, apertura de regalo, selección de variante en cápsula y reacción de unboxing) debe emitirse a salas individuales bajo el patrón `gift:{giftOrderId}`.
   - Tanto el emisor (Mateo) como el receptor (Valentina) deben recibir eventos inmediatos con payload tipado.

7. **Resiliencia e Inteligencia Artificial (Gemini & Fallback)**:
   - Todo asistente de IA (generación de dedicatorias y pistas secretas) debe implementar una estrategia de fallback determinista inteligente.
   - La aplicación debe ser 100% operativa y autónoma aun en ausencia de `GEMINI_API_KEY` o ante errores de cuota/red.

8. **Simulación de Pagos y Máquina de Estados**:
   - El checkout simulado debe soportar de forma determinista y auditable los estados `PENDING`, `APPROVED` y `REJECTED`.
   - Cada transición debe crear un registro inmutable en `PaymentTransaction` y notificar en vivo vía WebSockets.

9. **Transparencia, Explicabilidad y Uso Ético de IA**:
   - Todo uso de herramientas de IA generativa (Antigravity IDE, Claude, Cursor, Copilot) debe estar documentado en [README.md](file:///d:/proyectos%20propios/tanku/README.md).
   - Se debe dominar y poder explicar minuciosamente cada línea de código, arquitectura y decisión técnica en la entrevista.

10. **Documentación, Calidad e Idioma**:
    - Toda la comunicación, documentación, comentarios de código y nombres de dominio en la solución deben realizarse en **español**.
    - Todo cambio relevante debe registrarse en la carpeta [docs/](file:///d:/proyectos%20propios/tanku/docs).
