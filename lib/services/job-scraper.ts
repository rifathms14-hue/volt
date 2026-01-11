"use server";

import * as cheerio from "cheerio";

/**
 * Fetch job description from a URL
 * @param url - The job posting URL
 * @returns Extracted job description text
 */
export async function fetchJobDescription(
  url: string
): Promise<string> {
  try {
    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new Error("Invalid URL provided");
    }

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      // Add timeout
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Remove script and style elements
    $("script, style, nav, header, footer").remove();

    // Try to extract job description based on common job board structures
    let jobDescription = "";

    // LinkedIn job posting structure
    const linkedInDescription = $(
      ".description__text, .show-more-less-html__markup, .jobs-box__html-content"
    ).text();

    // Indeed job posting structure
    const indeedDescription = $(
      "#jobDescriptionText, .jobsearch-JobComponent-description"
    ).text();

    // Glassdoor job posting structure
    const glassdoorDescription = $(
      ".jobDescriptionContent, .jobDescription"
    ).text();

    // Generic job description selectors
    const genericDescription =
      $(
        "main article, .job-description, .job-description-content, [data-job-description], .description"
      ).text() ||
      $("article").text() ||
      $("main").text() ||
      $("body").text();

    // Use the first non-empty description found
    jobDescription =
      linkedInDescription ||
      indeedDescription ||
      glassdoorDescription ||
      genericDescription;

    // Clean up the text
    jobDescription = jobDescription
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, "\n") // Replace multiple newlines with single newline
      .trim();

    if (!jobDescription || jobDescription.length < 100) {
      // If we couldn't extract a good description, try getting all text from body
      $("script, style, nav, header, footer, aside").remove();
      jobDescription = $("body").text().trim();
      jobDescription = jobDescription
        .replace(/\s+/g, " ")
        .replace(/\n\s*\n/g, "\n")
        .trim();
    }

    if (!jobDescription || jobDescription.length < 50) {
      throw new Error(
        "Could not extract sufficient job description from the URL"
      );
    }

    return jobDescription;
  } catch (error) {
    console.error("Error fetching job description:", error);
    if (error instanceof Error) {
      // Re-throw known errors
      if (error.name === "AbortError") {
        throw new Error("Request timeout: Could not fetch job description");
      }
      throw error;
    }
    throw new Error(
      "Failed to fetch job description: Unknown error occurred"
    );
  }
}
