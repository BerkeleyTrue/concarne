"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Upload, FileUp, AlertCircle, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";

export const ImportExport = () => {
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    router.back();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (!droppedFile) return;
      handleFile(droppedFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is CSV
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      setFile(null);
      setIsUploaded(false);
      return;
    }

    setFile(file);
    setError(null);
    setIsUploaded(false);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    // Mock upload process
    if (file) {
      // In a real implementation, you would process the file here
      console.log("Uploading file:", file.name);

      // Simulate a successful upload after a short delay
      setTimeout(() => {
        setIsUploaded(true);
      }, 1000);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardTitle>
        <Button variant="ghost" size="sm" onClick={handleBack} className="mr-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Import/Export Data</h2>
      </CardTitle>

      <CardContent>
        {/* File Upload Area */}
        <div
          className={cn(
            "cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors mb-4",
            isDragging ? "border-primary bg-primary/5" : "border-input",
            file ? "bg-accent/50" : "",
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <Input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <FileUp className="text-muted-foreground mx-auto mb-4 h-12 w-12" />

          {file ? (
            <div>
              <p className="font-medium">File selected:</p>
              <p className="text-primary">{file.name}</p>
            </div>
          ) : (
            <div className="mb-4">
              <p className="mb-2 font-medium">Drag & drop a CSV file here</p>
              <p className="text-muted-foreground text-sm">
                or click to browse files
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive flex items-center rounded-md p-3">
            <AlertCircle className="mr-2 h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Button */}
        {file && !isUploaded && (
          <div className="flex justify-center mb-4">
            <Button onClick={handleUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </div>
        )}

        {/* Success Message */}
        {isUploaded && (
          <div className="flex items-center rounded-md bg-green-100 p-3 text-green-800">
            <Check className="mr-2 h-5 w-5" />
            <span>File uploaded successfully! (Mock upload)</span>
          </div>
        )}

        {/* Mock Data Preview */}
        {isUploaded && (
          <div className="mt-6 mb-4">
            <h3 className="mb-3 text-xl font-semibold">Preview (Mock Data)</h3>
            <div className="overflow-x-auto">
              <table className="border-input min-w-full rounded-md border">
                <thead className="bg-accent">
                  <tr>
                    <th className="border-input border-b px-4 py-2 text-left">
                      Date
                    </th>
                    <th className="border-input border-b px-4 py-2 text-left">
                      Weight (kg)
                    </th>
                    <th className="border-input border-b px-4 py-2 text-left">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: "2023-01-01", weight: "75.5", notes: "New Year" },
                    {
                      date: "2023-01-08",
                      weight: "74.8",
                      notes: "After holiday",
                    },
                    {
                      date: "2023-01-15",
                      weight: "74.2",
                      notes: "Morning weight",
                    },
                    { date: "2023-01-22", weight: "73.9", notes: "" },
                    {
                      date: "2023-01-29",
                      weight: "73.5",
                      notes: "Post workout",
                    },
                  ].map((row, index) => (
                    <tr key={index}>
                      <td className="border-input border-b px-4 py-2">
                        {row.date}
                      </td>
                      <td className="border-input border-b px-4 py-2">
                        {row.weight}
                      </td>
                      <td className="border-input border-b px-4 py-2">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-2 text-sm">
              Showing 5 of 5 rows (mock data)
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {/* Export Button */}
        <div className="mb-4 flex justify-between w-full">
          {isUploaded && (
            <Button
              variant="outline"
              onClick={() => {
                // This would be implemented to handle the import action
                console.log("Import data");
              }}
            >
              Import Data
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              // This would be implemented to handle the export action
              console.log("Export data");
            }}
          >
            Export Data
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
