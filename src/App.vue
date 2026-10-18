<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from './firebase'
import { collection, addDoc, getDocs } from 'firebase/firestore'

// Estado reactivo
const items = ref([])
const nuevoTitulo = ref('')
const nuevaDescripcion = ref('')
const cargando = ref(false)

// Métricas calculadas para el panel superior
const totalItems = computed(() => items.value.length)
const ultimoRegistro = computed(() => {
  if (items.value.length === 0) return 'Sin registros'
  return items.value[items.value.length - 1].fecha || 'Reciente'
})

// Función para obtener los datos de Firestore
const cargarItems = async () => {
  cargando.value = true
  try {
    const querySnapshot = await getDocs(collection(db, 'marenostrum_items'))
    items.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error("Error al cargar los datos: ", error)
  } finally {
    cargando.value = false
  }
}

// Función para añadir un nuevo elemento a Firestore
const agregarItem = async () => {
  if (!nuevoTitulo.value.trim() || !nuevaDescripcion.value.trim()) return

  try {
    await addDoc(collection(db, 'marenostrum_items'), {
      titulo: nuevoTitulo.value,
      descripcion: nuevaDescripcion.value,
      fecha: new Date().toLocaleDateString()
    })
    
    // Limpiar formulario y recargar lista
    nuevoTitulo.value = ''
    nuevaDescripcion.value = ''
    await cargarItems()
  } catch (error) {
    console.error("Error al añadir el documento: ", error)
  }
}

// Cargar los elementos al iniciar el componente
onMounted(() => {
  cargarItems()
})
</script>

<template>
  <div class="dashboard-wrapper">
    <!-- Encabezado superior -->
    <header class="header">
      <div class="logo-title">
        <h1>🌊 Mare Nostrum</h1>
        <span class="badge">Gestión Interactiva</span>
      </div>
      <p>Panel de control conectado en tiempo real con Firebase Firestore</p>
    </header>

    <!-- Disposición de 2 columnas -->
    <div class="dashboard-grid">
      <!-- Columna Izquierda: Formulario -->
      <aside class="sidebar-column">
        <div class="card-panel">
          <h2>➕ Nueva Iniciativa</h2>
          <p class="subtitle">Añade elementos al catálogo central</p>
          
          <form @submit.prevent="agregarItem">
            <div class="form-group">
              <label for="titulo">Título</label>
              <input 
                id="titulo"
                type="text" 
                v-model="nuevoTitulo" 
                placeholder="Ej. Libro de Navegación..." 
                required 
              />
            </div>

            <div class="form-group">
              <label for="descripcion">Descripción</label>
              <textarea 
                id="descripcion"
                v-model="nuevaDescripcion" 
                placeholder="Escribe los detalles o resumen..." 
                required 
              ></textarea>
            </div>

            <button type="submit" class="btn-primary">
              Guardar en Firestore
            </button>
          </form>
        </div>
      </aside>

      <!-- Columna Derecha: Métricas y Listado -->
      <main class="main-column">
        <!-- Panel de Estadísticas Rápidas -->
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-label">Total de Registros</span>
            <span class="stat-value">{{ totalItems }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Última Actividad</span>
            <span class="stat-value stat-small">{{ ultimoRegistro }}</span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Estado Base de Datos</span>
            <span class="stat-value status-online">● En línea</span>
          </div>
        </div>

        <!-- Sección de Catálogo -->
        <div class="card-panel">
          <div class="panel-header">
            <h2>📚 Catálogo Actual</h2>
            <button @click="cargarItems" class="btn-refresh" title="Recargar datos">
              🔄 Actualizar
            </button>
          </div>

          <div v-if="cargando" class="loading">
            Cargando elementos de Firestore...
          </div>

          <div v-else-if="items.length === 0" class="empty">
            No hay elementos registrados todavía. ¡Utiliza el panel lateral para añadir el primero!
          </div>

          <div class="items-grid" v-else>
            <div v-for="item in items" :key="item.id" class="item-card">
              <div class="item-content">
                <h3>{{ item.titulo }}</h3>
                <p>{{ item.descripcion }}</p>
              </div>
              <div class="item-footer">
                <span>🗓️ {{ item.fecha }}</span>
                <span class="tag">Firestore</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.dashboard-wrapper {
  font-family: 'Inter', system-ui, sans-serif;
  color: #0f172a;
  background-color: #f1f5f9;
  min-height: 100vh;
  padding: 30px 40px;
  box-sizing: border-box;
}

/* Header */
.header {
  margin-bottom: 30px;
}

.logo-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.badge {
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.header p {
  color: #64748b;
  margin: 6px 0 0 0;
  font-size: 0.95rem;
}

/* Rejilla Principal de 2 Columnas */
.dashboard-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 28px;
  align-items: start;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Paneles */
.card-panel {
  background: #ffffff;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
}

.subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: -8px;
  margin-bottom: 20px;
}

/* Formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

input[type="text"], textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.2s;
  background-color: #f8fafc;
}

input[type="text"]:focus, textarea:focus {
  outline: none;
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

textarea {
  min-height: 110px;
  resize: vertical;
}

.btn-primary {
  width: 100%;
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

/* Tarjetas de Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.stat-card {
  background: #ffffff;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-small {
  font-size: 1.1rem;
  padding-top: 6px;
}

.status-online {
  font-size: 1rem;
  color: #16a34a;
  padding-top: 6px;
}

/* Catálogo y Tarjetas */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.btn-refresh {
  background: none;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: #475569;
  transition: background-color 0.2s;
}

.btn-refresh:hover {
  background-color: #f1f5f9;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.item-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s, box-shadow 0.2s;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.06);
}

.item-content h3 {
  margin: 0 0 8px 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.item-content p {
  margin: 0 0 16px 0;
  font-size: 0.88rem;
  color: #475569;
  line-height: 1.4;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  padding-top: 10px;
}

.tag {
  background-color: #f1f5f9;
  color: #475569;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.empty, .loading {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  background-color: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
}
</style>