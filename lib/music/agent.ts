import OpenAI from "openai";

import {
  getEventPreparation,
  getRehearsals,
  getRepertoire,
  getUpcomingEvent,
} from "./agent-tools";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "get_repertoire",
    description:
      "Obtiene el repertorio actual de Blue Rose, incluyendo el estado de preparación de cada canción.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: "function",
    name: "get_upcoming_event",
    description:
      "Obtiene el próximo evento activo de Blue Rose.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: "function",
    name: "get_rehearsals",
    description:
      "Obtiene los ensayos recientes y próximos de Blue Rose.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },

  {
    type: "function",
    name: "get_event_preparation",
    description:
      "Analiza la preparación del próximo evento, incluyendo setlist, porcentaje de preparación y canciones prioritarias.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    strict: true,
  },
];

export type MusicAgentContext = {
    organizationId: string;
    organizationName: string;
    memberName?: string;
    memberRole?: string;
};

export async function askMusicAgent(
    context: MusicAgentContext,
    userMessage: string
) {
  const memberContext = context.memberName
    ? `
    Current member:
    Name: ${context.memberName}
    Role in the group: ${context.memberRole ?? "Not specified"}
    `
    : "";
  let response = await openai.responses.create({
    model: "gpt-5-mini",

    instructions: `
    You are the internal operations assistant for a music group using FlowIA Music.

    Current organization:
    ${context.organizationName}

    ${memberContext}

    Your job:
    1. Understand the user's question.
    2. Use the available tools if needed.
    3. Answer only with information explicitly supported by tools or current context.

    STRICT RULES:
    - Always respond in the user's language.
    - Maximum 4 bullets or 4 short sentences.
    - Never invent musical details, rehearsal techniques, difficult sections, tempos, solos, harmonies, transitions, cues, equipment, schedules or member tasks.
    - Never create a rehearsal plan unless the user explicitly asks for one.
    - Never offer actions that are not available as tools.
    - Never mention raw field names, tool names or raw status codes.
    - Translate statuses naturally:
    new = Nueva
    learning = Aprendiendo
    needs_rehearsal = Necesita ensayo
    ready = Lista
    mastered = Dominada
    planned = Planeado
    confirmed = Confirmado
    completed = Completado
    cancelled = Cancelado
    - For questions like "¿qué debemos ensayar?", only return:
    1. priority songs,
    2. their recorded status,
    3. upcoming event context if relevant.
    - Do not explain HOW to rehearse a song unless explicit recorded notes support it.
    - If data is insufficient, say so briefly.
    - Answer only the question asked.
    - When the user asks "what should I do next?", "what do I have pending?",
        "what's next for me?" or similar:
        only mention future active items:
        - upcoming confirmed/planned rehearsals,
        - upcoming confirmed/planned events,
        - assigned pending tasks,
        - recorded event preparation priorities.
        
        Do not include completed or cancelled records.
    - Never infer personal practice, preparation, logistics, or responsibilities
        unless they are explicitly recorded in the data.
    - "Should do" does not mean permission to generate general advice.
    Treat it as a request for recorded operational next steps.
    - For "what should I do next?" queries, ignore completed and cancelled items unless the user explicitly asks for history.
    - Only describe next steps that are directly represented by upcoming rehearsals, upcoming events, assigned tasks, or recorded preparation priorities.
    - Do not transform a song priority into a personal practice assignment unless such a task is explicitly assigned to the current member.
    - Never end by offering actions that are not available as tools.
    `,
    input: userMessage,
    tools,
  });

  while (
    response.output.some(
      (item) => item.type === "function_call"
    )
  ) {
    const toolOutputs = [];

    for (const item of response.output) {
      if (item.type !== "function_call") {
        continue;
      }

      const result = await executeTool(
        item.name,
        context.organizationId
      );

      toolOutputs.push({
        type: "function_call_output" as const,
        call_id: item.call_id,
        output: JSON.stringify(result),
      });
    }

    response = await openai.responses.create({
      model: "gpt-5-mini",
      previous_response_id: response.id,
      input: toolOutputs,
      tools,
    });
  }

  return response.output_text;
}

async function executeTool(
  name: string,
  organizationId: string
) {
  switch (name) {
    case "get_repertoire":
      return getRepertoire(
        organizationId
      );

    case "get_upcoming_event":
      return getUpcomingEvent(
        organizationId
      );

    case "get_rehearsals":
      return getRehearsals(
        organizationId
      );

    case "get_event_preparation":
      return getEventPreparation(
        organizationId
      );

    default:
      throw new Error(
        `Unknown tool: ${name}`
      );
  }
}