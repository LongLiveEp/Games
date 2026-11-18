/**
 * ============================================================================
 * КОЗАЦЬКИЙ БЕСТІАРІЙ (COSSACK BESTIARY MODAL & ARENA NOTIFICATION BANNER)
 * Bilingual (Ukrainian & English) interactive encyclopedia of all enemies,
 * bosses, folklore spirits, and companions (including Kum Hrytsko!).
 * ============================================================================
 */

const BESTIARY_DATA_UK = [
  {
    tabId: 'act1',
    tabLabel: '🌻 Акт I: Хутір',
    entries: [
      {
        id: 'goose',
        name: 'Гусак-охоронець',
        subtitle: 'Грицькова бойова сторожа',
        roleBadge: '⚔ Ворог Акту I',
        badgeColor: '#ffd166',
        texture: 'enemy_goose',
        scale: 1.35,
        location: 'Околиці хутора Омелька та стежка до садиби кума Грицька.',
        tactics: 'Коли гусак жовтіє і сичить — готується до стрімкого тарана або злету на крилах. Оглушуй сковорідкою [D] або галушкою [S]!',
        desc: 'Перша й чи не найлютіша перешкода на шляху до солоного борщу. Ходить поважно, шию гне дугою, але варто козакові підійти ближче — сичить так, наче в ньому сидить маленький змій, підстрибує на крилах і йде на таран дзьобом у шаровари.',
        lore: '• Українська народна казка «Івасик-Телесик» (де гусеня рятує хлопчика на крилах) та казка «Гуси-лебеді».\n• Байка Леоніда Глібова «Гуси» (де гуси пишаються тим, що їхні предки Рим урятували) та співомовки Степана Руданського.',
        omen: '«Якщо гусак стоїть на одній нозі й ховає дзьоба під крило — чекай морозу, а якщо витягнув шию паралельно землі — тікай або діставай сковорідку!»'
      },
      {
        id: 'pesyholovets',
        name: 'Песиголовець-підкопник',
        subtitle: 'Лісовий шишкостріл і норник',
        roleBadge: '⚔ Ворог Акту I–II',
        badgeColor: '#ffd166',
        texture: 'enemy_leshy',
        scale: 1.28,
        location: 'Узлісся за хутором, кореневі катакомби та підземелля Злого Лісу.',
        tactics: 'Кидається шишками здалеку, а коли Омелько підходить упритул — пірнає під землю. Пірнай за ним [Shift + ▼] або підлови на поверхні!',
        desc: 'Хитрий одноокий зайда з собачою головою, який полюбляє жбурляти в козака шишками й камінцями. Щойно Омелько підбігає дати здачі — миттю ховається у кореневі нори під землею.',
        lore: '• Українські народні казки «Про одноокого песиголовця» та «Як козак від песиголовців утік».\n• Етнографічні записи Володимира Гнатюка та Павла Чубинського про міфічних однооких велетнів-сироїдців із собачими головами.',
        omen: '«Де в лісі земля сама собою під ногами осідає і шишки без вітру сипляться — там песиголовець нору викопав».'
      },
      {
        id: 'chick',
        name: 'Бойове курча Корнія',
        subtitle: 'Пернатий спецназ курника',
        roleBadge: '🐤 Посіпака боса',
        badgeColor: '#ffbe0b',
        texture: 'enemy_chick',
        scale: 1.75,
        location: 'Арена боса наприкінці Першого акту (прикликається Півнем Корнієм).',
        tactics: 'Стрибає високо й прудко біжить у бік козака, але оглушується одним влучним ударом сковорідки.',
        desc: 'Дрібне, жовтеньке й пухнасте, але виховане суворим Півнем Корнієм у найкращих традиціях хутірського куріня. Безстрашно кидається під ноги на перший же кукурік ватажка.',
        lore: '• У давньослов’янській традиції курча — символ весняного сонця і нового життя.\n• Народні казки «Курочка Ряба», «Котик і Півник» та прислів’я «Курчат восени рахують».',
        omen: '«Якщо квочка скликає курчат під крила серед ясного дня — незабаром піде рясний дощ».'
      },
      {
        id: 'cellar_rat',
        name: 'Льоховий Щур-Злодюжка',
        subtitle: 'Вусатий розбійник старих комор і льохів',
        roleBadge: '⚔ Ворог Льоху',
        badgeColor: '#ffd166',
        texture: 'enemy_cellar_rat',
        scale: 1.55,
        location: 'Занедбаний козацький льох під хутором (Акт I).',
        tactics: 'Вміє перестрибувати кинуті здалеку галушки! Підходь ближче зі сковорідкою [D], ухиляйся від його стрибка й оглушуй, щоб повернути поцуплену галушку чи червінець!',
        desc: 'Прудкий сіро-бурий щур із довгим хвостом і гострими різцями, який хозяйнує між дубовими бочками в старому льоху. Обожнює вистрибувати з-за діжок і цупити з козацької торби галушки.',
        lore: '• Українські народні казки «Мишача рада» та гумористичні співомовки про коморних мишей і щурів.\n• У народних переказах льоховий пацюк — хитрий сторож старих підземель, який чує підземні ходи.',
        omen: '«Якщо в льоху щурі високо на полиці гнізда мостять — чекай великої весняної повені!»'
      },
      {
        id: 'mill_bat',
        name: 'Млиновий Кажан',
        subtitle: 'Нічний вартовий старих вітряків',
        roleBadge: '🦇 Ворог Горища',
        badgeColor: '#c77dff',
        texture: 'enemy_mill_bat',
        scale: 1.45,
        location: 'Темне горище старого вітряка під кроквами та шестернями (Акт I).',
        tactics: 'Висить догори дриґом під балками або ширяє хвилями. Коли пускає звукові кільця — готується до стрімкого піке! Перекочуйся [Shift] або збивай галушкою [S]!',
        desc: 'Крилатий мешканець млинового горища з перетинчастими крилами й пильними бурштиновими очима. Вдень дрімає під дубовими кроквами серед борошняного пилу, але варто потривожити тишу — ціла зграя зривається у стрімкий лет.',
        lore: '• За народними легендами Наддніпрянщини, кажан (лили́к) — то миша, що скуштувала свяченого хліба або борошна у старому млині й дістала крила.\n• Згадується в етнографічних записах Павла Чубинського та повістях Миколи Гоголя.',
        omen: '«Якщо ввечері кажани низько й густо літають навколо вітряка — завтра буде тиха, ясна й сонячна днина».'
      },
      {
        id: 'boss_rooster',
        name: 'Скажений Півень Корній',
        subtitle: 'Пернатий гетьман хутірського двору',
        roleBadge: '👑 БОС АКТУ I',
        badgeColor: '#ff4d4d',
        texture: 'boss_rooster',
        scale: 0.96,
         isBoss: true,
        location: 'Фінальна галявина Першого акту перед подвір’ям кума Грицька.',
        tactics: 'Має крилатий блок після 1–2 ударів! Бий у вікна після його випаду або стрибка з ударною хвилею. Потрібно оглушити й вгамувати двічі!',
        desc: 'Здоровецький червоногребінний володар сусідського подвір’я. Тупотить так, що по землі розходяться ударні хвилі, клюється чергами та скликає бойових курчат, поки Омелько не посадить його в дубову бочку.',
        lore: '• Повість Миколи Гоголя «Вій» (де третій спів півня проганяє всю нечисть).\n• Казки «Пан Коцький», «Півник і двоє мишенят» та поезії Тараса Шевченка («Садок вишневий коло хати»).',
        omen: '«До перших півнів нечисть гуляє, а після третіх — у землю тікає. А якщо півень заспівав не в пору — чекай гостей!»'
      }
    ]
  },
  {
    tabId: 'act2',
    tabLabel: '🌲 Акт II: Злий Ліс',
    entries: [
      {
        id: 'shield_guardian',
        name: 'Моховик-Щитоносець',
        subtitle: 'Страж вікових дубів',
        roleBadge: '🛡 Ворог зі щитом',
        badgeColor: '#00f5d4',
        texture: 'enemy_shield_guardian',
        scale: 1.25,
        location: 'Темні хащі та галявини Злого Лісу (Акт II).',
        tactics: 'Спереду 100% невразливий через дубовий щит! Перекотись крізь нього за спину клавішею [Shift] і бий шаблею у відкриту спину!',
        desc: 'Кряжистий лісовий дух, порослий віковим мохом і лишайником. Тримає поперед себе щит із мореного дуба, об який дзвенять і шаблі, і галушки, проте повертається повільно.',
        lore: '• Моховик (Боровик, Гаївка) — у поліській та карпатській демонології молодший брат Лісовика, охоронець старих дубів і грибних місць.\n• Описаний у працях Володимира Гнатюка «Знадоби до української демонології» та Валерія Войтовича.',
        omen: '«З якого боку на старих дубах мох густіший — звідти північ; а щоб Моховик стежку не сховав, лиши на пеньку окраєць хліба».'
      },
      {
        id: 'nyavka',
        name: 'Лісова Нявка (Мавка)',
        subtitle: 'Примарна діва з вогником Блуду',
        roleBadge: '✨ Ворог Акту II',
        badgeColor: '#80ed99',
        texture: 'enemy_nyavka',
        scale: 1.3,
        location: 'Туманні чагарі та папоротеві яри Злого Лісу.',
        tactics: 'Ширяє над землею, пускає зелені магічні вогники Блуду та стрімко пікірує. Перекочуйся [Shift] під час її лету й контратакуй шаблею!',
        desc: 'Напівпрозора смарагдова діва пралісу, що ковзає повітрям без жодного шелесту. Заводить тужливу пісню й намагається заманити подорожнього вогником Блуду в непролазні нетрі.',
        lore: '• Драма-феєрія Лесі Українки «Лісова пісня» (безсмертний образ Мавки).\n• Повість Михайла Коцюбинського «Тіні забутих предків» (зустріч Івана з Нявкою у карпатському лісі).',
        omen: '«Почуєш у лісі спів нявки чи побачиш зелений вогник — виверни свитку навиворіт, щоб лісовий Блуд не вчепився!»'
      },
      {
        id: 'bolotyanyk',
        name: 'Болотяник',
        subtitle: 'Господар лісової трясовини',
        roleBadge: '⚔ Важкий ворог',
        badgeColor: '#80ed99',
        texture: 'enemy_bolotyanyk',
        scale: 1.22,
        location: 'Торф’яні мочарі та багнисті низини Злого Лісу.',
        tactics: 'Здалеку жбурляє липким багном, а зблизька гупає об землю, розкидаючи грудки намулу в обидва боки. Тримай дистанцію під час замаху!',
        desc: 'Пузатий, обліплений ряскою, лататтям і торфом дух чорного болота. Не любить ні сонячного проміння, ні козацького гомону, зате обожнює трясти багно під ногами.',
        lore: '• Згадується у «Лісовій пісні» Лесі Українки (серед мешканців лісового озера й багна) та в українських народних переказах про Багника й Очеретяника.',
        omen: '«Якщо болото ввечері голосно булькає й парує — то Болотяник кашу варить, завтра буде велика злива».'
      },
      {
        id: 'chort',
        name: 'Куций Чортик з Корчми',
        subtitle: 'Рогатий гультяй із корчми-млина «Куций Хвіст»',
        roleBadge: '🍺 Чортик з Корчми',
        badgeColor: '#ff9f1c',
        texture: 'enemy_chort',
        extraTexture: 'korchma_mug',
        scale: 1.32,
        location: 'Дубові столи та полиці з бочками в зачарованій корчмі «Куций Хвіст» посеред Злого Лісу.',
        tactics: 'Жбурляє пінисті кухлі по параболі та вміє телепортуватись у сірчаному диму просто за спину Омелькові! Коли бачиш дим і «💨!» — розвертайся або перекочуйся [Shift]!',
        desc: 'Верткий куцохвостий гультяй із гострими ріжками, п’ятачком та копитцями, який гуляє на шабаші в старому лісовому млині-корчмі. Щойно бачить козака — хапається за дубові кухлі або пірнає в дим, щоб вискочити за спиною.',
        lore: '• Легендарний мультфільм Володимира Дахна «Як козаки на весіллі гуляли» (корчма-млин «Куций Хвіст» із чортами та нечистю).\n• Повісті Миколи Гоголя «Ніч перед Різдвом» та «Пропала грамота» із циклу «Вечори на хуторі біля Диканьки».',
        omen: '«Якщо посеред темного лісу світиться неонова вивіска корчми-млина — перехрести порога або тримай шаблю напоготові, бо там чорти весілля гуляють!»'
      },
      {
        id: 'dulya',
        name: 'Корчмарська Дуля',
        subtitle: 'Окаста Дуля в довгих вишитих рукавах',
        roleBadge: '✊ Котиться м’ячиком',
        badgeColor: '#ffd166',
        texture: 'enemy_dulya',
        scale: 1.24,
        location: 'Довгі дубові коридори та зала корчми «Куций Хвіст» (Акт II).',
        tactics: 'Згортається в тугий кулак і швидко котиться м’ячиком по підлозі! Перестрибуй через неї [↑] і рубай шаблею [D], коли вона зупиниться перевести дух!',
        desc: 'Химерна корчмарська примара у старій вишитій сорочці з довгими рукавами, замість голови якої стирчить величезна скручена дуля з виряченим оком між пальцями. Розганяється підлогою корчми немов гарматне ядро!',
        lore: '• Колоритний персонаж корчмарського шабашу з мультфільму «Як козаки на весіллі гуляли» та ілюстрацій за мотивами українського фольклору.\n• Народний жест-оберіг «дуля (фіґа) під ніс» проти відьом і нечистої сили.',
        omen: '«Як котиться на тебе корчмарська Дуля — не підставляй лоба, а перескоч зверху та почастуй плазом шаблі!»'
      },
      {
        id: 'boss_lykho',
        name: 'Лихо з Корчми «Куций Хвіст»',
        subtitle: 'Багряний отаман корчмарських чортів у червоних чоботях',
        roleBadge: '🥾 МІНІ-БОС КОРЧМИ',
        badgeColor: '#ff002b',
        texture: 'boss_lykho',
        extraTexture: 'loot_boots_lykho',
        scale: 1.02,
        isBoss: true,
        location: 'Бенкетна зала в глибині корчми «Куций Хвіст» (середина Акту II).',
        tactics: 'Таран у червоних чоботях, стрибок із подвійною ударною хвилею та залп кухлями! Переможи його, щоб здобути Червоні Чоботи-Сап’янці (оглушення ворогів перекатом [Shift], навіть крізь щити)!',
        desc: 'Здоровецький багряний ватажок нечисті з довгим носом, золотою сережкою у вусі та розкішними червоними чоботами-сап’янцями. Сидить на чолі дубового столу під бочками з черепом і регоче над кожним, хто зайшов у корчму без запрошення.',
        lore: '• Мультфільм «Як козаки на весіллі гуляли» (головний багряний чорт-корчмар за дубовим столом).\n• Українська народна казка «Лихо Однооке» та приказка «Не буди Лихо, поки воно тихо!».',
        omen: '«Хто в Лиха червоні чоботи-сап’янці відіб’є — той у перекаті саму нечисть із ніг збиватиме!»'
      },
      {
        id: 'boss_lisovyk',
        name: 'Прадавній Лісовик Чорнобор',
        subtitle: 'Рогатий володар Чорнолісся',
        roleBadge: '👑 БОС АКТУ II',
        badgeColor: '#ff4d4d',
        texture: 'boss_lisovyk',
        scale: 0.94,
        isBoss: true,
        location: 'Серце Злого Лісу перед галявиною Баби-Яги.',
        tactics: 'Періодично виставляє непробивний Коровий Щит спереду! Перекочуйся йому за спину [Shift], перестрибуй хвилі коріння й оглуши двічі!',
        desc: 'Гігантський рогатий дух пралісу у панцирі з віковічної дубової кори. Його кроки пробуджують підземне коріння, а ревіння скликає на арену моховиків та нявок.',
        lore: '• Драма-феєрія Лесі Українки «Лісова пісня» (образ мудрого й грізного Лісовика).\n• Казка Івана Франка «Фарбований Лис» та поліські легенди про Лісового Царя.',
        omen: '«Заходячи в праліс, спитай дозволу в Лісовика; а якщо заблукав — перевзуй чоботи з лівої ноги на праву!»'
      }
    ]
  },
  {
    tabId: 'act3',
    tabLabel: '🌊 Акт III: Дніпро',
    entries: [
      {
        id: 'rusalka',
        name: 'Дніпрова Русалка-лоскотарка',
        subtitle: 'Підводна мисливиця з вінком латаття',
        roleBadge: '🧜‍♀️ Водна засідка',
        badgeColor: '#48cae4',
        texture: 'enemy_rusalka',
        scale: 1.25,
        location: 'Глибокі плеса між хмаринками над ревучим Дніпром (Акт III).',
        tactics: 'Видає себе вінком на воді. Коли вистрибує з піснею — ухились перекатом [Shift] або стрибком! Якщо схопила — швидко тисни [Shift / Пробіл / D]!',
        desc: 'Підступна річкова красуня, що чатує під хмарними переправами. Вистрибує високо з хвиль Славутича, щоб охопити козака холодними руками й потягти у вир.',
        lore: '• Балади Тараса Шевченка «Причинна» («Реве та стогне Дніпр широкий...»), «Русалка» та «Утоплена».\n• Повість Миколи Гоголя «Майська ніч, або Утоплена».',
        omen: '«Щоб русалка не залоскотала біля Дніпра, носи при собі духмяний полин (євшан-зілля) або любисток!»'
      },
      {
        id: 'vodyanyk_cloud',
        name: 'Водяник Хмарний',
        subtitle: 'Чатовий дощових хмар Славутича',
        roleBadge: '🌊 Ворог Акту III',
        badgeColor: '#48cae4',
        texture: 'enemy_vodyanyk',
        scale: 1.22,
        location: 'Високі хмарні платформи над Дніпровими порогами.',
        tactics: 'Походжає по хмарах і метає водяні кулі. Збивай йому приціл бойовими жабами [S] або рубай шаблею у стрибку!',
        desc: 'Сивобородий слуга Водяного Царя, який піднявся разом із річковим туманом на хмари, щоб обстрілювати козацьку переправу водяними вихорами.',
        lore: '• Бурлескна поема Івана Котляревського «Енеїда» (бенкет морських і річкових духів у Нептуна).\n• Народні перекази про водяників, що під час літніх гроз підіймаються на хмари.',
        omen: '«Якщо хмари низько над Дніпром стеляться й проти вітру пливуть — водяники бурю кличуть».'
      },
      {
        id: 'potercha',
        name: 'Потерча річкове з каганцем',
        subtitle: 'Летючий вогник над плавнями',
        roleBadge: '🏮 Летючий ворог',
        badgeColor: '#ffea00',
        texture: 'enemy_potercha',
        scale: 1.32,
        location: 'Повітряні прогалини між хмарами та арена Водяного Царя.',
        tactics: 'Зависає в небі з жовтим ліхтариком і раптово пікірує навскоси. Влуч бойовою жабою [S] ще до його ривка!',
        desc: 'Маленький крилатий дух очеретів і дніпрових плавнів, який світить у сутінках болотним каганцем і намагається збити необережного стрибуна з хмаринки у воду.',
        lore: '• Драма-феєрія Лесі Українки «Лісова пісня» (де потерчата з мерехтливими вогниками бігають понад трясовиною та озером).',
        omen: '«Мигтять жовті вогники над вечірнім очеретом — не йди на їхнє світло, бо заведуть у глибоку ковбаню!»'
      },
      {
        id: 'boss_vodyanyk',
        name: 'Водяний Цар Порогів',
        subtitle: 'Володар дев’яти Дніпрових порогів',
        roleBadge: '👑 БОС АКТУ III',
        badgeColor: '#ff4d4d',
        texture: 'boss_vodyanyk_tsar',
        scale: 0.66,
        isBoss: true,
        location: 'Царський дерев’яний поміст біля останнього порога Дніпра.',
        tactics: 'Має 3 стадії! Стережись грозових хмар з блискавками, перестрибуй припливні хвилі, опирайся затягуванню у вир і оглуши його тричі!',
        desc: 'Грізний володар Дніпрових порогів із золотим тризубцем, який ув’язнив Річкового Сома Вусаня у золотій верші. Керує громами, вирами та хвилями, аж поки сам не закрутиться у власну воронку!',
        lore: '• Козацькі легенди про головний поріг Ненаситець («Дід-поріг»), зібрані Дмитром Яворницьким в «Історії запорозьких козаків».\n• Народні казки «Морський Цар і його дочки» та «Ох».',
        omen: '«Перепливаючи Дніпрові пороги, козацькі лоцмани кидали у хвилі дрібку хліба-солі, щоб Водяний Дід пропустив чайку».'
      }
    ]
  },
  {
    tabId: 'act4',
    tabLabel: '🌾 Акт IV: Степ і Море',
    entries: [
      {
        id: 'polovyk',
        name: 'Польовик (Ковиловий засідник)',
        subtitle: 'Невидимий дух степових трав',
        roleBadge: '🌾 Засідка в траві',
        badgeColor: '#e9c46a',
        texture: 'enemy_polovyk',
        scale: 1.32,
        location: 'Ковилові простори Дикого Поля (Акт IV).',
        tactics: 'Ховається у високій ковилі майже прозорим! Коли бачиш ледь помітний силует або знак «!» — бий першим або ухиляйся від його стрибка!',
        desc: 'Степовий дух, чиє волосся й борода сплетені з сухої ковили, полину та пшеничних колосків. Причаюється у траві й вистрибує просто перед носом мандрівника.',
        lore: '• Новела Михайла Коцюбинського «Intermezzo» (поетична симфонія українського поля й сонця).\n• Народні повір’я про Польовика і Полудницю у записах Бориса Грінченка.',
        omen: '«Коли жито чи ковила хвилями ходить без вітру — то Польовик свої угіддя обходить. Залиш йому на межі "Спасову бороду" з колосків!»'
      },
      {
        id: 'vovkulaka',
        name: 'Степовий Вовкулака',
        subtitle: 'Прудконогий сіроманець Дикого Поля',
        roleBadge: '🐺 Стрімкий хижак',
        badgeColor: '#ff9f1c',
        texture: 'enemy_vovkulaka',
        scale: 1.26,
        location: 'Скіфські кургани, кам’яні баби та чумацькі шляхи Степу.',
        tactics: 'Перед атакою низько присідає на 0.45 с із вовчим гарчанням — встигни перекотитися [Shift] назустріч або підстрибнути!',
        desc: 'Лютий степовий перевертень із вогняними очима, що чатує біля стародавніх курганів. Атакує блискавичними низькими стрибками.',
        lore: '• Козацькі перекази про характерників та кошового отамана Івана Сірка, які вміли перекидатися на сірого вовка.\n• Літописне «Слово о полку Ігоревім» та поема Олександра Олеся «Вовкулака».',
        omen: '«Якщо вовкулака перестрибне через козацький пояс або удар плазом шаблі — чари спадуть».'
      },
      {
        id: 'tumbleweed',
        name: 'Колюче Перекотиполе',
        subtitle: 'Вітряний мандрівник суховію',
        roleBadge: '🌬 Природна загроза',
        badgeColor: '#f4a261',
        texture: 'enemy_tumbleweed',
        scale: 1.3,
        location: 'Вітряні долини Дикого Поля.',
        tactics: 'Під час поривів степового суховію котиться значно швидше! Один-два влучні удари шаблею чи жабою — і воно відлетить за хмари.',
        desc: 'Пружна колюча куля висохлого степового зілля, яку жене вперед гарячий вітер-суховій, підкидаючи на купинах.',
        lore: '• Українська народна казка-притча «Перекотиполе» (де степовий кущ стає свідком неправди й викриває злочинця).\n• Степова лірика Івана Манжури та Якова Щоголева.',
        omen: '«Багато перекотиполя летить Чумацьким Шляхом — на суху й вітряну осінь; а якщо котиться проти вітру — то в ньому біс сидить!»'
      },
      {
        id: 'seagull',
        name: 'Чайка-злодійка',
        subtitle: 'Перната митниця Сивашу й Чорного моря',
        roleBadge: '🪙 Крадій червінців',
        badgeColor: '#ffd166',
        texture: 'enemy_seagull',
        scale: 1.38,
        location: 'Рожеві соляні озера Сивашу та узбережжя Чорного моря.',
        tactics: 'Пікірує з неба й видирає з кишені до 3 золотих червінців! Не дай їй утекти — оглуши шаблею [D] або жабою [S], щоб повернути всі вкрадені монети!',
        desc: 'Нахабний чорноморський мартин, який кружляє над соляними кладками й полює на блискучі козацькі червінці та чумацьку тараню.',
        lore: '• Козацька дума-пісня гетьмана Івана Мазепи «Ой біда, біда чайці-небозі».\n• Історична повість Андрія Чайковського «За сестрою» та чумацький фольклор Причорномор’я.',
        omen: '«Чайки сідають на воду — буде штиль і погожа днина; бродять берегом і кричать — чекай шторму на Чорному морі!»'
      },
      {
        id: 'boss_zmiy',
        name: 'Триголовий Змій Соляногорич',
        subtitle: 'Прадавній охоронець Соляної Гори (а нині — кум!)',
        roleBadge: '👑 ФІНАЛЬНИЙ БОС',
        badgeColor: '#ff0055',
        texture: 'zmiy_head_proud',
        isCompositeZmiyPortrait: true,
        scale: 0.9,
        isBoss: true,
        location: 'Вершина білосніжної Соляної Гори біля Чорного моря.',
        tactics: 'Бій у 3 стадії! По черзі оглуши всі 3 голови: І. Голодну (у бочку), ІІ. Сонну (приспи) та ІІІ. Царську (збий корону!). Жаби [S] наносять підвищене оглушення!',
        desc: 'Велетенський крилатий змій у панцирі з рожевих друз солі. Має Голодну, Сонну та Царську голови. Тисячу років стеріг сіль на самоті, бо ніхто ніколи не кликав його в гості на гарячий борщ — аж поки Омелько не запросив старого до столу!',
        lore: '• Героїчні казки «Кирило Кожум’яка», «Котигорошко», «Іван Побиван» та легенди про Змієві вали Наддніпрянщини.\n• Добродушні казкові змії у творах Юрія Винничука.',
        omen: '«Розсипати сіль за столом — до сварки, а привезти мішок кримської солі на спині Триголового Змія — до великого козацького застілля!»'
      }
    ]
  },
  {
    tabId: 'allies',
    tabLabel: '🍻 Кум і Побратими',
    entries: [
      {
        id: 'kum_hrytsko',
        name: 'Кум Грицько (Homo Kumus Cossackus)',
        subtitle: 'Почесний сусід, власник гусей і дамаської шаблі',
        roleBadge: '🍻 Козацький Кум',
        badgeColor: '#ffbe0b',
        texture: 'npc_hrytsko',
        scale: 1.35,
        location: 'Сусіднє подвір’я на околиці хутора (одразу за ареною Півня Корнія) та фінальне застілля.',
        tactics: 'Битися з кумом суворо заборонено козацьким звичаєм! З ним треба вітатися, слухати байки й приймати в дарунок гостру дамаську шаблю.',
        desc: 'Унікальний феномен українського світобудови: коли приходиш до кума позичити дрібку солі до борщу — солі в нього гарантовано катма («хоч вовком вий!»), зате в коморі випадково лежить справжня козацька шабля з дамаської сталі! Своїх лютих гусей і скаженого півня Корнія щиро вважає «мирними пташками».',
        lore: '• Повісті Миколи Гоголя «Вечори на хуторі біля Диканьки» («Ніч перед Різдвом» — Чуб і кум Панас; «Сорочинський ярмарок»).\n• Комедія Івана Карпенка-Карого «Мартин Боруля» та золотий фонд українських народних анекдотів про кумів.',
        omen: '«Якщо кум каже: "Та солі нема, але на ось тобі шаблю, сходи в Злий Ліс" — повернешся додому не раніше вечора, та ще й верхи на триголовому Змієві!»'
      },
      {
        id: 'baba_yaga',
        name: 'Баба-Яга Кістяна Нога',
        subtitle: 'Лісова знахарка та заводчиця бойових жаб',
        roleBadge: '🐸 Лісова Союзниця',
        badgeColor: '#80ed99',
        texture: 'npc_baba_yaga',
        extraTexture: 'swamp_frog',
        scale: 1.18,
        location: 'Галявина з хатинкою на курячих ніжках у глибині Злого Лісу (фінал Акту II).',
        tactics: 'За те, що Омелько провчив її галасливого сусіда Лісовика Чорнобора, дарує козакові торбу Бойових Болотних Жаб замість галушок [S]!',
        desc: 'Прадавня господиня хатки на курячих ніжках. Навіть мухомори в її казані киплять несолоні, бо останню сіль поцупив Водяник, зате болотних жаб у неї — хоч греблю гати!',
        lore: '• Українські народні казки «Івасик-Телесик», «Баба-Яга — кістяна нога».\n• Колоритні образи ворожок і Сивілли в «Енеїді» Івана Котляревського.',
        omen: '«Якщо болотні жаби голосно кумкають увечері — на ясну погоду; а якщо летять із торби Омелька — комусь зараз очі слизом заліпить!»'
      },
      {
        id: 'catfish_vusany',
        name: 'Річковий Сом Вусань',
        subtitle: 'Вусатий поромник Дніпра-Славутича',
        roleBadge: '🐟 Водний Побратим',
        badgeColor: '#48cae4',
        texture: 'giant_catfish',
        scale: 0.72,
        location: 'У золотій верші на арені Водяного Царя та на переправі через Дніпро (фінал Акту III).',
        tactics: 'Звільни його з плетеної верші, перемігши Водяного Царя, і Сом Вусань перевезе Омелька через широкий Дніпро просто до Дикого Поля!',
        desc: 'Велетенський вусатий велетень Дніпра, який сім весен просидів у золотій верші Водяного Царя. Обожнює ласувати болотними жабами, носить розкішні козацькі вуса й дарує Омелькові срібну луску-оберіг.',
        lore: '• Гумористичне оповідання Остапа Вишні «Сом» із циклу «Мисливські усмішки» (про дніпрового сома завбільшки з човен).\n• Народні перекази Подніпров’я про столітніх сомів під порогами.',
        omen: '«Якщо велетенський сом спливає з дніпрової ями на поверхню води — перед грозою або на щиру дружбу з козаком!»'
      }
    ]
  }
];

