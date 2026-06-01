# Capital Joven - Backend

Backend desarrollado con **FastAPI** para un servicio de administración de finanzas personales (Capital joven)

## Características

- **API REST** con FastAPI
- **Base de datos** MongoDB Atlas
- **Cuentas de usuario** para manejar la autenticidad de los usaurios
- **Arquitectura** en capas (Presentación, Lógica, Datos)

## Tecnologías

- **Python**
- **FastAPI** - Framework web moderno
- **MongoDB** - Base de datos NoSQL
- **Motor** - Driver asíncrono para MongoDB
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI

## Estructura del Proyecto

backend_guia_politecnica/

├── app/

│ ├── api/routes/ # Endpoints

│ ├── services/ # Lógica de negocio

│ ├── schemas/ # Modelos Pydantic

│ └── core/ # Configuración

│ └── deps/ # Dependencias

│ └── middleware/ # Middleware

└── requirements.txt # Dependencias

## Instalación

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/erick-0511/Capital_Joven_backend.git
   
2. **Entorno virtual**
   ```bash
   python -m venv venv
   ```
   ```bash
   source venv/bin/activate  # Linux/Mac
   ```
   ```bash
   venv\Scripts\activate     # Windows
   ```

3. **Instalación de dependencias**
   ```bash
   pip install -r requirements.txt

4. **Ejecución del servidor**
   ```bash
   python main.py

## Documentación automática
1. **http://localhost:8000/docs**

2. **http://localhost:8000/redoc**