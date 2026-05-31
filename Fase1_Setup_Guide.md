# Fase 1: Setup Backend con Firebase (Guía Paso a Paso)

## Estado Actual
Ya tienes el proyecto **"entrenamatch"** creado y obtuviste las credenciales de la app Web.

Las credenciales ya fueron colocadas en el archivo `.env` del proyecto.

---

## Próximos Pasos (Hazlos en orden)

### 1. Reinicia el servidor de desarrollo

Después de crear el archivo `.env`, debes reiniciar el servidor:

```powershell
cd $HOME/fitvina
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
npm run dev
```

---

### 2. Habilita los servicios en Firebase Console (Obligatorio)

Dentro del proyecto **entrenamatch**, ve al menú lateral y activa lo siguiente:

#### Authentication (Muy importante)
1. Ve a **Authentication** → **Comenzar**
2. En la pestaña **Método de acceso**, activa:
   - **Correo electrónico/contraseña**
   - **Google** (recomendado)

#### Firestore Database
1. Ve a **Firestore Database** → **Crear base de datos**
2. Elige **Iniciar en modo de prueba** (por ahora)
3. Selecciona una ubicación (puedes dejar la sugerida)

#### Storage (para subir fotos)
1. Ve a **Storage** → **Comenzar**
2. También inicia en modo de prueba

---

### 3. Próximo paso técnico (avísame cuando termines lo de arriba)

Una vez que hayas activado **Authentication**, **Firestore** y **Storage**, avísame con un mensaje como:

> "Listo, ya activé Authentication, Firestore y Storage"

En ese momento empezaremos a implementar:

- Registro e inicio de sesión real con Firebase
- Creación automática del perfil en Firestore
- Migración progresiva desde localStorage hacia Firebase

---

¿Ya activaste los tres servicios (Authentication, Firestore y Storage)? Dime en qué estado estás.
