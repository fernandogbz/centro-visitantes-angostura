# 📅 Script de Creación de Franjas Horarias

## Contexto del Proyecto

El Centro de Visitantes Angostura del Biobío opera con el siguiente horario:

- **Días de operación:** Martes a Domingo
- **Día bloqueado:** Lunes (automático)
- **Horario matutino:** 09:00 - 13:00
- **Horario vespertino:** 15:00 - 17:00
- **Capacidad por franja:** 30 visitantes

---

## 🎯 Objetivo

Crear franjas horarias cada hora dentro de los rangos permitidos:

**Mañana (4 franjas):**
- 09:00
- 10:00
- 11:00
- 12:00

**Tarde (3 franjas):**
- 15:00
- 16:00
- 17:00

**Total:** 7 franjas horarias por día

---

## 📝 Script: `insert-horarios-completo.js`

Crea este archivo en: `backend/scripts/insert-horarios-completo.js`

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HorarioDisponible from '../models/horarioDisponible.js';

dotenv.config();

/**
 * Script para crear/actualizar todas las franjas horarias del Centro de Visitantes
 * 
 * Horarios de operación:
 * - Martes a Domingo
 * - Mañana: 09:00 - 13:00 (4 franjas)
 * - Tarde: 15:00 - 17:00 (3 franjas)
 * - Capacidad: 30 visitantes por franja
 * 
 * NOTA: El bloqueo de lunes se maneja en el backend mediante lógica de negocio,
 * no requiere configuración en horarios.
 */

