# Monorepo: налаштування TypeScript

> **Коротко.** Фундамент — workspace packages (див. [packages-aliases-links.md](./packages-aliases-links.md)). Поверх них TypeScript налаштований для зручності редактора: `paths` дають autocomplete шляху імпорту, `include` дозволяє auto-import символів зі shared packages. Project References не використано: для поточного розміру проєкту окремий TypeScript build graph не потрібен.

---

## 1. Шари, які не треба змішувати

| Механізм | За що відповідає |
|---|---|
| Workspace packages | реальні частини системи та залежності між ними |
| pnpm | встановлює залежності й зв'язує локальні packages через symlink |
| `paths` (aliases) | зіставлення імені імпорту зі шляхом; тут — ще й autocomplete шляху імпорту |
| `include` | які файли входять у TypeScript project і які бачить Language Service |
| Project References | формальний зв'язок між кількома окремими TypeScript projects |

Кожен шар вирішує свою задачу. Жоден не замінює інший.

---

## 2. Alias працює на двох рівнях

Alias налаштовують для двох різних інструментів:

1. **TypeScript** (`paths` у `tsconfig.json`) — для перевірки типів і редактора: autocomplete, перехід до визначення, підказки імпортів.
2. **Bundler** — для реального запуску коду.

TS `paths` не впливає на те, як код виконується. Якщо alias налаштовано лише в TS, редактор помилок не покаже, а застосунок упаде з "module not found".

Metro в Expo читає `paths` із `tsconfig.json` сам. Vite — ні: там alias окремо прописують у `resolve.alias` (або ставлять плагін `vite-tsconfig-paths`).

---