const BESTIARY_DATA_EN = [
  {
    tabId: 'act1',
    tabLabel: '🌻 Act I: Homestead',
    entries: [
      {
        id: 'goose',
        name: 'Guard Goose',
        subtitle: 'Hrytsko’s Feathered Sentry',
        roleBadge: '⚔ Act I Foe',
        badgeColor: '#ffd166',
        texture: 'enemy_goose',
        scale: 1.35,
        location: 'Outskirts of Omelko’s homestead and the path to Godfather Hrytsko’s yard.',
        tactics: 'When the goose flashes yellow and hisses, it is about to charge or flutter up onto platforms. Stun it with your frying pan [D] or a dumpling [S]!',
        desc: 'The first and fiercest obstacle standing between a Cossack and salted borsch. Struts about with a curved neck, hisses like a little serpent, flaps its wings, and charges beak-first at your sharovary.',
        lore: '• Ukrainian folk tale “Ivasyk-Telesyk” (where a faithful gosling rescues the boy on its wings) and “The Magic Swan Geese”.\n• Leonid Hlibov’s fable “The Geese” and Stepan Rudansky’s humorous folk rhymes.',
        omen: '“If a goose stands on one leg and tucks its beak under its wing, frost is coming; if it stretches its neck flat along the ground — run or grab your frying pan!”'
      },
      {
        id: 'pesyholovets',
        name: 'Pesyholovets Burrower',
        subtitle: 'One-Eyed Woodland Cone-Thrower',
        roleBadge: '⚔ Act I–II Foe',
        badgeColor: '#ffd166',
        texture: 'enemy_leshy',
        scale: 1.28,
        location: 'Forest edges beyond the village and underground root burrows.',
        tactics: 'Hurls pinecones from afar and dives underground when Omelko approaches. Dive after him [Shift + ▼] or catch him leaping back up!',
        desc: 'A cunning one-eyed, dog-headed marauder who pelts travellers with pinecones and stones, then burrows into underground root tunnels the moment a Cossack gets close.',
        lore: '• Ukrainian folk tales “About the One-Eyed Pesyholovets” and “How the Cossack Escaped the Pesyholovtsi”.\n• Ethnographic collections by Volodymyr Hnatiuk and Pavlo Chubynsky on dog-headed cyclops spirits of Ukrainian folklore.',
        omen: '“Where forest soil sinks underfoot and pinecones fall without wind, a Pesyholovets has dug its burrow.”'
      },
      {
        id: 'chick',
        name: 'Korniy’s Combat Chick',
        subtitle: 'Feathered Barnyard Commando',
        roleBadge: '🐤 Boss Minion',
        badgeColor: '#ffbe0b',
        texture: 'enemy_chick',
        scale: 1.75,
        location: 'Boss arena at the end of Act I (summoned by Mad Rooster Korniy).',
        tactics: 'Hops briskly toward Omelko, but a single hearty swing of the frying pan calms it right down.',
        desc: 'Tiny, yellow, and fluffy, yet drilled by Mad Rooster Korniy in strict Cossack barnyard discipline. Fearlessly hops into the fray whenever the Rooster crows for backup.',
        lore: '• In Slavic tradition, the chick symbolizes spring sunlight and renewal.\n• Ukrainian fairy tales “Kurochka Ryaba” and “The Little Cat and the Rooster”.',
        omen: '“When a mother hen calls her chicks under her wings at midday, a summer downpour is on its way.”'
      },
      {
        id: 'cellar_rat',
        name: 'Cellar Rat-Thief',
        subtitle: 'Whiskered Raider of Old Cossack Vaults',
        roleBadge: '⚔ Cellar Foe',
        badgeColor: '#ffd166',
        texture: 'enemy_cellar_rat',
        scale: 1.55,
        location: 'Abandoned Cossack Cellar beneath the village (Act I).',
        tactics: 'Nimble enough to hop right over thrown dumplings! Close in with your frying pan [D], dodge its lunging pounce, and stun it to recover any snatched dumpling or coin!',
        desc: 'A sleek slate-brown cellar rat with sharp incisors that scurries between oak barrels. Loves springing out of the shadows to snatch a warm dumpling right out of Omelko’s pouch.',
        lore: '• Featured in Ukrainian folk fables (“The Council of Mice”) and humorous Cossack tales of pantry raiders.',
        omen: '“When cellar rats build their nests high up on the top barrel shelves, a great spring flood is on its way!”'
      },
      {
        id: 'mill_bat',
        name: 'Windmill Attic Bat',
        subtitle: 'Winged Sentinel of the Dusty Rafters',
        roleBadge: '🦇 Attic Foe',
        badgeColor: '#c77dff',
        texture: 'enemy_mill_bat',
        scale: 1.45,
        location: 'High rafters and wooden cogwheels of the Old Windmill Attic (Act I).',
        tactics: 'Roosts upside-down under rafters or flutters in figure-eight waves. When it emits sonic rings, dodge its diagonal V-swoop [Shift] or knock it down with a dumpling [S]!',
        desc: 'A leathery-winged inhabitant of the old windmill loft with glowing amber eyes. Roosts among the flour-dusted beams by day and swoops down in flocks when disturbed.',
        lore: '• In Ukrainian folklore, the bat (“lylyk”) is a mouse that nibbled blessed grain in an old mill and sprouted leathery wings.',
        omen: '“When bats wheel thickly around the windmill sails at dusk, tomorrow’s weather will be clear and sunny.”'
      },
      {
        id: 'boss_rooster',
        name: 'Mad Rooster Korniy',
        subtitle: 'Feathered Hetman of the Homestead Yard',
        roleBadge: '👑 ACT I BOSS',
        badgeColor: '#ff4d4d',
        texture: 'boss_rooster',
        scale: 0.96,
        isBoss: true,
        location: 'Final clearing of Act I right before Godfather Hrytsko’s yard.',
        tactics: 'Raises a Wing-Guard after 1–2 hits! Strike during cooldown windows after his lunge or shockwave jump. Stun and finish him twice!',
        desc: 'A massive red-combed monarch of the neighbour’s coop. Stomps the ground to send shockwaves, unleashes rapid beak flurries, and summons combat chicks until Omelko packs him into an oak barrel.',
        lore: '• Mykola Gogol’s novella “Viy” (where the rooster’s third crow banishes all dark spirits at dawn).\n• Folk tales “Sir Kotsky” and Taras Shevchenko’s pastoral poetry.',
        omen: '“Dark spirits roam until the first rooster crows, and vanish underground at the third crow!”'
      }
    ]
  },
  {
    tabId: 'act2',
    tabLabel: '🌲 Act II: Wicked Forest',
    entries: [
      {
        id: 'shield_guardian',
        name: 'Moss Shield-Guardian',
        subtitle: 'Oak-Shielded Warden of the Thicket',
        roleBadge: '🛡 Shielded Foe',
        badgeColor: '#00f5d4',
        texture: 'enemy_shield_guardian',
        scale: 1.25,
        location: 'Deep gloom and ancient clearings of the Wicked Forest (Act II).',
        tactics: '100% invulnerable from the front! Dodge-roll behind his back with [Shift] and slash his exposed back with your saber!',
        desc: 'A stocky woodland spirit overgrown with century-old moss and lichen. Carries a massive bog-oak shield that deflects any frontal strike, but turns around slowly.',
        lore: '• Known as Mokhovyk or Borovyk in Polissian and Carpathian folklore — the younger brother of the Forest Lord who guards ancient oaks and mushroom glades.\n• Documented in Volodymyr Hnatiuk’s “Contributions to Ukrainian Demonology”.',
        omen: '“Moss grows thickest on the northern side of old oaks; leave a crust of bread on a stump so the Moss Spirit does not hide your path.”'
      },
      {
        id: 'nyavka',
        name: 'Forest Nyavka (Mavka)',
        subtitle: 'Spectral Woodland Maiden with Will-o’-Wisp',
        roleBadge: '✨ Act II Foe',
        badgeColor: '#80ed99',
        texture: 'enemy_nyavka',
        scale: 1.3,
        location: 'Misty fern gullies and enchanted groves of the Wicked Forest.',
        tactics: 'Glides above the ground, fires glowing green Will-o’-Wisps, and swoops down swiftly. Roll [Shift] through her swoop and counterattack!',
        desc: 'An ethereal emerald spirit of the primeval woods who drifts silently above the grass, singing a haunting melody and hurling orbs of straying light (Blud).',
        lore: '• Lesya Ukrainka’s masterpiece drama-extravaganza “The Forest Song” (Mavka).\n• Mykhailo Kotsiubynsky’s novella “Shadows of Forgotten Ancestors” (Carpathian Nyavka).',
        omen: '“If you hear a Nyavka’s song or spot a stray green flame in the woods, turn your coat inside out so the spirit of Blud cannot lead you astray!”'
      },
      {
        id: 'bolotyanyk',
        name: 'Bolotyanyk (Bog Brute)',
        subtitle: 'Hulking Master of the Mire',
        roleBadge: '⚔ Heavy Foe',
        badgeColor: '#80ed99',
        texture: 'enemy_bolotyanyk',
        scale: 1.22,
        location: 'Peat bogs and treacherous marshlands of the Wicked Forest.',
        tactics: 'Hurls toxic bog sludge from afar and slams the ground when close, flinging mud globs both ways. Keep your distance when he winds up!',
        desc: 'A pot-bellied swamp demon draped in duckweed, peat, and reeds. Detests sunlight and noisy travellers, shaking the mire with his heavy fists.',
        lore: '• Featured in Lesya Ukrainka’s “The Forest Song” and Ukrainian folk legends of marsh spirits (Bolotyanyk, Bahnyk, Ocheretyanyk).',
        omen: '“When the swamp bubbles loudly and steams at dusk, the Bolotyanyk is brewing his porridge — expect heavy rain tomorrow.”'
      },
      {
        id: 'chort',
        name: 'Kutsyi Chortyk (Tavern Imp)',
        subtitle: 'Horned Reveler of the “Short Tail” Tavern-Mill',
        roleBadge: '🍺 Tavern Imp',
        badgeColor: '#ff9f1c',
        texture: 'enemy_chort',
        extraTexture: 'korchma_mug',
        scale: 1.32,
        location: 'Oak banquet tables and barrel shelves inside the haunted “Short Tail” Tavern.',
        tactics: 'Hurls frothy tankards and teleports in sulfurous smoke right behind Omelko’s back! When you see smoke and “💨!”, turn around or roll [Shift]!',
        desc: 'A nimble short-tailed devil with pointed horns, a snout, and cloven hooves carousing inside the crooked forest mill-tavern. Loves vanishing in smoke to ambush uninvited Cossacks from behind.',
        lore: '• Volodymyr Dakhno’s classic animated film “How the Cossacks Celebrated the Wedding” (the haunted mill-tavern “Kutsyi Khvist”).\n• Mykola Gogol’s “The Night Before Christmas” and “The Lost Letter” from “Evenings on a Farm Near Dikanka”.',
        omen: '“If a neon tavern sign glows in the middle of the dark woods, cross the threshold carefully — the devils are holding a feast inside!”'
      },
      {
        id: 'dulya',
        name: 'Tavern Dulya (The Fig-Fist)',
        subtitle: 'One-Eyed Clenched Fist in Embroidered Sleeves',
        roleBadge: '✊ Rolling Ball',
        badgeColor: '#ffd166',
        texture: 'enemy_dulya',
        scale: 1.24,
        location: 'Long oak corridors and main hall of the “Short Tail” Tavern (Act II).',
        tactics: 'Curls into a tight fist-ball and rolls rapidly across the floor! Jump over it [↑] and slash with your saber [D] when it stops to catch its breath!',
        desc: 'A bizarre tavern apparition clad in an old embroidered linen shirt with dangling sleeves, topped by a giant clenched fist (“dulya”) with a bulging eye peeking between the knuckles.',
        lore: '• Inspired by the folkloric tavern phantoms of “How the Cossacks Celebrated the Wedding” and traditional Ukrainian folk charms.',
        omen: '“When the Tavern Dulya comes rolling like a cannonball, leap high over its knuckles and strike as it uncurls!”'
      },
      {
        id: 'boss_lykho',
        name: 'Lykho of the “Short Tail” Tavern',
        subtitle: 'Crimson Chieftain of the Tavern Devils in Red Boots',
        roleBadge: '🥾 TAVERN MINI-BOSS',
        badgeColor: '#ff002b',
        texture: 'boss_lykho',
        extraTexture: 'loot_boots_lykho',
        scale: 1.02,
        isBoss: true,
        location: 'Banquet Hall at the heart of the “Short Tail” Tavern (mid-Act II).',
        tactics: 'Red-booted charge, shockwave slam, and double tankard volley! Defeat him to claim the Red Cossack Boots (allowing your roll [Shift] to stun enemies even through shields)!',
        desc: 'The hulking crimson chieftain of the tavern imps with a long nose, a golden earring, and prized red Moroccan-leather Cossack boots. Presides over the banquet table beneath skull-marked casks.',
        lore: '• Inspired by the crimson tavern devil chieftain in “How the Cossacks Celebrated the Wedding” and the Ukrainian folk tale “One-Eyed Lykho”.',
        omen: '“Whoever wins the red boots off Lykho’s feet will bowl over dark spirits with a single Cossack roll!”'
      },
      {
        id: 'boss_lisovyk',
        name: 'Ancient Lisovyk Chornobor',
        subtitle: 'Horned Sovereign of the Dark Woods',
        roleBadge: '👑 ACT II BOSS',
        badgeColor: '#ff4d4d',
        texture: 'boss_lisovyk',
        scale: 0.94,
        isBoss: true,
        location: 'Heart of the Wicked Forest before Baba Yaga’s clearing.',
        tactics: 'Frequently raises an impenetrable frontal Bark Shield! Roll behind him [Shift] to land bonus backstab hits, jump over root waves, and finish him twice!',
        desc: 'The towering antlered lord of the Black Woods clad in ancient bark armor. His slams awaken thorny root waves and his roar summons woodland spirits from the thicket.',
        lore: '• Lesya Ukrainka’s “The Forest Song” (the wise and formidable Lisovyk).\n• Ivan Franko’s tale “The Painted Fox” and Polissian legends of the Forest Tsar.',
        omen: '“Always ask the Lisovyk’s permission before entering the primeval forest; if you lose your way, swap your left and right boots!”'
      }
    ]
  },
  {
    tabId: 'act3',
    tabLabel: '🌊 Act III: Dnipro',
    entries: [
      {
        id: 'rusalka',
        name: 'Dnipro Rusalka',
        subtitle: 'River Nymph with a Water-Lily Wreath',
        roleBadge: '🧜‍♀️ Water Ambush',
        badgeColor: '#48cae4',
        texture: 'enemy_rusalka',
        scale: 1.25,
        location: 'Deep river gaps beneath the cloud crossing on the Dnipro (Act III).',
        tactics: 'Watch for her lily wreath on the water! Dodge her leap with [Shift] or jump. If grabbed, mash [Shift / Space / D] to break free!',
        desc: 'A alluring yet perilous nymph of the Dnipro rapids who lurks just below the water surface, leaping high into the air to pull travellers into the river.',
        lore: '• Taras Shevchenko’s ballads “Prychynna” (“The Mighty Dnipro Roars and Bellows...”), “Rusalka”, and “Utoplena”.\n• Mykola Gogol’s tale “May Night, or the Drowned Maiden”.',
        omen: '“Carry wormwood (yevshan-herb) or lovage in your sash by the river so the Rusalkas dare not tickle you!”'
      },
      {
        id: 'vodyanyk_cloud',
        name: 'Cloud Vodyanyk',
        subtitle: 'Mist Caster of the Dnipro Skies',
        roleBadge: '🌊 Act III Foe',
        badgeColor: '#48cae4',
        texture: 'enemy_vodyanyk',
        scale: 1.22,
        location: 'High cloud platforms above the Dnipro rapids.',
        tactics: 'Patrols clouds and hurls spinning water orbs. Pelting him with Baba Yaga’s swamp frogs [S] stuns him from a safe distance!',
        desc: 'A white-bearded servant of the Water Tsar who rides storm-mists up into the clouds to bombard anyone crossing the rapids.',
        lore: '• Ivan Kotliarevsky’s burlesque epic “Eneida” (Neptune’s river and sea court).\n• Folk tales of water spirits rising with summer storm clouds.',
        omen: '“When low clouds drift against the wind over the Dnipro, the water spirits are brewing a squall.”'
      },
      {
        id: 'potercha',
        name: 'River Potercha with Lantern',
        subtitle: 'Glowing Marsh-Light Flyer',
        roleBadge: '🏮 Sky Flyer',
        badgeColor: '#ffea00',
        texture: 'enemy_potercha',
        scale: 1.32,
        location: 'Sky gaps between clouds and the Water Tsar’s arena.',
        tactics: 'Hovers with a glowing yellow lantern and swoops diagonally. Strike it down with a swamp frog [S] or mid-air saber slash!',
        desc: 'A tiny winged spirit of the reeds carrying a flickering marsh lantern, eager to knock cloud-jumping Cossacks into the river below.',
        lore: '• Lesya Ukrainka’s “The Forest Song” (where Poterchata spirits flicker like marsh lights over the dark water).',
        omen: '“Never follow yellow lights flickering over riverside reeds at night — they lead straight into deep water!”'
      },
      {
        id: 'boss_vodyanyk',
        name: 'Water Tsar of the Rapids',
        subtitle: 'Crowned Sovereign of the Nine Dnipro Rapids',
        roleBadge: '👑 ACT III BOSS',
        badgeColor: '#ff4d4d',
        texture: 'boss_vodyanyk_tsar',
        scale: 0.66,
        isBoss: true,
        location: 'Royal wooden pier beside the final Dnipro rapid.',
        tactics: '3-stage battle! Dodge lightning clouds, leap over tidal waves, resist his whirlpool pull, and stun him three times to free the Catfish!',
        desc: 'The crowned ruler of the Dnipro rapids wielding a golden trident. He locked Whiskered Catfish Vusany in a golden reed cage and commands thunderclouds and whirlpools — until he gets sucked into his own maelstrom!',
        lore: '• Cossack legends of the Nenasytets (“Grandfather”) Rapid recorded by historian Dmytro Yavornytsky.\n• Ukrainian fairy tales “The Sea Tsar and His Daughters” and “Okh”.',
        omen: '“Before steering a chayka boat through the Dnipro rapids, Cossack pilots tossed bread and salt into the waves to appease the Water Grandfather.”'
      }
    ]
  },
  {
    tabId: 'act4',
    tabLabel: '🌾 Act IV: Steppe & Sea',
    entries: [
      {
        id: 'polovyk',
        name: 'Polovyk (Feather-Grass Ambusher)',
        subtitle: 'Camouflaged Spirit of the Steppe',
        roleBadge: '🌾 Grass Ambush',
        badgeColor: '#e9c46a',
        texture: 'enemy_polovyk',
        scale: 1.32,
        location: 'Feather-grass plains of the Wild Steppe (Act IV).',
        tactics: 'Lurks nearly invisible in the tall grass! Watch for a faint shimmer or “!” warning, then dodge his leap and strike back!',
        desc: 'A spirit of the open steppe whose hair and beard are woven from dry feather-grass and wheat ears. Blends into the turf until a traveller steps close.',
        lore: '• Mykhailo Kotsiubynsky’s lyrical novella “Intermezzo” (the sun-drenched Ukrainian steppe).\n• Folkloric records of Polovyk field spirits by Borys Hrinchenko.',
        omen: '“When feather-grass ripples in waves without a breeze, the Polovyk is patrolling his fields. Leave the last sheaf tied with a red ribbon in his honor!”'
      },
      {
        id: 'vovkulaka',
        name: 'Steppe Vovkulaka',
        subtitle: 'Swift Shape-Shifter of the Kurgans',
        roleBadge: '🐺 Swift Predator',
        badgeColor: '#ff9f1c',
        texture: 'enemy_vovkulaka',
        scale: 1.26,
        location: 'Scythian kurgans, stone babas, and Chumak trails of the Wild Steppe.',
        tactics: 'Crouches low for 0.45s with a growl before pouncing — roll [Shift] through his leap or jump over him!',
        desc: 'A fierce steppe werewolf with glowing amber eyes prowling near ancient burial mounds and pouncing with lightning speed.',
        lore: '• Zaporozhian Cossack legends of Kharakternyk sorcerers and Hetman Ivan Sirko, who could transform into a grey wolf.\n• The medieval epic “The Tale of Igor’s Campaign” and Oleksandr Oles’s poem “Vovkulaka”.',
        omen: '“Unlike an ordinary wolf, a Vovkulaka’s hind legs bend forward like human knees; striking him with the flat of a Cossack saber breaks the spell.”'
      },
      {
        id: 'tumbleweed',
        name: 'Thorny Tumbleweed',
        subtitle: 'Wind-Driven Wanderer of the Steppe',
        roleBadge: '🌬 Steppe Hazard',
        badgeColor: '#f4a261',
        texture: 'enemy_tumbleweed',
        scale: 1.3,
        location: 'Wind-swept plains of the Wild Steppe.',
        tactics: 'Accelerates sharply during steppe wind gusts! A couple of saber slashes or a frog sends it flying into the clouds.',
        desc: 'A bouncy, prickly sphere of dried steppe brushwood propelled across the plain by hot dry winds.',
        lore: '• Ukrainian folk parable “Tumbleweed” (where a rolling steppe bush witnesses a crime and exposes the culprit).\n• Steppe poetry by Ivan Manzhura and Yakiv Shchoholiv.',
        omen: '“When tumbleweeds race thick along the Chumak trail, expect a dry, windy autumn.”'
      },
      {
        id: 'seagull',
        name: 'Thieving Seagull',
        subtitle: 'Winged Pickpocket of Syvash & the Black Sea',
        roleBadge: '🪙 Coin Thief',
        badgeColor: '#ffd166',
        texture: 'enemy_seagull',
        scale: 1.38,
        location: 'Pink salt lagoons of Syvash and the Black Sea coast.',
        tactics: 'Dives from the sky to snatch up to 3 gold coins! Stun it with your saber [D] or a swamp frog [S] to recover every stolen coin!',
        desc: 'A brazen coastal gull soaring over the salt flats with a keen eye for shiny Cossack gold coins.',
        lore: '• Hetman Ivan Mazepa’s famous Cossack song “Oh Woe to the Poor Seagull” (“Oi bida, bida chaitsi-nebozi”).\n• Andriy Chaikovsky’s historical adventure “For His Sister” and Chumak sea lore.',
        omen: '“When seagulls rest calmly on the water, fair weather lies ahead; when they pace the sand crying loudly, a Black Sea storm is brewing!”'
      },
      {
        id: 'boss_zmiy',
        name: 'Three-Headed Dragon Salyonohorych',
        subtitle: 'Ancient Guardian of the Salt Mountain (and New Kum!)',
        roleBadge: '👑 FINAL BOSS',
        badgeColor: '#ff0055',
        texture: 'zmiy_head_proud',
        isCompositeZmiyPortrait: true,
        scale: 0.9,
        isBoss: true,
        location: 'Summit of the gleaming Salt Mountain by the Black Sea.',
        tactics: '3-stage fight! Stun each head in turn: Stage 1 Hungry Head (into a barrel), Stage 2 Sleepy Head (put to sleep), Stage 3 Crowned Head (knock off his crown)!',
        desc: 'A colossal winged dragon armored in pink Crimean salt crystals with Hungry, Sleepy, and Royal heads. He guarded the salt in lonely sorrow for a thousand years because nobody ever invited him over for hot borsch — until Omelko made him an honorary Kum!',
        lore: '• Heroic Ukrainian fairy tales “Kyrylo Kozhumyaka”, “Kotyhoroshko”, and legends of the Serpent’s Walls (Zmiyevi Valy).\n• Good-natured Ukrainian dragons in the literary tales of Yuriy Vynnychuk.',
        omen: '“Spilling salt at the table brings a quarrel — but flying home with a sack of salt on a Three-Headed Dragon’s back brings a grand Cossack feast!”'
      }
    ]
  },
  {
    tabId: 'allies',
    tabLabel: '🍻 Kum & Allies',
    entries: [
      {
        id: 'kum_hrytsko',
        name: 'Godfather Hrytsko (Homo Kumus Cossackus)',
        subtitle: 'Jovial Neighbour, Goose Owner & Damascus Saber Lender',
        roleBadge: '🍻 Cossack Kum',
        badgeColor: '#ffbe0b',
        texture: 'npc_hrytsko',
        scale: 1.35,
        location: 'Neighbouring homestead yard at the end of Act I and the grand finale feast.',
        tactics: 'Fighting one’s Kum is strictly forbidden by Cossack law! Greet him warmly, listen to his stories, and accept his razor-sharp Damascus saber.',
        desc: 'A legendary phenomenon of the Ukrainian universe: whenever you drop by to borrow a pinch of salt for borsch, his salt bowl is guaranteed to be bone-dry — yet he casually pulls a genuine Damascus steel Cossack saber out of his pantry! Sincerely believes his ferocious geese and Mad Rooster Korniy are “peaceful barnyard birds”.',
        lore: '• Mykola Gogol’s “Evenings on a Farm Near Dikanka” (“Christmas Eve” — Chub and his Kum Panas; “The Fair at Sorochyntsi”).\n• Ivan Karpenko-Karyi’s classic comedy “Martyn Borulya” and hundreds of Ukrainian folk jokes about two Kums.',
        omen: '“If your Kum says ‘I have no salt, but take this Damascus saber and pop into the Wicked Forest’ — you won’t be home before nightfall, and you’ll return riding a three-headed dragon!”'
      },
      {
        id: 'baba_yaga',
        name: 'Baba Yaga Bony-Leg',
        subtitle: 'Woodland Herbalist & Breeder of Combat Frogs',
        roleBadge: '🐸 Forest Ally',
        badgeColor: '#80ed99',
        texture: 'npc_baba_yaga',
        extraTexture: 'swamp_frog',
        scale: 1.18,
        location: 'Clearing with the hut on chicken legs deep inside the Wicked Forest (Act II finale).',
        tactics: 'Delighted that Omelko taught her noisy neighbour Chornobor a lesson, she gifts a pouch of Combat Swamp Frogs to replace your dumplings [S]!',
        desc: 'Ancient mistress of the chicken-legged hut. Even her fly-agaric mushroom soup is boiling unsalted because the Water Tsar stole her last pinch of salt, but she raises the finest stun-frogs in all Ukraine!',
        lore: '• Ukrainian folk tales “Ivasyk-Telesyk” and “Baba Yaga Bony-Leg”.\n• Colourful witches and the Sibyl in Ivan Kotliarevsky’s “Eneida”.',
        omen: '“When swamp frogs croak loudly at dusk, clear weather is coming; when they fly out of Omelko’s pouch, someone’s eyes are about to get plastered with slime!”'
      },
      {
        id: 'catfish_vusany',
        name: 'Whiskered River Catfish Vusany',
        subtitle: 'Mighty Ferryman of the Roaring Dnipro',
        roleBadge: '🐟 River Companion',
        badgeColor: '#48cae4',
        texture: 'giant_catfish',
        scale: 0.72,
        location: 'Locked in the golden reed cage in the Water Tsar’s arena & crossing the Dnipro (Act III finale).',
        tactics: 'Defeat the Water Tsar to shatter his reed cage, and Vusany will carry Omelko across the wide Dnipro on his back!',
        desc: 'A giant Dnipro catfish with magnificent Cossack whiskers who was held captive for seven springs by the Water Tsar. Loves snacking on swamp frogs, ferries Omelko to the Chumak trail, and gifts a silver talisman scale.',
        lore: '• Ostap Vyshnia’s famous humorous story “The Catfish” (“Som” from “Hunting Smiles”, about a Dnipro catfish big enough to tow boats).\n• Dnipro river legends of century-old catfish dwelling beneath the rapids.',
        omen: '“When a giant catfish rises from the deepest Dnipro riverbed to the surface, expect either a summer thunderstorm or a true Cossack friendship!”'
      }
    ]
  }
];

