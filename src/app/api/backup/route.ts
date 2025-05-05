import { type NextRequest, NextResponse } from "next/server";
import { parse } from "fast-csv";
import { Readable } from "stream";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { data } from "@/server/db/schema";

type DateWeightRaw = {
  dateTime: string;
  weight: string;
};
type DateWeight = {
  date: string;
  weight: number;
};

// In App Router, the config for body size is handled differently
export const dynamic = "force-dynamic";
// export const maxDuration = 60; // Set max duration to 60 seconds

export async function POST(request: NextRequest) {
  // TODO: Get userId from session
  const userId = 1;
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

    await new Promise<void>((resolve, reject) => {
      const stream = parse<DateWeightRaw, DateWeight>({ headers: true })
        .transform((row: DateWeightRaw) => {
          // Transform the row data if needed
          return {
            date: new Date(row.dateTime).toISOString(),
            weight: parseFloat(row.weight),
          };
        })
        .on("error", reject)
        .on("data", (row: DateWeight) => {
          rows.push(row);
          rowCount++;
        })
        .on("end", () => {
          console.log(`Parsed ${rowCount} rows`);
          resolve();
        });

      // Pipe the data to the parser
      fileStream.pipe(stream);
    });

    await db.transaction(async (tx) => {
      for (const item of rows) {
        try {
          // Check if entry already exists for this date and user
          const existingEntry = await tx.query.data.findFirst({
            where: (fields) =>
              eq(fields.userId, userId) && eq(fields.date, item.date),
          });

          if (!existingEntry) {
            // Insert new entry
            await tx.insert(data).values({
              userId,
              weight: item.weight,
              date: item.date,
            });
          } else {
            console.log("Entry already exists...");
          }
        } catch (err) {
          console.error("Error inserting/updating row:", err, item);
          throw err;
        }
      }
    });

    return NextResponse.json({
      success: true,
      rowCount,
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
