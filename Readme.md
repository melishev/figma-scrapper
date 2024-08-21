# Figma Snatcher

A micro script written in JS run via Bun/Node allows you to locally save any of your projects in Figma.

## Getting start:

1. Download this repository or copy the main script into an existing project.
2. Set variables in the environment or in your .env file:
- `FIGMA_EMAIL` - login for Figma
- `FIGMA_PASSWORD` - password for Figma
- `FIGMA_FILE_ID` - identifier of the file you need in Figma
3. Run the command:
```sh
bun run snatch # if u have Bun.js
# or
node src/index.ts # if u have Node.js
```

## FAQ

- Q: **How to understand what identifier my project has in Figma**
- A: Open your project in your browser. Look at the URL, it will look like this: `https://www.figma.com/design/oRdRrlxt897TP9kHLiRWHB/Untitled?t=bDp1Jc6ti15ouxP2-0`. In this URL the project identifier is - `oRdRrlxt897TP9kHLiRWHB`
