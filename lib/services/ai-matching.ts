"use server";

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Calculate match score between resume and job description using OpenAI
 * @param resumeText - Extracted text from resume
 * @param jobDescription - Job description text
 * @returns Match score (1-10)
 */
export async function calculateMatchScore(
  resumeText: string,
  jobDescription: string
): Promise<number> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Limit text length to avoid token limits (roughly 4000 tokens for both combined)
    const maxResumeLength = 8000; // characters
    const maxJobLength = 8000; // characters

    const truncatedResume =
      resumeText.length > maxResumeLength
        ? resumeText.substring(0, maxResumeLength) + "..."
        : resumeText;

    const truncatedJobDescription =
      jobDescription.length > maxJobLength
        ? jobDescription.substring(0, maxJobLength) + "..."
        : jobDescription;

    const prompt = `You are an expert recruiter analyzing the match between a resume and a job description. 

Analyze the following resume and job description, then provide a relevancy score from 1 to 10.

Consider these factors:
1. Skills alignment (how well the candidate's skills match the required skills)
2. Experience relevance (how relevant the candidate's experience is to the role)
3. Education match (if education requirements are specified)
4. Overall fit (how well the candidate fits the role overall)

Scoring guidelines:
- 1-3 (Low): Poor match - major gaps in skills, experience, or qualifications
- 4-6 (Mid): Moderate match - some alignment but missing key requirements
- 7-10 (High): Strong match - good alignment with most or all requirements

RESUME:
${truncatedResume}

JOB DESCRIPTION:
${truncatedJobDescription}

Provide ONLY a single integer score from 1 to 10. Do not include any explanation, just the number.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini for cost efficiency, can switch to gpt-4 for better accuracy
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter. Analyze resumes and job descriptions to provide accurate match scores. Always respond with a single integer between 1 and 10.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent scoring
      max_tokens: 10, // We only need a number
    });

    const responseText =
      completion.choices[0]?.message?.content?.trim() || "";

    // Extract the score (should be a number)
    const score = parseInt(responseText, 10);

    // Validate score is between 1 and 10
    if (isNaN(score) || score < 1 || score > 10) {
      console.error("Invalid score returned from OpenAI:", responseText);
      throw new Error("Invalid score returned from AI model");
    }

    return score;
  } catch (error) {
    console.error("Error calculating match score:", error);
    if (error instanceof Error) {
      // Handle OpenAI API errors
      if (error.message.includes("API key")) {
        throw new Error("OpenAI API key is invalid or not configured");
      }
      if (error.message.includes("rate limit")) {
        throw new Error("OpenAI API rate limit exceeded. Please try again later.");
      }
      throw error;
    }
    throw new Error(
      "Failed to calculate match score: Unknown error occurred"
    );
  }
}
