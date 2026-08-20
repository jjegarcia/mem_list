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

  function getOccurrenceIndex(listItems, item, occurrenceNumber) {
    let matchCount = 0;
    let lastMatchIndex = -1;

    for (let index = 0; index < listItems.length; index += 1) {
      if (listItems[index] !== item) continue;

      matchCount += 1;
      lastMatchIndex = index;

      if (matchCount === occurrenceNumber) {
        return index;
      }
    }

    return lastMatchIndex;
  }

  function insertItemAtMatchingPosition(currentItems, nextItem) {
    if (!validationItems) {
      return [...currentItems, nextItem];
    }

    const currentOccurrenceCount = currentItems.filter((item) => item === nextItem).length;
    const targetLeftIndex = getOccurrenceIndex(validationItems, nextItem, currentOccurrenceCount + 1);

    if (targetLeftIndex === -1) {
      return [...currentItems, nextItem];
    }

    const seenOccurrences = {};
    const insertionIndex = currentItems.findIndex((currentItem) => {
      seenOccurrences[currentItem] = (seenOccurrences[currentItem] || 0) + 1;
      const currentLeftIndex = getOccurrenceIndex(validationItems, currentItem, seenOccurrences[currentItem]);
      return currentLeftIndex > targetLeftIndex;
    });

    if (insertionIndex === -1) {
      return [...currentItems, nextItem];
    }

    return [
      ...currentItems.slice(0, insertionIndex),
      nextItem,
      ...currentItems.slice(insertionIndex),
    ];
  }

  function getRenderedListEntries() {
    if (!validationItems) {
      return items.map((item, index) => ({
        key: `${item}-${index}`,
        text: item,
        isMissing: false,
      }));
    }

    const rightOccurrences = {};

    items.forEach((item) => {
      rightOccurrences[item] = (rightOccurrences[item] || 0) + 1;
    });

    const seenValidationOccurrences = {};

    return validationItems.map((item, index) => {
      seenValidationOccurrences[item] = (seenValidationOccurrences[item] || 0) + 1;

      const isMissing = seenValidationOccurrences[item] > (rightOccurrences[item] || 0);

      return {
        key: `${item}-${index}`,
        text: isMissing ? '\u00A0' : item,
        isMissing,
      };
    });
  }

  function addItem() {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (validationItems && !validationItems.includes(trimmed)) {
      setErrorMessage(validationMessage);
      return;
    }

    setItems((currentItems) => insertItemAtMatchingPosition(currentItems, trimmed));
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

  const renderedListEntries = getRenderedListEntries();

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
      renderedListEntries.map((entry) =>
        React.createElement(
          'li',
          {
            key: entry.key,
            className: entry.isMissing ? 'missing-item' : undefined,
            'aria-label': entry.isMissing ? 'Missing item from left list' : undefined,
          },
          entry.text
        )
      )
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