async function insertHorariosCompleto() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/angostura');
    
    console.log('✅ Conectado a MongoDB');
    console.log('');
    console.log('📅 Creando franjas horarias...');
    console.log('');
    
    // ====================================
    // DEFINICIÓN DE FRANJAS HORARIAS
    // ====================================
    
    const horariosCompletos = [
      // HORARIO MATUTINO (09:00 - 13:00)
      { 
        hora: '09:00', 
        capacidad: 30, 
        activo: true, 
        orden: 1,
        descripcion: 'Primera franja matutina'
      },
      { 
        hora: '10:00', 
        capacidad: 30, 
        activo: true, 
        orden: 2,
        descripcion: 'Segunda franja matutina'
      },
      { 
        hora: '11:00', 
        capacidad: 30, 
        activo: true, 
        orden: 3,
        descripcion: 'Tercera franja matutina'
      },
      { 
        hora: '12:00', 
        capacidad: 30, 
        activo: true, 
        orden: 4,
        descripcion: 'Última franja matutina'
      },
      
      // HORARIO VESPERTINO (15:00 - 17:00)
      { 
        hora: '15:00', 
        capacidad: 30, 
        activo: true, 
        orden: 5,
        descripcion: 'Primera franja vespertina'
      },
      { 
        hora: '16:00', 
        capacidad: 30, 
        activo: true, 
        orden: 6,
        descripcion: 'Segunda franja vespertina'
      },
      { 
        hora: '17:00', 
        capacidad: 30, 
        activo: true, 
        orden: 7,
        descripcion: 'Última franja vespertina'
      }
    ];
    
    // ====================================
    // INSERCIÓN/ACTUALIZACIÓN
    // ====================================
    
    console.log('📋 Configurando horarios:');
    console.log('   Mañana: 09:00 - 12:00 (4 franjas)');
    console.log('   Tarde:  15:00 - 17:00 (3 franjas)');
    console.log('   Capacidad: 30 visitantes/franja');
    console.log('');
    
    let insertados = 0;
    let actualizados = 0;
    
    for (const horario of horariosCompletos) {
      const resultado = await HorarioDisponible.findOneAndUpdate(
        { hora: horario.hora },
        horario,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      
      // Verificar si fue insertado o actualizado
      const existia = await HorarioDisponible.countDocuments({ hora: horario.hora });
      
      if (existia === 1 && resultado.createdAt === resultado.updatedAt) {
        insertados++;
        console.log(`   ✓ [NUEVO] ${horario.hora} - Capacidad: ${horario.capacidad}`);
      } else {
        actualizados++;
        console.log(`   ↻ [ACTUALIZADO] ${horario.hora} - Capacidad: ${horario.capacidad}`);
      }
    }
    
    console.log('');
    console.log('✅ Franjas horarias configuradas correctamente');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • Total de franjas: ${horariosCompletos.length}`);
    console.log(`   • Nuevas: ${insertados}`);
    console.log(`   • Actualizadas: ${actualizados}`);
    console.log(`   • Capacidad total/día: ${horariosCompletos.length * 30} visitantes`);
    console.log('');
    
    // ====================================
    // VERIFICACIÓN FINAL
    // ====================================
    
    const totalHorarios = await HorarioDisponible.countDocuments();
    const horariosActivos = await HorarioDisponible.countDocuments({ activo: true });
    
    console.log('🔍 Verificación de base de datos:');
    console.log(`   • Horarios en BD: ${totalHorarios}`);
    console.log(`   • Horarios activos: ${horariosActivos}`);
    console.log('');
    
    // Mostrar todos los horarios actuales
    console.log('📋 Horarios configurados en el sistema:');
    const todosLosHorarios = await HorarioDisponible.find().sort({ orden: 1 });
    
    todosLosHorarios.forEach(h => {
      const estado = h.activo ? '✅' : '❌';
      console.log(`   ${estado} ${h.hora} - Capacidad: ${h.capacidad} - Orden: ${h.orden}`);
    });
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error creando franjas horarias:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar script
if (import.meta.url === `file://${process.argv[1]}`) {
  insertHorariosCompleto()
    .then(() => {
      console.log('🎉 Proceso completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export default insertHorariosCompleto;
```

---

## 🚀 Uso del Script

### 1. Crear el archivo

```bash
# Desde la raíz del proyecto
cd backend/scripts
# Crea el archivo insert-horarios-completo.js con el código anterior
```

### 2. Ejecutar el script

```bash
# Desde la carpeta backend
cd backend
node scripts/insert-horarios-completo.js
```

### 3. Salida esperada

```
🔄 Conectando a MongoDB...
✅ Conectado a MongoDB

📅 Creando franjas horarias...

📋 Configurando horarios:
   Mañana: 09:00 - 12:00 (4 franjas)
   Tarde:  15:00 - 17:00 (3 franjas)
   Capacidad: 30 visitantes/franja

   ✓ [NUEVO] 09:00 - Capacidad: 30
   ✓ [NUEVO] 10:00 - Capacidad: 30
   ✓ [NUEVO] 11:00 - Capacidad: 30
   ✓ [NUEVO] 12:00 - Capacidad: 30
   ✓ [NUEVO] 15:00 - Capacidad: 30
   ✓ [NUEVO] 16:00 - Capacidad: 30
   ✓ [NUEVO] 17:00 - Capacidad: 30

✅ Franjas horarias configuradas correctamente

📊 Resumen:
   • Total de franjas: 7
   • Nuevas: 7
   • Actualizadas: 0
   • Capacidad total/día: 210 visitantes

🔍 Verificación de base de datos:
   • Horarios en BD: 7
   • Horarios activos: 7

📋 Horarios configurados en el sistema:
   ✅ 09:00 - Capacidad: 30 - Orden: 1
   ✅ 10:00 - Capacidad: 30 - Orden: 2
   ✅ 11:00 - Capacidad: 30 - Orden: 3
   ✅ 12:00 - Capacidad: 30 - Orden: 4
   ✅ 15:00 - Capacidad: 30 - Orden: 5
   ✅ 16:00 - Capacidad: 30 - Orden: 6
   ✅ 17:00 - Capacidad: 30 - Orden: 7

🔌 Conexión cerrada
🎉 Proceso completado exitosamente
```

---

## 🔧 Actualizar el Modelo de Visita

Para que las validaciones funcionen con los nuevos horarios, actualiza el modelo:

**Archivo:** `backend/models/Visita.js`

```javascript
// Busca la línea del campo "hora" y actualiza el enum:
hora: {
  type: String,
  required: true,
  enum: ['09:00', '10:00', '11:00', '12:00', '15:00', '16:00', '17:00']
},
```

---

## 📊 Cálculo de Capacidad

Con esta configuración:

**Por día:**
- 7 franjas × 30 visitantes = **210 visitantes/día**

**Por semana (6 días):**
- 210 visitantes/día × 6 días = **1,260 visitantes/semana**

**Por mes (26 días aprox, sin lunes):**
- 210 visitantes/día × 26 días = **5,460 visitantes/mes**

---

## 🛠️ Personalización

### Cambiar capacidad de una franja específica

Si necesitas que la franja de 09:00 tenga solo 20 cupos:

```javascript
{ 
  hora: '09:00', 
  capacidad: 20,  // ← Cambiar aquí
  activo: true, 
  orden: 1,
  descripcion: 'Primera franja matutina (reducida)'
}
```

### Deshabilitar una franja temporalmente

```javascript
{ 
  hora: '17:00', 
  capacidad: 30, 
  activo: false,  // ← Cambiar a false
  orden: 7,
  descripcion: 'Última franja vespertina (deshabilitada)'
}
```

### Agregar más franjas

Si en el futuro quieres extender hasta las 18:00:

```javascript
{ 
  hora: '18:00', 
  capacidad: 30, 
  activo: true, 
  orden: 8,
  descripcion: 'Franja adicional vespertina'
}
```

---

## ⚠️ Importante

1. **Bloqueo de lunes:** Se maneja automáticamente en el componente `CalendarioDisponibilidad.tsx` y no requiere configuración en horarios.

2. **Sincronización con frontend:** Si cambias los horarios, actualiza también el enum en `backend/models/Visita.js` para que las validaciones sean consistentes.

3. **Reejecutar script:** Puedes ejecutar este script múltiples veces. Si un horario ya existe, se actualizará en lugar de crear duplicados.

4. **Verificar cambios:** Después de ejecutar el script, puedes verificar en MongoDB:
   ```bash
   mongosh angostura
   db.horarios_disponibles.find().pretty()
   ```

---

## 🧪 Testing

Después de ejecutar el script, prueba la disponibilidad:

```bash
# Consultar disponibilidad para un martes
curl "http://localhost:3000/api/visitas/disponibilidad?fecha=2025-12-23&hora=09:00"

# Debería retornar:
# { "cuposDisponibles": 30, "capacidad": 30 }
```

---

## 📚 Archivos Relacionados

- `backend/models/horarioDisponible.js` - Modelo de horarios
- `backend/models/Visita.js` - Actualizar enum de horas
- `backend/scripts/init-database.js` - Script inicial (usar para referencia)
- `src/components/CalendarioDisponibilidad.tsx` - Bloqueo de lunes en frontend

---

## ✅ Checklist de Implementación

- [ ] Crear archivo `backend/scripts/insert-horarios-completo.js`
- [ ] Ejecutar script: `node scripts/insert-horarios-completo.js`
- [ ] Verificar 7 franjas creadas en MongoDB
- [ ] Actualizar enum de `hora` en `backend/models/Visita.js`
- [ ] Probar reserva en frontend con nuevos horarios
- [ ] Verificar que lunes siga bloqueado
- [ ] Documentar cambios en informe académico

---

**Nota final:** Este script está diseñado para ser idempotente (puede ejecutarse múltiples veces sin causar problemas) y proporciona validación y feedback detallado.
