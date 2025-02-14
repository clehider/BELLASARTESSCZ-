# BELLASARTESSCZ - Sistema de Gestión Académica

## Descripción
Sistema de gestión académica para el Instituto de Bellas Artes SCZ, desarrollado con React, Material-UI y Firebase.

## Características
- Gestión de módulos académicos
- Administración de materias
- Control de estudiantes
- Panel administrativo
- Autenticación de usuarios
- Interfaz moderna y responsive

## Tecnologías
- React
- Firebase (Authentication, Firestore)
- Material-UI
- Vite
- date-fns

## Requisitos
- Node.js
- npm
- Firebase CLI

## Instalación
```bash
# Clonar el repositorio
git clone https://github.com/clehider/BELLASARTESSCZ-.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# Iniciar en desarrollo
node ./node_modules/vite/bin/vite.js dev

# Construir para producción
node ./node_modules/vite/bin/vite.js build
src/
  ├── components/     # Componentes React
  ├── contexts/       # Contextos (Auth, etc.)
  ├── firebase/      # Configuración de Firebase
  ├── assets/        # Recursos estáticos
  └── App.jsx        # Componente principal
2. Crear .gitignore para excluir archivos innecesarios:

```bash
cat > .gitignore << 'EOL'
# Dependencias
node_modules
.pnp
.pnp.js

# Testing
coverage

# Producción
dist
build

# Misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Firebase
.firebase/
serviceAccountKey.json

# Editor
.vscode/
.idea/
*.swp
*.swo

# Sistema
.DS_Store
Thumbs.db
