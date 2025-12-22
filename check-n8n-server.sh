#!/bin/bash

# Скрипт проверки готовности сервера n8n на Ubuntu
# Автор: abaranovskydako-tech
# Дата: 2025-12-22

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================="
echo "Проверка готовности сервера n8n"
echo "================================="
echo ""

# 1. Проверка версии Node.js
echo "[1/6] Проверка версии Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d'.' -f1)
    echo "Установлена версия Node.js: $(node -v)"
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✓ Node.js версия ≥18 - OK${NC}"
    else
        echo -e "${RED}✗ Node.js версия < 18 - ТРЕБУЕТСЯ ОБНОВЛЕНИЕ${NC}"
        echo "Установите Node.js 18+ через nvm или NodeSource"
        exit 1
    fi
else
    echo -e "${RED}✗ Node.js не установлен${NC}"
    exit 1
fi
echo ""

# 2. Проверка установки n8n
echo "[2/6] Проверка установки n8n..."
if command -v n8n &> /dev/null; then
    N8N_VERSION=$(n8n -v 2>&1 | head -n 1 || echo "неизвестно")
    echo "Установлена версия n8n: $N8N_VERSION"
    echo -e "${GREEN}✓ n8n установлен - OK${NC}"
else
    echo -e "${RED}✗ n8n не установлен${NC}"
    echo "Установите через: npm install -g n8n"
    exit 1
fi
echo ""

# 3. Проверка DB_SQLITE_PATH и файла базы
echo "[3/6] Проверка базы данных SQLite..."
DB_PATH="${DB_SQLITE_PATH:-/root/.n8n/database.sqlite}"
echo "Путь к базе: $DB_PATH"

if [ -f "$DB_PATH" ]; then
    DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
    echo "Файл базы существует, размер: $DB_SIZE"
    echo -e "${GREEN}✓ База данных найдена - OK${NC}"
else
    echo -e "${YELLOW}⚠ Файл базы не существует${NC}"
    echo "Он будет создан при первом запуске n8n"
    # Создаём директорию, если её нет
    DB_DIR=$(dirname "$DB_PATH")
    mkdir -p "$DB_DIR"
    echo "Создана директория: $DB_DIR"
fi

if [ -z "$DB_SQLITE_PATH" ]; then
    echo -e "${YELLOW}⚠ Переменная DB_SQLITE_PATH не установлена${NC}"
    echo "Рекомендуется добавить в ~/.bashrc или systemd unit:"
    echo "export DB_SQLITE_PATH=/root/.n8n/database.sqlite"
else
    echo -e "${GREEN}✓ DB_SQLITE_PATH установлена${NC}"
fi
echo ""

# 4. Проверка дублирующихся процессов n8n
echo "[4/6] Проверка запущенных процессов n8n..."
N8N_PROCESSES=$(ps aux | grep -v grep | grep -c "n8n" || true)
if [ "$N8N_PROCESSES" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Найдено процессов n8n: $N8N_PROCESSES${NC}"
    ps aux | grep -v grep | grep "n8n"
    echo ""
    read -p "Остановить все процессы n8n? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[YyДд]$ ]]; then
        echo "Останавливаем процессы n8n..."
        pkill -f n8n || true
        sleep 2
        N8N_AFTER=$(ps aux | grep -v grep | grep -c "n8n" || true)
        if [ "$N8N_AFTER" -eq 0 ]; then
            echo -e "${GREEN}✓ Все процессы n8n остановлены${NC}"
        else
            echo -e "${RED}✗ Не удалось остановить все процессы${NC}"
            ps aux | grep -v grep | grep "n8n"
        fi
    else
        echo "Процессы оставлены запущенными"
    fi
else
    echo -e "${GREEN}✓ Дублирующихся процессов не найдено${NC}"
fi
echo ""

# 5. Проверка порта 5678
echo "[5/6] Проверка доступности порта 5678..."
if command -v netstat &> /dev/null; then
    PORT_CHECK=$(netstat -tulnp 2>/dev/null | grep ":5678" || true)
    if [ -z "$PORT_CHECK" ]; then
        echo -e "${GREEN}✓ Порт 5678 свободен${NC}"
    else
        echo -e "${RED}✗ Порт 5678 занят:${NC}"
        echo "$PORT_CHECK"
        PID=$(echo "$PORT_CHECK" | awk '{print $7}' | cut -d'/' -f1)
        if [ ! -z "$PID" ]; then
            echo ""
            read -p "Остановить процесс $PID? (y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[YyДд]$ ]]; then
                kill "$PID" 2>/dev/null && echo -e "${GREEN}✓ Процесс остановлен${NC}" || echo -e "${RED}✗ Не удалось остановить${NC}"
            fi
        fi
    fi
else
    echo -e "${YELLOW}⚠ netstat не установлен, используем ss...${NC}"
    if command -v ss &> /dev/null; then
        PORT_CHECK=$(ss -tulnp 2>/dev/null | grep ":5678" || true)
        if [ -z "$PORT_CHECK" ]; then
            echo -e "${GREEN}✓ Порт 5678 свободен${NC}"
        else
            echo -e "${RED}✗ Порт 5678 занят:${NC}"
            echo "$PORT_CHECK"
        fi
    else
        echo -e "${RED}✗ Ни netstat, ни ss не установлены${NC}"
        echo "Установите net-tools: apt-get install net-tools"
    fi
fi
echo ""

# 6. Итоговая проверка
echo "[6/6] Итоговая проверка..."
echo ""
echo "================================="
echo "РЕЗУЛЬТАТ ПРОВЕРКИ"
echo "================================="
echo "Node.js: $(node -v)"
echo "n8n: $(n8n -v 2>&1 | head -n 1 || echo 'неизвестно')"
echo "База данных: $DB_PATH"
echo "Процессы n8n: $(ps aux | grep -v grep | grep -c 'n8n' || echo '0')"
echo "Порт 5678: $(netstat -tulnp 2>/dev/null | grep -q ':5678' && echo 'ЗАНЯТ' || echo 'СВОБОДЕН')"
echo "================================="
echo ""
echo -e "${GREEN}✓ Сервер готов к запуску n8n${NC}"
echo ""
echo "Для запуска n8n выполните:"
echo "export DB_SQLITE_PATH=/root/.n8n/database.sqlite"
echo "n8n"
echo ""
echo "Или через systemd, если настроен сервис."
echo ""
