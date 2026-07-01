# Portfolio

Личный сайт-портфолио. Вёрстка по макетам из Figma.

## Старт

```bash
cd ~/my-portfolio
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## Figma

Пришли в чат Cursor ссылку на **Frame** в Figma — см. [FIGMA.md](./FIGMA.md).

```
Сверстай hero:
https://www.figma.com/design/...?node-id=...
```

## Структура

| Путь | Назначение |
|------|------------|
| `src/app/` | Страницы |
| `src/components/` | Секции из Figma |
| `src/lib/figma.ts` | Парсинг ссылок Figma |
| `design/frames.json` | Реестр привязанных фреймов |
| `public/figma/` | Ассеты из макета |

## Открыть в Cursor

**File → Open Folder** → `~/my-portfolio`

Это отдельный проект, не связан с Expo-игрой.
