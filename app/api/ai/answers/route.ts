import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { flattenError } from "zod";
import { NextResponse } from "next/server";

import handleError from "@/lib/handlers/error";
import { AIAnswerSchema } from "@/app/schemas/answer";
import { ValidationError } from "@/lib/http-errors";

export const POST = async (req: Request) => {
  try {
    const body: unknown = await req.json();

    const validatedData = AIAnswerSchema.safeParse(body);

    if (!validatedData.success) {
      const { fieldErrors } = flattenError(validatedData.error);
      throw new ValidationError(fieldErrors);
    }

    const { questionTitle, questionContent, answerContent } =
      validatedData.data;

    const { text } = await generateText({
      model: openai("gpt-5-nano"),

      system: `
You are an editor for answers posted on a programming forum.

Your task is to improve the user's existing answer, not to answer the question yourself.

Rules:
- Correct grammar, spelling, punctuation, and awkward phrasing.
- Rewrite incorrect or unnatural English into clear, natural English.
- Improve readability and structure.
- Preserve the original meaning, intent, and level of certainty.
- Do not add new facts, explanations, examples, or solutions.
- Do not remove important information.
- Use the question title and question content only to understand the context of the answer.
- Do not answer the question yourself.
- You may improve code indentation and formatting, but do not change its logic, behavior, identifiers, strings, or values.
- Always return valid Markdown.
- Format source code using fenced Markdown code blocks.
- Add an appropriate lowercase language identifier to fenced code blocks when the language can be identified.
- Use inline code formatting for identifiers, function names, variables, commands, file names, and short code fragments when appropriate.
- Preserve technical terms, URLs, and identifiers.
- Never return HTML.
- Never wrap the entire response in a fenced code block.
- Return only the improved answer.
- Do not include comments about the editing process.
      `.trim(),

      prompt: `
Improve the user's answer and return it exclusively as Markdown.

Question title:
<question_title>
${questionTitle}
</question_title>

Question content:
<question_content>
${questionContent}
</question_content>

User's answer:
<answer_content>
${answerContent}
</answer_content>
      `.trim(),
    });

    const formattedAnswer = text.trim();

    if (!formattedAnswer) {
      throw new Error("The AI returned an empty response.");
    }

    return NextResponse.json(
      {
        success: true,
        data: formattedAnswer,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
};
