"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Upload, FileUp, AlertCircle, Check, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";
import { api } from "@/lib/trpc/client";
import { toast } from "sonner";

export const ImportExport = () => {
  const utils = api.useUtils();
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [rowCount, setRowCount] = useState<number>(0);
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

  const handleUpload = async () => {
    if (file) {
      try {
        setError(null);

        // Read the file as base64
        const reader = new FileReader();

        reader.onload = async (event) => {
          try {
            const base64Data = event.target?.result as string;

            // Send the file to the API
            const response = await fetch("/api/backup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                file: base64Data,
                filename: file.name,
              }),
            });

            const data = (await response.json()) as {
              success: boolean;
              rowCount?: number;
              error?: string;
            };

            if (data.success) {
              setIsUploaded(true);
              setRowCount(data.rowCount ?? 0);
              toast.success("File uploaded successfully!");
              void utils.data.getAll.invalidate();
            } else {
              setError(data.error ?? "Failed to upload file");
            }
          } catch (error) {
            console.error("Error uploading file:", error);
            setError("Failed to upload file. Please try again.");
          }
        };

        reader.onerror = () => {
          setError("Failed to read file. Please try again.");
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error handling file upload:", error);
        setError("An unexpected error occurred. Please try again.");
      }
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
            "mb-4 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
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
          <div className="mb-4 flex justify-center">
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
            <span>File uploaded successfully! ({rowCount})</span>
          </div>
        )}

        {/* Mock Data Preview */}
        {isUploaded && (
          <div className="mt-6 mb-4">
            <p className="text-muted-foreground mt-2 text-sm"></p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {/* Export Button */}
        <div className="mb-4 flex w-full justify-between">
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
