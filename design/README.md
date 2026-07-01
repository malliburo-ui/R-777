# Figma → код

Реестр макетов для портфолио. Когда присылаешь ссылку на фрейм в чат, агент:

1. Парсит URL (`src/lib/figma.ts`)
2. Запрашивает макет через Figma MCP (`get_design_context`)
3. Обновляет запись в `frames.json`
4. Верстает компонент в `src/components/`

## Формат ссылки

```
https://www.figma.com/design/FILE_KEY/Имя-файла?node-id=123-456
```

Выдели нужный **Frame** в Figma → Share → Copy link.

## Как писать в чат

```
Сверстай этот фрейм как главную страницу:
https://www.figma.com/design/...?node-id=...
```

или короче:

```
@FIGMA.md вот hero: https://...
```
