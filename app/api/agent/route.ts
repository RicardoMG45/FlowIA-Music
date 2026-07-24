import { NextResponse } from "next/server";

import { askMusicAgent } from "@/lib/music/agent";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const message =
      body.message?.toString().trim();

    const organizationId =
      body.organizationId?.toString();

    if (!message || !organizationId) {
      return NextResponse.json(
        {
          error:
            "message y organizationId son obligatorios.",
        },
        {
          status: 400,
        }
      );
    }

    const organizationName =
    typeof body.organizationName === "string"
        ? body.organizationName.trim()
        : "";

    const memberName =
    typeof body.memberName === "string"
        ? body.memberName.trim()
        : undefined;

    const memberRole =
    typeof body.memberRole === "string"
        ? body.memberRole.trim()
        : undefined;

    if (
    !message ||
    !organizationId ||
    !organizationName
    ) {
    return NextResponse.json(
        {
        error:
            "message, organizationId y organizationName son obligatorios.",
        },
        {
        status: 400,
        }
    );
    }

    const answer = await askMusicAgent(
    {
        organizationId,
        organizationName,
        memberName,
        memberRole,
    },
    message
    );

    return NextResponse.json({
      answer,
    });
    } catch (error) {
    console.error(
        "FlowIA Music Agent Error:",
        error
    );

    return NextResponse.json(
        {
        error:
            error instanceof Error
            ? error.message
            : "No se pudo procesar la solicitud.",
        },
        {
        status: 500,
        }
    );
    }
//   } catch (error) {
//     console.error(
//       "FlowIA Music Agent Error:",
//       error
//     );

//     return NextResponse.json(
//       {
//         error:
//           "No se pudo procesar la solicitud.",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
}