"use client";
import React, { useState, useRef } from "react";
import { Cross2Icon, UploadIcon } from "@radix-ui/react-icons";
import { useSetup } from "@/contexts/SetupContext";
import { toast } from "sonner";

interface UploadBaseProps {
  isOpen?: boolean;
  onClose?: () => void;
  showButton?: boolean;
  onUploadComplete?: (data: any[]) => void;
}

// Simple CSV parser function
const parseCSV = (text: string, header: boolean = true): any[] => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const rows = lines.map(line => {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // Skip next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim()); // Add last value

    return values;
  });

  if (!header || rows.length === 0) return [];

  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return data;
};

const UploadBase: React.FC<UploadBaseProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showButton = true,
  onUploadComplete,
}) => {
  const { setupData } = useSetup();
  const primaryColor = setupData.primaryColor || '#050711';
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);
  const [jsonData, setJSONData] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [uploadSummary, setUploadSummary] = useState<{
    successCount: number;
    skippedCount: number;
    failedCount: number;
    skippedDetails: string;
    failedDetails: string;
  }>({
    successCount: 0,
    skippedCount: 0,
    failedCount: 0,
    skippedDetails: "None",
    failedDetails: "None",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);



  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : show;
  const handleClose = () => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      setShow(false);
    }
    setProgress(0);
    setJSONData([]);
    setIsDragOver(false);
    setIsModalOpen(false);
  };

  const handleShow = () => setShow(true);

  const onClickReset = () => {
    setProgress(0);
    setJSONData([]);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleFileUpload(file);
      } else {
        toast.error("Invalid file type", {
          description: "Please upload a CSV file",
          duration: 3000,
        });
      }
    }
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedData = parseCSV(text, true);
        setJSONData(parsedData);
        toast.success("File loaded successfully", {
          description: `${parsedData.length} records loaded`,
          duration: 3000,
        });
      } catch (error) {
        toast.error("Failed to parse CSV", {
          description: "Please check the file format",
          duration: 3000,
        });
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file", {
        description: "Please try again",
        duration: 3000,
      });
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        handleFileUpload(file);
      } else {
        toast.error("Invalid file type", {
          description: "Please upload a CSV file",
          duration: 3000,
        });
      }
    }
  };

  const handleDragAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setProgress(30);


      setProgress(100);

      // Extract data from the API response
      const { created, updated, failed } = { created: [], updated: [], failed: [] };

      const successCount = created.length;
      const skippedCount = updated.length;
      const failedCount = failed.length;

      // Build detailed message for skipped and failed records
      const skippedDetails =
        updated.length > 0
          ? updated
            .map((item: any) => item)
            .filter((email: string) => email)
            .join(", ")
          : "None";
      const failedDetails =
        failed.length > 0
          ? failed
            .map(
              (item: any) =>
                `${item.email || "Unknown email"}: ${item.reason}`
            )
            .join("; ")
          : "None";

      // Set modal data and show modal
      setUploadSummary({
        successCount,
        skippedCount,
        failedCount,
        skippedDetails,
        failedDetails,
      });
      setIsModalOpen(true);

      // Call onUploadComplete callback if provided
      if (onUploadComplete && jsonData.length > 0) {
        onUploadComplete(jsonData);
      }
    } catch (err: any) {
      setProgress(0);

      toast.error("Upload Failed", {
        description:
          err?.data?.message || "An error occurred while uploading employees",
        duration: 5000,
      });
    }
  };

  return (
    <>
      {showButton && (
        <button
          onClick={handleShow}
          className="cursor-pointer flex flex-col md:flex-row justify-center items-center px-2 py-[8px] gap-2 md:w-[150px] h-[40px] font-normal text-[14px] leading-[150%] text-[#FFFFFF]"
          style={{ backgroundColor: primaryColor }}
        >
          Upload
        </button>
      )}

      {isOpen && (
        <div className="fixed flex items-center justify-center inset-0 bg-[#00000051] bg-opacity-50 z-40">
          <div className="bg-white dark:bg-gray-800 w-full max-w-2xl shadow-lg p-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2">
              <h2 className="text-xl font-semibold text-[#050711] dark:text-gray-100">Upload CSV File</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-lg"
              >
                <Cross2Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={submitHandler}>
              {isError && (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 relative flex justify-between items-center">
                  {/* @ts-ignore */}
                  <p>
                    <i className="fas fa-exclamation-circle mr-2" />{" "}
                    {/* @ts-ignore */}
                    {error?.data?.message || "Upload failed"}
                  </p>
                  <button onClick={onClickReset} className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                    <i className="fas fa-times" />
                  </button>
                </div>
              )}

              {isSuccess && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 relative flex justify-between items-center">
                  <p>
                    <i className="fas fa-check-circle mr-2" /> Upload
                    successful!
                  </p>
                  <button onClick={onClickReset} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-lg">
                    <Cross2Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
                  </button>
                </div>
              )}

              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed p-8 transition-all cursor-pointer ${isDragOver
                  ? ""
                  : progress > 0
                    ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                style={isDragOver ? {
                  backgroundColor: `${primaryColor}15`,
                  borderColor: primaryColor
                } : {}}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDragAreaClick}
              >
                <UploadIcon
                  className={`w-12 h-12 mb-4 ${isDragOver ? "" : "text-gray-400 dark:text-gray-500"}`}
                  style={isDragOver ? { color: primaryColor } : {}}
                />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {progress === 0
                    ? "Drag and drop your CSV file here"
                    : "Uploading..."}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  {progress === 0
                    ? "or click to browse files"
                    : "Please wait while we process your file"}
                </p>
                {jsonData.length > 0 && progress === 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    ✓ File loaded successfully ({jsonData.length} records)
                  </p>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                id="csv-upload"
                accept=".csv,text/csv"
                onChange={handleFileInputChange}
                style={{ display: "none" }}
              />

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mt-2">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: primaryColor }}
                />
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="reset"
                  onClick={onClickReset}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded transition-colors"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading || jsonData.length === 0}
                  className={`px-4 py-2 text-white rounded transition-opacity ${isLoading || jsonData.length === 0
                    ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                    : ""
                    }`}
                  style={!isLoading && jsonData.length > 0 ? {
                    backgroundColor: primaryColor,
                  } : {}}
                  onMouseEnter={(e) => {
                    if (!isLoading && jsonData.length > 0) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && jsonData.length > 0) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                >
                  {isLoading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </>
  );
};

export default UploadBase;
