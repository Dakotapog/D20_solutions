from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
# Configuración de CORS para permitir cabeceras de autorización
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})

# --- Configuración de la Base de Datos ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.root_path, 'site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- Modelos de la Base de Datos ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    def __init__(self, username, email):
        self.username = username
        self.email = email

    def __repr__(self):
        return '<User %r>' % self.username

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False, default='general')
    icon_url = db.Column(db.String(200), nullable=False, default='images/icon-recursos.png')
    badge = db.Column(db.String(50), nullable=True)

    def __init__(self, name, description, price, category, icon_url, badge=None):
        self.name = name
        self.description = description
        self.price = price
        self.category = category
        self.icon_url = icon_url
        self.badge = badge

    def __repr__(self):
        return '<Service %r>' % self.name

# --- Inicialización de la Base de Datos ---
with app.app_context():
    db.create_all()
    
    # Crear usuario admin por defecto si no existe
    admin_user = User.query.filter_by(email='admin@d10solutions.com').first()
    if not admin_user:
        admin_user = User(
            username='admin',
            email='admin@d10solutions.com'
        )
        db.session.add(admin_user)
        db.session.commit()
        print("Usuario admin creado: admin@d10solutions.com / adminpass")

    # Crear usuarios de prueba si no existen
    if User.query.count() <= 1:
        test_users = [
            {'username': 'ana.gomez', 'email': 'ana.gomez@example.com'},
            {'username': 'carlos.ruiz', 'email': 'carlos.ruiz@example.com'},
            {'username': 'beatriz.solano', 'email': 'beatriz.solano@example.com'},
            {'username': 'david.fernandez', 'email': 'david.fernandez@example.com'},
            {'username': 'elena.martin', 'email': 'elena.martin@example.com'}
        ]
        for user_data in test_users:
            if not User.query.filter_by(email=user_data['email']).first():
                db.session.add(User(username=user_data['username'], email=user_data['email']))
        db.session.commit()
        print(f"{len(test_users)} usuarios de prueba creados.")

    # Crear servicios de prueba si no existen
    if Service.query.count() == 0:
        initial_services = [
            {'name': 'Gestión Comercial', 'description': 'Potencializa tu gestión comercial y obtén información para optimizar el seguimiento de prospectos.', 'price': 299.0, 'category': 'gestión', 'icon_url': 'images/icon-gestion-comercial.png', 'badge': 'Popular'},
            {'name': 'Gestión Académica', 'description': 'Administra información académica desde matrículas hasta evaluaciones y programación de horarios.', 'price': 399.0, 'category': 'gestión académico', 'icon_url': 'images/icon-gestion-academica.png', 'badge': 'Premium'},
            {'name': 'Educación Virtual', 'description': 'Facilita comunicación con contenidos dinámicos, publicación de anuncios y cuestionarios interactivos.', 'price': 259.0, 'category': 'virtual', 'icon_url': 'images/icon-educacion-virtual.png', 'badge': None},
            {'name': 'Bienestar Institucional', 'description': 'Promueve satisfacción estudiantil con encuestas, evaluaciones y acceso a bolsa de empleo.', 'price': 199.0, 'category': 'gestión', 'icon_url': 'images/icon-bienestar.png', 'badge': None},
            {'name': 'Gestión Financiera', 'description': 'Controla cuentas por cobrar e ingresos con órdenes de pago, recibos y facturación automatizada.', 'price': 359.0, 'category': 'gestión', 'icon_url': 'images/icon-finanzas.png', 'badge': 'Premium'},
            {'name': 'Comunidad en Línea', 'description': 'Aumenta comunicación con chat institucional, SMS, app móvil y campañas de mailing dirigidas.', 'price': 179.0, 'category': 'comunicación', 'icon_url': 'images/icon-comunidad.png', 'badge': None},
            {'name': 'Sistema de Reportes', 'description': 'Genera reportes avanzados y dashboards interactivos con métricas clave de tu institución.', 'price': 229.0, 'category': 'gestión', 'icon_url': 'images/icon-reportes.png', 'badge': 'Nuevo'},
            {'name': 'Gestión de Recursos', 'description': 'Administra aulas, laboratorios, equipos y recursos físicos de manera eficiente y centralizada.', 'price': 189.0, 'category': 'gestión', 'icon_url': 'images/icon-recursos.png', 'badge': None},
            {'name': 'Portal de Padres', 'description': 'Conecta padres con el proceso educativo mediante notificaciones, calificaciones y comunicación directa.', 'price': 149.0, 'category': 'comunicación', 'icon_url': 'images/icon-portal-padres.png', 'badge': None},
            {'name': 'Análisis y Métricas', 'description': 'Inteligencia artificial para análisis predictivo, métricas de rendimiento y toma de decisiones estratégicas.', 'price': 449.0, 'category': 'gestión', 'icon_url': 'images/icon-analytics.png', 'badge': 'Premium'}
        ]
        for s in initial_services:
            db.session.add(Service(name=s['name'], description=s['description'], price=s['price'], category=s['category'], icon_url=s['icon_url'], badge=s['badge']))
        db.session.commit()
        print(f"INFO: {len(initial_services)} servicios de prueba creados.")

# --- Endpoint de salud ---
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Servidor funcionando correctamente"}), 200

# --- Rutas principales ---
@app.route('/')
def home():
    return jsonify({"message": "¡Bienvenido al backend de D10 Solutions!"})

