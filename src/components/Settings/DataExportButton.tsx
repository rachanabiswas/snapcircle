"use client";

import { useState } from "react";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/shadcnui/button";
import { Spinner } from "@/components/shadcnui/spinner";
import { toast } from "@/components/shadcnui/toast";
import { exportUserDataAction } from "@/server/settings";

const DataExportButton = () => {
  const [pending, setPending] = useState(false);

  const onExport = async () => {
    setPending(true);
    try {
      const result = await exportUserDataAction();
      if (!result.ok) {
        toast.add({
          title: "Export failed",
          description: result.error,
          type: "error",
        });
        return;
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "snapcircle-data.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.add({
        title: "Exported",
        description: "Your data was downloaded",
        type: "success",
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={pending}>
      {pending ?
        <Spinner
          data-icon="inline-start"
          aria-hidden="true"
        />
      : <DownloadIcon
          data-icon="inline-start"
          aria-hidden="true"
        />
      }
      {pending ? "Exporting..." : "Download my data"}
    </Button>
  );
};

export default DataExportButton;
