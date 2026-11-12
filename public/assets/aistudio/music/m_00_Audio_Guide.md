# Аудіо-довідник гри «В пошуках солі»

Версія 1 · 12 листопада 2026 · для роботи з Lyria в застосунку Gemini

## 1. Як користуватися

Це «біблія звуку» гри. Для кожного треку записано, де він звучить, як має звучати і який промпт використати. Порядок роботи: спершу згенеруйте M01 (він задає характер усієї музики), потім порівнюйте з ним решту треків, а кожен промпт і результат записуйте в журнал (розділ 7). Рядок «Звучить як» описує очікуваний результат. Якщо вийшло зовсім інакше, змінюйте промпт, а не підлаштовуйте гру під випадковий результат.

## 2. Звуковий образ гри

**Одним реченням:** тепла народна комедія з пригодою, більше усмішки, ніж пафосу.

- **Головний голос:** бандура або кобза (щипкова, з короткою атакою).
- **Фарби:** сопілка, скрипка, цимбали, бубон, ложки, дримба (для жартів), акордеон (для застілля).
- **Для босів:** низькі струнні, великий бубон, глибока бандура. Без голлівудського оркестрового пафосу.
- **Лейтмотив «Мелодія солі»:** коротка висхідна мелодія з чотирьох нот у M01, відлуння якої чути в інших треках (повільно в хаті, урочисто в польоті). Lyria не гарантує повторення мелодії, тому описуйте гачок словами (playful rising four-note hook) і відбирайте варіанти, де його чути.
- **Тональність:** тримайтеся родини D (мажор для затишних сцен, мінор або дорійський лад для таємничих). Вказуйте в промпті, але точного виконання не чекайте.
- **Чого уникати:** електронних синтів і EDM, вокалу (діалоги в грі текстові), іменованих виконавців («у стилі…»), відомих пісень, келтського звучання (його ШІ часто підставляє замість «фолку»).
- **Регіональна точність:** трембіта й коломийка належать до Карпат і для степу чи Дніпра не годяться. Гопак доречний лише у святкових сценах.

## 3. Формула промпту для Lyria

Структура: жанр і настрій + інструменти + темп і тональність + розвиток + петля + заборони.

```
Instrumental only, no vocals. [mood] [genre] background music for [scene].
[Main instrument] leads, with [supporting instruments]. About [BPM] BPM, key of [key].
[How it develops]. Seamless loop that ends where it begins.
Avoid electronic synths, heroic orchestral trailer sound and vocals.
```

Поради:

- Англійські промпти зазвичай працюють краще за українські.
- Спершу зробіть коротку версію (30 с) для перевірки ідеї, потім довгу в Lyria 3 Pro (до 3 хв). Назви режимів і ліміти перевіряйте в застосунку, вони змінюються.
- Генеруйте по 3 варіанти кожного треку й нумеруйте їх.
- Описуйте те, що чути: plucked bandura краще, ніж ethnic feel.
- Для довших треків можна окремо описати частини: вступ, основна тема, завершення.

## 4. Каталог музики

Інтенсивність від 1 (тихо) до 5 (максимум). Файли: OGG або MP3, назви на кшталт mus\_title.

### M01 · Головна тема (mus\_title)

- **Де:** титульний екран. **Темп:** 100 BPM, 1:30–2:00, петля. **Інтенсивність:** 2.
- **Звучить як:** сонячна сільська мелодія. Бандура веде мотив із чотирьох висхідних нот, сопілка відповідає, бубон ледь відбиває ритм, наприкінці легкий усміхнений підйом. Мелодія має запам’ятовуватися з першого разу.
- **Промпт:**

```
Instrumental only, no vocals. Sunny, charming Ukrainian folk theme for a hand-drawn
adventure game title screen. Plucked bandura leads a playful rising four-note hook,
sopilka (flute) answers, soft frame drum, light fiddle. About 100 BPM, key of D major.
Gentle build, warm smile at the end. Seamless loop. Avoid electronic synths and vocals.
```

### M02 · Хата (mus\_hut)

