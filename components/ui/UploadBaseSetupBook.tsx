"use client";
import React, { useState, useRef } from "react";
import { Cross2Icon, UploadIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { useCampaign } from "@/contexts/CampaignContext";
import { useCreateSetupBookMutation } from "@/store/services/setupBookApi";
import UploadAlert from "@/components/ui/UploadAlert";

interface UploadBaseProps {
  isOpen?: boolean;
  onClose?: () => void;
  showButton?: boolean;
  onUploadComplete?: (data: CsvRow[], file?: File) => void;
  searchId?: string;
}

// Simple CSV parser function
type CsvRow = Record<string, string>;

const parseCSV = (text: string, header: boolean = true): CsvRow[] => {
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
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  return data;
};

interface ApiError {
  data?: {
    message?: string;
  };
}

const UploadBaseSetupBook: React.FC<UploadBaseProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  showButton = true,
  onUploadComplete,
  searchId,
}) => {
  const { campaignData } = useCampaign();
  const campaignId = campaignData?.campaign?._id;
  const companyId = campaignData?.campaign
    ?.companyId;



  const primaryColor = campaignData?.primaryColor || '#050711';
  const [progress, setProgress] = useState(0);
  const [show, setShow] = useState(false);
  const [jsonData, setJSONData] = useState<CsvRow[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const [createSetupBook, { isLoading, isSuccess, isError, error, reset }] = useCreateSetupBookMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);


  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : show;
  const handleClose = () => {
    reset(); // Reset the mutation state
    if (externalOnClose) {
      externalOnClose();
    } else {
      setShow(false);
    }
    setProgress(0);
    setJSONData([]);
    setIsDragOver(false);
    setFileToUpload(null);
  };

  const handleAlertDismiss = () => {
    reset(); // Reset the mutation state
    setProgress(0);
    setJSONData([]);
    setIsDragOver(false);
    setFileToUpload(null);
  };

  const handleShow = () => setShow(true);

  const onClickReset = () => {
    reset(); // Reset the mutation state
    setProgress(0);
    setJSONData([]);
    setIsDragOver(false);
    setFileToUpload(null);
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
    setFileToUpload(file);
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
      } catch {
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
    if (!fileToUpload) return;

    try {
      setProgress(30);

      let fileToSend = fileToUpload;

      if (jsonData.length > 0 && searchId) {
        // Reconstruct CSV with searchId
        const headers = Object.keys(jsonData[0]);
        const newHeaders = [...headers, 'searchId'];

        const csvLines = jsonData.map(row => {
          const values = headers.map(header => {
            let val = row[header] || '';
            if (val.includes(',') || val.includes('"') || val.includes('\n')) {
              val = `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          });
          values.push(searchId);
          return values.join(',');
        });

        const newContent = [newHeaders.join(','), ...csvLines].join('\n');
        const blob = new Blob([newContent], { type: 'text/csv' });
        fileToSend = new File([blob], fileToUpload.name, { type: 'text/csv' });
      }

      const formData = new FormData();

      // if (companyId && typeof companyId === 'object') {
      //   companyId = companyId._id || companyId.id;
      // }

      if (!companyId || !campaignId) {
        toast.error("Missing required information", {
          description: "Campaign ID, Company ID, or Search ID is missing.",
          duration: 5000,
        });
        setProgress(0);
        return;
      }

      formData.append('companyId', companyId);
      formData.append('campaignId', campaignId);
      if (searchId) {
        formData.append('searchId', searchId);
      }
      formData.append('file', fileToSend);

      await createSetupBook(formData).unwrap();

      setProgress(100);

      toast.success("Upload successful", {
        description: "Setup book created successfully",
        duration: 5000,
      });

      // Call onUploadComplete callback if provided
      if (onUploadComplete) {
        onUploadComplete(jsonData, fileToUpload);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setProgress(0);

      toast.error("Upload Failed", {
        description: apiError?.data?.message || "An error occurred while uploading records",
        duration: 5000,
      });
    }
  };

  return (
    <>
      {showButton && (
        <button
          onClick={handleShow}
          className="cursor-pointer flex flex-col md:flex-row justify-center items-center px-2 py-8px gap-2 md:w-[150px] h-40px font-normal text-[10px] md:text-[12px] leading-[150%] text-[#FFFFFF] rounded-[var(--radius)]"
          style={{ backgroundColor: primaryColor }}
        >
          Upload
        </button>
      )}

      {isOpen && (
        <div className="fixed flex items-center justify-center inset-0 bg-[#00000051] bg-opacity-50 z-40">
          <div
            className="dark:bg-gray-800 w-full max-w-2xl shadow-lg p-6 rounded-[var(--radius)]"
            style={{ backgroundColor: 'var(--accent-white)' }}
          >
            <div
              className="flex justify-between items-center border-b dark:border-gray-700 pb-2"
              style={{ borderColor: 'var(--light-gray)' }}
            >
              <h2
                className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
                style={{ color: 'var(--text-primary)' }}
              >
                Upload Setup Book CSV
              </h2>
              <button
                onClick={handleClose}
                className="dark:text-gray-400 dark:hover:text-red-400 text-[12px] md:text-[14px]"
                style={{ color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <Cross2Icon
                  className="w-5 h-5 dark:text-gray-400 dark:hover:text-gray-200"
                  style={{ color: 'var(--text-tertiary)' }}
                />
              </button>
            </div>

            <form className="mt-4 space-y-4" onSubmit={submitHandler}>
              {isError && (
                <UploadAlert
                  type="error"
                  message={(error as ApiError)?.data?.message || "Upload failed"}
                  onClose={onClickReset}
                />
              )}

              {isSuccess && (
                <UploadAlert
                  type="success"
                  message="Upload successful!"
                  onClose={handleAlertDismiss}
                />
              )}

              <div
                className={`flex flex-col items-center justify-center border-2 border-dashed p-8 transition-all cursor-pointer rounded-[var(--radius)] ${isDragOver
                  ? ""
                  : progress > 0
                    ? "dark:bg-green-900/20 dark:border-green-500"
                    : "dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-700"
                  }`}
                style={isDragOver ? {
                  backgroundColor: `${primaryColor}15`,
                  borderColor: primaryColor
                } : progress > 0 ? {
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  borderColor: '#22C55E'
                } : {
                  borderColor: 'var(--light-gray)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isDragOver && progress === 0) {
                    e.currentTarget.style.borderColor = '#94A3B8';
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDragOver && progress === 0) {
                    e.currentTarget.style.borderColor = 'var(--light-gray)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleDragAreaClick}
              >
                <UploadIcon
                  className={`w-12 h-12 mb-4 dark:text-gray-500`}
                  style={isDragOver ? { color: primaryColor } : { color: 'var(--text-tertiary)' }}
                />
                <p
                  className="text-[12px] md:text-[14px] font-medium dark:text-gray-300 mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {progress === 0
                    ? "Drag and drop your CSV file here"
                    : "Uploading..."}
                </p>
                <p
                  className="text-[10px] md:text-[12px] dark:text-gray-400 text-center"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {progress === 0
                    ? "or click to browse files"
                    : "Please wait while we process your file"}
                </p>
                {jsonData.length > 0 && progress === 0 && (
                  <p
                    className="text-[10px] md:text-[12px] dark:text-green-400 mt-2"
                    style={{ color: '#22C55E' }}
                  >
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

              <div
                className="w-full dark:bg-gray-700 rounded-full h-3 overflow-hidden mt-2"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${progress}%`, backgroundColor: primaryColor }}
                />
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="reset"
                  onClick={onClickReset}
                  className="px-4 py-2 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 transition-colors rounded-[var(--radius)]"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E2E8F0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                  }}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isLoading || jsonData.length === 0}
                  className={`px-4 py-2 text-white transition-opacity rounded-[var(--radius)] ${isLoading || jsonData.length === 0
                    ? "dark:bg-gray-600 cursor-not-allowed"
                    : ""
                    }`}
                  style={!isLoading && jsonData.length > 0 ? {
                    backgroundColor: primaryColor,
                  } : {
                    backgroundColor: '#9CA3AF',
                    cursor: 'not-allowed'
                  }}
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

export default UploadBaseSetupBook;