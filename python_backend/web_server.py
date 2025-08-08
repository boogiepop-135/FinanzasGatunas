#!/usr/bin/env python3
"""
Servidor web para el Sistema de Finanzas
Sirve el frontend y maneja las APIs del backend
"""

import os
import json
import sqlite3
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

class FinanceWebServer(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.db = FinanceDatabase()
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        """Maneja las peticiones GET"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # Servir archivos estáticos de React (build)
        if path == '/' or path == '/index.html':
            self.serve_file('index.html', 'text/html')
        elif path.startswith('/static/'):
            # Archivos estáticos generados por React
            self.serve_file(path.lstrip('/'), self.guess_mime_type(path))
        # APIs del backend
        elif path == '/api/categories':
            self.get_categories()
        elif path == '/api/transactions':
            self.get_transactions()
        elif path == '/api/dashboard':
            self.get_dashboard()
        else:
            # Para rutas de React Router, servir index.html
            self.serve_file('index.html', 'text/html')
    
    def do_POST(self):
        """Maneja las peticiones POST"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        if path == '/api/categories':
            self.save_category()
        elif path == '/api/transactions':
            self.save_transaction()
        elif path == '/api/transactions/delete':
            self.delete_transaction()
        else:
            self.send_error(404, "API not found")
    
    def serve_file(self, filename, content_type):
        """Sirve archivos estáticos desde la carpeta build"""
        file_path = os.path.join('build', filename)
        print("Buscando archivo:", os.path.abspath(file_path))  # DEBUG
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-type', content_type)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            self.wfile.write(content)
        except FileNotFoundError:
            self.send_error(404, f"File not found: {filename}")

    def guess_mime_type(self, path):
        if path.endswith('.js'):
            return 'application/javascript'
        elif path.endswith('.css'):
            return 'text/css'
        elif path.endswith('.json'):
            return 'application/json'
        elif path.endswith('.png'):
            return 'image/png'
        elif path.endswith('.jpg') or path.endswith('.jpeg'):
            return 'image/jpeg'
        elif path.endswith('.svg'):
            return 'image/svg+xml'
        elif path.endswith('.ico'):
            return 'image/x-icon'
        else:
            return 'application/octet-stream'
    
    def get_categories(self):
        """API para obtener categorías"""
        try:
            categories = self.db.get_categories()
            self.send_json_response(categories)
        except Exception as e:
            self.send_error(500, str(e))
    
    def get_transactions(self):
        """API para obtener transacciones"""
        try:
            transactions = self.db.get_transactions()
            self.send_json_response(transactions)
        except Exception as e:
            self.send_error(500, str(e))
    
    def get_dashboard(self):
        """API para obtener datos del dashboard"""
        try:
            stats = self.db.get_dashboard_stats()
            self.send_json_response(stats)
        except Exception as e:
            self.send_error(500, str(e))
    
    def save_category(self):
        """API para guardar categoría"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            category_id = self.db.save_category(data)
            self.send_json_response({"success": True, "id": category_id})
        except Exception as e:
            self.send_error(500, str(e))
    
    def save_transaction(self):
        """API para guardar transacción"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            transaction_id = self.db.save_transaction(data)
            self.send_json_response({"success": True, "id": transaction_id})
        except Exception as e:
            self.send_error(500, str(e))
    
    def delete_transaction(self):
        """API para eliminar transacción"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            success = self.db.delete_transaction(data['id'])
            if success:
                self.send_json_response({"success": True})
            else:
                self.send_json_response({"success": False, "error": "No se pudo eliminar la transacción"})
        except Exception as e:
            print(f"Error en delete_transaction API: {e}")
            self.send_json_response({"success": False, "error": str(e)})
    
    def send_json_response(self, data):
        """Envía respuesta JSON"""
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
    
    def do_OPTIONS(self):
        """Maneja peticiones OPTIONS para CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

class FinanceDatabase:
    def __init__(self):
        self.db_path = 'data/finances.db'
        self.init_database()
    
    def init_database(self):
        """Inicializa la base de datos"""
        os.makedirs('data', exist_ok=True)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Crear tabla de categorías
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                color TEXT DEFAULT '#007bff',
                icon TEXT DEFAULT 'fas fa-tag',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Crear tabla de transacciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                type TEXT NOT NULL,
                category_id INTEGER,
                date TEXT NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        ''')
        
        # Insertar categorías por defecto
        default_categories = [
            ('Alimentación', 'expense', '#dc3545', 'fas fa-utensils'),
            ('Transporte', 'expense', '#fd7e14', 'fas fa-car'),
            ('Entretenimiento', 'expense', '#e83e8c', 'fas fa-gamepad'),
            ('Salud', 'expense', '#6f42c1', 'fas fa-heartbeat'),
            ('Educación', 'expense', '#20c997', 'fas fa-graduation-cap'),
            ('Salario', 'income', '#28a745', 'fas fa-money-bill-wave'),
            ('Freelance', 'income', '#17a2b8', 'fas fa-laptop-code'),
            ('Inversiones', 'income', '#ffc107', 'fas fa-chart-line')
        ]
        
        cursor.executemany('''
            INSERT OR IGNORE INTO categories (name, type, color, icon)
            VALUES (?, ?, ?, ?)
        ''', default_categories)
        
        conn.commit()
        conn.close()
    
    def get_categories(self):
        """Obtiene todas las categorías"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM categories ORDER BY name')
        categories = []
        for row in cursor.fetchall():
            categories.append({
                'id': row[0],
                'name': row[1],
                'type': row[2],
                'color': row[3],
                'icon': row[4],
                'created_at': row[5]
            })
        conn.close()
        return categories
    
    def get_transactions(self):
        """Obtiene todas las transacciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT t.*, c.name as category_name, c.color as category_color
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.date DESC
        ''')
        transactions = []
        for row in cursor.fetchall():
            transactions.append({
                'id': row[0],
                'description': row[1],
                'amount': row[2],
                'type': row[3],
                'category_id': row[4],
                'date': row[5],
                'notes': row[6],
                'created_at': row[7],
                'category_name': row[8],
                'category_color': row[9]
            })
        conn.close()
        return transactions
    
    def get_dashboard_stats(self):
        """Obtiene estadísticas del dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total de ingresos
        cursor.execute('SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = "income"')
        total_income = cursor.fetchone()[0]
        
        # Total de gastos
        cursor.execute('SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = "expense"')
        total_expenses = cursor.fetchone()[0]
        
        # Balance
        balance = total_income - total_expenses
        
        # Transacciones recientes
        cursor.execute('''
            SELECT t.*, c.name as category_name, c.color as category_color
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.date DESC
            LIMIT 5
        ''')
        recent_transactions = []
        for row in cursor.fetchall():
            recent_transactions.append({
                'id': row[0],
                'description': row[1],
                'amount': row[2],
                'type': row[3],
                'category_id': row[4],
                'date': row[5],
                'notes': row[6],
                'created_at': row[7],
                'category_name': row[8],
                'category_color': row[9]
            })
        
        conn.close()
        
        return {
            'total_income': total_income,
            'total_expenses': total_expenses,
            'balance': balance,
            'recent_transactions': recent_transactions
        }
    
    def save_category(self, data):
        """Guarda una categoría"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if 'id' in data and data['id']:
            cursor.execute('''
                UPDATE categories 
                SET name = ?, type = ?, color = ?, icon = ?
                WHERE id = ?
            ''', (data['name'], data['type'], data['color'], data['icon'], data['id']))
            category_id = data['id']
        else:
            cursor.execute('''
                INSERT INTO categories (name, type, color, icon)
                VALUES (?, ?, ?, ?)
            ''', (data['name'], data['type'], data['color'], data['icon']))
            category_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        return category_id
    
    def save_transaction(self, data):
        """Guarda una transacción"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if 'id' in data and data['id']:
            cursor.execute('''
                UPDATE transactions 
                SET description = ?, amount = ?, type = ?, category_id = ?, date = ?, notes = ?
                WHERE id = ?
            ''', (data['description'], data['amount'], data['type'], 
                  data['category_id'], data['date'], data['notes'], data['id']))
            transaction_id = data['id']
        else:
            cursor.execute('''
                INSERT INTO transactions (description, amount, type, category_id, date, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (data['description'], data['amount'], data['type'], 
                  data['category_id'], data['date'], data['notes']))
            transaction_id = cursor.lastrowid
        
        conn.commit()
        conn.close()
        return transaction_id
    
    def delete_transaction(self, transaction_id):
        """Elimina una transacción"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
            conn.commit()
            conn.close()
            return True
        except Exception as e:
            print(f"Error eliminando transacción {transaction_id}: {e}")
            if 'conn' in locals():
                conn.close()
            return False

def run_server(port=3000):
    """Ejecuta el servidor web"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, FinanceWebServer)
    print(f"Servidor iniciado en http://localhost:{port}")
    print("Presiona Ctrl+C para detener el servidor")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido")
        httpd.server_close()

if __name__ == '__main__':
    run_server() 