# Promise, `async` і `await` у JavaScript та TypeScript

> **Коротко.**
>
> - Виклик `async`-функції у JavaScript **завжди повертає `Promise`**.
> - `Promise` — це об'єкт, який представляє майбутній результат операції.
> - `await` очікує завершення проміса і дає значення, з яким проміс успішно завершився.
> - `await` призупиняє лише продовження поточної `async`-функції, а не всю програму.
> - `await` має сенс там, де функція повертає Promise.
> - `async` та `await` не є типами. Це ключові слова JavaScript.
> - У TypeScript запис `Promise<string | null>` означає: проміс успішно завершиться рядком або `null`.
> - TypeScript часто сам виводить тип `Promise`, тому явну анотацію потрібно писати не завжди.

---

## 1. Що таке Promise

`Promise` — це JavaScript-об'єкт, який представляє результат операції, що може завершитися зараз або пізніше.

Проміс має один із трьох станів:

| Стан | Значення |
|---|---|
| `pending` | операція ще не завершилася |
| `fulfilled` | операція успішно завершилася і має результат |
| `rejected` | операція завершилася помилкою |

Коли проміс стає `fulfilled` або `rejected`, кажуть, що він **settled** — завершений.

Наприклад, `fetch` запускає HTTP-запит і відразу повертає проміс:

```ts
const responsePromise = fetch('https://example.com/products');
```

На цьому рядку відповідь сервера зазвичай ще не отримана. У змінній знаходиться об'єкт `Promise`, за допомогою якого можна дізнатися про майбутній результат.

Важливо: Promise не є працівником, який сам виконує HTTP-запит. Мережеву операцію виконує середовище JavaScript — браузер, Node.js або React Native. Promise представляє її майбутній результат і дозволяє підписатися на успіх або помилку.

Умовно:

```text
fetch() запускає HTTP-запит
        ↓
відразу повертає Promise у стані pending
        ↓
JavaScript продовжує іншу роботу
        ↓
сервер надсилає відповідь
        ↓
Promise стає fulfilled із Response
```

Назва `Promise` дійсно походить від ідеї «обіцянки» надати результат пізніше. Проте існує два можливі фінали: проміс може виконатися успішно або завершитися помилкою. Він не обіцяє, що успіх гарантований; він обіцяє, що про підсумок можна буде дізнатися.

---

## 2. Що повертає `async`-функція

Функція, позначена `async`, завжди повертає `Promise`.

```ts
async function getName() {
  return 'Anna';
}
```

Хоча в коді написано `return 'Anna'`, виклик повертає проміс:

```ts
const result = getName();
// Promise<string>
```

JavaScript поводиться приблизно так, ніби значення було загорнуте в успішний проміс:

```ts
function getName() {
  return Promise.resolve('Anna');
}
```

Це не буквальне перетворення вихідного коду, але корисна модель для розуміння.

Якщо `async`-функція повертає `null`:

```ts
async function getToken() {
  return null;
}
```

її виклик повертає:

```ts
const result = getToken();
// Promise<null>
```

Якщо `async`-функція робить `throw`, проміс стає `rejected`:

```ts
async function loadUser() {
  throw new Error('User not found');
}

const result = loadUser();
// rejected Promise
```

Отже, `async` пов'язаний із промісами двома правилами:

1. Повернене значення стає успішним результатом Promise.
2. Кинута помилка стає причиною відхилення Promise.

`async` — не тип даних. Це ключове слово, яке змінює спосіб повернення результату функції та дозволяє використовувати `await` усередині неї.

---

## 3. Що робить `await`

`await` приймає проміс, чекає, доки він завершиться, і повертає його успішне значення:

```ts
const responsePromise = fetch('/products');
const response = await responsePromise;
```

Скорочений запис:

```ts
const response = await fetch('/products');
```

Типи на цих двох етапах різні:

```ts
const responsePromise = fetch('/products');
// Promise<Response>

const response = await responsePromise;
// Response
```

Тому фраза «`await` дістає значення з Promise» є спрощенням. Точніше:

> `await` призупиняє продовження поточної `async`-функції до завершення проміса. Після успішного завершення вираз `await` дає його fulfilled-значення, а після відхилення — кидає помилку.

Наприклад:

