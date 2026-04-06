// ============================================
// CONFIGURACION DE SUPABASE
// ============================================

// 
const SUPABASE_URL = 'https://ljwsfdjitakdjugodaef.supabase.co';       // 
const SUPABASE_ANON_KEY = 'sb_publishable_2ysR80HDfAphRe0b9DPC8w_CVKPkWDP';               // 
// Crear cliente de Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

// Cargar todos los clientes de la base de datos
async function cargarClientes() {
    const loading = document.getElementById('loading');
    const tabla = document.getElementById('tablaClientes');
    const sinDatos = document.getElementById('sinDatos');
    const body = document.getElementById('bodyClientes');
    const contador = document.getElementById('contadorClientes');

    // Si no estamos en la pagina de clientes, no hacer nada
    if (!body) return;

    try {
        // Consultar Supabase: SELECT * FROM clientes ORDER BY created_at DESC
        const { data, error } = await db
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Ocultar loading
        loading.style.display = 'none';

        if (data.length === 0) {
            // No hay datos
            sinDatos.style.display = 'block';
            tabla.style.display = 'none';
            contador.textContent = '0 clientes';
            return;
        }

        // Mostrar tabla con datos
        tabla.style.display = 'table';
        sinDatos.style.display = 'none';
        contador.textContent = data.length + ' cliente' + (data.length !== 1 ? 's' : '');

        // Generar filas de la tabla
        body.innerHTML = data.map(cliente => {
            const fecha = new Date(cliente.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            return '<tr>' +
                '<td>' + cliente.id + '</td>' +
                '<td><strong>' + (cliente.nombre || '-') + '</strong></td>' +
                '<td>' + (cliente.email || '-') + '</td>' +
                '<td>' + (cliente.telefono || '-') + '</td>' +
                '<td>' + (cliente.ciudad || '-') + '</td>' +
                '<td>' + fecha + '</td>' +
                '<td><button class="btn btn-danger" onclick="eliminarCliente(' + cliente.id + ')">Eliminar</button></td>' +
                '</tr>';
        }).join('');

    } catch (error) {
        loading.textContent = 'Error al cargar clientes: ' + error.message;
        loading.style.color = 'red';
        console.error('Error:', error);
    }
}

// Agregar un nuevo cliente
async function agregarCliente(event) {
    event.preventDefault(); // Evitar que el formulario recargue la pagina

    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const ciudad = document.getElementById('ciudad').value.trim();

    if (!nombre) {
        mostrarMensaje('El nombre es obligatorio', 'error');
        return;
    }

    try {
        // Insertar en Supabase: INSERT INTO clientes (nombre, email, telefono, ciudad) VALUES (...)
        const { data, error } = await db
            .from('clientes')
            .insert([{ nombre, email, telefono, ciudad }])
            .select();

        if (error) throw error;

        // Limpiar formulario
        document.getElementById('clienteForm').reset();

        // Mostrar mensaje de exito
        mostrarMensaje('Cliente "' + nombre + '" agregado correctamente', 'exito');

        // Recargar la tabla
        cargarClientes();

    } catch (error) {
        mostrarMensaje('Error al agregar cliente: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Eliminar un cliente
async function eliminarCliente(id) {
    // Confirmar antes de eliminar
    if (!confirm('Seguro que quieres eliminar este cliente?')) return;

    try {
        // Eliminar de Supabase: DELETE FROM clientes WHERE id = ...
        const { error } = await db
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        mostrarMensaje('Cliente eliminado', 'exito');
        cargarClientes();

    } catch (error) {
        mostrarMensaje('Error al eliminar: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Mostrar mensaje temporal
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    if (!mensaje) return;

    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + tipo;
    mensaje.style.display = 'block';

    // Ocultar despues de 4 segundos
    setTimeout(function() {
        mensaje.style.display = 'none';
    }, 4000);
}

// ============================================
// INICIALIZACION
// ============================================

// Cuando la pagina cargue, ejecutar estas funciones
document.addEventListener('DOMContentLoaded', function() {
    // Cargar clientes si estamos en la pagina de clientes
    cargarClientes();

    // Conectar el formulario al boton de agregar
    var form = document.getElementById('clienteForm');
    if (form) {
        form.addEventListener('submit', agregarCliente);
    }
});
