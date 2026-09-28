# OpenAPI, Swagger, Orval

## Проблема, яку вони вирішують

Фронт надсилає бекенду HTTP-запити:

```
POST http://localhost:4000/auth/mobile/register
Content-Type: application/json

{ "email": "illia@gmail.com", "password": "123456" }
```

- `POST`: метод (GET отримати, POST створити, PATCH змінити, DELETE видалити)
- `/auth/mobile/register`: ендпоінт (адреса дії)
- `{ ... }`: тіло запиту в JSON

Фронтендер має знати: які ендпоінти є, що в них слати, що повернеться. Код бекенду він не читає. Потрібен **документ з описом API** і бажано **автоматичне створення коду** з цього документа.

---

## OpenAPI

**OpenAPI це стандарт (формат файлу) для опису API.** Звичайний JSON або YAML, у якому описано всі ендпоінти, їхні методи, що вони приймають і що повертають.

### Хто його пише

**Ніхто руками.** Бекенд на NestJS генерує його **сам при запуску** пакетом `@nestjs/swagger`: проходить по всіх ендпоінтах і DTO і збирає з них JSON.

### Де він лежить

- бекенд **роздає** його за адресою `http://localhost:4000/api/docs-json` (звідти його бере Orval)
- у корені бекенд-репозиторію є файл `openapi.json` (~4000 рядків), який, скоріше за все, записується скриптом при старті для зручності

На фронті файлу нема і не треба: Orval читає JSON по URL з запущеного бекенду.

### Як його читати

Шматок з `openapi.json` бекенду:

```json
{
  "openapi": "3.0.0",
  "paths": {
    "/auth/register": {
      "post": {
        "operationId": "auth_register",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/RegisterDto" }
            }
          }
        },
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/AuthResponse" }
              }
            }
          }
        },
        "tags": ["auth"]
      }
    }
  },
  "components": {
    "schemas": {
      "RegisterDto": {
        "type": "object",
        "required": ["email", "password"],
        "properties": {
          "email": { "type": "string", "format": "email" },
          "password": { "type": "string", "minLength": 6 }
        }
      }
    }
  }
}
```

- `paths`: усі ендпоінти
- `"/auth/register"` → `"post"`: ендпоінт з методом POST
- `operationId`: унікальна назва операції. З неї Orval робить назви функцій і хуків
- `requestBody`: що ендпоінт приймає (посилання на `RegisterDto`)
- `responses` → `"200"`: що повертає при успіху (посилання на `AuthResponse`)
- `tags`: група ендпоінта. За тегами Orval розкладає код по папках
- `components.schemas`: опис усіх DTO і Response. Ендпоінти посилаються на них, щоб не дублювати

### $ref і запис через крапку

`"$ref": "#/components/schemas/RegisterDto"` це посилання в форматі **JSON Pointer**: `#` = «цей файл», далі шлях через `/`.

Запис `components.schemas.RegisterDto` через крапку це **не синтаксис JSON**, а звичайна домовленість позначати шлях до вкладеного поля, як у JS:

```ts
spec.components.schemas.RegisterDto
```

Zed показує той самий шлях зверху екрану стрілками: `openapi.json › paths › /auth/register › post › responses`.

---

## Swagger

### Звідки назва

Англійське слово **swagger**: пиха, самовпевнена хода, бравада. Просто яскрава назва-бренд.

1. **2010**: розробник Tony Tam у компанії Wordnik створив Swagger для документації свого API
2. **2015**: права купила компанія SmartBear
3. **2015–2016**: SmartBear віддала **специфікацію** (правила формату) у відкритий консорціум OpenAPI Initiative (Google, Microsoft, IBM та інші), і її перейменували на **OpenAPI**

### Чому перейменували

**Юридична причина.** «Swagger» це торгова марка компанії SmartBear. Стандарт, спільний для всієї індустрії, не може носити назву, що належить одній компанії. Тому стандарт отримав нейтральну назву OpenAPI, а бренд Swagger лишився за SmartBear для їхніх **інструментів**.

З JavaScript та сама історія: «JavaScript» це торгова марка Oracle, тому офіційний стандарт мови називається **ECMAScript** (звідси ES6, ES2024). Усі кажуть JavaScript, а стандарт зветься ECMAScript.

«Свагер» досі кажуть за звичкою, і тому що інструменти й пакети так звуться (`@nestjs/swagger`).

### Що таке Swagger зараз

**Сімейство інструментів** навколо OpenAPI:
- **Swagger UI**: сторінка-документація API
- **Swagger Editor**: редактор openapi-файлів у браузері
- **Swagger Codegen**: генератор коду з openapi (те саме, що Orval, від інших авторів)

У розмові «свагер» майже завжди означає Swagger UI.

### Swagger UI

**Готовий веб-застосунок (HTML/JS/CSS), який бере `openapi.json` і малює з нього сторінку документації.** Написаний один раз для будь-яких API, тому бекендерам не треба верстати свою документацію.

