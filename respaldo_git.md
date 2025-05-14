
# 🧠 Chuleta Git: Respaldos y Revisión de Cambios

## 🔄 Flujo Básico para Hacer Respaldos

```bash
# 1. Verifica el estado actual del proyecto
git status

# 2. Añade todos los cambios al área de preparación
git add .

# 3. Haz un commit con un mensaje descriptivo
git commit -m "Descripción de los cambios"

# 4. Sube los cambios a GitHub
git push
```

---

## 📜 Ver el Historial de Cambios

```bash
git log --oneline
```

Ejemplo de salida:

```
d3f1a2c Agrego autenticación de usuario
9a7b5c8 Ajuste de diseño en el footer
b12f6d0 Primer commit del frontend
```

---

## 🧪 Volver Atrás a un Punto Específico

### 👉 1. Ver temporalmente un commit anterior (modo lectura)

```bash
git checkout b12f6d0
```

> Saldrás de la rama actual y entrarás en estado “detached HEAD”.

---

### 👉 2. Volver permanentemente a un commit anterior

```bash
git reset --hard b12f6d0
```

> ⚠️ Peligroso: eliminarás los commits posteriores.

---

### 💾 3. Guardar los cambios actuales antes de volver atrás

```bash
# Crea una rama de respaldo por si acaso
git branch respaldo-antes-reset

# Vuelve atrás con seguridad
git reset --hard b12f6d0
```

---

### 🌱 4. Crear una nueva rama desde un commit antiguo

```bash
git checkout -b nombre-nueva-rama b12f6d0
```

---

## 🧹 Deshacer el último commit (sin perder los cambios)

```bash
git reset --soft HEAD~1
```

---

## ❓ Ver qué cambió entre commits

```bash
git diff b12f6d0 d3f1a2c
```

---

## 💡 Buenas prácticas

- Haz commits pequeños y frecuentes.
- Usa mensajes claros.
- Crea ramas para probar cosas nuevas sin romper `main` o `master`.

---

## 🔗 Repositorio de este proyecto

[https://github.com/TU_USUARIO/ecommerce-laravel-angular](https://github.com/TU_USUARIO/ecommerce-laravel-angular)
