# Работа с Figma в этом проекте

## Что прислать

Ссылку на **конкретный Frame** в Figma:

```
https://www.figma.com/design/XXXXXXXX/Имя-файла?node-id=123-456
```

## Что сделает агент

1. Разберёт URL (`fileKey`, `nodeId`)
2. Получит скриншот и контекст через **Figma MCP** (`get_design_context`)
3. Сохранит ссылку в `design/frames.json`
4. Сверстает экран в `src/components/` + подключит в `src/app/page.tsx`
5. При необходимости выгрузит ассеты в `public/figma/`

## Шаблон сообщения

```text
Сверстай [название секции] по Figma:
https://www.figma.com/design/...?node-id=...

Стек: Next.js + Tailwind (этот проект).
```

## Несколько экранов

Один файл Figma — несколько фреймов. На каждый экран — отдельная ссылка с `node-id`.

## Реестр макетов

| Секция | Статус | Ссылка |
|--------|--------|--------|
| Home   | pending | — |

Обновляется в `design/frames.json`.
