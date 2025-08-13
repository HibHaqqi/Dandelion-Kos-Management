"use client";

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportDialog({ isOpen, onOpenChange, onImportComplete }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: string[];
    suggestions?: string[];
    imported?: number;
    total?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an Excel file (.xlsx or .xls)",
        });
        return;
      }
      setFile(selectedFile);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an Excel file to import",
      });
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message,
          imported: result.imported,
          total: result.total,
          details: result.errors,
        });
        
        toast({
          title: "Import successful",
          description: `Imported ${result.imported} out of ${result.total} transactions`,
        });
        
        onImportComplete();
      } else {
        setImportResult({
          success: false,
          message: result.error || 'Import failed',
          details: result.details,
          suggestions: result.suggestions,
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResult({
        success: false,
        message: 'Failed to import transactions',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Transactions
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to import transactions. Required format:
            <div className="mt-2 text-xs bg-muted p-2 rounded font-mono">
              <div><strong>Type:</strong> "revenue" or "expense"</div>
              <div><strong>Amount:</strong> Numbers only (e.g., 100.50)</div>
              <div><strong>Date:</strong> yyyy-mm-dd format (e.g., 2024-01-15)</div>
              <div><strong>Description:</strong> Transaction description</div>
              <div><strong>Category:</strong> Optional category</div>
              <div><strong>Room Number:</strong> Must exist in your rooms</div>
              <div><strong>Customer Name:</strong> Must exist in your customers</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Excel File</Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
            </div>
          )}

          {importResult && (
            <Alert className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p>{importResult.message}</p>
                  {importResult.imported !== undefined && importResult.total !== undefined && (
                    <p className="text-sm">
                      Successfully imported {importResult.imported} out of {importResult.total} transactions
                    </p>
                  )}
                  {importResult.details && importResult.details.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-700">Validation Errors:</p>
                      <div className="max-h-32 overflow-y-auto mt-1 p-2 bg-red-50 rounded border">
                        <ul className="text-xs space-y-1">
                          {importResult.details.slice(0, 10).map((detail, index) => (
                            <li key={index} className="text-red-600 font-mono">• {detail}</li>
                          ))}
                          {importResult.details.length > 10 && (
                            <li className="text-red-600 font-medium">• ... and {importResult.details.length - 10} more errors</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                  {importResult.suggestions && importResult.suggestions.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-blue-700">💡 Tips for fixing your data:</p>
                      <ul className="text-xs space-y-1 mt-1">
                        {importResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-blue-600">• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}