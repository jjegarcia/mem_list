const LEFT_LIST_COOKIE_NAME = 'mem_list_left_items';
const LEFT_LIST_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function normalizeItems(items) {
  return items.map((item) => item.trim()).filter(Boolean);
}

function normalizeItemKey(item) {
  return item.toLowerCase();
}

function getCookieValue(cookieName) {
  const cookiePrefix = `${cookieName}=`;
  const cookieEntry = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(cookiePrefix));

  return cookieEntry ? cookieEntry.slice(cookiePrefix.length) : '';
}

function MemoListPanel({
  side,
  suffix,
  items,
  setItems,
  hintText,
  validationItems,
  validationMessage,
  onSaveItems,
  isSaving,
  statusMessage,
  statusTone,
}) {
  const { useState } = React;
  const [value, setValue] = useState('');
  const [isListHidden, setIsListHidden] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const panelClassName = `memo-panel memo-panel-${side}`;
  const memoInputId = suffix ? `memoInput-${suffix}` : 'memoInput';
  const addButtonId = suffix ? `addButton-${suffix}` : 'addButton';
  const saveButtonId = suffix ? `saveButton-${suffix}` : 'saveButton';
  const itemListId = suffix ? `itemList-${suffix}` : 'itemList';
  const hideListCheckboxId = suffix ? `hideListCheckbox-${suffix}` : 'hideListCheckbox';
  const clearButtonId = suffix ? `clearButton-${suffix}` : 'clearButton';

  function getOccurrenceIndex(listItems, item, occurrenceNumber) {
    let matchCount = 0;
    let lastMatchIndex = -1;
    const targetKey = normalizeItemKey(item);

    for (let index = 0; index < listItems.length; index += 1) {
      if (normalizeItemKey(listItems[index]) !== targetKey) continue;

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

    const nextItemKey = normalizeItemKey(nextItem);
    const currentOccurrenceCount = currentItems.filter((item) => normalizeItemKey(item) === nextItemKey).length;
    const targetLeftIndex = getOccurrenceIndex(validationItems, nextItem, currentOccurrenceCount + 1);

    if (targetLeftIndex === -1) {
      return [...currentItems, nextItem];
    }

    const seenOccurrences = {};
    const insertionIndex = currentItems.findIndex((currentItem) => {
      const currentItemKey = normalizeItemKey(currentItem);
      seenOccurrences[currentItemKey] = (seenOccurrences[currentItemKey] || 0) + 1;
      const currentLeftIndex = getOccurrenceIndex(validationItems, currentItem, seenOccurrences[currentItemKey]);
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
      const itemKey = normalizeItemKey(item);
      rightOccurrences[itemKey] = (rightOccurrences[itemKey] || 0) + 1;
    });

    const seenValidationOccurrences = {};

    return validationItems.map((item, index) => {
      const itemKey = normalizeItemKey(item);
      seenValidationOccurrences[itemKey] = (seenValidationOccurrences[itemKey] || 0) + 1;

      const isMissing = seenValidationOccurrences[itemKey] > (rightOccurrences[itemKey] || 0);

      return {
        key: `${item}-${index}`,
        text: isMissing ? '\u00A0' : item,
        isMissing,
      };
    });
  }

  function addItem() {
    const parsedItems = value
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (!parsedItems.length) return;

    if (validationItems && parsedItems.some((item) => getOccurrenceIndex(validationItems, item, 1) === -1)) {
      setErrorMessage(validationMessage);
      return;
    }

    setItems((currentItems) =>
      parsedItems.reduce(
        (updatedItems, item) => insertItemAtMatchingPosition(updatedItems, item),
        currentItems
      )
    );
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
      ),
      onSaveItems
        ? React.createElement(
            'button',
            {
              id: saveButtonId,
              type: 'button',
              onClick: onSaveItems,
              className: 'secondary-btn',
              disabled: isSaving,
            },
            isSaving ? 'Saving...' : 'Save List'
          )
        : null
    ),
    React.createElement('div', { className: 'hint' }, hintText),
    statusMessage
      ? React.createElement(
          'div',
          {
            className: `status-message${statusTone ? ` status-message-${statusTone}` : ''}`,
            role: 'status',
            'aria-live': 'polite',
          },
          statusMessage
        )
      : null,
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
  const { useEffect, useState } = React;
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [leftListStatus, setLeftListStatus] = useState('Loading left list from cookie...');
  const [leftListStatusTone, setLeftListStatusTone] = useState('loading');
  const [isSavingLeftList, setIsSavingLeftList] = useState(false);

  function alignItemsToReference(currentItems, referenceItems) {
    const remainingCounts = {};

    referenceItems.forEach((item) => {
      const itemKey = normalizeItemKey(item);
      remainingCounts[itemKey] = (remainingCounts[itemKey] || 0) + 1;
    });

    return currentItems.filter((item) => {
      const itemKey = normalizeItemKey(item);

      if (!remainingCounts[itemKey]) {
        return false;
      }

      remainingCounts[itemKey] -= 1;
      return true;
    });
  }

  function loadLeftListFromCookie() {
    setLeftListStatus('Loading left list from cookie...');
    setLeftListStatusTone('loading');

    try {
      const cookieValue = getCookieValue(LEFT_LIST_COOKIE_NAME);

      if (!cookieValue) {
        setLeftItems([]);
        setLeftListStatus('No saved cookie found. Started with an empty left list.');
        setLeftListStatusTone('success');
        return;
      }

      const payload = JSON.parse(decodeURIComponent(cookieValue));
      const loadedItems = Array.isArray(payload) ? payload : payload.items;

      if (!Array.isArray(loadedItems) || loadedItems.some((item) => typeof item !== 'string')) {
        console.error('Failed to load left list cookie: cookie JSON must contain an array of strings.');
        setLeftItems([]);
        setLeftListStatus('Saved cookie was invalid. Started with an empty left list.');
        setLeftListStatusTone('error');
        return;
      }

      const normalizedItems = normalizeItems(loadedItems);

      setLeftItems(normalizedItems);
      setLeftListStatus(`Loaded ${normalizedItems.length} item${normalizedItems.length === 1 ? '' : 's'} from cookie.`);
      setLeftListStatusTone('success');
    } catch (error) {
      console.error('Failed to load left list cookie:', error);
      setLeftItems([]);
      setLeftListStatus('Unable to read the saved cookie. Started with an empty left list.');
      setLeftListStatusTone('error');
    }
  }

  function saveLeftListToCookie() {
    setIsSavingLeftList(true);
    setLeftListStatus('Saving left list to cookie...');
    setLeftListStatusTone('loading');

    try {
      const payload = JSON.stringify({ items: leftItems }, null, 2);
      document.cookie = `${LEFT_LIST_COOKIE_NAME}=${encodeURIComponent(payload)}; max-age=${LEFT_LIST_COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;

      setLeftListStatus(`Saved ${leftItems.length} item${leftItems.length === 1 ? '' : 's'} to cookie.`);
      setLeftListStatusTone('success');
    } catch (error) {
      console.error('Failed to save left list cookie:', error);
      setLeftListStatus('Unable to save the left list to cookie.');
      setLeftListStatusTone('error');
    } finally {
      setIsSavingLeftList(false);
    }
  }

  useEffect(() => {
    loadLeftListFromCookie();
  }, []);

  useEffect(() => {
    setRightItems((currentItems) => alignItemsToReference(currentItems, leftItems));
  }, [leftItems]);

  return React.createElement(
    'main',
    { className: 'app-shell' },
    React.createElement(MemoListPanel, {
      side: 'left',
      suffix: '',
      items: leftItems,
      setItems: setLeftItems,
      hintText: 'Use the input above to add items to the list.',
      onSaveItems: saveLeftListToCookie,
      isSaving: isSavingLeftList,
      statusMessage: leftListStatus,
      statusTone: leftListStatusTone,
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