```ts
async function loadProducts() {
  try {
    const response = await fetch('/products');
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Не вдалося завантажити товари', error);
    throw error;
  }
}
```

Якщо проміс відхиляється, `await` поводиться так, ніби на цьому місці виконано `throw`. Тому його можна обробляти через `try/catch`.

---

## 4. Чи зупиняє `await` усю програму

Ні. `await` не блокує всю JavaScript-програму. Він призупиняє лише подальше виконання конкретної `async`-функції.

```ts
async function example() {
  console.log('A');
  await fetch('/products');
  console.log('B');
}

console.log('1');
example();
console.log('2');
```

Спочатку відбудеться приблизно таке:

```text
1
A
2
```

Після завершення запиту з'явиться:

```text
B
```

Що сталося:

1. `example()` почала виконуватися.
2. Вивела `A`.
3. Дійшла до `await` і призупинила своє продовження.
4. Зовнішній код продовжив роботу та вивів `2`.
5. Після завершення проміса продовження `example()` було поставлено в чергу microtask.
6. Event loop дозволив функції продовжити виконання і вивести `B`.

Цим керують JavaScript runtime та event loop: саме вони під час роботи програми вирішують, яку задачу виконати наступною.

Правильна модель:

> «На цьому місці ця функція поки не може продовжитися. Коли проміс завершиться, продовж її виконання. А зараз runtime може обробляти інші події та задачі».

---

## 5. Коли взагалі потрібен `await`

Асинхронна операція — це робота, яку виконує не твій JS-код, а хтось інший: сервер обробляє запит, система читає файл, мережа передає дані. Твоя програма запускає операцію і чекає результату, а поки чекає, обробляє інші задачі (натискання, анімації, інші запити).

Тому `await` ставлять там, де функція **повертає Promise**:

- `fetch(...)` → `Promise<Response>` → можна `await`;
- `SecureStore.getItemAsync(...)` → Promise → можна `await`;
- `JSON.parse(...)`, `array.map(...)` → звичайне значення → `await` не потрібен.

Як це перевірити: наведи курсор на функцію, і TypeScript покаже `Promise<...>` у типі. В Expo такі функції часто мають суфікс `Async`.

Типові асинхронні операції: HTTP-запити, файли, сховище (AsyncStorage, SecureStore), база даних, таймери. Таймер — виняток із правила "хтось працює": там просто минає час.

**Події теж асинхронні, але через callback, а не `await`.** Promise завершується один раз, а подія повторюється, тому на неї підписуються: `addEventListener('click', handler)`, `onPress={handler}`.

---

## 6. Чи створює `await` асинхронність

Ні. `await` не перетворює синхронну важку роботу на фонову.

Наприклад:

```ts
async function calculate() {
  const result = await veryHeavySynchronousCalculation();
  return result;
}
```

Якщо `veryHeavySynchronousCalculation()` синхронно займає процесор протягом п'яти секунд, виклик усе одно блокуватиме JavaScript упродовж цих п'яти секунд. `await` не переносить обчислення в інший потік.

Асинхронна операція запускається відповідним API. Promise представляє її результат, а `await` зручно призупиняє поточну функцію до цього результату.

---

## 7. Чи обов'язково використовувати `await`, щоб отримати результат

Ні. Є два основні способи працювати з Promise.

### Через `await`

```ts
async function showProducts() {
  const products = await getProducts();
  console.log(products);
}
```

### Через `.then()` і `.catch()`

```ts
getProducts()
  .then((products) => {
    console.log(products);
  })
  .catch((error) => {
    console.error(error);
  });
```

Обидва варіанти працюють із тим самим Promise. `async/await` зазвичай робить послідовний асинхронний код легшим для читання.

Також проміс можна просто повернути іншій функції:

```ts
function loadProducts() {
  return getProducts();
}
```

Тобто `await` потрібен саме там, де вам необхідне завершене значення для наступного кроку. Не треба автоматично ставити `await` перед кожним промісом.

### Забутий `await`

Якщо значення потрібне, а `await` забули, у змінній опиняється Promise замість даних:

```ts
const products = getProducts();   // забули await
products.map(...);                // помилка: products — це Promise, а не масив
```

TypeScript зазвичай ловить таке: `Property 'map' does not exist on type 'Promise<...>'`.

