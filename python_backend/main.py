#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
import sqlite3
import os
from datetime import datetime, timedelta
from pathlib import Path
import shutil

class FinanceDatabase:
    def __init__(self):
        self.db_path = self._get_db_path()
        self.init_database()
    
    def _get_db_path(self):
        """Obtener la ruta de la base de datos"""
        # En desarrollo, usar el directorio actual
        if getattr(sys, 'frozen', False):
            # Si es un ejecutable
            base_path = sys._MEIPASS
        else:
            # Si es desarrollo
            base_path = os.path.dirname(os.path.abspath(__file__))
        
        db_dir = os.path.join(base_path, 'data')
        os.makedirs(db_dir, exist_ok=True)
        return os.path.join(db_dir, 'finances.db')
    
    def init_database(self):
        """Inicializar la base de datos con las tablas necesarias"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Crear tabla de categorías
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                color TEXT DEFAULT '#007bff',
                icon TEXT DEFAULT '📁',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Crear tabla de transacciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                amount REAL NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
                category_id INTEGER,
                date DATE NOT NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        ''')
        
        # Crear tabla de configuración
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT NOT NULL UNIQUE,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Insertar categorías por defecto
        default_categories = [
            ('Compras', '#FF6384', '🛒'),
            ('Transporte', '#36A2EB', '🚗'),
            ('Hogar', '#FFCE56', '🏠'),
            ('Comida', '#4BC0C0', '🍽️'),
            ('Trabajo', '#9966FF', '💼'),
            ('Salud', '#FF9F40', '❤️'),
            ('Educación', '#FF6384', '🎓'),
            ('Viajes', '#C9CBCF', '✈️'),
            ('Salario', '#28A745', '💰'),
            ('Freelance', '#20C997', '💻'),
            ('Inversiones', '#17A2B8', '📈'),
            ('Otros', '#6C757D', '📁')
        ]
        
        for name, color, icon in default_categories:
            cursor.execute('''
                INSERT OR IGNORE INTO categories (name, color, icon)
                VALUES (?, ?, ?)
            ''', (name, color, icon))
        
        # Insertar configuración por defecto
        default_settings = [
            ('currency', 'MXN'),
            ('language', 'es'),
            ('theme', 'light')
        ]
        
        for key, value in default_settings:
            cursor.execute('''
                INSERT OR IGNORE INTO settings (key, value)
                VALUES (?, ?)
            ''', (key, value))
        
        conn.commit()
        conn.close()
    
    def get_categories(self):
        """Obtener todas las categorías"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, name, color, icon, 
                   COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) as total_amount
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id
            GROUP BY c.id, c.name, c.color, c.icon
            ORDER BY c.name
        ''')
        
        categories = []
        for row in cursor.fetchall():
            categories.append({
                'id': row[0],
                'name': row[1],
                'color': row[2],
                'icon': row[3],
                'total_amount': row[4]
            })
        
        conn.close()
        return {'categories': categories}
    
    def save_category(self, data):
        """Guardar una nueva categoría"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO categories (name, color, icon)
                VALUES (?, ?, ?)
            ''', (data['name'], data['color'], data['icon']))
            
            conn.commit()
            category_id = cursor.lastrowid
            
            conn.close()
            return {'success': True, 'id': category_id}
        except sqlite3.IntegrityError:
            conn.close()
            return {'success': False, 'error': 'La categoría ya existe'}
    
    def get_transactions(self, filters=None):
        """Obtener transacciones con filtros opcionales"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = '''
            SELECT t.id, t.description, t.amount, t.type, t.category_id, 
                   t.date, t.notes, c.name as category_name, c.color, c.icon
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
        '''
        
        params = []
        where_clauses = []
        
        if filters:
            if filters.get('category_id'):
                where_clauses.append('t.category_id = ?')
                params.append(filters['category_id'])
            
            if filters.get('type'):
                where_clauses.append('t.type = ?')
                params.append(filters['type'])
            
            if filters.get('date'):
                where_clauses.append('t.date = ?')
                params.append(filters['date'])
            
            if filters.get('start_date'):
                where_clauses.append('t.date >= ?')
                params.append(filters['start_date'])
            
            if filters.get('end_date'):
                where_clauses.append('t.date <= ?')
                params.append(filters['end_date'])
        
        if where_clauses:
            query += ' WHERE ' + ' AND '.join(where_clauses)
        
        query += ' ORDER BY t.date DESC, t.created_at DESC'
        
        cursor.execute(query, params)
        
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
                'category_name': row[7],
                'color': row[8],
                'icon': row[9]
            })
        
        conn.close()
        return {'transactions': transactions}
    
    def save_transaction(self, data):
        """Guardar una nueva transacción"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO transactions (description, amount, type, category_id, date, notes)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                data['description'],
                data['amount'],
                data['type'],
                data['category_id'],
                data['date'],
                data.get('notes', '')
            ))
            
            conn.commit()
            transaction_id = cursor.lastrowid
            
            conn.close()
            return {'success': True, 'id': transaction_id}
        except Exception as e:
            conn.close()
            return {'success': False, 'error': str(e)}
    
    def delete_transaction(self, transaction_id):
        """Eliminar una transacción"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
            conn.commit()
            conn.close()
            return {'success': True}
        except Exception as e:
            conn.close()
            return {'success': False, 'error': str(e)}
    
    def get_dashboard_stats(self):
        """Obtener estadísticas del dashboard"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener fecha actual y primer día del mes
        now = datetime.now()
        first_day = now.replace(day=1)
        
        # Estadísticas del mes actual
        cursor.execute('''
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
                COUNT(*) as total_transactions
            FROM transactions 
            WHERE date >= ? AND date <= ?
        ''', (first_day.strftime('%Y-%m-%d'), now.strftime('%Y-%m-%d')))
        
        month_stats = cursor.fetchone()
        
        # Estadísticas totales
        cursor.execute('''
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            FROM transactions
        ''')
        
        total_stats = cursor.fetchone()
        
        # Gastos por categoría
        cursor.execute('''
            SELECT c.name as category_name, 
                   COALESCE(SUM(t.amount), 0) as total
            FROM categories c
            LEFT JOIN transactions t ON c.id = t.category_id 
                AND t.type = 'expense' 
                AND t.date >= ? AND t.date <= ?
            GROUP BY c.id, c.name
            HAVING total > 0
            ORDER BY total DESC
        ''', (first_day.strftime('%Y-%m-%d'), now.strftime('%Y-%m-%d')))
        
        expense_by_category = []
        for row in cursor.fetchall():
            expense_by_category.append({
                'category_name': row[0],
                'total': row[1]
            })
        
        # Datos de flujo de efectivo (últimos 7 días)
        cashflow_data = []
        for i in range(7):
            date = now - timedelta(days=i)
            date_str = date.strftime('%Y-%m-%d')
            
            cursor.execute('''
                SELECT 
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
                FROM transactions 
                WHERE date = ?
            ''', (date_str,))
            
            day_stats = cursor.fetchone()
            cashflow_data.append({
                'date': date.strftime('%m/%d'),
                'income': day_stats[0],
                'expense': day_stats[1]
            })
        
        cashflow_data.reverse()  # Ordenar cronológicamente
        
        conn.close()
        
        return {
            'total_income': month_stats[0],
            'total_expense': month_stats[1],
            'total_transactions': month_stats[2],
            'total_balance': total_stats[0] - total_stats[1],
            'expense_by_category': expense_by_category,
            'cashflow_data': cashflow_data
        }
    
    def get_report(self, period='month'):
        """Obtener reporte financiero"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Calcular fechas según el período
        now = datetime.now()
        if period == 'month':
            start_date = now.replace(day=1)
        elif period == 'quarter':
            quarter = (now.month - 1) // 3
            start_date = now.replace(month=quarter * 3 + 1, day=1)
        elif period == 'year':
            start_date = now.replace(month=1, day=1)
        else:
            start_date = now.replace(day=1)
        
        cursor.execute('''
            SELECT 
                COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
            FROM transactions 
            WHERE date >= ? AND date <= ?
        ''', (start_date.strftime('%Y-%m-%d'), now.strftime('%Y-%m-%d')))
        
        stats = cursor.fetchone()
        
        conn.close()
        
        return {
            'total_income': stats[0],
            'total_expense': stats[1],
            'balance': stats[0] - stats[1],
            'period': period
        }
    
    def backup_database(self):
        """Crear respaldo de la base de datos"""
        try:
            backup_path = self.db_path.replace('.db', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db')
            shutil.copy2(self.db_path, backup_path)
            return {'success': True, 'backup_path': backup_path}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def reset_database(self):
        """Resetear la base de datos"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Eliminar todas las transacciones
            cursor.execute('DELETE FROM transactions')
            
            # Resetear autoincrement
            cursor.execute('DELETE FROM sqlite_sequence WHERE name = "transactions"')
            
            conn.commit()
            conn.close()
            
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def export_report(self, period='month'):
        """Exportar reporte a archivo"""
        try:
            report_data = self.get_report(period)
            
            # Crear directorio de exportaciones
            export_dir = os.path.join(os.path.dirname(self.db_path), 'exports')
            os.makedirs(export_dir, exist_ok=True)
            
            # Generar nombre de archivo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f'reporte_financiero_{period}_{timestamp}.json'
            filepath = os.path.join(export_dir, filename)
            
            # Guardar reporte
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, ensure_ascii=False, indent=2)
            
            return {'success': True, 'filepath': filepath}
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Instancia global de la base de datos
db = FinanceDatabase()

