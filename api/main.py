from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
import os

# Crear la aplicacion
app = FastAPI(title="Mi Primera API", version="1.0")

# Permitir que el frontend se conecte (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conectar a Supabase usando variables de entorno
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")
db = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- ENDPOINTS ---

@app.get("/")
def inicio():
    """Endpoint de prueba — si ves esto, la API funciona."""
    return {
        "mensaje": "API funcionando correctamente!",
        "version": "1.0",
        "endpoints": ["/", "/api/clientes", "/docs"]
    }


@app.get("/api/clientes")
def obtener_clientes():
    """Trae todos los clientes de la base de datos."""
    resultado = db.table("clientes").select("*").order("created_at", desc=True).execute()
    return {
        "total": len(resultado.data),
        "clientes": resultado.data
    }


@app.get("/api/clientes/{cliente_id}")
def obtener_cliente(cliente_id: int):
    """Trae un cliente especifico por su ID."""
    resultado = db.table("clientes").select("*").eq("id", cliente_id).execute()
    if not resultado.data:
        return {"error": "Cliente no encontrado"}
    return resultado.data[0]