- **Де:** заставка в хаті, сцена з кумом Грицьком. **Темп:** 76 BPM, 1:30, петля. **Інтенсивність:** 1.
- **Звучить як:** теплий вечір у хаті. М’яка бандура, тиха скрипка, ледь чутні ложки на столі. Мотив із M01 звучить повільно, як колискова.
- **Промпт:**

```
Instrumental only, no vocals. Cozy warm Ukrainian village evening, family dinner at home.
Soft plucked bandura, quiet fiddle, wooden spoons tapping lightly, gentle sopilka.
About 76 BPM, key of D major. A slow lullaby-like version of a rising four-note hook.
Seamless loop. Avoid electronic synths and vocals.
```

### M03 · Акт I: Хутір і ліс (mus\_act1)

- **Де:** перший рівень. **Темп:** 108 BPM, 2:00, петля. **Інтенсивність:** 3.
- **Звучить як:** бадьора прогулянка двором. Пружинні щипки струнних, весела сопілка, бубон, трохи комічного підстрибування, як у мультфільмі.
- **Промпт:**

```
Instrumental only, no vocals. Playful bouncy folk music for a farmyard and forest edge in
a cartoon platformer. Pizzicato strings and plucked bandura, cheerful sopilka, frame drum,
light cimbalom accents. About 108 BPM, key of D major. Cartoon comedy bounce with a
recurring rising four-note hook. Seamless loop. Avoid electronic synths and vocals.
```

### M04 · Бос: Скажений Півень Корній (mus\_boss\_rooster)

- **Де:** арена Акту I. **Темп:** 150 BPM, 1:30, петля. **Інтенсивність:** 4.
- **Звучить як:** бурхлива комічна погоня. Швидкі скрипкові пасажі, тремтлива бандура, стакато, що нагадує кудкудакання, бубон підганяє темп.
- **Промпт:**

```
Instrumental only, no vocals. Frantic comedic chase music for a boss fight against an
angry rooster. Fast fiddle runs, rapid strummed bandura, staccato pizzicato clucks,
driving frame drum. About 150 BPM, key of D minor. Energetic and funny, not scary.
Seamless loop. Avoid electronic synths and vocals.
```

### M05 · Акт II: Злий ліс (mus\_act2)

- **Де:** другий рівень. **Темп:** 80 BPM, 2:00, петля. **Інтенсивність:** 2–3.
- **Звучить як:** таємничий, але не страшний ліс. Низька бандура, скляне тремоло цимбалів, далека сопілка з ехо, поскрипування дерева замість ударних.
- **Промпт:**

```
Instrumental only, no vocals. Mysterious enchanted dark forest, eerie but gentle, for a
folk-fantasy platformer. Low plucked bandura, glassy cimbalom tremolo, distant sopilka
with echo, creaking wood percussion. About 80 BPM, key of D dorian. Slowly shifting
atmosphere. Seamless loop. Avoid electronic synths, horror screeches and vocals.
```

### M06 · Баба-Яга в болоті (mus\_yaga)

- **Де:** арена Акту II. **Темп:** 120 BPM, 1:30, петля. **Інтенсивність:** 4.
- **Звучить як:** важка й напружена музика гігантського лісового духа. Низька бандура, глибокий бубон, смичкові на нижніх нотах, удари цимбалів, ритм як тупіт.
- **Промпт:**