# --- Ruta de Autenticación (Simplificada) ---
@app.route('/auth/login', methods=['POST'])
def auth_login():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se enviaron datos"}), 400
            
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"error": "Email y contraseña son requeridos"}), 400

        user = User.query.filter_by(email=email).first()

        # Verificación simple de contraseña
        if user and password == "adminpass":
            # Simular token (en producción usarías JWT real)
            fake_token = f"simple_token_{user.id}_{user.email}"
            
            return jsonify({
                "message": "Inicio de sesión exitoso",
                "token": fake_token,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }), 200
        else:
            return jsonify({"error": "Credenciales inválidas"}), 401
            
    except Exception as e:
        print(f"Error en login: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# --- Ruta de Verificación de Token ---
@app.route('/auth/verify', methods=['POST'])
def auth_verify():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({"error": "Token no proporcionado o malformado"}), 401

    token = auth_header.split(' ')[1]

    # Verificación simple del token (en un caso real, se decodificaría y validaría un JWT)
    if token.startswith('simple_token_'):
        # Opcionalmente, podríamos extraer el user_id y verificar si el usuario aún existe
        return jsonify({"message": "Token válido"}), 200
    else:
        return jsonify({"error": "Token inválido o expirado"}), 401

# --- Rutas para Servicios ---
@app.route('/services', methods=['POST'])
def create_service():
    data = request.get_json()
    if not data or not all(key in data for key in ['name', 'description', 'price']):
        return jsonify({"error": "Datos incompletos para crear el servicio"}), 400

    try:
        new_service = Service(
            name=data['name'], 
            description=data['description'], 
            price=float(data['price']), 
            category=data.get('category', 'general'),
            icon_url=data.get('icon_url', 'images/icon-recursos.png'),
            badge=data.get('badge', None)
        )
        db.session.add(new_service)
        db.session.commit()
        return jsonify({"message": "Servicio creado exitosamente", "service_id": new_service.id}), 201
    except ValueError:
        return jsonify({"error": "El precio debe ser un número válido"}), 400
    except Exception as e:
        print(f"Error creando servicio: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/services', methods=['GET'])
def get_services():
    try:
        services = Service.query.all()
        output = []
        for service in services:
            service_data = {
                'id': service.id, 
                'name': service.name, 
                'description': service.description, 
                'price': service.price,
                'category': service.category,
                'icon_url': service.icon_url,
                'badge': service.badge
            }
            output.append(service_data)
        return jsonify({'services': output})
    except Exception as e:
        print(f"Error obteniendo servicios: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/services/<int:service_id>', methods=['GET'])
def get_service(service_id):
    try:
        service = Service.query.get_or_404(service_id)
        return jsonify({
            'id': service.id, 
            'name': service.name, 
            'description': service.description, 
            'price': service.price,
            'category': service.category,
            'icon_url': service.icon_url,
            'badge': service.badge
        })
    except Exception as e:
        print(f"Error obteniendo servicio: {e}")
        return jsonify({"error": "Servicio no encontrado"}), 404

@app.route('/services/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    try:
        service = Service.query.get_or_404(service_id)
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

        service.name = data.get('name', service.name)
        service.description = data.get('description', service.description)
        service.category = data.get('category', service.category)
        service.icon_url = data.get('icon_url', service.icon_url)
        service.badge = data.get('badge', service.badge)
        
        if 'price' in data:
            try:
                service.price = float(data['price'])
            except ValueError:
                return jsonify({"error": "El precio debe ser un número válido"}), 400
        
        db.session.commit()
        return jsonify({"message": "Servicio actualizado exitosamente"})
    except Exception as e:
        print(f"Error actualizando servicio: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/services/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    try:
        service = Service.query.get_or_404(service_id)
        db.session.delete(service)
        db.session.commit()
        return jsonify({"message": "Servicio eliminado exitosamente"})
    except Exception as e:
        print(f"Error eliminando servicio: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

# --- Rutas para Usuarios ---
@app.route('/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        if not data or not all(key in data for key in ['username', 'email']):
            return jsonify({"error": "Datos incompletos para crear el usuario"}), 400

        # Verificar si el usuario ya existe
        existing_user = User.query.filter((User.username == data['username']) | (User.email == data['email'])).first()
        if existing_user:
            return jsonify({"error": "El usuario o email ya existe"}), 409

        new_user = User(username=data['username'], email=data['email'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Usuario creado exitosamente", "user_id": new_user.id}), 201
    except Exception as e:
        print(f"Error creando usuario: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        output = []
        for user in users:
            user_data = {'id': user.id, 'username': user.username, 'email': user.email}
            output.append(user_data)
        return jsonify({'users': output})
    except Exception as e:
        print(f"Error obteniendo usuarios: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        return jsonify({'id': user.id, 'username': user.username, 'email': user.email})
    except Exception as e:
        print(f"Error obteniendo usuario: {e}")
        return jsonify({"error": "Usuario no encontrado"}), 404

@app.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No se proporcionaron datos para actualizar"}), 400

        user.username = data.get('username', user.username)
        user.email = data.get('email', user.email)
        db.session.commit()
        return jsonify({"message": "Usuario actualizado exitosamente"})
    except Exception as e:
        print(f"Error actualizando usuario: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

@app.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Usuario eliminado exitosamente"})
    except Exception as e:
        print(f"Error eliminando usuario: {e}")
        return jsonify({"error": "Error interno del servidor"}), 500

if __name__ == '__main__':
    print("Servidor iniciando...")
    print("URL de login: http://127.0.0.1:5001/auth/login")
    print("Credenciales: admin@d10solutions.com / adminpass")
    app.run(debug=True, host='127.0.0.1', port=5001)
