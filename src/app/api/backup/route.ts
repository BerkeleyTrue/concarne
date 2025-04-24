import { type NextRequest, NextResponse } from "next/server";
import { parse } from "fast-csv";
import { Readable } from "stream";

type DateWeightRaw = {
  dateTime: string;
  weight: string;
};
type DateWeight = {
  dateTime: Date;
  weight: number;
};

// In App Router, the config for body size is handled differently
export const dynamic = "force-dynamic";
export const maxDuration = 60; // Set max duration to 60 seconds

export async function POST(request: NextRequest) {
  try {
    // Get the file data from the request body
    const { file, filename } = (await request.json()) as {
      file: string;
      filename: string;
    };

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    // Check if it's a CSV file
    if (!filename?.endsWith(".csv")) {
      return NextResponse.json(
        { success: false, error: "Please upload a CSV file" },
        { status: 400 },
      );
    }

    // Decode base64 data
    const base64Data = file.split(",")[1];
    const fileData = Buffer.from(base64Data ?? "", "base64");

    // Log file data for testing purposes
    console.log("File received:", {
      filename,
      size: fileData.length,
      preview: fileData.toString().substring(0, 200) + "...", // Show first 200 chars
    });

    // Parse the CSV file
    const rows: DateWeight[] = [];
    let rowCount = 0;

    // Create a readable stream from the file data
    const fileStream = Readable.from(fileData);

    return new Promise<NextResponse>((resolve) => {
      const stream = parse<DateWeightRaw, DateWeight>({ headers: true })
        .transform((row: DateWeightRaw) => {
          // Transform the row data if needed
          return {
            dateTime: new Date(row.dateTime),
            weight: parseFloat(row.weight),
          };
        })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          resolve(
            NextResponse.json(
              { success: false, error: error.message },
              { status: 500 },
            ),
          );
        })
        .on("data", (row: DateWeight) => {
          rows.push(row);
          rowCount++;
        })
        .on("end", () => {
          // Store the parsed data
          console.log(`Parsed ${rowCount} rows from CSV: `, rows);
          resolve(
            NextResponse.json({ success: true, rowCount }, { status: 200 }),
          );
        });

      // Pipe the data to the parser
      fileStream.pipe(stream);
    });
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    );
  }
}
