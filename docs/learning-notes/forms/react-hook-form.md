# react-hook-form

## Що це і навіщо

**react-hook-form** це бібліотека (`react-hook-form`) для керування формами в React і React Native. Вона:
1. зберігає значення полів
2. перевіряє поля (своїми правилами або через resolver, наприклад із Zod)
3. зберігає помилки кожного поля
4. керує відправкою: не пускає далі, поки є помилки

Без неї форма з двох полів виглядає так:

```tsx
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

const onPress = () => {
  const newErrors: { email?: string; password?: string } = {}
  if (!email.includes('@')) newErrors.email = 'Invalid email'
  if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
  setErrors(newErrors)
  if (Object.keys(newErrors).length) return
  sendRequest({ email, password })
}
```

`{ email?: string }` тут це тип **помилок**: `?:` означає, що ключа може не бути (помилок спочатку нема взагалі). Це не optional chaining (`?.`).

На кожне нове поле: ще `useState`, ще `if`, ще логіка прибирання помилок. react-hook-form бере це на себе.

## Що є в бібліотеці

| Що | Навіщо |
|---|---|
| `useForm` | головний хук: створює форму |
| `Controller` | компонент: з'єднує інпут з полем форми |
| `useController` | те саме, що `Controller`, але хук |
| `useWatch` | стежити за значенням поля |
| `useFormState` | отримати стан форми (помилки, відправка) в іншому компоненті |
| `useFieldArray` | динамічні списки полів («додати ще один телефон») |
| `FormProvider`, `useFormContext` | передати форму в глибоко вкладені компоненти без пропсів |

---

## useForm

**Хук з react-hook-form, який створює екземпляр форми**: сховище значень полів, помилок і стану форми.

```tsx
const { control, handleSubmit } = useForm<TAuthForm>({
  resolver: zodResolver(authSchema)
})
```

### Що приймає

Один об'єкт з налаштуваннями, усі необов'язкові:

```tsx
useForm<TAuthForm>({
  resolver: zodResolver(authSchema),            // чим перевіряти (див. resolver.md)
  defaultValues: { email: '', password: '' },    // початкові значення
  mode: 'onSubmit',                              // коли перевіряти вперше (за замовчуванням)
  reValidateMode: 'onChange'                     // коли перевіряти повторно (за замовчуванням)
})
```

`defaultValues` варто задавати: без нього на першому рендері `field.value` буде `undefined`, а не `''`.

### Що повертає

Об'єкт з інструментами для роботи з формою:

| Що | Навіщо |
|---|---|
| `control` | об'єкт цієї форми. Передається в `Controller`, `useController`, `useWatch` |
| `handleSubmit` | обгортка для функції відправки: спершу перевірка, потім відправка |
| `register` | підключення звичайних HTML-інпутів (у вебі) |
| `formState` | стан форми: `errors`, `isSubmitting`, `isValid`... |
| `getValues` | поточні значення полів у цей момент |
| `watch` | стежити за значенням поля (компонент перемальовується при зміні) |
| `setValue` | записати значення в поле з коду |
| `reset` | очистити форму |
| `setError` | вручну поставити помилку полю |

Через деструктуризацію беруть тільки потрібне: `const { control, handleSubmit } = useForm(...)`.

### Дженерик

`useForm<TAuthForm>` каже формі, які в неї поля і якого типу. Що це дає:

```tsx
<Controller name='email' ... />      // ✅ TS знає поле, підказує при наборі
<Controller name='emial' ... />      // ❌ помилка: такого поля нема

const onSubmit = (data: TAuthForm) => {
  data.email    // ✅ string
  data.phone    // ❌ такого поля нема
}
```

---

## Двостороннє зв'язування (two-way binding)

**Інпут і стан пов'язані в обидва боки**: стан передається в інпут, а введений текст повертається в стан.

На `useState`:

```tsx
const [email, setEmail] = useState('')

<TextInput
  value={email}              // стан → інпут: показуй те, що в стані
  onChangeText={setEmail}    // інпут → стан: користувач надрукував → онови стан
/>
```

```
користувач натиснув 'a'
  → TextInput викликає onChangeText('a')      (інпут → стан)
  → setEmail('a') → email = 'a'
  → компонент перемальовується
  → value={email} → інпут показує 'a'          (стан → інпут)
```

Результат: у стані завжди актуальне значення, воно збігається з тим, що на екрані.

У формі те саме, тільки стан лежить у сховищі форми:

