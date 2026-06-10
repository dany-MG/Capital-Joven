# Capital Joven - Frontend 🚀

Este es el repositorio del frontend de **Capital Joven**, una plataforma web asíncrona de administración de finanzas personales diseñada específicamente para jóvenes y estudiantes universitarios. El proyecto está construido utilizando **Astro** en modo SSR, integrado con **React** para componentes interactivos y dinámicos, **Tailwind CSS** para los estilos, **GSAP** para animaciones fluidas y el **Vercel AI SDK** para potenciar el Asesor Financiero Inteligente con Gemini.

---

## 🛠️ Tecnologías Utilizadas

* **Framework Principal:** [Astro](https://astro.build/) (Configurado en modo Server-Side Rendering - SSR)
* **Librería de Interfaz:** [React](https://react.dev/) (Integrado en islas de interactividad)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Animaciones:** [GSAP (GreenSock Animation Platform)](https://gsap.com/)
* **Manejo de Gráficos:** [Recharts](https://recharts.org/)
* **Iconografía:** [Lucide React](https://lucide.dev/)
* **Alertas e Interacciones:** [SweetAlert2](https://sweetalert2.github.io/)
* **Integración de IA:** [@ai-sdk/react](https://sdk.ai/docs) y `@ai-sdk/google` (Gemini 2.5 Flash)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu equipo:

* **Node.js:** Versión `18.x` o superior recomendada.
* **Gestor de paquetes:** `pnpm` (puedes instalarlo con `npm install -g pnpm` si aún no lo tienes).
* **Backend Activo:** Este frontend requiere que el servidor en FastAPI (`Capital Joven API`) esté corriendo simultáneamente en `http://localhost:8000`.

---

## 🚀 Instalación y Configuración

Sigue estos pasos para clonar el proyecto e instalar las dependencias correctamente:

### 1. Clonar el repositorio e ingresar a la carpeta
```bash
git clone https://github.com/dany-MG/Capital-Joven
cd [Tu-ruta-a-CapitalJoven]/frontend
```

### 2. Instala dependencias
Instala todos los modulos definidos en el `package.json` usando `pnpm`:
```bash
pnpm install
```

### 3. Configura las variables de entorno `.env`
El SDK de Vercel y el endpoint de Gemini requieren una clave de API válida de Google AI Studio para operar de manera local. Crea un archivo llamado `.env` en la raíz de este directorio frontend y añade tu clave:
```Fragmento de código
# Clave secreta para habilitar el streaming con Gemini 2.5 Flash
GOOGLE_API_KEY=tu_gemini_api_key_aqui
```

## 💻 Ejecución en Entorno de Desarrollo
Para iniciar un servidor de desarrollo local de Astro, ejecute el siguiente comando:
```bash
pnpm dev
```
Por defecto, Astro intentará levantar el entorno en el puerto `4321` o en el puerto configurado en el archivo `config.py` del backend (`http://localhost:5173`).
Si requieres forzar a Astro a correr específicamente en el puerto whiteleado de los CORS (`5173`), utiliza:
```bash
pnpm dev --port 5173
```
## 📁 Estructura principal del proyecto
La arquitectura del código está modularizada para facilitar el mantenimiento y la inyección asíncrona de datos:
```Estructura
src/
├── components/
│   └── Dashboard/
│       ├── MainApp.jsx            # Contenedor principal de la app y sincronización de datos con FastAPI
│       ├── SideBar.jsx            # Menú de navegación lateral con control de pestañas dinámicas
│       ├── HomeView.jsx           # Tablero principal con métricas financieras reales del mes
│       ├── TransactionsView.jsx   # Historial, altas, modificaciones y bajas de ingresos/egresos
│       ├── AnalysisView.jsx       # Análisis de presupuesto persistente en LocalStorage y gráficas de Pie/Barra
│       ├── SavingsView.jsx        # Gestión de metas de ahorro e inyección bidireccional de abonos
│       ├── AssesorView.jsx        # Chatbot interactivo con persistencia de historial y contexto real del usuario
│       ├── TipsView.jsx           # Sección educativa y calculadora avanzada de Fondo de Emergencia
│       └── SettingsView.jsx       # Panel de configuración y actualización del perfil del estudiante
└── pages/
    └── api/
        └── gemini.js              # Endpoint de la API Edge para procesar las peticiones del Asesor IA
```

## 🔑 Características Clave Sincronizadas
* **Autenticación Compartida**: Todas las peticiones fetch hacia el backend de FastAPI incluyen la propiedad credentials: 'include' para enviar de forma automática e integrada la cookie de sesión segura session_token.

* **Persistencia del Asesor IA**: La vista AssesorView.jsx sincroniza de forma automatizada los mensajes en el localStorage del navegador. Al cambiar de pestaña o refrescar el sitio, la conversación no se borra.

* **Onboarding Inteligente**: Al detectar un usuario nuevo sin transacciones, se dispara un modal de bienvenida que registra su fuente de ingresos inicial y define automáticamente su presupuesto mensual base en el navegador de manera interactiva.

* **Abonos Bidireccionales**: Al aportar saldo a una meta de ahorro en SavingsView.jsx, la lógica impacta el backend agregando un registro a la tabla de transacciones de forma asíncrona y transparente.





