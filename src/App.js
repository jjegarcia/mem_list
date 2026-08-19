function MemoListPanel({ side, suffix, items, setItems, hintText, validationItems, validationMessage }) {
  const { useState } = React;
  const [value, setValue] = useState('');
  const [isListHidden, setIsListHidden] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const panelClassName = `memo-panel memo-panel-${side}`;
  const memoInputId = suffix ? `memoInput-${suffix}` : 'memoInput';
  const addButtonId = suffix ? `addButton-${suffix}` : 'addButton';
  const itemListId = suffix ? `itemList-${suffix}` : 'itemList';
  const hideListCheckboxId = suffix ? `hideListCheckbox-${suffix}` : 'hideListCheckbox';
  const clearButtonId = suffix ? `clearButton-${suffix}` : 'clearButton';

  function addItem() {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (validationItems && !validationItems.includes(trimmed)) {
      setErrorMessage(validationMessage);
      return;
    }

    setItems((currentItems) => [...currentItems, trimmed]);
    setValue('');
    setErrorMessage('');
  }

  function clearList() {
    setItems([]);
    setErrorMessage('');
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
    'section',
    { className: panelClassName },
    React.createElement(
      'div',
      { className: 'controls' },
      React.createElement('input', {
        id: memoInputId,
        type: 'text',
        value,
        onChange: (event) => {
          setValue(event.target.value);
          if (errorMessage) {
            setErrorMessage('');
          }
        },
        onKeyDown: handleKeyDown,
        placeholder: 'Type something...',
        'aria-label': 'Text field',
      }),
      React.createElement(
        'button',
        { id: addButtonId, type: 'button', onClick: addItem },
        'Add'
      )
    ),
    React.createElement('div', { className: 'hint' }, hintText),
    errorMessage ? React.createElement('div', { className: 'error-message', role: 'alert' }, errorMessage) : null,
    React.createElement(
      'ul',
      { id: itemListId, hidden: isListHidden },
      items.map((item, index) => React.createElement('li', { key: `${item}-${index}` }, item))
    ),
    React.createElement(
      'div',
      { className: 'list-actions' },
      React.createElement(
        'label',
        { className: 'hide-toggle', htmlFor: hideListCheckboxId },
        React.createElement('input', {
          id: hideListCheckboxId,
          type: 'checkbox',
          checked: isListHidden,
          onChange: handleListVisibilityChange,
        }),
        React.createElement('span', null, 'Hide List')
      ),
      React.createElement(
        'button',
        { id: clearButtonId, type: 'button', onClick: clearList, className: 'clear-btn' },
        'Clear List'
      )
    )
  );
}

export function App() {
  const { useState } = React;
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);

  return React.createElement(
    'main',
    { className: 'app-shell' },
    React.createElement(MemoListPanel, {
      side: 'left',
      suffix: '',
      items: leftItems,
      setItems: setLeftItems,
      hintText: 'Use the input above to add items to the list.',
    }),
    React.createElement(MemoListPanel, {
      side: 'right',
      suffix: 'right',
      items: rightItems,
      setItems: setRightItems,
      hintText: 'Only items already shown in the left list can be added here.',
      validationItems: leftItems,
      validationMessage: 'Add failed: the item must already exist in the left list.',
    })
  );
}