def handle_command(command, data_str):
    """Manejar comandos del frontend"""
    try:
        data = json.loads(data_str) if data_str else {}
        
        if command == 'init_database':
            return {'success': True, 'message': 'Base de datos inicializada'}
        
        elif command == 'get_categories':
            return db.get_categories()
        
        elif command == 'save_category':
            return db.save_category(data)
        
        elif command == 'get_transactions':
            return db.get_transactions(data)
        
        elif command == 'save_transaction':
            return db.save_transaction(data)
        
        elif command == 'delete_transaction':
            return db.delete_transaction(data['id'])
        
        elif command == 'get_dashboard_stats':
            return db.get_dashboard_stats()
        
        elif command == 'get_report':
            return db.get_report(data.get('period', 'month'))
        
        elif command == 'backup_database':
            return db.backup_database()
        
        elif command == 'reset_database':
            return db.reset_database()
        
        elif command == 'export_report':
            return db.export_report(data.get('period', 'month'))
        
        else:
            return {'success': False, 'error': f'Comando desconocido: {command}'}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}

if __name__ == '__main__':
    # Leer argumentos de línea de comandos
    if len(sys.argv) >= 3:
        command = sys.argv[1]
        data_str = sys.argv[2]
        
        result = handle_command(command, data_str)
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(json.dumps({'success': False, 'error': 'Argumentos insuficientes'}, ensure_ascii=False)) 