Гірший випадок — коли результат не потрібен, але проміс може завершитися помилкою. Якщо його ніхто не `await`-ить і не обробляє через `.catch()`, помилка ніде не з'явиться в твоєму коді, лише попередження "Unhandled promise rejection".

---

## 8. Послідовне та паралельне очікування

Такий код виконує запити послідовно:

```ts
const user = await getUser();
const products = await getProducts();
```

Другий запит почнеться лише після завершення першого. Якщо вони не залежать один від одного, їх можна запустити разом:

```ts
const userPromise = getUser();
const productsPromise = getProducts();

const [user, products] = await Promise.all([
  userPromise,
  productsPromise,
]);
```

Або коротше:

```ts
const [user, products] = await Promise.all([
  getUser(),
  getProducts(),
]);
```

Це важлива деталь: `await` робить код зручним, але необережне послідовне очікування може сповільнювати незалежні операції.

### `Promise.all` vs `Promise.allSettled`

`Promise.all` відхиляється на **першій** помилці — результати решти промісів втрачаються.

`Promise.allSettled` чекає завершення **всіх** промісів і повертає статус кожного:

```ts
const results = await Promise.allSettled([getUser(), getProducts()]);
// [
//   { status: 'fulfilled', value: user },
//   { status: 'rejected', reason: error },
// ]
```

Використовуй його, коли часткові результати теж корисні: наприклад, одна секція екрана не завантажилась, але решту все одно треба показати.

---

## 9. Hooks і async

Hook не можна викликати всередині async-функції (і після `await`), бо hooks мають викликатися синхронно на верхньому рівні компонента в тому самому порядку при кожному рендері. Async-код усередині hook писати можна.

Колбек `useEffect` не можна робити `async`, бо він має повертати cleanup-функцію або нічого, а не Promise. Тому async-функцію оголошують всередині effect і викликають її.

Setter із `useState` — звичайна функція, його можна викликати і після `await`.

```tsx
// ❌ hook усередині async-функції
async function load() {
  const [data, setData] = useState(null);
}

// ❌ async-колбек effect
useEffect(async () => { ... }, []);

// ✅
const [data, setData] = useState(null);

useEffect(() => {
  const load = async () => {
    const res = await fetch(url);
    setData(await res.json());
  };
  load();
}, [url]);
```

---

## 10. Promise у JavaScript і TypeScript

У звичайному JavaScript немає запису типу `Promise<string>`:

```js
async function getToken() {
  return 'abc123';
}
```

JavaScript під час виконання просто створить Promise. Інформації `string` у runtime немає.

У TypeScript можна явно описати майбутній результат:

```ts
async function getToken(): Promise<string | null> {
  return 'abc123';
}
```

Запис читається так:

```text
Promise<string | null>
        └───────────┘
        тип успішного результату проміса
```

Тут додаткова інформація передається **generic-типу `Promise`**:

- `Promise` — generic-шаблон типу;
- `string | null` — аргумент типу;
- `Promise<string | null>` — конкретизований тип проміса.

Умовно визначення Promise можна уявити так:

```ts
interface Promise<T> {
  then(/* обробник, який отримає T */): unknown;
  catch(/* обробник помилки */): unknown;
}
```

У визначенні:

```ts
Promise<T>
```

`T` є параметром типу — місцем для майбутнього конкретного типу.

Під час використання:

```ts
Promise<string | null>
```

значенням `T` стає:

```ts
string | null
```

Ця інформація існує лише для TypeScript та інструментів розробки. Під час компіляції TypeScript-типи стираються.

---

## 11. Чи треба завжди явно писати тип Promise у TypeScript

Ні. TypeScript уміє виводити тип із реалізації.

```ts
async function getName() {
  return 'Anna';
}
```

TypeScript сам визначить тип:

```ts
() => Promise<string>
```

Так само:

```ts
const getAge = async () => 25;
// () => Promise<number>
```

Тому в TypeScript не потрібно вручну типізувати абсолютно все. Якщо тип очевидний, виведення типів часто є кращим і коротшим варіантом.

Явну анотацію корисно писати, коли ви хочете:

- зафіксувати публічний контракт функції;
- дозволити декілька результатів, наприклад `string | null`;
- отримати помилку, якщо реалізація випадково почне повертати інший тип;
- зробити складний код зрозумілішим;
- описати callback, який буде переданий пізніше.

