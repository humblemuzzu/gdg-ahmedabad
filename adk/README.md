# ADK Setup - GDG Ahmedabad

This folder contains Agent Development Kit (ADK) agents for the GDG Ahmedabad project.

## Structure

```
adk/
├── agents/
│   └── main/           # Main agent
│       ├── agent.ts    # Root coordinator agent
│       └── index.ts
├── tools/              # Custom tools for agents
│   └── index.ts
├── prompts/            # Agent prompt templates
│   ├── templates.ts
│   └── index.ts
└── README.md
```

## Run Commands

From project root:

```bash
# Run the main agent
npm run adk:run

# Start ADK Web UI for debugging
npm run adk:web

# Start ADK API server
npm run adk:api
```

## Environment Setup

1. Copy `.env.example` to `.env.local` in project root
2. Add your Google/Gemini API key:
   ```
   GOOGLE_GENAI_API_KEY=your_key_here
   # or
   GEMINI_API_KEY=your_key_here
   ```

## Adding New Agents

1. Create a new folder under `adk/agents/`
2. Define your agent in `agent.ts`
3. Export it from `index.ts`
4. Add prompts to `adk/prompts/templates.ts`

## Adding New Tools

1. Create a new file in `adk/tools/`
2. Define your tool with name, description, parameters, and handler
3. Export it from `adk/tools/index.ts`
4. Add the tool to your agent's `tools` array
