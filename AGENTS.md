# Portfolio site — agent notes

- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4
- **Dev:** `npm run dev` → http://localhost:3000
- **Figma workflow:** see `FIGMA.md` and `.cursor/rules/figma-design.mdc`

## Structure

```
src/app/           — pages (App Router)
src/components/    — UI sections from Figma frames
src/lib/figma.ts   — parse Figma URLs
design/frames.json — registry of linked frames
public/figma/      — exported assets from Figma
```

## User sends a Figma link

Always call Figma MCP `get_design_context` before implementing.