Наприклад:

```ts
let getToken: () => Promise<string | null> = async () => null;
```

Явний тип тут важливий, тому що пізніше змінній присвоять іншу функцію. TypeScript перевірить, що нова функція має той самий контракт.

```ts
getToken = async () => 'abc123'; // правильно
getToken = async () => null;     // правильно
getToken = async () => 123;      // помилка
```

---

## 12. Повний розбір прикладу `getToken`

```ts
let getToken: () => Promise<string | null> = async () => null;
```

Його можна згрупувати так:

```ts
let getToken:
  (() => Promise<string | null>)
=
  (async () => null);
```

Ліва частина — тип:

```ts
() => Promise<string | null>
```

- `()` — функція не приймає аргументів;
- `=>` — у типі означає «повертає»;
- `Promise<...>` — повернення відбудеться асинхронно;
- `string | null` — успішним значенням буде токен або відсутність токена.

Права частина — реалізація:

```ts
async () => null
```

- `async` — функція завжди повертає Promise;
- `()` — не приймає аргументів;
- `=>` — створює arrow function;
- `null` — її початковий результат.

Тут є дві стрілки з різним призначенням:

```ts
let getToken: () => Promise<string | null> = async () => null;
                 ↑                                    ↑
           опис типу                         реалізація функції
```

Початкова функція є заглушкою: до конфігурації вона повідомляє, що токена немає.

Після налаштування:

```ts
configureApi({
  baseUrl: 'https://api.example.com',
  getToken: async () => {
    return SecureStore.getItemAsync('accessToken');
  },
});
```

змінна `getToken` посилатиметься на передану функцію. Файл на диску не переписується — змінюється значення змінної в пам'яті поточного запуску програми.

---

## 13. Чому `Promise<string | null>`, а не `Promise<string> | null`

Ці записи мають різні значення.

```ts
Promise<string | null>
```

Функція завжди повертає Promise. Після очікування результатом буде рядок або `null`:

```ts
const token = await getToken();
// string | null
```

А цей запис:

```ts
Promise<string> | null
```

означає, що сама функція негайно поверне або Promise, або `null`:

```ts
const result = getToken();
// Promise<string> | null
```

Такий контракт менш зручний: перед `await` довелося б додатково перевіряти, чи взагалі отримано Promise.

---

## 14. Порівняння з Python

Загальна ідея схожа, але механіка виклику відрізняється.

У Python виклик функції, оголошеної через `async def`, повертає coroutine object. Її виконання потрібно запустити через `await` або запланувати в event loop.

У JavaScript виклик `async`-функції повертає `Promise`. Тіло функції починає виконуватися одразу і працює синхронно до першого місця, де йому справді потрібно призупинитися на `await`.

```ts
async function test() {
  console.log('початок');
  await fetch('/data');
  console.log('після запиту');
}

const promise = test();
```

Під час `test()` напис `початок` з'явиться одразу. Функція поверне Promise, а частина після `await` виконається пізніше.

---

## 15. Підсумкова модель

Найточніше уявляти процес так:

```text
1. Викликається async-функція
2. Вона одразу починає виконуватися
3. Викликає асинхронне API, наприклад fetch
4. Асинхронне API повертає Promise
5. await перевіряє цей Promise
6. Якщо він pending — продовження функції призупиняється
7. JavaScript runtime обробляє інші задачі
8. Операція завершується
9. Promise стає fulfilled або rejected
10. Продовження функції планується через microtask queue
11. При fulfilled await дає результат
12. При rejected await кидає помилку
13. Коли async-функція завершується, завершується і Promise, який вона повернула
```

Головні фрази для запам'ятовування:

> `async` гарантує, що функція поверне Promise.

> Promise представляє майбутній успішний результат або помилку.

> `await` призупиняє лише поточну async-функцію і після завершення Promise дає його результат або кидає помилку.

> Event loop дозволяє JavaScript обробляти іншу роботу, поки асинхронна операція очікує завершення.

> TypeScript-запис `Promise<T>` описує тип успішного значення, яке буде отримане після очікування.

## Офіційні матеріали

- [MDN: Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- [MDN: async function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)
- [MDN: await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)
- [MDN: Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [React: Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- [TypeScript: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript: Function type expressions](https://www.typescriptlang.org/docs/handbook/2/functions.html)