- NestJS підключає його в коді бекенду, і він відкривається на `http://localhost:4000/api/docs`
- «Автор зробив свагер» = підключив Swagger UI, додав до DTO описи й приклади, трохи налаштував. Саму сторінку не верстав
- кнопка **Try it out**: вводиш дані, відправляєш реальний запит, бачиш відповідь. Зручно, щоб перевірити ендпоінт до написання коду
- свій код у Swagger написати не можна
- працює не тільки на localhost: публічні API викладають його на сервер. У внутрішніх проектах на продакшені його часто вимикають з міркувань безпеки
- користуються фронтендери, мобільні розробники, тестувальники

Альтернативи Swagger UI: Redoc, Scalar.

**Для фронтендера Swagger = документація бекенду**: які є запити, що слати, що повернеться.

---

## Orval

**Orval це npm-пакет з командою для терміналу (CLI).** Читає `openapi.json` і генерує TS-код для роботи з API: типи, функції запитів, хуки.

Як працює:
1. завантажує `openapi.json` (у проекті по URL з бекенду)
2. проходить по `components.schemas` → для кожної схеми генерує TS-тип (interface)
3. проходить по `paths` → для кожного ендпоінта генерує функцію запиту і хук TanStack Query
4. записує все в `.ts` файли

Правила генерації вбудовані в Orval, у конфігу їх налаштовують.

### Конфіг: `packages/api/orval.config.ts`

```ts
import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: 'http://localhost:4000/api/docs-json',   // звідки брати openapi. Бекенд має бути запущений
    output: {
      mode: 'tags-split',                           // розкласти код по папках за тегами (auth, collections...)
      target: './src/generated/endpoints.ts',       // куди класти функції і хуки
      schemas: './src/generated/models',            // куди класти типи (DTO, Response)
      client: 'react-query',                        // генерувати хуки TanStack Query
      clean: true,                                  // перед генерацією видаляти старі файли
      override: {
        mutator: {
          path: './src/http.ts',                    // усі запити робити через функцію з цього файлу
          name: 'http'                              // назва цієї функції
        }
      }
    }
  }
})
```

- `mode: 'tags-split'`: тому в `generated/` папки `auth-mobile`, `collections`, `friends`, `library`: по одній на тег
- `clean: true`: видалений на беку ендпоінт зникне і на фронті
- `mutator`: без нього Orval у кожній функції робив би запит сам (через fetch/axios). З ним кожна згенерована функція викликає **твою** функцію `http`. Навіщо це: [http-client.md](http-client.md)

### Що генерується

Типи в `generated/models/`:

```ts
export interface RegisterDto {
  email: string
  password: string
}
```

Функції і хуки в папках тегів (спрощено):

```ts
import { http } from '../../http'   // Orval дописав цей імпорт через mutator

// функція запиту
export const authMobileRegister = (registerDto: RegisterDto) => {
  return http<authMobileRegisterResponse>(`/auth/mobile/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerDto)
  })
}

// хук TanStack Query
export const useAuthMobileRegister = (options) => {
  return useMutation({
    mutationFn: ({ data }) => authMobileRegister(data),
    ...options?.mutation
  })
}
```

Як це лягає на `http(url, init)`:
- `` `/auth/mobile/register` `` → `url`
- об'єкт з `method`, `headers`, `body` → `init`
- `<authMobileRegisterResponse>` → дженерик `T` (тип відповіді)

### Як запустити

Orval встановлений у пакеті `packages/api`, а не в корені монорепо. Тому `pnpm orval` у корені дає «command not found».

1. запусти бекенд (Orval бере `openapi.json` з `localhost:4000`)
2. подивись `packages/api/package.json` → розділ `"scripts"`: там, скоріше за все, є скрипт типу `"generate": "orval"`
3. запускай у `packages/api`:

```bash
cd packages/api
pnpm orval          # або pnpm <назва скрипта>
```

або з кореня:

```bash
pnpm --filter @app/api exec orval
```

Якщо команди нема зовсім: `pnpm install` у корені.

### Коли перезапускати

- бекенд змінив DTO, додав чи видалив ендпоінт → перезапустити, щоб оновились типи і хуки
- змінився вміст `http.ts` → **не треба**: згенерований код лише імпортує функцію
- перейменовано функцію `http` чи переміщено файл → оновити `mutator` у конфігу і перезапустити

---

## Хто є хто

| Що | Де | Що робить |
|---|---|---|
| **DTO** | бек (клас) → фронт (interface) | описує дані запиту чи відповіді |
| **@nestjs/swagger** | бек | генерує `openapi.json` з ендпоінтів і DTO при запуску |
| **OpenAPI** | формат файлу | опис усього API в JSON |
| **Swagger UI** | бек, `/api/docs` | показує `openapi.json` людям як сторінку |
| **Orval** | фронт, `packages/api` | генерує з `openapi.json` типи, функції і хуки |

Повний шлях від DTO до натискання кнопки: [../flows/register-flow.md](../flows/register-flow.md).