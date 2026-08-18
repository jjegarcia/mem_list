export function App() {
  const { useState } = React;
  const [value, setValue] = useState('');
  const [items, setItems] = useState([]);

  function addItem() {
    const trimmed = value.trim();
    if (!trimmed) return;

    setItems((currentItems) => [...currentItems, trimmed]);
    setValue('');
  }

  function clearList() {
    setItems([]);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      addItem();
    }
  }

  return React.createElement(
    'main',
    { className: 'app' },
    React.createElement(
      'div',
      { className: 'controls' },
      React.createElement('input', {
        id: 'memoInput',
        type: 'text',
        value,
        onChange: (event) => setValue(event.target.value),
        onKeyDown: handleKeyDown,
        placeholder: 'Type something...',
        'aria-label': 'Text field',
      }),
      React.createElement(
        'button',
        { id: 'addButton', type: 'button', onClick: addItem },
        'Add'
      )
    ),
    React.createElement('div', { className: 'hint' }, 'Use the input above to add items to the list.'),
    React.createElement(
      'ul',
      { id: 'itemList' },
      items.map((item, index) => React.createElement('li', { key: `${item}-${index}` }, item))
    ),
    React.createElement(
      'button',
      { id: 'clearButton', type: 'button', onClick: clearList, className: 'clear-btn' },
      'Clear List'
    )
  );
}

