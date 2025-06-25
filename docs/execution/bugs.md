# Bugs & Issues Log

## 2024-06-24

### 1. Dependency Installation Errors
- **langgraph@^0.0.20** is not found in the npm registry. Installation fails with:
  - `npm error 404 Not Found - GET https://registry.npmjs.org/langgraph - Not found`
- **Dependency conflict** between `langchain@0.0.200` and `googleapis@128.0.0`:
  - `langchain` expects `googleapis@^126.0.1`, but the project uses `googleapis@128.0.0`.
  - Resolved by using `--legacy-peer-deps`, but langgraph is still missing.

#### Actions Taken
- Attempted `npm install` and `npm install --legacy-peer-deps`.
- langgraph is not available on npm; need to check for correct package name, alternative source, or remove from dependencies until available.

#### Next Steps
- Investigate correct installation method for `langgraph` (private repo, GitHub, or alternative package?).
- Consider downgrading `googleapis` to `^126.0.1` if `langchain` is required.
- Update dependencies in `package.json` accordingly. 