function getBestiaryCatalog() {
  return (typeof GAME_STATE !== 'undefined' && GAME_STATE.language === 'en')
    ? BESTIARY_DATA_EN
    : BESTIARY_DATA_UK;
}

class BestiaryModal {
  constructor(scene) {
    this.scene = scene;
    this.isOpen = false;
    this.activeTabIndex = 0;
    this.activeEntryIndex = 0;
    this.elements = [];
    this.dynamicElements = [];
    this.portraitTween = null;
    this.arenaBannerElements = [];
    this.arenaBannerTimer = null;
    this.wasPausedBeforeOpen = false;
    this.openedAtTime = 0;

    this.createModalShell();
    this.setupKeyboardShortcuts();
  }

  createModalShell() {
    const cx = CONFIG.WIDTH / 2;
    const cy = CONFIG.HEIGHT / 2;

    // 1. Fullscreen dark backdrop (depth 240)
    this.backdrop = this.scene.add.rectangle(cx, cy, CONFIG.WIDTH, CONFIG.HEIGHT, 0x07080d, 0.9)
      .setScrollFactor(0)
      .setDepth(240)
      .setInteractive()
      .setVisible(false);

    this.backdrop.on('pointerdown', (pointer, lx, ly, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
    });

    // 2. Main Ornate Cossack Chronicle Frame (920 x 516)
    this.frameGfx = this.scene.add.graphics()
      .setScrollFactor(0)
      .setDepth(241)
      .setVisible(false);

    const fw = 920;
    const fh = 516;
    const fx = cx - fw / 2;
    const fy = cy - fh / 2;
    const panelY = fy + 80;
    const panelH = fh - 112; // 404px tall

    this.frameGfx.fillStyle(0x161925, 0.98);
    this.frameGfx.fillRoundedRect(fx, fy, fw, fh, 14);
    this.frameGfx.lineStyle(3, 0xffd166, 1);
    this.frameGfx.strokeRoundedRect(fx, fy, fw, fh, 14);
    this.frameGfx.lineStyle(1.5, 0xc1121f, 0.9);
    this.frameGfx.strokeRoundedRect(fx + 6, fy + 6, fw - 12, fh - 12, 10);

    // Left list background & Right detail parchment dark card
    this.frameGfx.fillStyle(0x1d2132, 0.96);
    this.frameGfx.fillRoundedRect(fx + 16, panelY, 266, panelH, 10);
    this.frameGfx.lineStyle(1.5, 0x4a5568, 0.85);
    this.frameGfx.strokeRoundedRect(fx + 16, panelY, 266, panelH, 10);

    this.frameGfx.fillStyle(0x212538, 0.97);
    this.frameGfx.fillRoundedRect(fx + 294, panelY, fw - 310, panelH, 10);
    this.frameGfx.lineStyle(1.5, 0xd4a373, 0.9);
    this.frameGfx.strokeRoundedRect(fx + 294, panelY, fw - 310, panelH, 10);

    // 3. Header Title
    this.headerTitle = this.scene.add.text(cx - 48, fy + 24, '', {
      fontFamily: "'Cormorant Infant', Georgia, serif",
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(242).setVisible(false);

    // 4. Close Button in top-right corner of modal
    this.closeBtnBg = this.scene.add.rectangle(fx + fw - 74, fy + 24, 116, 28, 0x8d0801, 0.95)
      .setStrokeStyle(1.8, 0xffd166)
      .setScrollFactor(0)
      .setDepth(242)
      .setInteractive({ useHandCursor: true })
      .setVisible(false);

    this.closeBtnTxt = this.scene.add.text(fx + fw - 74, fy + 24, '', {
      fontSize: '12.5px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(243).setVisible(false);

    this.closeBtnBg.on('pointerover', () => {
      this.closeBtnBg.setFillStyle(0xc1121f, 1).setScale(1.04);
      this.closeBtnTxt.setScale(1.04);
    });
    this.closeBtnBg.on('pointerout', () => {
      this.closeBtnBg.setFillStyle(0x8d0801, 0.95).setScale(1);
      this.closeBtnTxt.setScale(1);
    });
    this.closeBtnBg.on('pointerdown', (pointer, lx, ly, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.close();
    });

    // 5. Footer Navigation Hint
    this.footerHint = this.scene.add.text(cx, fy + fh - 16, '', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#a8dadc'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(242).setVisible(false);

    this.elements.push(
      this.backdrop,
      this.frameGfx,
      this.headerTitle,
      this.closeBtnBg,
      this.closeBtnTxt,
      this.footerHint
    );
  }

  setupKeyboardShortcuts() {
    if (!this.scene.input || !this.scene.input.keyboard) return;

    this.scene.input.keyboard.on('keydown-B', (event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      if (this.isOpen) {
        this.close();
      } else {
        // Determine default tab based on scene level
        const lvl = this.scene.currentLevel || 1;
        const bossActive = Boolean(this.scene.boss && (this.scene.boss.active || this.scene.bossIntroTriggered));
        this.openForLevel(lvl, bossActive);
      }
    });

    this.scene.input.keyboard.on('keydown-LEFT', () => {
      if (!this.isOpen) return;
      this.switchTab((this.activeTabIndex - 1 + 5) % 5);
    });
    this.scene.input.keyboard.on('keydown-RIGHT', () => {
      if (!this.isOpen) return;
      this.switchTab((this.activeTabIndex + 1) % 5);
    });
    this.scene.input.keyboard.on('keydown-UP', () => {
      if (!this.isOpen) return;
      const catalog = getBestiaryCatalog();
      const entries = catalog[this.activeTabIndex].entries;
      this.selectEntry((this.activeEntryIndex - 1 + entries.length) % entries.length);
    });
    this.scene.input.keyboard.on('keydown-DOWN', () => {
      if (!this.isOpen) return;
      const catalog = getBestiaryCatalog();
      const entries = catalog[this.activeTabIndex].entries;
      this.selectEntry((this.activeEntryIndex + 1) % entries.length);
    });
    this.scene.input.keyboard.on('keydown-ESC', () => {
      if (this.isOpen) {
        this.close();
      }
    });
  }

  openForLevel(level = 1, selectBoss = false) {
    const tabIdx = Phaser.Math.Clamp((level || 1) - 1, 0, 3);
    const catalog = getBestiaryCatalog();
    const entries = catalog[tabIdx].entries;
    let entryIdx = 0;
    if (selectBoss) {
      const bossIdx = entries.findIndex(e => e.isBoss);
      if (bossIdx >= 0) entryIdx = bossIdx;
    }
    this.open(tabIdx, entryIdx);
  }

  open(tabIndex = 0, entryIndex = 0) {
    if (this.isOpen) return;
    if (this.scene.isVictory || this.scene.isDeathModalOpen) return;

    this.isOpen = true;
    this.openedAtTime = this.scene.time ? this.scene.time.now : 0;
    this.activeTabIndex = Phaser.Math.Clamp(tabIndex, 0, 4);
    this.activeEntryIndex = entryIndex || 0;

    // Hide any active arena banner once player opens the Bestiary
    this.hideArenaPromptBanner();

    // Pause gameplay physics safely if inside GameScene
    if (this.scene.physics && this.scene.physics.world) {
      this.wasPausedBeforeOpen = Boolean(this.scene.isPaused);
      if (!this.wasPausedBeforeOpen) {
        this.scene.physics.world.pause();
      }
    }

    if (typeof SFX !== 'undefined' && SFX.pickup) {
      SFX.pickup();
    }

    const isEn = (typeof GAME_STATE !== 'undefined' && GAME_STATE.language === 'en');
    this.headerTitle.setText(
      isEn
        ? '📖 COSSACK BESTIARY — CHRONICLE OF SPIRITS & KUM'
        : '📖 КОЗАЦЬКИЙ БЕСТІАРІЙ — ЛІТОПИС НЕЧИСТІ ТА КУМІВ'
    );
    this.closeBtnTxt.setText(isEn ? '✕ Close [B]' : '✕ Закрити [B]');
    this.footerHint.setText(
      isEn
        ? '[◄ / ►] Switch Act Tabs   |   [▲ / ▼] Select Creature   |   [B / Esc] Close Bestiary'
        : '[◄ / ►] Розділи актів   |   [▲ / ▼] Обрати істоту   |   [B / Esc] Закрити Бестіарій'
    );

    this.elements.forEach(el => el.setVisible(true));
    this.renderDynamicContent();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;

    if (typeof SFX !== 'undefined' && SFX.speechBlip) {
      SFX.speechBlip();
    }

    this.clearDynamicElements();
    this.elements.forEach(el => el.setVisible(false));

    // Resume physics if GameScene was not already paused in Pause Menu
    if (this.scene.physics && this.scene.physics.world && !this.wasPausedBeforeOpen && !this.scene.isControlsModalOpen) {
      const now = this.scene.time ? this.scene.time.now : 0;
      const pausedDuration = Math.max(0, now - (this.openedAtTime || now));
      if (this.scene.player) {
        this.scene.player.rollEndTime += pausedDuration;
        this.scene.player.nextRollAllowedTime += pausedDuration;
        this.scene.player.invulnUntil += pausedDuration;
        this.scene.player.counterWindowEndTime += pausedDuration;
      }
      if (Array.isArray(this.scene.enemies)) {
        this.scene.enemies.forEach(e => {
          if (e.stunEndTime) e.stunEndTime += pausedDuration;
          if (e.stateEndTime) e.stateEndTime += pausedDuration;
          if (e.timeOutJump) e.timeOutJump += pausedDuration;
        });
      }
      if (this.scene.boss && this.scene.boss.isCompositeZmiy) {
        if (this.scene.boss.stateEndTime) this.scene.boss.stateEndTime += pausedDuration;
        if (this.scene.boss.vortexActiveUntil) this.scene.boss.vortexActiveUntil += pausedDuration;
      }
      this.scene.physics.world.resume();
    }
  }

  switchTab(tabIndex) {
    if (tabIndex === this.activeTabIndex) return;
    this.activeTabIndex = tabIndex;
    this.activeEntryIndex = 0;
    if (typeof SFX !== 'undefined' && SFX.speechBlip) SFX.speechBlip();
    this.renderDynamicContent();
  }

  selectEntry(entryIndex) {
    if (entryIndex === this.activeEntryIndex) return;
    this.activeEntryIndex = entryIndex;
    if (typeof SFX !== 'undefined' && SFX.speechBlip) SFX.speechBlip();
    this.renderDynamicContent();
  }

  clearDynamicElements() {
    if (this.portraitTween) {
      this.portraitTween.stop();
      this.portraitTween = null;
    }
    this.dynamicElements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    this.dynamicElements = [];
  }

  renderDynamicContent() {
    this.clearDynamicElements();

    const catalog = getBestiaryCatalog();
    const isEn = (typeof GAME_STATE !== 'undefined' && GAME_STATE.language === 'en');
    const cx = CONFIG.WIDTH / 2;
    const cy = CONFIG.HEIGHT / 2;
    const fw = 920;
    const fh = 516;
    const fx = cx - fw / 2;
    const fy = cy - fh / 2;
    const panelY = fy + 80;
    const panelH = fh - 112; // 404px

    // 1. Render 5 Category Tabs across top (y = fy + 56)
    const tabW = 172;
    const tabGap = 7;
    const totalTabsW = catalog.length * tabW + (catalog.length - 1) * tabGap;
    const startTabX = cx - totalTabsW / 2 + tabW / 2;
    const tabY = fy + 56;

    catalog.forEach((tab, idx) => {
      const tx = startTabX + idx * (tabW + tabGap);
      const isSelected = idx === this.activeTabIndex;

      const tBg = this.scene.add.rectangle(
        tx,
        tabY,
        tabW,
        28,
        isSelected ? 0xc1121f : 0x262b40,
        0.96
      )
        .setStrokeStyle(isSelected ? 2.2 : 1.4, isSelected ? 0xffea00 : 0x6c757d)
        .setScrollFactor(0)
        .setDepth(243)
        .setInteractive({ useHandCursor: true });

      const tLbl = this.scene.add.text(tx, tabY, tab.tabLabel, {
        fontSize: '12.5px',
        fontStyle: 'bold',
        color: isSelected ? '#ffea00' : '#e2e8f0'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(244);

      tBg.on('pointerdown', (pointer, lx, ly, event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        this.switchTab(idx);
      });

      this.dynamicElements.push(tBg, tLbl);
    });

    // 2. Render Entry List in Left Column (fx + 16 .. fx + 282)
    const activeTab = catalog[this.activeTabIndex];
    const entries = activeTab.entries;
    const listCenterX = fx + 149;
    const itemH = entries.length >= 5 ? 64 : 68;
    const itemGap = entries.length >= 5 ? 10 : 12;
    const listTopPad = 14;

    entries.forEach((entry, idx) => {
      const itemY = panelY + listTopPad + itemH / 2 + idx * (itemH + itemGap);
      const isSelected = idx === this.activeEntryIndex;

      const itemBg = this.scene.add.rectangle(
        listCenterX,
        itemY,
        246,
        itemH,
        isSelected ? 0x2e3856 : 0x161925,
        0.96
      )
        .setStrokeStyle(isSelected ? 2.4 : 1.2, isSelected ? 0xffd166 : 0x3b4254)
        .setScrollFactor(0)
        .setDepth(243)
        .setInteractive({ useHandCursor: true });

      // Mini thumbnail sprite on left of item
      if (this.scene.textures.exists(entry.texture)) {
        const thumb = this.scene.add.image(fx + 52, itemY, entry.texture)
          .setScrollFactor(0)
          .setDepth(244);
        const maxThumbDim = Math.max(thumb.width || 48, thumb.height || 48);
        thumb.setScale(Math.min(0.82, 36 / maxThumbDim));
        this.dynamicElements.push(thumb);
      }

      const nameTxt = this.scene.add.text(fx + 80, itemY - itemH / 2 + 8, entry.name, {
        fontFamily: "'Cormorant Infant', Georgia, serif",
        fontSize: '15.5px',
        fontStyle: 'bold',
        color: isSelected ? '#ffea00' : '#ffffff',
        lineSpacing: -1,
        wordWrap: { width: 186 }
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);

      const badgeY = Math.min(itemY + itemH / 2 - 14, nameTxt.y + nameTxt.height + 2);
      const badgeTxt = this.scene.add.text(fx + 80, badgeY, entry.roleBadge, {
        fontSize: '11px',
        fontStyle: 'bold',
        color: entry.badgeColor || '#a8dadc'
      }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);

      itemBg.on('pointerdown', (pointer, lx, ly, event) => {
        if (event && event.stopPropagation) event.stopPropagation();
        this.selectEntry(idx);
      });

      this.dynamicElements.push(itemBg, nameTxt, badgeTxt);
    });

    // 3. Render Detailed Creature Card in Right Column (fx + 294 .. fx + 904, width = 610)
    const entry = entries[this.activeEntryIndex] || entries[0];
    if (!entry) return;

    const rightPanelX = fx + 294;
    const rightPanelW = fw - 310; // 610px
    const padX = 16;
    const contentX = rightPanelX + padX;
    const contentW = rightPanelW - padX * 2; // 578px

    // Portrait showcase pedestal box (top-left of right pane: 112 x 108)
    const portW = 112;
    const portH = 108;
    const portBoxX = contentX + portW / 2;
    const portBoxY = panelY + 14 + portH / 2;
    const portBox = this.scene.add.rectangle(portBoxX, portBoxY, portW, portH, 0x141724, 1)
      .setStrokeStyle(2, entry.isBoss ? 0xff4d4d : 0xd4a373)
      .setScrollFactor(0)
      .setDepth(243);
    this.dynamicElements.push(portBox);

    // Pedestal glow
    const portGlow = this.scene.add.ellipse(portBoxX, portBoxY + 32, 78, 16, 0xffd166, 0.22)
      .setScrollFactor(0)
      .setDepth(243);
    this.dynamicElements.push(portGlow);

    const portraitTargets = [];
    if (entry.isCompositeZmiyPortrait) {
      // Show all 3 heads of Salyonohorych together!
      const hKeys = ['zmiy_head_hungry', 'zmiy_head_sleepy', 'zmiy_head_proud'];
      hKeys.forEach((hk, hIdx) => {
        if (this.scene.textures.exists(hk)) {
          const sp = this.scene.add.image(portBoxX - 28 + hIdx * 28, portBoxY + (hIdx === 1 ? -10 : 6), hk)
            .setScale(0.48)
            .setScrollFactor(0)
            .setDepth(244 + hIdx);
          this.dynamicElements.push(sp);
          portraitTargets.push(sp);
        }
      });
    } else if (this.scene.textures.exists(entry.texture)) {
      const mainPortrait = this.scene.add.image(
        entry.extraTexture ? portBoxX - 12 : portBoxX,
        portBoxY,
        entry.texture
      )
        .setScale(entry.scale || 1.05)
        .setScrollFactor(0)
        .setDepth(244);
      this.dynamicElements.push(mainPortrait);
      portraitTargets.push(mainPortrait);

      if (entry.extraTexture && this.scene.textures.exists(entry.extraTexture)) {
        const subPortrait = this.scene.add.image(portBoxX + 30, portBoxY + 18, entry.extraTexture)
          .setScale(1.25)
          .setScrollFactor(0)
          .setDepth(245);
        this.dynamicElements.push(subPortrait);
        portraitTargets.push(subPortrait);
      }
    }

    if (portraitTargets.length > 0) {
      this.portraitTween = this.scene.tweens.add({
        targets: portraitTargets,
        y: '-=4',
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Creature Name, Subtitle, Habitat & Tactical Advice next to Portrait (measured dynamically!)
    const infoX = contentX + portW + 14;
    const infoWrapW = contentW - portW - 14; // 452px
    let headerCursorY = panelY + 10;

    const titleFontSize = entry.name.length > 28 ? '20px' : '23px';
    const titleTxt = this.scene.add.text(infoX, headerCursorY, entry.name, {
      fontFamily: "'Cormorant Infant', Georgia, serif",
      fontSize: titleFontSize,
      fontStyle: 'bold',
      color: '#ffd166',
      wordWrap: { width: infoWrapW }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);
    headerCursorY += titleTxt.height + 2;

    const subTxt = this.scene.add.text(infoX, headerCursorY, `${entry.roleBadge}  •  ${entry.subtitle}`, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: entry.badgeColor || '#a8dadc',
      wordWrap: { width: infoWrapW }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);
    headerCursorY += subTxt.height + 3;

    const locLabel = isEn ? '📍 Habitat:' : '📍 Де зустрічається:';
    const locTxt = this.scene.add.text(infoX, headerCursorY, `${locLabel} ${entry.location}`, {
      fontSize: '11.5px',
      color: '#e2e8f0',
      wordWrap: { width: infoWrapW }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);
    headerCursorY += locTxt.height + 5;

    // Create tactical text first so we can size tacBg to its exact height!
    const tacPadX = 10;
    const tacPadY = 6;
    const tacTxt = this.scene.add.text(infoX + tacPadX, headerCursorY + tacPadY, `⚔ ${entry.tactics}`, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#90e0ef',
      lineSpacing: 2,
      wordWrap: { width: infoWrapW - tacPadX * 2 }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);

    const tacBoxH = Math.max(28, tacTxt.height + tacPadY * 2);
    const tacBg = this.scene.add.rectangle(
      infoX + infoWrapW / 2,
      headerCursorY + tacBoxH / 2,
      infoWrapW,
      tacBoxH,
      0x162436,
      0.95
    )
      .setStrokeStyle(1.2, 0x48cae4)
      .setScrollFactor(0)
      .setDepth(243);
    headerCursorY += tacBoxH;

    // Center portrait box vertically alongside the header block if header is taller than portH
    const headerBlockH = headerCursorY - (panelY + 10);
    const actualPortCenterY = panelY + 10 + Math.max(portH, headerBlockH) / 2;
    const portDeltaY = actualPortCenterY - portBoxY;
    if (portDeltaY > 0) {
      portBox.y += portDeltaY;
      portGlow.y += portDeltaY;
      portraitTargets.forEach(pt => {
        pt.y += portDeltaY;
      });
    }

    this.dynamicElements.push(titleTxt, subTxt, locTxt, tacBg, tacTxt);

    // 4. Three Lore Cards below Portrait & Tactical Box (measured dynamically so nothing overlaps!)
    const portraitBottomY = portBox.y + portH / 2;
    let bodyCursorY = Math.max(portraitBottomY, headerCursorY) + 10;

    // Subtle horizontal divider separating header from lore sections
    const divider = this.scene.add.rectangle(
      rightPanelX + rightPanelW / 2,
      bodyCursorY - 5,
      contentW,
      1,
      0xd4a373,
      0.35
    ).setScrollFactor(0).setDepth(243);
    this.dynamicElements.push(divider);

    // Measure Folk Omen box first so we know exact bottom boundary
    const omenPadX = 12;
    const omenPadY = 6;
    const omenHeader = isEn ? '🌿 FOLK OMEN & BELIEF:' : '🌿 НАРОДНА ПРИКМЕТА ТА ПОВІР’Я:';
    const omenHdrTxt = this.scene.add.text(contentX + omenPadX, 0, omenHeader, {
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffbe0b'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);

    const omenBodyTxt = this.scene.add.text(contentX + omenPadX, 0, entry.omen, {
      fontFamily: "'Cormorant Infant', Georgia, serif",
      fontSize: '14.5px',
      fontStyle: 'italic bold',
      color: '#fefae0',
      lineSpacing: 1,
      wordWrap: { width: contentW - omenPadX * 2 }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);

    const omenBoxH = omenPadY + omenHdrTxt.height + 2 + omenBodyTxt.height + omenPadY;
    const omenTopY = panelY + panelH - omenBoxH - 10;

    // Section A: Cossack Description
    const descHeader = isEn ? '📜 COSSACK DESCRIPTION & NATURE' : '📜 КОЗАЦЬКИЙ ОПИС ТА ВДАЧА';
    const descHdrTxt = this.scene.add.text(contentX, bodyCursorY, descHeader, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);
    bodyCursorY += descHdrTxt.height + 2;

    const descBodyTxt = this.scene.add.text(contentX, bodyCursorY, entry.desc, {
      fontSize: '12px',
      color: '#f8f9fa',
      lineSpacing: 1.5,
      wordWrap: { width: contentW }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);
    bodyCursorY += descBodyTxt.height + 7;

    // Section B: Myths, Fairy Tales & Literary Works
    const loreHeader = isEn
      ? '📚 MYTHS, FAIRY TALES & LITERARY WORKS'
      : '📚 МІФИ, КАЗКИ ТА ЛІТЕРАТУРНІ ТВОРИ';
    const loreHdrTxt = this.scene.add.text(contentX, bodyCursorY, loreHeader, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#80ed99'
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);
    bodyCursorY += loreHdrTxt.height + 2;

    const loreBodyTxt = this.scene.add.text(contentX, bodyCursorY, entry.lore, {
      fontSize: '12px',
      color: '#e2e8f0',
      lineSpacing: 1.5,
      wordWrap: { width: contentW }
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(244);
    bodyCursorY += loreBodyTxt.height + 6;

    // If a verbose entry makes bodyCursorY approach omenTopY, compact text slightly so it never touches
    if (bodyCursorY > omenTopY - 4) {
      descBodyTxt.setFontSize(11).setLineSpacing(1);
      loreHdrTxt.setY(descBodyTxt.y + descBodyTxt.height + 5);
      loreBodyTxt.setFontSize(11).setLineSpacing(1).setY(loreHdrTxt.y + loreHdrTxt.height + 2);
    }

    omenHdrTxt.setY(omenTopY + omenPadY);
    omenBodyTxt.setY(omenTopY + omenPadY + omenHdrTxt.height + 2);

    const omenBg = this.scene.add.rectangle(
      contentX + contentW / 2,
      omenTopY + omenBoxH / 2,
      contentW,
      omenBoxH,
      0x2b2118,
      0.94
    )
      .setStrokeStyle(1.5, 0xe9c46a)
      .setScrollFactor(0)
      .setDepth(243);

    this.dynamicElements.push(
      descHdrTxt,
      descBodyTxt,
      loreHdrTxt,
      loreBodyTxt,
      omenBg,
      omenHdrTxt,
      omenBodyTxt
    );
  }

  /**
   * Shows a non-intrusive, interactive Bestiary prompt banner at the start of each Act or Boss Arena.
   * Clicking the banner or pressing [B] opens the Bestiary directly to that Act's creatures or Boss!
   */
  showArenaPromptBanner(level = 1, isBossArena = false) {
    this.hideArenaPromptBanner();

    const isEn = (typeof GAME_STATE !== 'undefined' && GAME_STATE.language === 'en');
    const catalog = getBestiaryCatalog();
    const tabIdx = Phaser.Math.Clamp((level || 1) - 1, 0, 3);
    const tabEntries = catalog[tabIdx].entries;

    // Position cleanly at bottom-center above any ground action (y = CONFIG.HEIGHT - 44)
    // so it NEVER overlaps the top HUD, Boss HP Bar, or Omelko's speech bubble!
    const bx = CONFIG.WIDTH / 2;
    const by = CONFIG.HEIGHT - 36;
    const bw = 660;
    const bh = 44;

    const bg = this.scene.add.rectangle(bx, by, bw, bh, 0x161925, 0.94)
      .setStrokeStyle(2.5, isBossArena ? 0xff4d4d : 0xffd166)
      .setScrollFactor(0)
      .setDepth(180)
      .setInteractive({ useHandCursor: true });

    // Mini creature icons on the left of the banner
    const previewEntries = isBossArena
      ? tabEntries.filter(e => e.isBoss)
      : tabEntries.slice(0, 3);

    previewEntries.forEach((ent, i) => {
      if (this.scene.textures.exists(ent.texture)) {
        const ic = this.scene.add.image(bx - bw / 2 + 28 + i * 28, by, ent.texture)
          .setScrollFactor(0)
          .setDepth(181);
        const maxD = Math.max(ic.width || 48, ic.height || 48);
        ic.setScale(Math.min(0.7, 28 / maxD));
        this.arenaBannerElements.push(ic);
      }
    });

    const iconOffset = previewEntries.length * 28 + 18;
    const titleStr = isBossArena
      ? (isEn
        ? '📖 BOSS IN ARENA! View boss lore & weaknesses in Bestiary'
        : '📖 БОС НА АРЕНІ! Переглянь слабкі місця та легенду в Бестіарії')
      : (isEn
        ? `📖 NEW ARENA (${catalog[tabIdx].tabLabel}): Inspect area foes in Bestiary!`
        : `📖 НОВА ЛОКАЦІЯ (${catalog[tabIdx].tabLabel}): Переглянь ворогів у Бестіарії!`);

    const subStr = isEn
      ? 'Press [B] or click here to open 📖'
      : 'Натисни клавішу [B] або клікни тут 📖';

    const mainTxt = this.scene.add.text(bx - bw / 2 + iconOffset, by - 8, titleStr, {
      fontSize: '13px',
      fontStyle: 'bold',
      color: isBossArena ? '#ffbe0b' : '#ffd166'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(181);

    const subTxt = this.scene.add.text(bx - bw / 2 + iconOffset, by + 10, subStr, {
      fontSize: '11.5px',
      fontStyle: 'bold',
      color: '#90e0ef'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(181);

    // Dismiss '✕' button on right edge of banner
    const closeBg = this.scene.add.rectangle(bx + bw / 2 - 22, by, 28, 28, 0x2b2d42, 0.9)
      .setStrokeStyle(1, 0x8d99ae)
      .setScrollFactor(0)
      .setDepth(182)
      .setInteractive({ useHandCursor: true });
    const closeTxt = this.scene.add.text(bx + bw / 2 - 22, by, '✕', {
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(183);

    closeBg.on('pointerdown', (pointer, lx, ly, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.hideArenaPromptBanner();
    });

    bg.on('pointerover', () => {
      bg.setFillStyle(0x232942, 0.98);
      bg.setStrokeStyle(3, 0xffea00);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x161925, 0.94);
      bg.setStrokeStyle(2.5, isBossArena ? 0xff4d4d : 0xffd166);
    });
    bg.on('pointerdown', (pointer, lx, ly, event) => {
      if (event && event.stopPropagation) event.stopPropagation();
      this.openForLevel(level, isBossArena);
    });

    this.arenaBannerElements.push(bg, mainTxt, subTxt, closeBg, closeTxt);

    // Auto-hide after 8.5 seconds if not clicked
    this.arenaBannerTimer = this.scene.time.delayedCall(8500, () => {
      this.hideArenaPromptBanner();
    });
  }

  hideArenaPromptBanner() {
    if (this.arenaBannerTimer) {
      this.arenaBannerTimer.remove(false);
      this.arenaBannerTimer = null;
    }
    this.arenaBannerElements.forEach(el => {
      if (el && el.destroy) el.destroy();
    });
    this.arenaBannerElements = [];
  }
}