```
Instrumental only, no vocals. Heavy tense boss battle against a giant ancient forest
spirit. Deep plucked bandura, deep frame drum stomping, low bowed strings, hard cimbalom
hits. About 120 BPM, key of D minor. Dark but with a touch of folk humor.
Seamless loop. Avoid electronic synths and vocals.
```
```

### M07 · Бос: Чорнобор (mus\_boss\_chornobor)

- **Де:** сцена Баби-Яги. **Темп:** 90 BPM, 1:00, петля. **Інтенсивність:** 2.
- **Звучить як:** кумедна моторошність. Дримба булькає, акордеон хитається в ритмі, що спотикається (відчуття 5/4), щипки звучать, як кроки по болоті.
- **Промпт:**

```
Instrumental only, no vocals. Quirky creepy-funny swamp witch theme. Jaw harp (jew's harp)
bubbling, wobbly accordion, off-kilter plucked bandura, odd 5/4 feel. About 90 BPM,
key of D minor. Mischievous, comedic, not frightening. Seamless loop. Avoid vocals.



### M08 · Акт III: Дніпро (mus\_act3)

- **Де:** третій рівень. **Темп:** 90 BPM, розмір 6/8, 2:00, петля. **Інтенсивність:** 2–3.
- **Звучить як:** течія і блиск води. Арпеджіо бандури, плавна сопілка, м’які цимбали, схожі на брижі, легкий шелест ударних.
- **Промпт:**

```
Instrumental only, no vocals. Flowing river music, shimmering and magical, for a folk
platformer level on the Dnipro. Rippling bandura arpeggios, smooth sopilka melody, soft
cimbalom ripples, gentle brushed percussion. About 90 BPM in 6/8, key of D major.
Seamless loop. Avoid electronic synths and vocals.
```

### M09 ·Бос: Водяник-цар (mus\_boss\_vodyanyk)

- **Де:** арена Акту III. **Темп:** 130 BPM, 1:30, петля. **Інтенсивність:** 4–5.
- **Звучить як:** величний і штормовий. Глибокі барабани, хвилеподібні смичкові, тремоло бандури, цимбали, як краплі блискавки.
- **Промпт:**

```
Instrumental only, no vocals. Majestic stormy boss battle against a river king.
Deep drums, surging bowed strings like waves, tremolo bandura, sparkling cimbalom.
About 130 BPM, key of D minor. Powerful and dramatic with a folk flavor.
Seamless loop. Avoid electronic synths and vocals.
```

### M10 ·  Сом Вусань (mus\_catfish)

- **Де:** сцена перевезення. **Темп:** 100 BPM, 1:00, петля. **Інтенсивність:** 2.
- **Звучить як:** ліниве комічне погойдування. Контрабас у розмірений ходьбі, акордеон, щипки бандури, булькання духових.
- **Промпт:**

```
Instrumental only, no vocals. Lazy swaying comedic riverboat ride, a giant friendly
catfish carries the hero across the river. Walking double bass, accordion, plucked
bandura, bubbly woodwinds. About 100 BPM, key of D major. Seamless loop. Avoid vocals.
```

### M11 · Акт IV: Дике поле і Чорне море (mus\_act4)

- **Де:** четвертий рівень. **Темп:** 92 BPM, до 3:00 у Lyria 3 Pro, петля. **Інтенсивність:** від 2 до 4.
- **Звучить як:** один довгий день. Тихий світанок, яскравий полудень із вітром, золота година біля моря, глибокі сутінки. Відкриті ноти струнних, як подих степу. Ближче до кінця з’являється низький гул «гори» й мерехтіння цимбалів, як соляних кристалів.
- **Промпт:**

```
Instrumental only, no vocals. Epic wide-open Ukrainian steppe and Black Sea coast journey
that follows one whole day. Quiet dawn, bright windy noon, golden hour by the sea, deep
dusk. Plucked bandura, long sopilka melody, slow fiddle, open airy strings, shimmering
cimbalom at the end and a low distant drone. About 92 BPM, key of D major turning minor.
Builds gradually. Seamless loop. Avoid electronic synths and vocals.
```

### M12 · Фінальний бос: Соляногорич, фази 1–3 (mus\_boss\_zmiy)

- **Де:** арена Акту IV. **Темп:** 110 BPM, 2:00, петля. **Інтенсивність:** 4.
- **Звучить як:** величний і трохи сумний. Глибока бандура, смичковий контрабас, великий бубон, холодні цимбали. Це старий велетень, а не лиходій із жахів, тож у музиці є і сила, і смуток.
- **Промпт:**

```
Instrumental only, no vocals. Huge solemn boss battle against an ancient three-headed
serpent guarding a mountain of salt. Deep plucked bandura, bowed double bass, large frame
drum, cold cimbalom. About 110 BPM, key of D minor. Powerful but with a note of
loneliness, steady groove. Seamless loop. Avoid electronic synths and vocals.
```