## 3. `paths` у mobile

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["../assets/*"],

      "@app/types": ["../../packages/types/src"],
      "@app/constants": ["../../packages/constants/src"],
      "@app/utils": ["../../packages/utils/src"],
      "@app/tokens": ["../../packages/tokens/src"],
      "@app/schemas": ["../../packages/schemas/src"],
      "@app/api": ["../../packages/api/src"],
      "@app/hooks": ["../../packages/hooks/src"],
      "@app/ui": ["../../packages/ui/src"]
    }
  }
}
```

Тут два види aliases.

**Внутрішні aliases mobile** (`@/*`, `@/assets/*`) — просто скорочують шляхи всередині застосунку:

```ts
import { Button } from '../../../components/Button';   // без alias
import { Button } from '@/components/Button';          // з alias
```

**Aliases з тими ж іменами, що й workspace packages** (`@app/types` тощо) — про них далі.

---

## 4. Alias з тією ж назвою, що й package

Одночасно існують package `"name": "@app/types"` і alias `"@app/types": ["../../packages/types/src"]`.

Конфлікту немає. TypeScript спочатку перевіряє `paths`, і якщо ім'я збігається, бере шлях звідти, не доходячи до `node_modules`. Обидва шляхи ведуть в одну й ту саму папку `packages/types`, тож результат однаковий.

Package dependency при цьому нікуди не зникає: pnpm і далі знає, що `mobile` залежить від `@app/types`, і dependency graph залишається правильним.

Однакові назви обрано навмисно: імпорт завжди виглядає однаково (`'@app/types'`), незалежно від того, який механізм його знаходить. Не треба пам'ятати дві назви одного модуля (наприклад, package `@app/types` і alias `@packages/types`).

Але package і alias від цього не стають однією сутністю: package — рівень залежностей, alias — рівень TypeScript і редактора.

---

## 5. Навіщо aliases, якщо package вже працює

Не тому, що без них package не працює. Імпорт `'@app/types'`, написаний вручну, працював і без `paths`.

Проблема була в редакторі: при наборі `'@app/ty...'` він не пропонував локальні workspace packages у списку підказок. З `paths` TypeScript має явну карту "ім'я → папка" і пропонує їх.

Тобто:

- **package** робить імпорт реальним і описує залежність;
- **alias** додатково покращує autocomplete у редакторі.

Це не універсальна вимога для всіх monorepo. У багатьох setup редактор знаходить workspace packages і без дублювання в `paths`. Тут без них autocomplete працював погано, тому `paths` залишено як практичне доповнення.

---

## 6. Два різні види autocomplete

**A. Autocomplete шляху імпорту.** Ти вже пишеш `import { something } from '@app/...'`, і редактор пропонує `@app/types`, `@app/constants`, `@app/ui`. Для цього тут потрібні `paths`.

**B. Auto-import символу.** Імпорту ще немає. Ти просто пишеш у коді `MEDIA_TYPES`, і редактор пропонує цей символ та сам додає:

```ts
import { MEDIA_TYPES } from '@app/constants';
```

Це інша задача. Щоб TypeScript Language Service знав про `MEDIA_TYPES`, він повинен бачити файл, де цей символ експортується. Для цього потрібен `include`.

---

## 7. `include`

Спочатку в `apps/mobile/tsconfig.json` було приблизно:

```json
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ]
}
```

Patterns у `include` рахуються від папки, де лежить `tsconfig.json`, тобто від `apps/mobile/`. Тому вони охоплювали лише файли mobile, а вихідники packages лежать зовні — у `packages/*/src`.

Тому в `include` додано вихідники packages:

```json
{
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",

    "../../packages/*/src/**/*.ts",
    "../../packages/*/src/**/*.tsx"
  ]
}
```

Тепер TypeScript project mobile охоплює і `apps/mobile`, і `packages/*/src`.

`include` — не alias і не залежність. Він визначає, які файли входять у TypeScript project. Після розширення Language Service бачить експорти shared packages:

```text
packages/constants/src/index.ts
→ export const MEDIA_TYPES = ...
→ Language Service бачить цей символ
→ редактор пропонує MEDIA_TYPES і сам додає імпорт
```

---

## 8. `paths` і `include` — різні задачі

- **`paths`** — як зіставити ім'я імпорту зі шляхом. Тут — autocomplete шляху імпорту.
- **`include`** — які файли входять у TypeScript project. Тут — auto-import символів зі shared packages.
- **Package dependencies** — хто від кого залежить.

`paths` не замінює `include`, `include` не замінює залежності, а залежності не замінюють налаштування редактора.

---

## 9. TypeScript у root

```bash
pnpm add -w -D typescript
```

- `-w` — додати в root workspace (root `package.json`), а не в конкретний package.
- `-D` — як devDependency.

Так у monorepo з'являється одна контрольована версія TypeScript для всього tooling: `tsc`, редактора, скриптів, CI.

Але проблему з auto-import символів вирішило не встановлення TypeScript, а розширення `include`.

---

## 10. `tsconfig.base.json`

```json
{
  "extends": [
    "expo/tsconfig.base",
    "../../tsconfig.base.json"
  ]
}
```

`extends` бере спільні налаштування компілятора, щоб не дублювати їх у кожному package і застосунку. Масив в `extends` підтримується з TypeScript 5.0; якщо налаштування перетинаються, пріоритет має пізніший файл у масиві.

Root `tsconfig.base.json` містить загальне: `strict`, налаштування модулів, прапорці компілятора. `apps/mobile/tsconfig.json` додає специфічне для mobile: налаштування Expo, `paths`, `include`.

`tsconfig.base.json` — спільна конфігурація, а не dependency graph.

---

## 11. Project References

Складніший механізм TypeScript для репозиторію з кількома проєктами. Кожен package стає **окремим** TypeScript project, а mobile на них посилається:

```json
{
  "references": [
    { "path": "../../packages/types" },
    { "path": "../../packages/ui" }
  ]
}
```

Referenced package має `"composite": true` у своєму `tsconfig.json`.

Що це дає: TypeScript знає, хто від кого залежить, який project будувати першим, що вже зібрано і що можна не перезбирати. `tsc -b` будує весь граф у правильному порядку, з інкрементальною збіркою. Це масштабується краще для великих репозиторіїв, де packages мають власну збірку.

### Чому не використано

Для кількох невеликих internal packages і одного застосунку це зайва конфігурація: окремі `tsconfig` для кожного package, `references`, `composite`, налаштування declarations і output, стан інкрементальної збірки.

Тому зроблено простіше: вихідники packages включено в TypeScript project mobile через `include`, плюс `paths`. Shared packages аналізуються разом із mobile, без окремого TypeScript build graph.

Якщо репозиторій сильно виросте, Project References можуть стати логічнішими.

---

## 12. Порівняння варіантів

| Варіант | Плюси | Мінуси |
|---|---|---|
| **Тільки aliases** (усе в одному `src/`) | простота, короткі імпорти | немає меж між модулями, немає залежностей у `package.json` і dependency graph |
| **Packages без aliases** | чиста модель packages, менше дублювання конфігурації | тут гірше працював autocomplete локальних packages |
| **Packages + `paths` + `include`** ← зараз | є межі packages і dependency graph, кращий досвід у редакторі, немає складного build-шару | `paths` частково дублюють назви packages, TS project mobile ширший, конфігурацію підтримують вручну |
| **Packages + Project References** | масштабується, окремі межі TS projects, інкрементальна збірка | складніша конфігурація, для маленького проєкту — overkill |

"Тільки aliases" підходить для одного застосунку, де окремі packages не мають сенсу. Поточний варіант — практичний компроміс для невеликого monorepo.

---

## 13. Уся схема одним ланцюжком

Приклад: `@app/constants` залежить від `@app/types`, `mobile` використовує `@app/constants`.

**Рівень packages (pnpm):**

```text
packages/constants/package.json: "@app/types": "workspace:*"
→ pnpm додає зв'язок у dependency graph
→ створює symlink packages/constants/node_modules/@app/types → packages/types
```

**Рівень редактора (`paths`):**

```text
@app/constants → ../../packages/constants/src
→ autocomplete шляху імпорту
```

**Рівень Language Service (`include`):**

```text
../../packages/*/src/**/*.ts
→ TypeScript бачить експорти shared packages
→ MEDIA_TYPES з'являється в підказках auto-import
```

Три різні механізми, які працюють разом. Фундамент — workspace packages; `paths` та `include` — шар TypeScript і редактора поверх них.