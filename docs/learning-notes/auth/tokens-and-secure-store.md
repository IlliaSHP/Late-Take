# Токени і SecureStore

## accessToken і refreshToken

Після реєстрації чи логіну бекенд видає два токени:

| | accessToken | refreshToken |
|---|---|---|
| Навіщо | підтверджує, хто ти. Додається до **кожного** запиту | отримати новий access, коли старий протух |
| Скільки живе | мало (хвилини) | довго (тижні) |
| Куди відправляється | у заголовку `Authorization: Bearer <токен>` кожного запиту | тільки на один ендпоінт оновлення |

### Чому два, а не один довгий

Access летить у **кожному** запиті, тому шанс, що його перехоплять, більший. Якщо вкрадуть, він скоро протухне. Refresh відправляється рідко і тільки на один ендпоінт, тому йому можна жити довше.

### Чому через кілька тижнів викидає з акаунту

Закінчився refresh-токен, і отримати новий access уже нічим. Інші причини: зміна пароля, вихід з усіх пристроїв, сайт відкликав сесію. Багато сайтів продовжують refresh щоразу, коли користувач заходить, тому активного користувача не викидає.

### Веб і мобілка отримують токени по-різному

З коментаря в бекенді (`prisma/schema/refresh-token.prisma`):
- **веб** отримує refresh у **httpOnly-куці**: браузер зберігає і надсилає її сам, JS прочитати її не може
- **мобілка** отримує токени **в тілі відповіді** (JSON), бо кук у неї нема. Тому є окремі ендпоінти `/auth/mobile/...` і хук `useAuthMobileRegister`, а токени мобілка зберігає сама

Бекенд зберігає в базі не сам refresh-токен, а його **хеш**: при витоку бази ніхто не зможе увійти в чужі акаунти.

---

## SecureStore

**`expo-secure-store` це бібліотека Expo для зберігання даних на телефоні в зашифрованому вигляді.** Використовує захищене сховище системи: на iOS це Keychain, на Android шифрування ключем з Android Keystore.

Токени це фактично ключі від акаунту, тому звичайне незашифроване сховище для них не годиться.

### Порівняння з localStorage у вебі

| Веб (localStorage) | Мобілка (SecureStore) |
|---|---|
| `localStorage.setItem(key, value)` | `await SecureStore.setItemAsync(key, value)` |
| `localStorage.getItem(key)` | `await SecureStore.getItemAsync(key)` |
| `localStorage.removeItem(key)` | `await SecureStore.deleteItemAsync(key)` |
| синхронний | **асинхронний** (повертає Promise) |
| не зашифрований | зашифрований |

### Чому асинхронний

`localStorage` живе прямо в браузері і працює синхронно.

`SecureStore` звертається **до операційної системи телефону** і **шифрує** дані. Це робить нативний код поза JavaScript, і це займає час. Тому методи повертають Promise, а в назвах є `Async`. У React Native майже все, що звертається до можливостей телефону, асинхронне.

`getItemAsync` повертає `null`, якщо під цим ключем нічого нема (наприклад, користувач ще не увійшов).

---

## token.ts по рядках

`apps/mobile/src/lib/token.ts`:

```ts
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@app/constants'
import * as SecureStore from 'expo-secure-store'

export const saveTokens = async (access: string, refresh: string) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN, access)
  await SecureStore.setItemAsync(REFRESH_TOKEN, refresh)
}

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN)
  await SecureStore.deleteItemAsync(REFRESH_TOKEN)
}
```

- `import { ACCESS_TOKEN, REFRESH_TOKEN }`: назви ключів зі спільного пакета (нижче)
- `import * as SecureStore`: усі експорти бібліотеки, зібрані в об'єкт `SecureStore`. Потім `SecureStore.setItemAsync(...)`, схоже на глобальний `localStorage` у вебі
- `saveTokens`: `async` функція з двома параметрами-рядками. «Під ключем `'accessToken'` збережи `access`, дочекайся; під ключем `'refreshToken'` збережи `refresh`, дочекайся». Викликається в `onSuccess` після реєстрації
- `clearTokens`: видаляє обидва токени. Для виходу з акаунту

## Константи ключів

`packages/constants/src/index.ts`:

```ts
export const ACCESS_TOKEN = 'accessToken'
export const REFRESH_TOKEN = 'refreshToken'
```

Це **назви ключів**, під якими лежать токени. Самі токени тут не зберігаються.

Навіщо константи: ключ використовується в кількох місцях (зберегти, прочитати, видалити). Опечатка в рядку тихо все ламає:

```ts
await SecureStore.setItemAsync('accessToken', token)   // зберегли
await SecureStore.getItemAsync('acessToken')           // опечатка → null, і жодної помилки
```

З константою опечатку підсвітить TS: `ACESS_TOKEN` не існує. Лежать вони в `@app/constants`, щоб усі застосунки монорепо брали ті самі назви.

---

## Шлях токена

```
1. РЕЄСТРАЦІЯ
   register.tsx → onSuccess → saveTokens(access, refresh)
   token.ts → SecureStore.setItemAsync(ACCESS_TOKEN, access)       ← токен збережено

2. СТАРТ ЗАСТОСУНКУ
   api.ts імпортується при старті (у _layout.tsx: import '@/lib/api')
   api.ts → configureApi({ getToken: () => SecureStore.getItemAsync(ACCESS_TOKEN) })
   http.ts → запам'ятав функцію getToken

3. БУДЬ-ЯКИЙ НАСТУПНИЙ ЗАПИТ
   хук Orval → http(...)
   http.ts → await getToken()                 ← викликає функцію з api.ts
          → SecureStore.getItemAsync(...)      ← дістає збережений токен
          → headers: { Authorization: 'Bearer <токен>' }
          → fetch на бекенд
   бекенд бачить токен → знає, хто ти → віддає твої дані

4. ВИХІД
   clearTokens() → токени видалені → getToken() поверне null → заголовка нема
```

## Чого ще нема в проекті

Refresh-токен зберігається, але логіки «access протух → отримати новий через refresh → повторити запит» ще нема. Коли access протухне, бекенд відповідатиме `401`. Цю логіку пишуть в одному місці, у `http.ts` (див. [../api/http-client.md](../api/http-client.md)).