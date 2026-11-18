---
paths:
  - "src/frontend/src/components/**/*.tsx"
---

# Component conventions

- Always reuse the existing primitives in `src/frontend/src/components/ui/` (button, dialog,
  form, input, label, popover, sonner, textarea, toggle-group, tooltip) instead of building new
  base elements from scratch. If a primitive is missing, add it to `components/ui/` in the same
  shadcn style rather than inlining a one-off.
- Style with Tailwind utility classes that match the patterns already used in neighbouring
  components. Don't write custom CSS.
