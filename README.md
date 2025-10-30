## Описание

Реализация класса TreeStore для работы с древовидными структурами данных и визуализация через AG-Grid в Vue 3.

## Технологии

- **Vue 3** - фреймворк
- **TypeScript** - типизация
- **AG-Grid Enterprise** - таблица с группировкой
- **Tailwind CSS** - стилизация
- **Vite** - сборщик

## Установка и запуск

```bash
# Установка зависимостей
pnpm install

# Запуск dev сервера
pnpm dev

# Сборка для продакшена
pnpm build
```

## Структура проекта

```
mstroy-app/
├── src/
│   ├── components/
│   │   └── TreeGrid.vue      # Компонент с AG-Grid
│   ├── TreeStore.ts           # Класс для работы с деревом
│   ├── App.vue                # Главный компонент
│   ├── main.ts                # Точка входа
│   └── style.css              # Глобальные стили
├── package.json
└── vite.config.ts
```