```tsx
value={field.value}             // стан форми → інпут
onChangeText={field.onChange}   // інпут → стан форми
```

Тому значення завжди можна отримати через `getValues()` чи `watch`.

У вебі в `<input>` подія зміни називається `onChange` і передає об'єкт події (текст у `event.target.value`). У React Native у `TextInput` вона називається `onChangeText` і передає рядок.

---

## Controlled і uncontrolled інпути

- **контрольований (controlled)**: значення зберігається в стані React і передається в інпут через `value`; кожна зміна йде через `onChange` у стан
- **неконтрольований (uncontrolled)**: значення зберігає сам DOM-елемент, React читає його через `ref`, коли потрібно

`Controller` працює з контрольованими інпутами, `register` з неконтрольованими.

---

## register

**Метод з об'єкта, який повертає `useForm`.** Підключає звичайний HTML `<input>` у **вебі** до поля форми.

`register('email')` повертає об'єкт:

| Властивість | Що робить |
|---|---|
| `name` | ставить HTML-атрибут `name="email"` |
| `onChange` | при зміні бере текст з `event.target.value` і записує в поле форми |
| `onBlur` | позначає, що користувач вийшов з поля |
| `ref` | React передає сюди HTML-елемент, форма зберігає його (читає `.value`, ставить фокус) |

Спред розкладає цей об'єкт на пропси:

```tsx
<input {...register('email')} />

// те саме, що:
const emailProps = register('email')
<input
  name={emailProps.name}
  onChange={emailProps.onChange}
  onBlur={emailProps.onBlur}
  ref={emailProps.ref}
/>
```

`value` не передається: текст зберігає сам HTML-елемент (неконтрольований інпут). Тому компонент не перемальовується при кожній літері.

Повний приклад у вебі:

```tsx
const { register, handleSubmit, formState: { errors } } = useForm<TAuthForm>({
  resolver: zodResolver(authSchema)
})

<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} />
  {errors.email && <p>{errors.email.message}</p>}

  <input type='password' {...register('password')} />
  {errors.password && <p>{errors.password.message}</p>}

  <button type='submit'>Create account</button>
</form>
```

Помилки тут беруться з `formState.errors`.

---

## Controller

**Компонент з react-hook-form, який з'єднує один інпут з одним полем форми.** Використовується для React Native, UI-бібліотек і власних компонентів.

Пропси:

| Пропс | Що це |
|---|---|
| `control` | з якою формою працювати (той `control`, що повернув `useForm`) |
| `name` | з яким полем цієї форми: `'email'` або `'password'` |
| `render` | функція, яка повертає інпут |
| `rules`, `defaultValue` | необов'язкові: вбудовані правила поля, початкове значення |

```tsx
<Controller
  control={control}
  name='email'
  render={({ field, fieldState }) => (
    <Input
      value={field.value}
      onChangeText={field.onChange}
      error={fieldState.error?.message}
    />
  )}
/>
```

### control

Об'єкт конкретної форми: її стан і методи читання, запису, підписки на зміни. `Controller` окремий компонент і не має доступу до змінних усередині твого компонента, а на екрані може бути кілька форм. Тому йому явно передають, з якою формою працювати.

### name

Ключ поля в об'єкті значень форми. За ним `Controller` читає значення і помилку поля і записує нове значення. Для вкладених об'єктів через крапку: `'address.city'`.

`name` має збігатися з ключем у Zod-схемі: помилки від `zodResolver` кладуться за ключами схеми (`errors.email`), і `Controller` з `name='email'` бере саме `errors.email`.

### render

**Пропс `Controller`, у який передають функцію, що повертає компонент поля.** Назву `render` вибрали автори react-hook-form, у самому React такого пропса нема.

Навіщо функція: значення і помилка поля зберігаються у формі, дістати їх може тільки `Controller`. Він сам викликає твою функцію і передає їй ці дані параметром, а ти в функції вирішуєш, у які пропси інпута їх покласти.

**Де викликається:** у коді компонента `Controller` у бібліотеці. Там він написаний буквально так:

```tsx
const Controller = (props) => props.render(useController(props))
```

Що відбувається:
1. React малює екран і доходить до `<Controller>`
2. `useController` бере з форми дані поля `name` і складає об'єкт `{ field, fieldState, formState }`
3. `Controller` **викликає твою функцію** з цим об'єктом
4. на екрані на місці `<Controller>` з'являється те, що функція повернула
5. значення чи помилка поля змінились → `Controller` викликає функцію знову з новими даними

Функцію можна винести окремо, щоб було видно, що це звичайна функція:

```tsx
const renderEmail = ({ field, fieldState }) => (
  <Input value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />
)

<Controller control={control} name='email' render={renderEmail} />
```

Правило:

```tsx
render={renderInput}                          // ✅ передаєш функцію
render={(props) => renderInput(props, 'x')}   // ✅ передаєш нову функцію, що викличе твою з додатковим аргументом
render={renderInput(...)}                     // ❌ викликаєш одразу, у render потрапляє результат
```

`Controller` викликає функцію **з одним аргументом** (об'єктом). Другий параметр він не передасть; для цього потрібна обгортка з другого рядка.

### Чому не через children

`<Controller><Input value={???} /></Controller>` не працює: `<Input>` створюється в коді батьківського компонента, і всі його пропси обчислюються там, до того як `Controller` щось зробив. А значення поля в батьківському компоненті нема. Крім того, `Controller` не може знати назви пропсів кожного компонента (`value`/`onChangeText` у твого `Input`, `checked` у чекбокса, `onValueChange` у перемикача). З функцією ти сам вирішуєш, куди що передати.

### Render prop як патерн

Прийом «компонент приймає функцію в пропсі, сам її викликає зі своїми даними і показує результат» називається **render prop**. Він поширений:

```tsx
// FlatList у React Native
<FlatList data={movies} renderItem={({ item }) => <MovieCard title={item.title} />} />

// вбудований React Context.Consumer (функція в children)
<ThemeContext.Consumer>
  {(theme) => <Text style={{ color: theme.color }}>Hi</Text>}
</ThemeContext.Consumer>
```

Formik і TanStack Form теж так роблять.

### field

| Властивість | Що це |
|---|---|
| `field.value` | поточне значення поля з форми |
| `field.onChange` | функція: записує нове значення у форму. Приймає і рядок, і об'єкт події |
| `field.onBlur` | функція: позначає, що користувач вийшов з поля |
| `field.name` | назва поля (`'email'`) |
| `field.ref` | посилання на інпут (форма ставить фокус на поле з помилкою) |

### fieldState

| Властивість | Що це |
|---|---|
| `fieldState.error` | помилка поля `{ type, message }` або `undefined` |
| `fieldState.invalid` | `true`, якщо помилка є |
| `fieldState.isTouched` | користувач уже виходив з поля |
| `fieldState.isDirty` | значення змінене від початкового |

`fieldState.error?.message`: `?.` тому, що помилки може не бути.

### Що відбувається в часі

```
1. ПЕРШИЙ РЕНДЕР
   field.value = undefined (або '' з defaultValues), fieldState.error = undefined
   → <Input value='' /> без помилки

2. КОРИСТУВАЧ ВВІВ 'a'
   Input викликає onChangeText('a') = field.onChange('a')
   → форма записує email = 'a'
   → Controller перемальовується, render викликається знову
   → <Input value='a' />

3. НАТИСНУВ КНОПКУ, EMAIL НЕПРАВИЛЬНИЙ
   handleSubmit → resolver → у формі з'являється errors.email
   → Controller перемальовується
   → fieldState.error.message = 'Invalid email'
   → <Input error='Invalid email' />
```

---

## register чи Controller

| | register | Controller |
|---|---|---|
| Для чого | звичайні HTML `<input>` у вебі | React Native, UI-бібліотеки, власні компоненти |
| Хто з'єднує | сам, через спред | ти вручну, пропс за пропсом |
| Тип інпута | неконтрольований (через `ref`) | контрольований (через `value` + `onChange`) |
| Помилки | `formState.errors.email` | `fieldState.error` |

Чому в React Native `Controller`:
1. `register` побудований навколо HTML-елементів і DOM-подій: його `onChange` читає `event.target.value`, його `ref` чекає елемент з `.value`. У React Native DOM нема: `TextInput` передає рядок через `onChangeText`. Документація react-hook-form для React Native рекомендує `Controller`
2. Власний `Input` має свої пропси (`value`, `onChangeText`, `error`), а `register` дає `name`, `onChange`, `onBlur`, `ref`

---

## useController

**Хук з react-hook-form**, який дає ті самі `field` і `fieldState`, що й `Controller`, але без `render`. Використовують, щоб зробити власний компонент поля:

```tsx
import { type Control, useController } from 'react-hook-form'

type FormInputProps = {
  control: Control<TAuthForm>   // тип контролу саме цієї форми
  name: keyof TAuthForm         // 'email' | 'password'
}

// ПОЗА іншими компонентами
function FormInput({ control, name }: FormInputProps) {
  const { field, fieldState } = useController({ control, name })
  const isPassword = name === 'password'

  return (
    <Input
      placeholder={isPassword ? 'Enter password' : 'Enter email'}
      secureTextEntry={isPassword}
      autoCapitalize='none'
      keyboardType={isPassword ? 'default' : 'email-address'}
      value={field.value}
      onChangeText={field.onChange}
      error={fieldState.error?.message}
    />
  )
}

// використання
<FormInput control={control} name='email' />
<FormInput control={control} name='password' />
```

`Controller` усередині використовує саме `useController`. Це два способи отримати одне й те саме.

---

## handleSubmit

**Функція з `useForm`**, яка обгортає твою функцію відправки.

```tsx
const onSubmit = (data: TAuthForm) => { mutate({ data }) }

<Button onPress={handleSubmit(onSubmit)} />
```

`handleSubmit(onSubmit)` **не викликає** `onSubmit` одразу, а **повертає нову функцію**. Вона при натисканні:
1. збирає значення полів
2. передає їх resolver'у (перевірка)
3. є помилки → записує їх у форму, поля їх показують, `onSubmit` **не викликається**
4. все добре → викликає `onSubmit(значення)`

Тому `onSubmit` отримує тільки перевірені дані.

### Звідки береться data в onSubmit

Ти ніде не передаєш `onSubmit` аргументи. Їх передає **функція, яку повернув `handleSubmit`**: вона збирає значення форми і, якщо перевірка пройшла, сама викликає `onSubmit(значення)`. `data` це значення форми: `{ email: '...', password: '...' }`.

Спрощено `handleSubmit` влаштований так:

```ts
const handleSubmit = (onValid) => {
  // повертає НОВУ функцію, її отримує onPress
  return async () => {
    const values = /* поточні значення форми */
    const result = await resolver(values)       // перевірка Zod-схемою

    if (/* є помилки */) {
      /* записати помилки у форму */
      return                                     // onValid не викликається
    }

    onValid(result.values)                       // ← ось звідки data в onSubmit
  }
}
```

Чому не `onPress={onSubmit}`: тоді кнопка викликала б `onSubmit` сама, передавши їй подію натискання, а не дані форми, і жодної перевірки не було б.

```tsx
onPress={onSubmit}                 // ❌ onSubmit(подія натискання), без перевірки
onPress={handleSubmit(onSubmit)}   // ✅ натискання → перевірка → onSubmit(дані форми)
```

---

## Типові помилки

```tsx
// ❌ викликати функцію в render замість передати
render={renderInput(renderInput)}

// ❌ оголосити компонент всередині іншого компонента
export default function Register() {
  function FormInput() { ... }   // кожен рендер Register створює нову функцію →
  ...                            // React вважає її новим компонентом → видаляє і створює Input заново →
}                                // інпут втрачає фокус, клавіатура ховається

// ❌ name не збігається з ключем схеми
<Controller name='mail' ... />   // схема має ключ email → помилка ніколи не з'явиться

// ❌ занадто загальні типи для useController
control: object      // треба Control<TAuthForm>
name: string         // треба keyof TAuthForm
```

---

## Формулювання для співбесіди

- **useForm**: хук react-hook-form, що створює екземпляр форми. Зберігає значення полів, помилки і стан форми, повертає API: `control`, `register`, `handleSubmit`, `formState`, `getValues`, `setValue`, `reset` тощо
- **control**: об'єкт з внутрішнім станом і методами конкретного екземпляра форми. Передається в `Controller`, `useController`, `useWatch`, щоб вони могли читати, змінювати поля цієї форми і підписуватись на зміни
- **name**: шлях до поля в об'єкті значень форми, типізується через дженерик `useForm`
- **register**: метод, що реєструє неконтрольований нативний інпут. Повертає `{ name, onChange, onBlur, ref }`, які розкладаються на інпут через спред
- **Controller**: компонент для контрольованих і сторонніх інпутів. Через `useController` підписується на поле `name` у формі `control` і передає в render prop об'єкти `field` і `fieldState`
- **render prop**: патерн, у якому компонент приймає функцію як пропс і сам викликає її зі своїми даними, а функція повертає JSX
- **controlled / uncontrolled**: у контрольованому значення живе в стані React і передається через `value`; у неконтрольованому живе в DOM-елементі і читається через `ref`
- **handleSubmit**: обгортка над обробником відправки, яка запускає валідацію і викликає обробник тільки з валідними даними