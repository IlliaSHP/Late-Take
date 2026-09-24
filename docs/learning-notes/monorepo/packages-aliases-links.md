# Monorepo: packages, aliases, links

> **Коротко.** Monorepo — один репозиторій з кількома apps і packages. Workspace — усі ці packages під керуванням одного package manager (pnpm). Package — окрема частина системи зі своїм `package.json`; залежності між packages утворюють dependency graph. Alias лише скорочує шлях імпорту й про залежності нічого не знає.
>
> Цей файл — рівень package manager. Як поверх нього налаштований TypeScript і редактор (`paths`, `include`, Project References) — у [typescript-setup.md](./typescript-setup.md).

---

## 1. Monorepo

**Monorepo** — один Git-репозиторій, у якому лежить кілька застосунків і/або packages.

```text
project/
├── apps/
│   └── mobile/
├── packages/
│   ├── api/
│   ├── constants/
│   ├── hooks/
│   ├── schemas/
│   ├── tokens/
│   ├── types/
│   ├── ui/
│   └── utils/
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

Один репозиторій — це не один застосунок і не один package. Monorepo просто дозволяє тримати пов'язані частини системи разом.

---

## 2. Workspace

**Workspace** — набір packages, якими package manager керує разом. У pnpm він описується в `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

Це вказує pnpm, у яких папках шукати workspace packages.

Папка сама по собі ще не package. Package нею стає, коли в ній є власний `package.json`.

---

## 3. Package

Package — окрема програмна одиниця зі своїм `package.json`:

```text
packages/types/
├── package.json
└── src/
    └── index.ts
```

```json
{
  "name": "@app/types",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

- `name` — ім'я, за яким package імпортують.
- `private` — не дає випадково опублікувати package в npm.
- `main` — точка входу package.
- `types` — точка входу для TypeScript-типів.

`main` і `types` тут вказують прямо на TS-вихідник, без окремого build-кроку: Metro і TypeScript читають `src/index.ts` напряму.

Тепер папку `packages/types` можна імпортувати за ім'ям:

```ts
import type { TMediaType } from '@app/types';
```

### Scoped name

`@app/types` — **scoped package name**: `@app` — scope (простір імен), `types` — ім'я package. Scope групує пов'язані packages і не дає назвам конфліктувати з чужими packages у npm.

Таке ім'я — це назва package, а не alias. Поле `"name": "@app/types"` вже створює package з цим ім'ям.

---

## 4. `workspace:*`

Застосунок оголошує залежність на package у своєму `package.json`:

```json
{
  "dependencies": {
    "@app/types": "workspace:*"
  }
}
```

`workspace:*` означає "використовуй саме локальний package `@app/types` з цього workspace". Так явно видно, що це внутрішня залежність, а не однойменний package з npm registry.

Протокол `workspace:` підтримують pnpm, yarn і bun. У npm workspaces пишуть просто `"*"`.

Залежності між packages оголошуються так само. Якщо `@app/constants` використовує `@app/types`, у `packages/constants/package.json` теж з'являється `"@app/types": "workspace:*"`.

---

## 5. `--filter`

```bash
pnpm --filter mobile add @app/types @app/constants
```

`--filter mobile` виконує команду для конкретного package — тут `mobile`. Залежності додаються в `apps/mobile/package.json`, а не в root.

Інші приклади:

```bash
pnpm --filter mobile dev          # запустити скрипт dev у mobile
pnpm --filter @app/ui test        # запустити тести в @app/ui
```

---

## 6. Як package знаходиться без alias

Якщо в `mobile` є залежність `"@app/types": "workspace:*"`, pnpm створює в `node_modules` **symlink** — посилання у файловій системі на справжню папку:

```text
apps/mobile/node_modules/@app/types   →   packages/types
```

У `node_modules` це виглядає як звичайний встановлений package, але це не копія, а посилання. Тому зміни в `packages/types` одразу видно в `mobile` без перевстановлення.

Звідси ланцюжок, за яким знаходиться імпорт `'@app/types'`:

```text
'@app/types'
→ node_modules/@app/types
→ symlink → packages/types
→ package.json (main / types / exports)
→ src/index.ts
```

Тобто **для самого імпорту alias не потрібен** — package працює і без нього.

---

## 7. Dependency graph

Коли залежності явно записані в `package.json`, утворюється **dependency graph** — формальна карта "хто від кого залежить":

```text
mobile
├── @app/ui        → @app/types
├── @app/api       → @app/types
└── @app/constants → @app/types
```

Ним користуються pnpm, CI і monorepo-інструменти (Turborepo, Nx). За графом можна визначити, які packages зачепила зміна, які з них треба перезібрати чи протестувати і в якому порядку запускати задачі.

---

## 8. Транзитивні залежності

Якщо A залежить від B, а B — від C, то C — **транзитивна** залежність для A.

Наприклад, `mobile → @app/ui → animation-library`. `mobile` сам не оголошував `animation-library`, але вона потрібна через `@app/ui`, і package manager встановить її автоматично, пройшовши граф.

Правило: якщо A **сам** імпортує C, він має явно оголосити C у своєму `package.json`, а не покладатися на те, що C "прийшов" через B. Причини:

- pnpm суворий: він не дасть імпортувати package, якого немає у твоєму `package.json` (так звана phantom dependency), навіть якщо той фізично є десь у `node_modules`.
- B колись може перестати залежати від C — і в A все зламається без жодних змін у самому A.

---

## 9. Чому packages, а не лише aliases

Alias може зіставити `@app/types` → `../../packages/types/src`, але він лише каже, **де лежить код**. Він не повідомляє pnpm, що `mobile` залежить від `@app/types`.

Package dependency якраз це повідомляє. Package дає:

- власний `package.json` і межу модуля;
- явні залежності і dependency graph;
- workspace linking;
- власні scripts, версії, можливість окремо збирати й тестувати;
- видимість для monorepo-інструментів.

Shared-модулі (types, constants, api, schemas, ui, hooks, utils, tokens) винесені в packages, тому що це окремі частини системи, які перевикористовуються, а не просто зручні папки. Якби це були лише aliases (`@constants → packages/constants/src`), package manager не знав би про зв'язки між ними.

Aliases у проєкті теж є, але як додатковий шар для редактора поверх packages — див. [typescript-setup.md](./typescript-setup.md).

---

## 10. Workspace link ≠ deep link

Спільне лише слово "link":

- **Workspace link** — посилання у файловій системі: `node_modules/@app/types` → `packages/types`. Створює package manager.
- **Deep link** — URL, що відкриває конкретний екран застосунку: `myapp://title/movie/123`. Див. [routing-foundations.md](../routing/routing-foundations.md).