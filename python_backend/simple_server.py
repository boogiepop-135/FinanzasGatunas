#!/usr/bin/env python3
"""
Servidor web simplificado para el Sistema de Finanzas
"""

import os
import json
import sqlite3
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

class SimpleFinanceServer(BaseHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.db_path = 'data/finances.db'
        self.init_database()
        super().__init__(*args, **kwargs)
    
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
                icon TEXT DEFAULT 'fas fa-tag'
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
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        ''')

        # Crear tabla de gastos programados y membresías
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scheduled_expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                frequency TEXT NOT NULL,
                next_payment TEXT NOT NULL,
                notes TEXT
            )
        ''')

        # Insertar ejemplo si la tabla está vacía
        cursor.execute('SELECT COUNT(*) FROM scheduled_expenses')
        if cursor.fetchone()[0] == 0:
            default_scheduled = [
                ('Netflix', 199.00, 'Mensual', '2025-08-10', 'Membresía de streaming'),
                ('Gimnasio', 350.00, 'Mensual', '2025-08-15', 'Pago mensualidad'),
                ('Seguro auto', 1200.00, 'Anual', '2026-01-01', 'Seguro obligatorio')
            ]
            cursor.executemany('''
                INSERT INTO scheduled_expenses (description, amount, frequency, next_payment, notes)
                VALUES (?, ?, ?, ?, ?)
            ''', default_scheduled)
            print('✅ Gastos programados de ejemplo insertados')
        else:
            print('ℹ️ Gastos programados ya existen, saltando inserción')
        
        # Insertar categorías por defecto solo si no existen
        cursor.execute('SELECT COUNT(*) FROM categories')
        if cursor.fetchone()[0] == 0:
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
                INSERT INTO categories (name, type, color, icon)
                VALUES (?, ?, ?, ?)
            ''', default_categories)
            print("✅ Categorías por defecto insertadas")
        else:
            print("ℹ️ Las categorías ya existen, saltando inserción")
        
        conn.commit()
        conn.close()
    
    def do_GET(self):
        """Maneja las peticiones GET"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"GET request: {path}")
        
        # Servir archivos estáticos
        if path == '/' or path == '/index.html':
            self.serve_file('index.html', 'text/html')
        elif path == '/styles.css':
            self.serve_file('styles.css', 'text/css')
        elif path == '/renderer.js':
            self.serve_file('renderer.js', 'application/javascript')
        # APIs del backend
        elif path == '/api/categories':
            self.get_categories()
        elif path == '/api/transactions':
            self.get_transactions()
        elif path == '/api/dashboard':
            self.get_dashboard()
        elif path == '/api/scheduled_expenses':
            self.get_scheduled_expenses()
        elif path == '/api/backup':
            self.backup_database()
        elif path == '/api/download-backup':
            # Descargar archivo de respaldo especificado por query param ?file=...
            from urllib.parse import parse_qs
            query = parse_qs(parsed_path.query)
            filename = query.get('file', [None])[0]
            if filename and os.path.exists(filename) and filename.startswith('backups/'):
                self.serve_file(filename, 'application/octet-stream')
            else:
                self.send_error(404, f"Backup file not found: {filename}")
        else:
            self.send_error(404, f"File not found: {path}")
    
    def do_POST(self):
        """Maneja las peticiones POST"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        print(f"POST request: {path}")
        
        if path == '/api/categories':
            self.save_category()
        elif path == '/api/transactions':
            self.save_transaction()
        elif path == '/api/transactions/delete':
            self.delete_transaction()
        elif path == '/api/scheduled_expenses':
            self.save_scheduled_expense()
        elif path == '/api/scheduled_expenses/delete':
            self.delete_scheduled_expense()
        elif path == '/api/export_database':
            self.handle_export_database()
        elif path == '/api/import_database':
            self.handle_import_database()
        else:
            self.send_error(404, f"API not found: {path}")

    def get_scheduled_expenses(self):
        """API para obtener gastos programados y membresías"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM scheduled_expenses ORDER BY next_payment')
            expenses = []
            for row in cursor.fetchall():
                expenses.append({
                    'id': row[0],
                    'description': row[1],
                    'amount': row[2],
                    'frequency': row[3],
                    'next_payment': row[4],
                    'notes': row[5]
                })
            conn.close()
            self.send_json_response(expenses)
        except Exception as e:
            self.send_error(500, str(e))

    def save_scheduled_expense(self):
        """API para guardar o actualizar gasto programado"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            if 'id' in data and data['id']:
                cursor.execute('''
                    UPDATE scheduled_expenses
                    SET description = ?, amount = ?, frequency = ?, next_payment = ?, notes = ?
                    WHERE id = ?
                ''', (data['description'], data['amount'], data['frequency'], data['next_payment'], data['notes'], data['id']))
                expense_id = data['id']
            else:
                cursor.execute('''
                    INSERT INTO scheduled_expenses (description, amount, frequency, next_payment, notes)
                    VALUES (?, ?, ?, ?, ?)
                ''', (data['description'], data['amount'], data['frequency'], data['next_payment'], data['notes']))
                expense_id = cursor.lastrowid

            conn.commit()
            conn.close()
            self.send_json_response({"success": True, "id": expense_id})
        except Exception as e:
            self.send_error(500, str(e))

    def delete_scheduled_expense(self):
        """API para eliminar gasto programado"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))

            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('DELETE FROM scheduled_expenses WHERE id = ?', (data['id'],))
            rows_affected = cursor.rowcount
            conn.commit()
            conn.close()
            if rows_affected > 0:
                self.send_json_response({"success": True})
            else:
                self.send_json_response({"success": False, "error": "No se pudo eliminar el gasto programado"})
        except Exception as e:
            self.send_error(500, str(e))
    
    def serve_file(self, filename, content_type):
        """Sirve archivos estáticos"""
        try:
            with open(filename, 'rb') as f:
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
    
    def get_categories(self):
        """API para obtener categorías"""
        try:
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
                    'icon': row[4]
                })
            conn.close()
            self.send_json_response(categories)
        except Exception as e:
            self.send_error(500, str(e))
    
    def get_transactions(self):
        """API para obtener transacciones"""
        try:
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
                    'category_name': row[7] if len(row) > 7 else None,
                    'category_color': row[8] if len(row) > 8 else None
                })
            conn.close()
            self.send_json_response(transactions)
        except Exception as e:
            print(f"Error en get_transactions: {e}")
            self.send_error(500, str(e))
    
    def get_dashboard(self):
        """API para obtener datos del dashboard"""
        try:
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
                    'category_name': row[7] if len(row) > 7 else None,
                    'category_color': row[8] if len(row) > 8 else None
                })
            
            conn.close()
            
            self.send_json_response({
                'total_income': total_income,
                'total_expenses': total_expenses,
                'balance': balance,
                'recent_transactions': recent_transactions
            })
        except Exception as e:
            print(f"Error en get_dashboard: {e}")
            self.send_error(500, str(e))
    
    def save_category(self):
        """API para guardar categoría"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
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
            self.send_json_response({"success": True, "id": category_id})
        except Exception as e:
            self.send_error(500, str(e))
    
    def save_transaction(self):
        """API para guardar transacción"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
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
            self.send_json_response({"success": True, "id": transaction_id})
        except Exception as e:
            self.send_error(500, str(e))
    
    def delete_transaction(self):
        """API para eliminar transacción"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            print(f"Intentando eliminar transacción ID: {data['id']}")
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Verificar si la transacción existe
            cursor.execute('SELECT COUNT(*) FROM transactions WHERE id = ?', (data['id'],))
            if cursor.fetchone()[0] == 0:
                conn.close()
                self.send_json_response({"success": False, "error": "Transacción no encontrada"})
                return
            
            # Eliminar la transacción
            cursor.execute('DELETE FROM transactions WHERE id = ?', (data['id'],))
            rows_affected = cursor.rowcount
            
            conn.commit()
            conn.close()
            
            if rows_affected > 0:
                print(f"Transacción {data['id']} eliminada exitosamente")
                self.send_json_response({"success": True})
            else:
                print(f"No se pudo eliminar la transacción {data['id']}")
                self.send_json_response({"success": False, "error": "No se pudo eliminar la transacción"})
                
        except Exception as e:
            print(f"Error eliminando transacción: {e}")
            self.send_json_response({"success": False, "error": str(e)})
    
    def backup_database(self):
        """API para respaldar la base de datos"""
        try:
            import shutil
            from datetime import datetime
            
            # Crear directorio de respaldos si no existe
            os.makedirs('backups', exist_ok=True)
            
            # Generar nombre del archivo de respaldo con fecha y hora
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_filename = f'backups/finances_backup_{timestamp}.db'
            
            # Copiar la base de datos
            shutil.copy2(self.db_path, backup_filename)
            
            print(f"✅ Respaldo creado: {backup_filename}")
            
            # Obtener estadísticas del respaldo
            conn = sqlite3.connect(backup_filename)
            cursor = conn.cursor()
            
            cursor.execute('SELECT COUNT(*) FROM categories')
            categories_count = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM transactions')
            transactions_count = cursor.fetchone()[0]
            
            conn.close()
            
            self.send_json_response({
                "success": True,
                "message": "Respaldo creado exitosamente",
                "filename": backup_filename,
                "stats": {
                    "categories": categories_count,
                    "transactions": transactions_count
                }
            })
            
        except Exception as e:
            print(f"Error creando respaldo: {e}")
            self.send_json_response({"success": False, "error": str(e)})
    
    def handle_export_database(self):
        """Exporta toda la base de datos a JSON"""
        try:
            import shutil
            from datetime import datetime
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Exportar categorías
            cursor.execute('SELECT * FROM categories')
            categories = []
            for row in cursor.fetchall():
                categories.append({
                    'id': row[0],
                    'name': row[1],
                    'type': row[2],
                    'color': row[3],
                    'icon': row[4]
                })
            
            # Exportar transacciones
            cursor.execute('SELECT * FROM transactions')
            transactions = []
            for row in cursor.fetchall():
                transactions.append({
                    'id': row[0],
                    'description': row[1],
                    'amount': row[2],
                    'type': row[3],
                    'category_id': row[4],
                    'date': row[5],
                    'notes': row[6]
                })
            
            # Exportar gastos programados
            cursor.execute('SELECT * FROM scheduled_expenses')
            scheduled_expenses = []
            for row in cursor.fetchall():
                scheduled_expenses.append({
                    'id': row[0],
                    'description': row[1],
                    'amount': row[2],
                    'frequency': row[3],
                    'next_payment': row[4],
                    'notes': row[5]
                })
            
            conn.close()
            
            export_data = {
                'export_date': datetime.now().isoformat(),
                'categories': categories,
                'transactions': transactions,
                'scheduled_expenses': scheduled_expenses,
                'version': '1.0'
            }
            
            self.send_json_response({
                'success': True,
                'data': export_data,
                'stats': {
                    'categories': len(categories),
                    'transactions': len(transactions),
                    'scheduled_expenses': len(scheduled_expenses)
                }
            })
            
        except Exception as e:
            print(f"Error exportando base de datos: {e}")
            self.send_json_response({'success': False, 'error': str(e)})
    
    def handle_import_database(self):
        """Importa datos a la base de datos"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            import_data = data.get('data', {})
            mode = data.get('mode', 'replace')  # 'replace' o 'merge'
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            stats = {'categories': 0, 'transactions': 0, 'scheduled_expenses': 0}
            
            if mode == 'replace':
                # Limpiar todas las tablas
                cursor.execute('DELETE FROM transactions')
                cursor.execute('DELETE FROM categories')
                cursor.execute('DELETE FROM scheduled_expenses')
                cursor.execute('DELETE FROM sqlite_sequence WHERE name IN ("categories", "transactions", "scheduled_expenses")')
            
            # Importar categorías
            categories = import_data.get('categories', [])
            for cat in categories:
                if mode == 'replace':
                    cursor.execute('''
                        INSERT INTO categories (name, type, color, icon)
                        VALUES (?, ?, ?, ?)
                    ''', (cat['name'], cat['type'], cat['color'], cat['icon']))
                else:  # merge
                    # Verificar si ya existe
                    cursor.execute('SELECT id FROM categories WHERE name = ? AND type = ?', 
                                 (cat['name'], cat['type']))
                    if not cursor.fetchone():
                        cursor.execute('''
                            INSERT INTO categories (name, type, color, icon)
                            VALUES (?, ?, ?, ?)
                        ''', (cat['name'], cat['type'], cat['color'], cat['icon']))
                        stats['categories'] += 1
            
            if mode == 'replace':
                stats['categories'] = len(categories)
            
            # Importar transacciones
            transactions = import_data.get('transactions', [])
            for trans in transactions:
                if mode == 'replace':
                    cursor.execute('''
                        INSERT INTO transactions (description, amount, type, category_id, date, notes)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ''', (trans['description'], trans['amount'], trans['type'], 
                          trans['category_id'], trans['date'], trans['notes']))
                else:  # merge
                    # Verificar si ya existe (por descripción, monto y fecha)
                    cursor.execute('''
                        SELECT id FROM transactions 
                        WHERE description = ? AND amount = ? AND date = ?
                    ''', (trans['description'], trans['amount'], trans['date']))
                    if not cursor.fetchone():
                        cursor.execute('''
                            INSERT INTO transactions (description, amount, type, category_id, date, notes)
                            VALUES (?, ?, ?, ?, ?, ?)
                        ''', (trans['description'], trans['amount'], trans['type'], 
                              trans['category_id'], trans['date'], trans['notes']))
                        stats['transactions'] += 1
            
            if mode == 'replace':
                stats['transactions'] = len(transactions)
            
            # Importar gastos programados
            scheduled = import_data.get('scheduled_expenses', [])
            for sch in scheduled:
                if mode == 'replace':
                    cursor.execute('''
                        INSERT INTO scheduled_expenses (description, amount, frequency, next_payment, notes)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (sch['description'], sch['amount'], sch['frequency'], 
                          sch['next_payment'], sch['notes']))
                else:  # merge
                    # Verificar si ya existe
                    cursor.execute('''
                        SELECT id FROM scheduled_expenses 
                        WHERE description = ? AND amount = ?
                    ''', (sch['description'], sch['amount']))
                    if not cursor.fetchone():
                        cursor.execute('''
                            INSERT INTO scheduled_expenses (description, amount, frequency, next_payment, notes)
                            VALUES (?, ?, ?, ?, ?)
                        ''', (sch['description'], sch['amount'], sch['frequency'], 
                              sch['next_payment'], sch['notes']))
                        stats['scheduled_expenses'] += 1
            
            if mode == 'replace':
                stats['scheduled_expenses'] = len(scheduled)
            
            conn.commit()
            conn.close()
            
            self.send_json_response({
                'success': True,
                'mode': mode,
                'stats': stats,
                'message': f'Base de datos {"reemplazada" if mode == "replace" else "fusionada"} exitosamente'
            })
            
        except Exception as e:
            print(f"Error importando base de datos: {e}")
            self.send_json_response({'success': False, 'error': str(e)})

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

def run_server(port=None):
    """Ejecuta el servidor web"""
    # Para Railway, usar el puerto asignado por la variable de entorno PORT
    if port is None:
        port = int(os.environ.get('PORT', 3000))
    
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleFinanceServer)
    print(f"Servidor iniciado en puerto {port}")
    print("Presiona Ctrl+C para detener el servidor")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido")
        httpd.server_close()

if __name__ == '__main__':
    run_server() 