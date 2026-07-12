import { Plus, Download } from 'lucide-react';

interface ActionToolbarProps {
  addLabel: string;
  onAddClick: () => void;
  showExportExcel?: boolean;
  showExportPdf?: boolean;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isLoading?: boolean;
}

export function ActionToolbar({
  addLabel,
  onAddClick,
  showExportExcel = false,
  showExportPdf = false,
  onExportExcel,
  onExportPdf,
  isLoading = false,
}: ActionToolbarProps) {
  return (
    <div className="list-page__toolbar">
      <button
        type="button"
        className="list-page__btn-tambah"
        onClick={onAddClick}
        disabled={isLoading}
      >
        <Plus size={14} />
        {addLabel}
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {showExportExcel && (
          <button
            type="button"
            className="list-page__btn-download"
            onClick={onExportExcel}
            title="Download Excel"
            disabled={isLoading}
          >
            <Download size={14} />
            Excel
          </button>
        )}
        {showExportPdf && (
          <button
            type="button"
            className="list-page__btn-download"
            onClick={onExportPdf}
            title="Download PDF"
            disabled={isLoading}
          >
            <Download size={14} />
            PDF
          </button>
        )}
      </div>
    </div>
  );
}
