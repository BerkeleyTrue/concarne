import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "fast-csv";
import { Readable } from "stream";

// Type for CSV data
type CsvData = {
  headers: string[];
  rows: Record<string, string>[];
};

// Global variable to store the last parsed CSV data
let lastParsedData: CsvData | null = null;

// Configure bodyParser to handle JSON data
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    // Get the file data from the request body
    const { file, filename } = req.body as { file: string; filename: string };

    if (!file) {
      return res
        .status(400)
        .json({ success: false, error: "No file provided" });
    }

    // Check if it's a CSV file
    if (!filename?.endsWith(".csv")) {
      return res
        .status(400)
        .json({ success: false, error: "Please upload a CSV file" });
    }

    // Decode base64 data
    const base64Data = file.split(",")[1];
    const fileData = Buffer.from(base64Data ??"", "base64");

    // Log file data for testing purposes
    console.log("File received:", {
      filename,
      size: fileData.length,
      preview: fileData.toString().substring(0, 200) + "...", // Show first 200 chars
    });

    // Parse the CSV file
    const rows: Record<string, string>[] = [];
    let headers: string[] = [];
    let rowCount = 0;

    // Create a readable stream from the file data
    const fileStream = Readable.from(fileData);

    return new Promise<void>((resolve) => {
      const stream = parse({ headers: true })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          res.status(500).json({ success: false, error: error.message });
          resolve();
        })
        .on("headers", (headerList) => {
          headers = headerList;
          console.log("CSV headers:", headerList);
        })
        .on("data", (row) => {
          rows.push(row);
          rowCount++;
        })
        .on("end", () => {
          // Store the parsed data
          lastParsedData = { headers, rows };
          console.log(`Parsed ${rowCount} rows from CSV`);
          res.status(200).json({ success: true, rowCount });
          resolve();
        });

      // Pipe the data to the parser
      fileStream.pipe(stream);
    });
  } catch (error) {
    console.error("Error parsing CSV:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}
