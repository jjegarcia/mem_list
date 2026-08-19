export function App() {
  const { useState } = React;
  const [value, setValue] = useState('');
  const [items, setItems] = useState([]);
  const [isListHidden, setIsListHidden] = useState(false);

  function addItem() {
    const trimmed = value.trim();
    if (!trimmed) return;

    setItems((currentItems) => [...currentItems, trimmed]);
    setValue('');
  }

  function clearList() {
    setItems([]);
  }

  function handleListVisibilityChange(event) {
    setIsListHidden(event.target.checked);
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
      { id: 'itemList', hidden: isListHidden },
      items.map((item, index) => React.createElement('li', { key: `${item}-${index}` }, item))
    ),
    React.createElement(
      'div',
      { className: 'list-actions' },
      React.createElement(
        'label',
        { className: 'hide-toggle', htmlFor: 'hideListCheckbox' },
        React.createElement('input', {
          id: 'hideListCheckbox',
          type: 'checkbox',
          checked: isListHidden,
          onChange: handleListVisibilityChange,
        }),
        React.createElement('span', null, 'Hide List')
      ),
      React.createElement(
        'button',
        { id: 'clearButton', type: 'button', onClick: clearList, className: 'clear-btn' },
        'Clear List'
      )
    )
  );
}

