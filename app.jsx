const { useState } = React;
const h = React.createElement;
const excelDrinks = window.excelDrinks || [];
const categories = [...new Set(excelDrinks.map((drink) => drink.category))];

const itemPattern = /сахар|цукор|шт|порц|палоч|веточ|маршмел|зефир|морожен|гранат свеж|вишн|лайм|лимон|апельсин|яблок/i;
const liquidPattern = /кипяток|вода|молок|сливк|сок|спрайт|тоник|ром|ликер|водк|виски|коньяк|пюре|кофе/i;

function formatAmount(value, ingredient) {
  const amount = Number(value.replace(',', '.'));
  if (!Number.isFinite(amount)) return value;
  if (itemPattern.test(ingredient) && amount >= 1) return `${amount} шт`;

  const scaledAmount = amount < 1 ? amount * 1000 : amount;
  const roundedAmount = Number(scaledAmount.toFixed(2));
  const unit = liquidPattern.test(ingredient) && !/кофе/i.test(ingredient) ? 'мл' : 'г';
  return `${roundedAmount} ${unit}`;
}

function formatIngredients(ingredients) {
  return ingredients.split(/,\s*/).map((part) => part.replace(/\(([-+]?\d+(?:[.,]\d+)?(?:E[-+]?\d+)?)\)$/i, (_, value, offset, fullText) => {
    const ingredient = fullText.slice(0, offset).trim();
    return `(${formatAmount(value, ingredient)})`;
  })).join(', ');
}

function formatVolume(volume) {
  return volume.replace(/(\d+)\s*(мл|г|л)/gi, '$1 $2');
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'Кофе');
  const currentData = excelDrinks.filter((drink) => drink.category === activeCategory);
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredDrinks = currentData.filter((drink) =>
    `${drink.name} ${drink.ingredients}`.toLowerCase().includes(normalizedSearch)
  );

  const renderDrink = (drink) => h(
    'article',
    { key: drink.id, className: 'drink-card' },
    h('img', {
      src: drink.image,
      alt: drink.name,
      className: 'drink-image',
      onError: (event) => {
        event.currentTarget.src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85';
      }
    }),
    h(
      'div',
      { className: 'drink-content' },
      h(
        'div',
        { className: 'drink-heading' },
        h('h2', { className: 'drink-name' }, drink.name),
        h('span', { className: 'volume' }, formatVolume(drink.volume))
      ),
      h(
        'div',
        { className: 'detail' },
        h('h3', { className: 'detail-label' }, 'Состав'),
        h('p', { className: 'detail-text' }, formatIngredients(drink.ingredients))
      ),
      h(
        'div',
        { className: 'detail' },
        h('h3', { className: 'detail-label' }, 'Приготовление'),
        h('p', { className: 'detail-text' }, drink.recipe)
      )
    )
  );

  return h(
    'div',
    { className: 'app-shell' },
    h(
      'div',
      { className: 'app-container' },
      h(
        'header',
        { className: 'app-header' },
        h('p', { className: 'eyebrow' }, 'Рабочая книга бариста'),
        h('h1', { className: 'app-title' }, 'Техкарты бара'),
        h('p', { className: 'app-subtitle' }, 'Быстрый доступ к составу, объёму и приготовлению каждого напитка.'),
        h(
          'div',
          { className: 'toolbar' },
          h(
            'div',
            { className: 'tabs' },
            categories.map((category) => h('button', {
              key: category,
              type: 'button',
              className: `tab ${activeCategory === category ? 'active' : ''}`,
              onClick: () => {
                setActiveCategory(category);
                setSearchTerm('');
              }
            }, `${category} (${excelDrinks.filter((drink) => drink.category === category).length})`))
          ),
          h('input', {
            type: 'search',
            className: 'search',
            placeholder: `Поиск в разделе ${activeCategory}...`,
            value: searchTerm,
            onChange: (event) => setSearchTerm(event.target.value)
          })
        )
      ),
      h(
        'main',
        { className: 'drink-grid' },
        filteredDrinks.length > 0
          ? filteredDrinks.map(renderDrink)
          : h('p', { className: 'empty-state' }, 'Напиток не найден. Попробуйте другой запрос.')
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
