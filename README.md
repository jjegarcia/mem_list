# mem_list

A minimal React page with mirrored left/right memo lists.

## Files

- `index.html` loads React and ReactDOM from a CDN
- `src/App.js` contains the React component logic
- `src/main.js` mounts the app

## Behavior

- The left list loads automatically from a browser cookie when the page starts.
- If no saved cookie exists, the left list starts empty.
- Words separated by spaces in the add field are added as separate list items.
- The `Load Cookie` button reloads the left list from the saved cookie.
- The `Save Cookie` button stores the current left list as JSON inside a browser cookie.
- The right list can only add items that already exist in the left list.

## Run locally

Serve the folder with any static file server, then open `index.html` in a browser.

For example:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

